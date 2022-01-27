import { forceLink, forceSimulation } from "d3-force";
import { forceManyBodyReuse } from "d3-force-reuse";
import * as _ from "lodash";

class Node {
    x: number;
    y: number;
    id: number;
    hue: number;

    constructor(id: number) {
        this.id = id;
        this.x = 0;
        this.y = 0;
        this.hue = 0;
    }

    norm() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
}

class Edge {
    source: Node;
    target: Node;
    weight: number;

    constructor(source: Node, target: Node, weight: number) {
        this.source = source;
        this.target = target;
        this.weight = weight;
    }
}

type Positions = { [id: number]: { x: number, y: number, hue: number } };
export class Layout {
    Clusters: { [node_id: string]: number[] };
    Cluster_Nodes: { [cluster_id: number]: number[] };
    Edges: number[][];
    edges: Edge[] = [];
    min_colors: number;
    simulation = forceSimulation([]).stop();
    done = false;
    tier: number = 0;

    constructor(clusters: { [node_id: string]: number[] }, edges: number[][], min_colors = 20) {
        this.Clusters = clusters;
        this.Cluster_Nodes = _.mapValues(clusters, (cluster) => cluster.slice(0, -1));
        this.initClusterMap();
        this.min_colors = min_colors;
        this.Edges = edges;
    }

    tick(iters = 1) {
        if (this.simulation.alpha() < 0.01) {
            this.simulation.stop();
            this.done = true;
            return;
        }

        for (let i = 0; i < iters; i++) {
            this.simulation.tick();
        }
        this.normalizeDensity();

        if (this.tier <= this.max_tier() && this.simulation.alpha() < 0.05) {
            let nodes = this.simulation.nodes();
            nodes = this.newClusterNodes(nodes, this.tier);
            let edges = this.getClusterEdges(this.tier, nodes);
            this.tier++;
            console.log(`tier ${this.tier}`);

            this.simulation.nodes(nodes);
            this.simulation.force(
                "link",
                forceLink(edges)
                    .strength((link) => {
                        return link.weight;
                    })
                    .distance(50)
            );
            this.simulation.force(
                "charge",
                forceManyBodyReuse()
                    .strength(-50)
            );
            this.simulation.alphaDecay(0.0015);
            this.simulation.alpha(0.25).restart();
        }
    }

    normalizeDensity(target_density = 0.00007) {
        let nodes = this.simulation.nodes();
        const max_norm: number = _.max(nodes.map((node: Node) => node.norm()));
        const area = Math.PI * max_norm * max_norm;
        const target_area = nodes.length / target_density;
        const norm_scale = Math.sqrt(target_area / area);
        for (let node of nodes) {
            node.x *= norm_scale;
            node.y *= norm_scale;
        }
    }

    max_tier() {
        return this.Clusters[1].length - 1;
    }

    initClusterMap() {
        for (let [node_id, cluster_ids] of Object.entries(this.Clusters)) {
            const clusters = _.uniq(cluster_ids);
            for (let cluster_id of clusters) {
                if (!(cluster_id in this.Cluster_Nodes)) {
                    this.Cluster_Nodes[cluster_id] = [];
                }
                this.Cluster_Nodes[cluster_id].push(parseInt(node_id));
            }
        }
    }

    assignHues(nodes: Node[], min_hue: number, max_hue: number) {
        const range = max_hue - min_hue;
        let sorted = nodes.sort((a, b) => this.Cluster_Nodes[a.id].length - this.Cluster_Nodes[b.id].length);
        // shuffle the last n-2 elements
        let shuffled = _.shuffle(sorted.slice(2));
        shuffled = sorted.slice(0, 2).concat(shuffled);
        // swap the second element with the middle element
        let middle = Math.floor(shuffled.length / 2);
        [shuffled[1], shuffled[middle]] = [shuffled[middle], shuffled[1]];

        for (let i = 0; i < shuffled.length; i++) {
            shuffled[i].hue = range * i / shuffled.length + min_hue;
        }
    }

    getCluster(id: number, tier: number): number {
        if (tier < 0) tier = this.Clusters[id].length + tier;
        return this.Clusters[id][tier];
    }

    newClusterNodes(old_nodes: Node[], tier: number): Node[] {
        if (tier === 0) {
            const ids = _.uniq(_.values(this.Clusters).flatMap(v => v[0]));
            return ids.map(id => new Node(id));
        }

        const ids = _.uniq(_.values(this.Clusters).flatMap(v => v[tier]));
        let parents: { [id: number]: number } = {};
        for (const [id, cluster] of Object.entries(this.Clusters)) {
            parents[cluster[tier]] = cluster[tier - 1];
        }

        const scale = 1;
        const nodes = ids.map(id => {
            const node = old_nodes.find(n => n.id === parents[id])!;
            const new_node = new Node(id);
            new_node.x = node.x * scale + jiggle();
            new_node.y = node.y * scale + jiggle();
            new_node.hue = node.hue;
            return new_node;
        });



        if (old_nodes.length < this.min_colors && nodes.length >= this.min_colors) {
            this.assignHues(nodes, 0, 360);
        }

        return nodes;

        function jiggle() {
            return (Math.random() - 0.5) * 10;
        }
    }

    getClusterEdges(tier: number, nodes: Node[]): Edge[] {
        const node_dict: { [key: number]: Node; } = {};
        for (const node of nodes) {
            node_dict[node.id] = node;
        }

        const edge_dict: { [key: string]: number } = {};
        for (const edge of this.Edges) {
            let [a, b, weight] = edge;

            const s = this.getCluster(a, tier);
            const t = this.getCluster(b, tier);
            if (s === t) {
                continue;
            }
            if (tier > 1) {
                if (this.getCluster(a, tier - 2) !== this.getCluster(b, tier - 2)) {
                    continue;
                }
            }
            if (tier > 0) {
                const ps = this.getCluster(a, tier - 1);
                const pt = this.getCluster(b, tier - 1);
                if (ps !== pt) {
                    weight /= 30;
                }
            }
            const key = (s < t) ? `${s}-${t}` : `${t}-${s}`;
            if (key in edge_dict) {
                edge_dict[key] += weight;
            }
            else {
                edge_dict[key] = weight;
            }
        }

        // normalize weights
        const max_weight = _.max(_.values(edge_dict))!;
        _.forEach(edge_dict, (weight, key) => {
            if (tier === this.max_tier()) {
                edge_dict[key] = Math.sqrt(weight) / 3;
            } else {
                edge_dict[key] = weight / max_weight;
            }
        });

        this.edges = [];
        for (const key in edge_dict) {
            const [s, t] = key.split('-').map(v => parseInt(v));
            this.edges.push(new Edge(node_dict[s], node_dict[t], edge_dict[key]));
        }
        return this.edges;
    }

    toJSON(): { nodes: Positions, edges: number[][] } {
        let positions: Positions = {};
        for (const node of this.simulation.nodes()) {
            positions[node.id] = {
                x: node.x,
                y: node.y,
                hue: node.hue
            };
        }
        let edges: number[][] = [];
        for (const edge of this.edges) {
            edges.push([edge.source.id, edge.target.id, edge.weight]);
        }
        return { nodes: positions, edges: edges };
    }
}