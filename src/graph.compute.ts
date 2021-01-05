/*
 # graph.compute.ts
 # Attributive Computational Graph Reducers
 */

/*
 # Specification
 */

/****************

SUMMARY:


TESTING:


TODO:


*****************/

/*
 # Module Imports
 */

import * as _ from 'lodash';
import { EdgeConfig, EdgeDirection, EdgeDirections, EdgeIdentity, Graph, IGraph, IVertex} from './graph';
import { operations, OperationKey } from './operations';

/*
 # Types
 */

/* export type EdgeDirection = 'IN' | 'OUT' | 'ANY';
export const EdgeDirections = {IN: 'IN', OUT: 'OUT', ANY: 'ANY'} as {
  [key: string]: EdgeDirection;
}; */

export type VertexType = 'SCALAR' | 'COMPUTE' | 'VALIDATOR';
export const VertexTypes = {SCALAR: 'SCALAR', COMPUTE: 'COMPUTE', VALIDATOR: 'VALIDATOR'} as {
  [key: string]: VertexType;
}

/*
 # Interfaces
 */

/* export interface IVertex {
  id: string;
}

export interface IEdge {
  weight: number;
  direction?: EdgeDirection;
} */

export interface IComputeVertex extends IVertex {
  type: VertexType;
  default?: number;
}

export interface IComputeGraphSchema extends IGraph {
  nodes: { [key: string]: IVertex };
}

export interface IComputeGraph extends IComputeGraphSchema {
  values: { [key: string]: number };
}

export interface IComputeGraphConfig {
  id?: string;
  vertices?: IComputeVertex[];
  edges?: EdgeConfig[];
}

/*
 # Utility Methods
 */

/*
 # Graph Methods
 */

// Graph Methods

/**
 * Initializes a new Graph.
 * @param id The id of the graph.
 * @param vertices An array containing an initial set of vertices.
 * @param edges An array containing an initial set of edges.
 */
function initGraph({
  id,
  vertices,
  edges,
}: IComputeGraphConfig) {
  let graph = {id, directed: true, acyclic: false, values: {}, nodes: {}, adjacency: {}} as IComputeGraph;
  if (vertices) graph = addVertices(graph, vertices);
  if (edges) graph = addEdges(graph, edges);
  return graph;
}

/**
 * Clones a graph.
 * @param graph The graph to perform the operation on.
 */
function cloneGraph<T extends IComputeGraphSchema>(graph: T) {
  return _.cloneDeep(graph) as T;
}

// Vertex Methods

/**
 * Adds a single Vertex.
 * @param graph The graph to perform the operation on.
 * @param id The id of the vertex to be added.
 */
function addVertex(graph: IComputeGraph, vertex: IComputeVertex) {
  return addVertices(graph, [vertex]);
}

/**
 * Adds an array of Vertices.
 * @param graph The graph to perform the operation on.
 * @param ids An array containing the ids of the vertices to be added.
 */
function addVertices(graph: IComputeGraph, vertices: IComputeVertex[]) {
  try {
    const v = vertices.reduce((l, n) => ({ ...l, [n.id]: { type: [n.type], default: [n.default] }}), {});
    const result = Graph.addVertices(graph, Object.keys(v)) as IComputeGraph;
    result.nodes = { ...v, ...result.nodes };
    // TODO: RECALCULATE HERE
    return result;
  } catch (err) {
    console.error(err);
    return graph;
  }
}

/**
 * Removes a single Vertex and any associated edges.
 * @param graph The graph to perform the operation on.
 * @param id The id of the vertex to be added.
 * @param strict If true, will throw an error if trying to remove an undefined vertex.
 */
function removeVertex(graph: IComputeGraphSchema, id: string, strict = false) {
  return removeVertices(graph, [id], strict);
}

/**
 * Removes an array of Vertices and any associated edges.
 * @param graph The graph to perform the operation on.
 * @param ids The ids of the vertices to be removed.
 * @param strict If true, will throw an error if trying to remove an undefined vertex.
 */
function removeVertices(graph: IComputeGraphSchema, ids: string[], strict = false) {
  try {
    const result = Graph.removeVertices(graph, ids, strict) as IComputeGraphSchema;
    ids.forEach(v => {
      delete result.nodes[v];
    });
    return result;
  } catch (err) {
    console.error(err);
    return graph;
  }
}

// Edge Methods

/**
 * Adds an edge to a graph.
 * @param graph The graph to perform the operation on.
 * @param edge An array defining the edge to be added.
 * @param strict If false, will add vertices that do not exist, otherwise will throw an error.
 */
/* function addEdge(
  graph: IGraph,
  edge: [string, string, number?],
  strict = false
) {
  return addEdges(graph, [edge], strict);
} */

/**
 * Adds an array of edges to a graph.
 * @param graph The graph to perform the operation on.
 * @param edges An array defining the edges to be added.
 * @param strict If false, will add vertices that do not exist, otherwise will throw an error.
 */
/* function addEdges(
  graph: IGraph,
  edges: [string, string, number?][],
  strict = false
) {
  try {
    let result = cloneGraph(graph);

    // Add the edges.
    edges.forEach(e => {
      const [from, to, weight] = e;
      const w = weight !== undefined ? weight : 1;

      // Check if vertices exist. If we're not strict, add any that are missing.
      const missing = getMissingVertices(result, [from, to]);
      if (missing) {
        if (strict) {
          throw Error(
            `Could not add edge ${from} -> ${to}, vertices: ${missing.join(
              ', '
            )} are missing.`
          );
        } else {
          result = addVertices(result, missing);
        }
      }

      // TODO: Check for cycles if the graph is acyclic.

      // Add the Edge to the source.
      if (result.adjacency[from][to] === undefined)
        result.adjacency[from][to] = [];
      result.adjacency[from][to].push({
        weight: w,
        direction: result.directed ? 'OUT' : undefined,
      });

      // Add the Edge to the sink.
      if (result.adjacency[to][from] === undefined)
        result.adjacency[to][from] = [];
      result.adjacency[to][from].push({
        weight: w,
        direction: result.directed ? 'IN' : undefined,
      });
    });

    return result;
  } catch (err) {
    console.error(err);
    return graph;
  }
} */

/**
 * Removes an edge from the graph.
 * @param graph The graph to perform the operation on.
 * @param edge The edge to be removed.
 */
/* function removeEdge(graph: IGraph, edge: EdgeIdentity) {
  return removeEdges(graph, [edge]);
} */

/**
 * Removes an array of edges from the graph.
 * @param graph The graph to perform the operation on.
 * @param edges An array of edges to be removed.
 */
/* function removeEdges(graph: IComputeGraph, edges: EdgeIdentity[]) {
  try {
    const result = Graph.removeEdges(graph, edges);
  } catch (err) {
    console.error(err);
    return graph;
  }
} */


/*
 # Module Exports
 */

export const ComputeGraph = {
  initGraph,
  cloneGraph,
  // getVertices,
  // getMissingVertices,
  addVertex,
  addVertices,
  removeVertex,
  removeVertices,
  // getVertexNeighbors,
  // getVertexOutputs,
  // getVertexInputs,
  // getVertexNeighborsRecursive,
  // getVertexDescendants,
  // getVertexAncestors,
  addEdge,
  addEdges,
  removeEdge,
  removeEdges,
};
