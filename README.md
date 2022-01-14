# MAL Map

Cluster and visualize relationships between anime on [MyAnimeList](https://myanimelist.net/).

<!-- Overview image -->
![](assets/overview.png)

## Description


MAL Map is a web application that visualizes anime relationships on [MyAnimeList](https://myanimelist.net/). Edges are extracted from the recommendations of users on MAL.

#### Clustering

The graph is clustered with multi-level modularity clustering, using [code by Fabrice Rossi](https://apiacoa.org/research/software/graph/index.en.html). Some clusters are merged to produce a simpler visualization.

#### Layout

The map layout is generated by a [particle force simulation](https://github.com/d3/d3-force). At first all of the nodes are represented by a single particle. The simulation is then run for a number of iterations. Each iteration all particles are split into new particles, one for each sub-cluster. Appropriate forces are applied between particles to attract related clusters together. This process results in a visually pleasing layout. The layout process can be seen live [here](https://www.malmap.net/#animate=true).

## Future work

#### Highlight user watched anime

This feature is waiting for the MAL API to relax its CORS policy.

#### Manga Map, Goodreads, etc.

It should be reasonably easy to adapt this application to other domains, I may get around to some, feel free to extend this project.

## Contributing

Pull requests are welcome! See the [github action](.github/workflows/main.yml) for build instructions. You need a MAL API key to run the data pipeline.

## Acknowledgements

#### Clustering

- [Représentation d’un grand réseau à partir d’une
classification hiérarchique de ses sommets](https://apiacoa.org/publications/2011/rossivilla-vialaneix2011societe-fran-caise.pdf)
- https://apiacoa.org/research/software/graph/index.en.html

#### Layout

- [d3-force](https://github.com/d3/d3-force)
- [d3-force-reuse](https://github.com/twosixlabs/d3-force-reuse)

#### Frontend

- [PIXI.js](https://www.pixijs.com/)
- [PIXI Viewport](https://github.com/davidfig/pixi-viewport)
- [Svelte](https://svelte.dev/)


#### Data

- [MyAnimeList API](https://myanimelist.net/apiconfig/references/api/v2)
