import { Cluster } from "./classes";
import { Edge } from "./recs";
import { execShellCommand } from "./utils";

const fs = require('fs');

export async function createCluster(edges: Edge[]) {
    const out = edges
        .map(e => `${e[0]} ${e[1]} ${e[2]}`)
        .join('\n');
    fs.writeFileSync('data/edges.txt', out);

    console.log('Creating clusters...');
    let start = Date.now();
    await execShellCommand("java -jar data/clustering.jar data/edges.txt -recursive data/partitions.txt -minsize 15 -recrandom 50 -reduction 0.2");
    console.log(`Clustering took ${(Date.now() - start)/1000}s`);

    // Process clusters

    Cluster.setEdges(edges);
    const clusters: number[][] = fs.readFileSync('data/partitions.txt').toString()
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

    start = Date.now();
    root.merge();
    console.log(`Merging took ${(Date.now() - start)/1000}s`);

    fs.writeFileSync('data/clusters.json', JSON.stringify(root.toJSON(), null, 2));

    return root;
}