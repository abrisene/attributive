/*
 # graph.ts
 # Attributive Graph Reducers
 */

/*
 # Specification
 */

/****************

SUMMARY:
- Pure reducer functions for graph initialization / manipulation / analysis.
- All functions should be immutable.
- Supports directed and undirected graphs.

TESTING:
- Basic coverage of all methods.
- Could use more tests on undirected graphs.

TODO:
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

export type EdgeConfig = [string, string, number?];
export type EdgeIdentity = [string, string];
export type EdgeDirection = 'IN' | 'OUT' | 'ANY';
export const EdgeDirections = {IN: 'IN', OUT: 'OUT', ANY: 'ANY'} as {
  [key: string]: EdgeDirection;
};

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
  edges?: EdgeConfig[];
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
 * TODO / WIP:
 * Merges multiple graphs into the first one.
 * IMPORTANT: Assumes all graphs are of the same directed / undirected type.
 * @param graphs An array of graphs to merge.
 */
/* function mergeGraphs(graphs: IGraph[]) {
  const g0 = graphs.shift() as IGraph;
  const result = cloneGraph(g0);
  const edges: EdgeConfig[] = [];
  graphs.forEach((g) => {
    // Iterate through the adjacency list and construct edges.
    Object.keys(g.adjacency).forEach((vA) => {
      Object.keys(g.adjacency[vA]).forEach((vB) => {
        // Add each of the edges.
      });
    });
  });
}; */

/**
 * TODO:
 * Returns a series of subgraphs consisting of the graph's components and
 * provides a graph where each vertex represents a subcomponent.
 * @param graph The graph to split.
 */
/* function splitComponents(graph: IGraph) {
  // TODO
} */

/**
 * Returns an array of the vertices in the graph.
 * @param graph The graph containing the vertices.
 */
function getVertices(graph: IGraph) {
  return Object.keys(graph.adjacency);
}

/**
 * TODO:
 * Returns an array of the edges in the graph.
 * @param graph The graph containing the edges.
 */
/* function getEdges(graph: IGraph) {
  const result: EdgeConfig[] = [];

} */

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
 * Finds neighbors of a vertex attached by outgoing edges.
 * @param graph The graph to perform the operation on.
 * @param vertex The vertex to find the neighbors of.
 */
function getVertexOutputs(graph: IGraph, vertex: string) {
  return getVertexNeighbors(graph, vertex, EdgeDirections.OUT);
}

/**
 * Finds neighbors of a vertex attached by incoming edges.
 * @param graph The graph to perform the operation on.
 * @param vertex The vertex to find the neighbors of.
 */
function getVertexInputs(graph: IGraph, vertex: string) {
  return getVertexNeighbors(graph, vertex, EdgeDirections.IN);
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
  const queue = [vertex];
  for (let i = 0; i < queue.length; i += 1) {
    const v = queue[i];
    const neighbors = getVertexNeighbors(graph, v, direction);
    if (neighbors !== undefined) {
      neighbors.forEach(n => {
        if (!queue.includes(n)) queue.push(n);
      });
    }
  }
  queue.shift();
  return queue;
}

/**
 * Recurses through the descendants of a vertex and returns an array of visited vertices.
 * @param graph The graph to perform the operation on.
 * @param vertex The vertex to recurse from.
 */
function getVertexDescendants(graph: IGraph, vertex: string) {
  return getVertexNeighborsRecursive(graph, vertex, EdgeDirections.OUT);
}

/**
 * Recurses through the ancestors of a vertex and returns an array of visited vertices.
 * @param graph The graph to perform the operation on.
 * @param vertex
 */
/**
 * Recurses through the descendants of a vertex and returns an array of visited vertices.
 * @param graph The graph to perform the operation on.
 * @param vertex The vertex to recurse from.
 */
function getVertexAncestors(graph: IGraph, vertex: string) {
  return getVertexNeighborsRecursive(graph, vertex, EdgeDirections.IN);
}

// Edge Methods

/**
 * Adds an edge to a graph.
 * @param graph The graph to perform the operation on.
 * @param edge An array defining the edge to be added.
 * @param strict If false, will add vertices that do not exist, otherwise will throw an error.
 */
function addEdge(
  graph: IGraph,
  edge: EdgeConfig,
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
  edges: EdgeConfig[],
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
function removeEdge(graph: IGraph, edge: EdgeIdentity) {
  return removeEdges(graph, [edge]);
}

/**
 * Removes an array of edges from the graph.
 * @param graph The graph to perform the operation on.
 * @param edges An array of edges to be removed.
 */
function removeEdges(graph: IGraph, edges: EdgeIdentity[]) {
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
  getVertices,
  getMissingVertices,
  addVertex,
  addVertices,
  removeVertex,
  removeVertices,
  getVertexNeighbors,
  getVertexOutputs,
  getVertexInputs,
  getVertexNeighborsRecursive,
  getVertexDescendants,
  getVertexAncestors,
  addEdge,
  addEdges,
  removeEdge,
  removeEdges,
};
