/*
 # graph.ts
 # Attributive Graph Class
 */

/*
 # Module Imports
 */

import {operations, OperationKey} from './operations';
import {DirectedGraph} from 'graphology';

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

  /**
   * Returns an array of dirty nodes.
   */
  protected getDirtyNodes() {
    return this._graph
      .nodes()
      .filter(n => this._graph.getNodeAttribute(n, 'dirty'));
  }

  /**
   * Sets the dirty flag on descendants of the node.
   * Also sets the node as dirty.
   * @param node ID of the node to set dependencies as dirty.
   */
  protected async setDescendantsDirty(node: string) {
    return this.getDescendants(node, n => this.setNodeDirty(n));
  }

  /**
   * Returns whether or not a node is dirty.
   * @param node ID of the node.
   */
  protected getNodeDirty(node: string) {
    return this._graph.getNodeAttribute(node, 'dirty');
  }

  /**
   * Sets the dirty flag on a node.
   * @param node ID of the node.
   * @param dirty Status of the flag to set.
   */
  protected setNodeDirty(node: string, dirty = true) {
    return this._graph.setNodeAttribute(node, 'dirty', dirty);
  }

  /**
   * Returns the value of a node.
   * @param node ID of the node.
   */
  protected getNodeValue(node: string) {
    return this._graph.getNodeAttribute(node, 'value');
  }

  /**
   * Directly sets the value of the node.
   * NOT USER FACING: this does not trigger updates. In most cases setValue / setValues should be used.
   * @param node
   * @param value
   */
  protected setNodeValue(node: string, value: number) {
    this._values[node] = value;
    return this._graph.setNodeAttribute(node, 'value', value);
  }

  /**
   * Recursive method to update the ComputeGraph. Works down a queue of dirty nodes.
   * Will move a node to the end of the queue if it cannot be updated and try later.
   * Ends when the queue is empty.
   * @param queue Queue of nodes to update.
   * @param iteration Recursive iteration count.
   */
  protected async update(queue?: string[], iteration = 0): Promise<void> {
    try {
      // Populate the queue - with dirty nodes if none is defined - and get the next node.
      const nextQueue = queue ? queue : this.getDirtyNodes();
      const nextNode = nextQueue.shift();

      // Update the ndoe, or push it to the end of the queue if the update is unsuccessful.
      if (nextNode !== undefined) {
        const updateSuccessful = await this.updateNode(nextNode);
        if (!updateSuccessful) nextQueue.push(nextNode);
      }

      // If the queue is empty or we've reached max iteration, then exit, otherwise recurse.
      return nextQueue.length === 0 || iteration > 20
        ? undefined
        : this.update(nextQueue, iteration + 1);
    } catch (err) {
      console.error(err);
      return;
    }
  }

  /**
   * Updates / Calculates a node and sets it clean.
   * Returns false if the update cannot be performed.
   * @param node Node to update.
   */
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
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  /**
   * Recurses through the descendants / ancestors of a node and returns an array of their ids.
   * @param node ID of the node to start from.
   * @param descendants If true will recurse through descendants. If false will recurse ancestors.
   * @param callbackFn Callback function called on each iterated node.
   * @param queue Queue containing ids of nodes to recurse. This should not be set manually.
   * @param pos Iterator: Current position in the queue. This should not be set.
   */
  protected async recurseNeighbors(
    node: string,
    descendants = true,
    callbackFn: (n: string) => void,
    queue = [node] as string[],
    pos = 0
  ): Promise<string[] | void> {
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

  /**
   * Initializes the Graph.
   */
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

  /**
   * Gets the values of the nodes on the Graph.
   */
  getValues() {
    return {...this._values};
  }

  async setValues(values: {[key: string]: number}) {
    try {
      const operations = Object.keys(values).map(async key => {
        this.setNodeValue(key, values[key]);
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

  /**
   * Gets the value of a node.
   * @param key ID of the node to return the value of.
   */
  getValue(key: string) {
    return this._values[key];
  }

  /**
   * Sets the value of a node. Triggers updates.
   * @param key ID of the node to update.
   * @param value Value to set the node to.
   */
  async setValue(key: string, value: number) {
    return this.setValues({[key]: value});
  }

  /**
   * Adds a node.
   */
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
      const edges = [] as string[][];
      if (sources !== undefined) sources.forEach(n => edges.push([n, id]));
      if (targets !== undefined) targets.forEach(n => edges.push([id, n]));
      if (edges.length > 0) await this.addEdges(edges, false);

      // Set the node's descendants as dirty.
      await this.setDescendantsDirty(id);

      // Update if necessary.
      if (shouldUpdate && this._initialized) await this.update();

      return;
    } catch (err) {
      console.error(err);
      return;
    }
  }

  /**
   * Adds an array of nodes.
   * @param nodes Array of nodes to add.
   * @param shouldUpdate If true this will update the graph after adding the nodes.
   */
  async addNodes(nodes: IAddVertexConfig[], shouldUpdate = false) {
    try {
      // Add the Nodes.
      for (const n of nodes) {
        await this.addNode(n, false);
      }

      // Update if necessary.
      if (shouldUpdate && this._initialized) await this.update();

      return;
    } catch (err) {
      console.error(err);
      return;
    }
  }

  /**
   * Adds an edge.
   * @param source ID of the originating node.
   * @param target ID of the ending node.
   * @param shouldUpdate If true this will update the graph after adding the edge.
   */
  async addEdge(source: string, target: string, shouldUpdate = false) {
    try {
      // Add the Edge
      this._graph.addDirectedEdge(source, target);

      // Set Descendants as Dirty
      await this.setDescendantsDirty(source);

      // Update if necessary.
      if (shouldUpdate && this._initialized) await this.update();

      return;
    } catch (err) {
      console.error(err);
      return;
    }
  }

  /**
   * Adds an array of edges.
   * @param edges Array of edges.
   * @param shouldUpdate If true this will update the graph after adding the edge.
   */
  async addEdges(edges: string[][], shouldUpdate = false) {
    try {
      // Add the Edges
      for (const e of edges) {
        await this.addEdge(e[0], e[1], false);
      }

      // Update if necessary.
      if (shouldUpdate && this._initialized) await this.update();
    } catch (err) {
      console.error(err);
      return;
    }
  }

  /**
   * Recurses through a nodes descendants.
   * @param node
   * @param callbackFn
   */
  async getDescendants(node: string, callbackFn: (n: string) => void) {
    return this.recurseNeighbors(node, true, callbackFn);
  }

  /**
   * Recurses through a nodes ancestors.
   * @param node
   * @param callbackFn
   */
  async getAncestors(node: string, callbackFn: (n: string) => void) {
    return this.recurseNeighbors(node, false, callbackFn);
  }

  /**
   * Exports the graph.
   */
  export() {
    return this._graph.export();
  }
}
