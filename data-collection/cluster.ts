import * as _ from "lodash";

export type Edge = [number, number, number];
export type ClusterJSON = {
    id: number,
    tier: number,
    nodes: number[],
    clusters: ClusterJSON[],
}

export class Cluster {
    static max_id = 0;
    static adj_list: { [id: number]: number[]; };

    id: number;
    tier: number;
    nodes: number[] = [];
    clusters: Cluster[] = [];
    constructor(id: number, tier: number, nodes: number[] = []) {
        this.id = id;
        this.tier = tier;
        this.nodes = nodes;
        Cluster.max_id = Math.max(id, Cluster.max_id);
    }

    static setEdges(edges: Edge[]) {
        Cluster.adj_list = {};
        for (let e of edges) {
            Cluster.adj_list[e[0]] = Cluster.adj_list[e[0]] || [];
            Cluster.adj_list[e[0]].push(e[1]);
            Cluster.adj_list[e[1]] = Cluster.adj_list[e[1]] || [];
            Cluster.adj_list[e[1]].push(e[0]);
        }
    }


    insert(id: number, levels: number[]) {
        if (levels.length === 0) {
            this.nodes.push(id);
        }
        else {
            const c = _.find(this.clusters, c => c.id === levels[0]);
            if (c) {
                c.insert(id, levels.slice(1));
            } else {
                const cluster = new Cluster(levels[0], this.tier + 1);
                cluster.insert(id, levels.slice(1));
                this.clusters.push(cluster);
            }
        }
    }

    size(): number {
        return this.nodes.length + this.clusters.reduce((a, b) => a + b.size(), 0);
    }

    allNodes(): number[] {
        return this.nodes.concat(this.clusters.reduce((a, b) => a.concat(b.allNodes()), [] as number[]));
    }

    distance(cluster: Cluster): number {
        const nodes = this.allNodes();
        const other_nodes = cluster.allNodes();

        const num_potential_edges = nodes.length * other_nodes.length;
        let edges_found = 0;
        for (let n of nodes) {
            for (let o of other_nodes) {
                if (Cluster.adj_list[n].includes(o)) {
                    edges_found++;
                }
            }
        }
        return edges_found / num_potential_edges;
    }

    addCluster(cluster: Cluster) {
        cluster.tier = this.tier + 1;
        this.clusters.push(cluster);
    }

    merge(min_prop = 0.15, min_size = 10) {
        const threshold = Math.max(min_size, this.size() * min_prop);
        if (this.size() < threshold) {
            throw new Error(`Cluster is too small to merge`);
        }
        if (this.nodes.length > 0 && this.clusters.length > 0) {
            this.addCluster(new Cluster(Cluster.max_id + 1, this.tier + 1, this.nodes));
            this.nodes = [];
        }

        if (this.size() < threshold) {
            this.clusters.forEach(c => this.nodes.push(...c.allNodes()));
            this.clusters = [];
            return;
        }

        while (this.clusters.length > 2) {
            if (this.clusters.length === 0)
                break;
            this.clusters.sort((a, b) => a.size() - b.size());
            const smallest = this.clusters[0];
            if (smallest.size() >= threshold)
                break;
            this.clusters.shift();
            const closest = _.minBy(this.clusters, c => this.distance(c));
            closest?.addCluster(smallest);
        }

        const cluster_sizes = this.clusters.map(c => c.size());
        const min_csize = _.min(cluster_sizes) || 0;
        if (this.clusters.length > 0 && min_csize <= threshold) {
            this.clusters.forEach(c => this.nodes.push(...c.allNodes()));
            this.clusters = [];
        }

        for (let cluster of this.clusters) {
            cluster.merge(min_prop, min_size);
        }
    }

    toNodeDict(): { [key: string]: number[]; } {
        let json: { [key: string]: number[]; } = {};
        for (let node of this.nodes) {
            json[node] = [node];
        }

        for (let i = 0; i < this.clusters.length; i++) {
            json = Object.assign(json, this.clusters[i].toNodeDict());
        }

        // pad shorter arrays
        const max_len = _.max(_.map(json, arr => arr.length)) || 0;
        for (let [id, clusters] of Object.entries(json)) {
            while (clusters.length <= max_len) {
                clusters.splice(0, 0, this.id);
            }
        }

        return json;
    }

    toJSON(): ClusterJSON {
        let json = {
            id: this.id,
            tier: this.tier,
            nodes: this.nodes,
            clusters: this.clusters.map(c => c.toJSON())
        };
        return json;
    }

    static fromJSON(json: ClusterJSON) {
        const cluster = new Cluster(json.id, json.tier, json.nodes);
        cluster.clusters = json.clusters.map(c => Cluster.fromJSON(c));
        return cluster;
    }

}

import * as child_process from 'child_process';
import * as fs from "fs";

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
function execShellCommand(cmd: string) {
    const exec = child_process.exec;
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.warn(error);
            }
            resolve(stdout ? stdout : stderr);
        });
    });
}

export async function createCluster(edges: Edge[], jarPath='data/clustering.jar', edgePath='data/edges.txt', partitionPath='data/partitions.txt') {
    const out = edges
        .map(e => `${e[0]} ${e[1]} ${e[2]}`)
        .join('\n');
    fs.writeFileSync(edgePath, out);

    console.log('Creating clusters...');
    let start = Date.now();
    await execShellCommand(`java -jar ${jarPath} ${edgePath} -recursive ${partitionPath} -minsize 15 -recrandom 50 -reduction 0.3`);
    console.log(`Clustering took ${(Date.now() - start) / 1000}s`);

    // Process clusters

    Cluster.setEdges(edges);
    const clusters: number[][] = fs.readFileSync(partitionPath).toString()
        .trim()
        .split('\n')
        .map(l => {
            return l.split('\t').map(s => parseInt(s));
        });
    const root = new Cluster(0, 0);
    for (let v of clusters) {
        const id = v[0];
        root.insert(id, v.slice(1));
    }

    return root;
}