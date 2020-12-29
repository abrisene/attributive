/*
 # cgraph.test.js
 # Attributive Compute Graph Tests
 */

/**
 # Module Dependencies
 */

import {ComputeGraph, VertexType} from '../src';

/**
 # Variables
 */

const simpleGraph = [
  {id: 'node_scalar_a', value: 2},
  {id: 'node_scalar_b', value: 5},
  {
    id: 'node_sum_a',
    type: VertexType.compute,
    operation: 'SUM',
    sources: ['node_scalar_a', 'node_scalar_b'],
  },
  {id: 'node_output', sources: ['node_sum_a']},
];

/**
 # Tests
 */

test('Basic ComputeGraph can be created.', async () => {
  const g = new ComputeGraph();
  await g.addNodes(simpleGraph);
  await g.init();

  // Get Values
  expect(g.getValues()).toEqual({
    node_scalar_a: 2,
    node_scalar_b: 5,
    node_sum_a: 7,
    node_output: 7,
  });

  // Set Values
  await g.setValues({node_scalar_a: 7, node_scalar_b: 8});
  expect(g.getValues()).toEqual({
    node_scalar_a: 7,
    node_scalar_b: 8,
    node_sum_a: 15,
    node_output: 15,
  });

  await g.addNode(
    {id: 'node_scalar_c', value: 10, targets: ['node_sum_a']},
    true
  );
  expect(g.getValues()).toEqual({
    node_scalar_a: 7,
    node_scalar_b: 8,
    node_scalar_c: 10,
    node_sum_a: 25,
    node_output: 25,
  });
});
