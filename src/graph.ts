/*
 # graph.ts
 # Attributive Graph Class
 */

/*
 # Specification
 */

/****************

- Pure reducer functions for graph initialization / manipulation.
- Supports directed and undirected graphs.
- Doesn't currently support / enforce acyclic graphs.
- PROBABLY DOESN'T SUPPORT PARALLEL EDGES.

*****************/

/*
 # Module Imports
 */

import * as _ from 'lodash';

/*
 # Types
 */

export const EdgeDirections = {IN: 'IN', OUT: 'OUT', ANY: 'ANY'};
export type EdgeDirection = keyof typeof EdgeDirections;

/*
 # Interfaces
 */

export interface IVertex {
  id: string;
}

export interface IEdge {
  weight: number;
  direction?: EdgeDirection;
}

export interface IGraph {
  id?: string;
  directed: boolean;
  acyclic: boolean;
  adjacency: IAdjacencyList;
}

export interface IGraphConfig {
  id?: string;
  directed?: boolean;
  acyclic?: boolean;
  vertices?: string[];
  edges?: [string, string, number?][];
}

export interface IAdjacencyList {
  [key: string]: {
    [key: string]: IEdge[];
  };
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
 * @param directed Determines whether or not the graph is directed.
 * @param acyclic <TODO> Determine whether or nto the graph is acyclic - NON FUNCTIONAL.
 * @param vertices An array containing an initial set of vertices.
 * @param edges An array containing an initial set of edges.
 */
function initGraph({
  id,
  directed = true,
  acyclic = false,
  vertices,
  edges,
}: IGraphConfig) {
  let graph = {id, directed, acyclic, adjacency: {}} as IGraph;
  if (vertices) graph = addVertices(graph, vertices);
  if (edges) graph = addEdges(graph, edges);
  return graph;
}

/**
 * Clones a graph.
 * @param graph The graph to perform the operation on.
 */
function cloneGraph(graph: IGraph) {
  return _.cloneDeep(graph) as IGraph;
}

/**
 * Returns if any vertices in a provided array are missing from the graph.
 * @param graph The graph to perform the operation on.
 * @param ids An array of vertex ids to validate.
 */
function getMissingVertices(graph: IGraph, ids: string[]) {
  const missing = ids.filter(v => graph.adjacency[v] === undefined);
  return missing.length > 0 ? missing : undefined;
}

// Vertex Methods

/**
 * Adds a single Vertex.
 * @param graph The graph to perform the operation on.
 * @param id The id of the vertex to be added.
 */
function addVertex(graph: IGraph, id: string) {
  return addVertices(graph, [id]);
}

/**
 * Adds an array of Vertices.
 * @param graph The graph to perform the operation on.
 * @param ids An array containing the ids of the vertices to be added.
 */
function addVertices(graph: IGraph, ids: string[]) {
  try {
    const result = cloneGraph(graph);
    const vertices = ids.reduce((l, n) => ({...l, [n]: {}}), {});
    result.adjacency = {...result.adjacency, ...vertices};
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
function removeVertex(graph: IGraph, id: string, strict = false) {
  return removeVertices(graph, [id], strict);
}

/**
 * Removes an array of Vertices and any associated edges.
 * @param graph The graph to perform the operation on.
 * @param ids The ids of the vertices to be removed.
 * @param strict If true, will throw an error if trying to remove an undefined vertex.
 */
function removeVertices(graph: IGraph, ids: string[], strict = false) {
  try {
    const result = cloneGraph(graph);

    // Remove the vertices.
    ids.forEach(v => {
      // Iterate neighbors to delete linking edges in other vertices.
      const neighbors = result.adjacency[v];
      if (neighbors !== undefined) {
        Object.keys(neighbors).forEach(n => {
          delete result.adjacency[n][v];
        });

        // Remove the vertex
        delete result.adjacency[v];
      } else if (strict) {
        throw Error(`Cannot delete vertex: ${v} - does not exist.`);
      }
    });

    return result;
  } catch (err) {
    console.error(err);
    return graph;
  }
}

/**
 * Returns the neighbors of a vertex.
 * @param graph The graph to perform the operation on.
 * @param vertex The vertex to find the neighbors of.
 * @param direction Determines which direction of edges should be returned.
 */
function getVertexNeighbors(
  graph: IGraph,
  vertex: string,
  direction?: EdgeDirection
) {
  const adjacencies = graph.adjacency[vertex];
  let result: string[] | undefined;
  if (adjacencies !== undefined) {
    result =
      !graph.directed || direction === undefined
        ? Object.keys(adjacencies)
        : Object.keys(adjacencies).filter(e =>
            adjacencies[e].some(x => x.direction === direction)
          );
  }
  return result;
}

/**
 * Recurses through the ancestors / descendants of a vertex and returns an array of visited vertices.
 * @param graph The graph to perform the operation on.
 * @param vertex The vertex to recurse from.
 * @param direction Determines which direction of edges should be returned.
 */
function getVertexNeighborsRecursive(
  graph: IGraph,
  vertex: string,
  direction?: EdgeDirection
) {
  // TODO
}

/**
 *
 * @param graph The graph to perform the operation on.
 * @param vertex
 */
/* function getVertexInputs(graph: IGraph, vertex: string) {

} */

/**
 *
 * @param graph The graph to perform the operation on.
 * @param vertex
 */
/* function getVertexOutputs(graph: IGraph, vertex: string) {
  const adjacencies = graph.adjacency[vertex];
  return adjacencies ?
} */

// Edge Methods

/**
 * Adds an edge to a graph.
 * @param graph The graph to perform the operation on.
 * @param edge An array defining the edge to be added.
 * @param strict If false, will add vertices that do not exist, otherwise will throw an error.
 */
function addEdge(
  graph: IGraph,
  edge: [string, string, number?],
  strict = false
) {
  return addEdges(graph, [edge], strict);
}

/**
 * Adds an array of edges to a graph.
 * @param graph The graph to perform the operation on.
 * @param edges An array defining the edges to be added.
 * @param strict If false, will add vertices that do not exist, otherwise will throw an error.
 */
function addEdges(
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
}

/**
 * Removes an edge from the graph.
 * @param graph The graph to perform the operation on.
 * @param edge The edge to be removed.
 */
function removeEdge(graph: IGraph, edge: [string, string]) {
  return removeEdges(graph, [edge]);
}

/**
 * Removes an array of edges from the graph.
 * @param graph The graph to perform the operation on.
 * @param edges An array of edges to be removed.
 */
function removeEdges(graph: IGraph, edges: [string, string][]) {
  try {
    const result = cloneGraph(graph);

    // Remove the edges.
    edges.forEach(e => {
      // Validate the vertices.
      const v1 = result.adjacency[e[0]];
      if (v1 === undefined)
        throw Error(
          `Cannot remove edge ${e[0]} -> ${e[1]}, vertex ${e[0]} does not exist.`
        );
      if (v1[e[1]] === undefined)
        throw Error(
          `Cannot remove edge ${e[0]} -> ${e[1]}: Edge is not defined in ${e[0]}`
        );

      const v2 = result.adjacency[e[1]];
      if (v2 === undefined)
        throw Error(
          `Cannot remove edge ${e[1]} -> ${e[0]}, vertex ${e[1]} does not exist.`
        );
      if (v2[e[0]] === undefined)
        throw Error(
          `Cannot remove edge ${e[1]} -> ${e[0]}: Edge is not defined in ${e[1]}`
        );

      // Delete the edges. If we're undirected, or only have one edge, this is easy.
      const inAdj = result.adjacency[e[0]][e[1]];
      const outAdj = result.adjacency[e[1]][e[0]];
      if (!result.directed || (inAdj.length === 1 && outAdj.length === 1)) {
        delete result.adjacency[e[0]][e[1]];
        delete result.adjacency[e[1]][e[0]];
      } else {
        result.adjacency[e[0]][e[1]] = inAdj.filter(
          e => e.direction === EdgeDirections.IN
        );
        result.adjacency[e[1]][e[0]] = outAdj.filter(
          e => e.direction === EdgeDirections.OUT
        );
      }
    });

    return result;
  } catch (err) {
    console.error(err);
    return graph;
  }
}

/*
 # Module Exports
 */

export const Graph = {
  initGraph,
  cloneGraph,
  getMissingVertices,
  addVertex,
  addVertices,
  removeVertex,
  removeVertices,
  getVertexNeighbors,
  addEdge,
  addEdges,
  removeEdge,
  removeEdges,
};
