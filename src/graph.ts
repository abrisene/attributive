/*
 # graph.ts
 # Attributive Graph Class
 */

/*
 # Module Imports
 */

import {operations, OperationKey} from './operations';
import {DirectedGraph} from 'graphology';
// import { asyncForEach } from './utilities';

/*
 # Interfaces
 */

export enum VertexType {
  scalar = 'SCALAR',
  compute = 'COMPUTE',
  validator = 'VALIDATOR',
}

export interface IOperation {
  operation: OperationKey;
  arguments: (string | number)[];
}

/* export interface IValidator {
  validator: ValidatorKey;
  arguments: (string | number)[];
} */

export interface IVertexConfig {
  id: string;
  type?: VertexType;
  value?: number;
  operation?: OperationKey;
  visible?: boolean;
}

export interface IAddVertexConfig extends IVertexConfig {
  sources?: string[];
  targets?: string[];
}

/*
 # Utility Methods
 */

/*
 # Module Exports
 */

export class ComputeGraph {
  protected _values: {[key: string]: number};
  protected _graph: DirectedGraph;
  protected _initialized: boolean;

  constructor() {
    this._values = {};
    this._graph = new DirectedGraph();
    this._initialized = false;
  }

  protected getDirtyNodes() {
    return this._graph
      .nodes()
      .filter(n => this._graph.getNodeAttribute(n, 'dirty'));
  }

  protected async setDescendantsDirty(node: string) {
    return this.getDescendants(node, n => this.setNodeDirty(n));
  }

  protected getNodeDirty(node: string) {
    return this._graph.getNodeAttribute(node, 'dirty');
  }

  protected setNodeDirty(node: string, dirty = true) {
    return this._graph.setNodeAttribute(node, 'dirty', dirty);
  }

  protected getNodeValue(node: string) {
    return this._graph.getNodeAttribute(node, 'value');
  }

  protected setNodeValue(node: string, value: number) {
    this._values[node] = value;
    return this._graph.setNodeAttribute(node, 'value', value);
  }

  protected async update(queue?: string[], iteration = 0): Promise<undefined> {
    try {
      const nextQueue = queue ? queue : this.getDirtyNodes();
      const nextNode = nextQueue.shift();

      if (nextNode !== undefined) {
        const updateSuccessful = await this.updateNode(nextNode);
        if (!updateSuccessful) nextQueue.push(nextNode);
      }

      if (nextQueue.length === 0 || iteration > 20) return;
      return this.update(nextQueue, iteration + 1);
    } catch (err) {
      console.error(err);
      return;
    }
  }

  protected async updateNode(node: string) {
    try {
      const attributes = this._graph.getNodeAttributes(node);
      const inputNodes = this._graph.inNeighbors(node);
      const inputDirty = inputNodes.some(n => this.getNodeDirty(n));

      if (attributes.type === VertexType.compute) {
        if (inputDirty) return false;
        const operationFn = operations[attributes.operation];
        const operationArgs = inputNodes.reduce(
          (l: number[], n: string) => [...l, this.getNodeValue(n)],
          []
        );
        const newValue = operationFn(operationArgs);
        this.setNodeValue(node, newValue);
        this._graph.setNodeAttribute(node, 'dirty', false);
      } else {
        if (inputNodes.length > 0) {
          if (inputDirty) return false;
          const newValue = this.getNodeValue(inputNodes[0]);
          this.setNodeValue(node, newValue);
        }
      }

      this.setNodeDirty(node, false);
      // console.log(`${node}: ${this.getNodeValue(node)}`);
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  protected async recurseNeighbors(
    node: string,
    descendants = true,
    callbackFn: (n: string) => void,
    queue = [node] as string[],
    pos = 0
  ): Promise<string[] | undefined> {
    try {
      await callbackFn(node);
      const nodeNeighbors = descendants
        ? this._graph.outNeighbors(node)
        : this._graph.inNeighbors(node);
      const nextQueue = [...queue, ...nodeNeighbors];
      const nextPos = pos + 1;
      const nextNode = nextQueue[nextPos];

      if (pos === nextQueue.length - 1) return nextQueue;
      return this.recurseNeighbors(
        nextNode,
        descendants,
        callbackFn,
        nextQueue,
        nextPos
      );
    } catch (err) {
      console.error(err);
      return;
    }
  }

  async init() {
    try {
      await this.update();
      this._initialized = true;
      return this._initialized;
    } catch (err) {
      console.error(err);
      return;
    }
  }

  getValues() {
    return {...this._values};
  }

  async setValues(values: {[key: string]: number}) {
    try {
      const operations = Object.keys(values).map(async key => {
        this.setNodeValue(key, values[key]);
        // await this.getDescendants(key, n => this.setNodeDirty(n));
        await this.setDescendantsDirty(key);
      });
      await Promise.all(operations);
      await this.update();
      return;
    } catch (err) {
      console.error(err);
      return;
    }
  }

  getValue(key: string) {
    return this._values[key];
  }

  async setValue(key: string, value: number) {
    return this.setValues({[key]: value});
  }

  async addNode(
    {
      id,
      type = VertexType.scalar,
      value,
      operation,
      visible = true,
      sources,
      targets,
    }: IAddVertexConfig,
    shouldUpdate = false
  ) {
    try {
      // Add the Node and set the value.
      this._graph.addNode(id, {type, operation, visible, dirty: true});
      if (value !== undefined) this.setNodeValue(id, value);

      // Add the Edges.
      if (sources !== undefined) {
        sources.forEach(s => {
          this.addEdge(s, id);
        });
      }

      if (targets !== undefined) {
        targets.forEach(t => {
          this.addEdge(id, t);
        });
      }

      await this.setDescendantsDirty(id);

      if (shouldUpdate) {
        await this.update();
      }

      return;
    } catch (err) {
      console.error(err);
      return;
    }
  }

  async addNodes(nodes: IAddVertexConfig[], shouldUpdate = false) {
    try {
      nodes.forEach(n => {
        this.addNode(n, false);
      });

      if (shouldUpdate) {
        await this.update();
      }

      return;
    } catch (err) {
      console.error(err);
      return;
    }
  }

  addEdge(source: string, target: string) {
    try {
      this._graph.addDirectedEdge(source, target);
    } catch (err) {
      console.error(err);
    }
  }

  addEdges(edges: [string, string][]) {
    try {
      edges.forEach(e => {
        this.addEdge(e[0], e[1]);
      });
    } catch (err) {
      console.error(err);
    }
  }

  async getDescendants(node: string, callbackFn: (n: string) => void) {
    return this.recurseNeighbors(node, true, callbackFn);
  }

  async getAncestors(node: string, callbackFn: (n: string) => void) {
    return this.recurseNeighbors(node, false, callbackFn);
  }

  export() {
    return this._graph.export();
  }
}
