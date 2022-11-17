// import * as _ from 'lodash-es';
import { Node } from './node';
import { Graphics } from 'pixi.js';

export class Edge {
    index: number = 0;
    source: Node;
    target: Node;
    weight: number;

    constructor(source: Node, target: Node, weight: number) {
        this.source = source;
        this.target = target;
        this.weight = weight;
        source.neighbors.push(target);
        target.neighbors.push(source);
        source.edges.push(this);
        target.edges.push(this);
    }

    alpha() {
        let alpha = this.weight * 5;
        const selected = Node.selected &&
            (Node.selected.id === this.source.id ||
                Node.selected.id === this.target.id);
        const hovered = Node.hovered &&
            (Node.hovered.id === this.source.id ||
                Node.hovered.id === this.target.id);

        if (selected || hovered) {
            alpha *= 8;
        }
        return Math.min(.8, alpha);
    }

    static strength(edge: Edge) {
        return edge.weight;
    }
}

export class LineContainer {
    buckets: Graphics[] = [];

    constructor(num_buckets: number) {
        for (let i = 0; i < num_buckets; i++) {
            this.buckets.push(new Graphics());
        }
    }

    setEdges(edges: Edge[]) {
        for (let i = 0; i < this.buckets.length; i++) {
            this.buckets[i].clear();
            this.buckets[i].lineStyle(1, 0xb0a08d, i / (this.buckets.length - 1));
        }

        for (const edge of edges) {
            if (!edge){
                continue;
            }
            const bucket_id = Math.floor(edge.alpha() * (this.buckets.length - 1));
            const bucket = this.buckets[bucket_id];
            bucket.moveTo(edge.source.x, edge.source.y);
            bucket.lineTo(edge.target.x, edge.target.y);
        }
    }
}