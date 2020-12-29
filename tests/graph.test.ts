/*
 # graph.tests.js
 # Attributive Graph Tests
 */

/**
 # Module Dependencies
 */

import {EdgeDirections, Graph, IGraphConfig} from '../src';

/**
 # Variables
 */

const v0 = ['a', 'b', 'c'];
const e0 = [
  ['a', 'b'],
  ['a', 'c'],
  ['b', 'c'],
];

const g0Init = {
  id: 'g0',
};

const g1Init = {
  id: 'g1',
  directed: true,
  acyclic: false,
  vertices: v0,
  edges: e0,
} as IGraphConfig;

/**
 # Tests
 */

test('Graph can be initialized from scratch.', () => {
  const g = Graph.initGraph(g0Init);
  expect(g.id).toEqual(g0Init.id);
  expect(g.directed).toEqual(true);
  expect(g.adjacency).toEqual({});
});

test('Graph methods work properly.', () => {
  const g = Graph.initGraph(g1Init);
  expect(g.id).toEqual(g1Init.id);
  expect(g.directed).toEqual(g1Init.directed);
  expect(g.acyclic).toEqual(g1Init.acyclic);
  expect(Object.keys(g.adjacency)).toEqual(g1Init.vertices);
});

test('Vertex and Edge methods work properly.', () => {
  // Add Vertices
  let g = Graph.initGraph(g0Init);
  g = Graph.addVertex(g, 'v0');
  g = Graph.addVertices(g, ['v1', 'v2']);

  expect(Object.keys(g.adjacency)).toEqual(['v0', 'v1', 'v2']);

  // Adding Edges
  g = Graph.addEdge(g, ['v0', 'v1', 0.5]);

  expect(g.adjacency.v0.v1).toBeDefined();
  expect(g.adjacency.v0.v1).toEqual([
    {direction: EdgeDirections.OUT, weight: 0.5},
  ]);
  expect(g.adjacency.v1.v0).toBeDefined();
  expect(g.adjacency.v1.v0).toEqual([
    {direction: EdgeDirections.IN, weight: 0.5},
  ]);

  // Removing Vertices
  const removeIds = ['v0', 'v2'];
  g = Graph.removeVertices(g, removeIds);

  expect(Object.keys(g.adjacency)).toEqual(['v1']);
  expect(Graph.getMissingVertices(g, removeIds)).toEqual(removeIds);
  expect(g.adjacency.v1.v0).toBeUndefined();
});

test('Edge methods work properly.', () => {
  // Create Graph, add Vertices, Edges
  let g = Graph.initGraph(g0Init);
  g = Graph.addVertices(g, ['v0', 'v1', 'v2', 'v3', 'v4']);
  g = Graph.addEdges(g, [
    ['v0', 'v1'],
    ['v1', 'v2'],
    ['v2', 'v3'],
    ['v3', 'v4'],
    ['v4', 'v3', 0.25],
  ]);

  // Test Single Edge Adjacency
  expect(g.adjacency.v1).toEqual({
    v0: [{weight: 1, direction: EdgeDirections.IN}],
    v2: [{weight: 1, direction: EdgeDirections.OUT}],
  });

  // Test Multi-Edge Adjacency
  expect(g.adjacency.v3).toEqual({
    v2: [{weight: 1, direction: EdgeDirections.IN}],
    v4: [
      {weight: 1, direction: EdgeDirections.OUT},
      {weight: 0.25, direction: EdgeDirections.IN},
    ],
  });

  // Test Remove Edges
  g = Graph.removeEdges(g, [
    ['v0', 'v1'],
    ['v4', 'v3'],
  ]);

  expect(g.adjacency.v0).toEqual({});
  expect(g.adjacency.v1).toEqual({
    v2: [{weight: 1, direction: EdgeDirections.OUT}],
  });
  expect(g.adjacency.v3).toEqual({
    v2: [{weight: 1, direction: EdgeDirections.IN}],
    v4: [{weight: 1, direction: EdgeDirections.OUT}],
  });
  expect(g.adjacency.v4).toEqual({
    v3: [{weight: 1, direction: EdgeDirections.IN}],
  });
});

test('Graph methods are immutable.', () => {
  const g = Graph.initGraph(g0Init);
  const gCopy = Graph.cloneGraph(g);

  expect(gCopy).toStrictEqual(g);

  Graph.addVertices(g, ['v1', 'v2', 'v3']);
  Graph.addEdges(g, [
    ['v1', 'v2'],
    ['v2', 'v1'],
    ['v2', 'v3'],
  ]);
  expect(g.adjacency).toEqual({});
});
