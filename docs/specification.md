# Specification #

## Problem ##

We want a flexible and expressive architecture for defining parameterized calculation models with strong relational components.

Example use cases:

- Roleplaying game stats.
- Economy simulation.

## Insights ##

- https://www.freecodecamp.org/news/8-essential-graph-algorithms-in-javascript
- https://medium.com/kineviz-blog/visualizing-node-link-graphs-84a40a9b2fcc

## Primitives ##

Three primitives:

- *Entities* which own sets of Stats and define the scope of their operation.
- *Stats* 
- *Stat Providers* which 

### Stat Specification ###

Each Stat includes a number of different *properties*, which define the Stat's behavior, as well as how the value is calculated. Properties can be resolved in one of multiple ways:

- *Scalar* definitions define simple numbers.
- *Reference* definitions refer to another stat to determine the value.
- *Calculated* definitions refer to a calculation that is performed to determine property.

Stats by default include the following properties:

- *Value* defines the current value of the stat.
- *Minimum* defines the minimum value of the stat.
- *Maximum* defines the maximum value of the stat.
- *Default* defines the default value if none is specified.

## Use Cases ##

### Attributes ###

- *

- Have a *current value*, which is calculated as a sum.
- Have a *base value*, which defines the base value of the attribute before modification.
- Have a *base maximum value*, which determines how 


