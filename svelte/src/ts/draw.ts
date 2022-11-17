import { Viewport } from "pixi-viewport";
import { rectIntersectsRect } from "./base_utils";
import { FullNode } from "./node";
import _ from 'lodash';
import { Tier } from "./utils";

function getViewportNodes(nodes: FullNode[], viewport: Viewport) {
    const bounds = viewport.getVisibleBounds();
    bounds.pad(bounds.width * 0.2, bounds.height * .1);
    return nodes.filter((node) => {
        return bounds.contains(node.x, node.y);
    });
}

export function drawLabels(nodes: FullNode[], viewport: Viewport, max_labels = 20) {
    const prev_visible_nodes = nodes.filter((node) => {
        return node.label.visible;
    });
    for (let node of nodes) {
        node.label.x = node.x;
        node.label.y = node.y + node.graphics.height / 2;
        node.label.visible = false;
    }

    let visible_nodes = getViewportNodes(nodes, viewport);
    visible_nodes.sort((a, b) => {
        if (Tier[a.id] !== Tier[b.id]) {
            return Tier[a.id] - Tier[b.id];
        }
        return b.metadata.members - a.metadata.members;
    });
    let good_nodes = visible_nodes.slice(0, max_labels);
    const kept_nodes = _.intersection(prev_visible_nodes, visible_nodes);
    const union = _.union(kept_nodes, good_nodes);
    const final_nodes = union.length < 2 * max_labels ? union : good_nodes;

    // display in order of popularity without overlap
    const bounds = viewport.getVisibleBounds();
    let min_font_size = bounds.width < bounds.height
        ? bounds.width / 1.7
        : bounds.height / 3;
    const max_font_size = min_font_size * 1.7;
    const min_scale = _.min(final_nodes.map((node) => node.scale)) - 0.0001;
    const max_scale = _.max(final_nodes.map((node) => node.scale));

    for (let i = 0; i < final_nodes.length; i++) {
        const node = final_nodes[i];
        const lambda = (node.scale - min_scale) / (max_scale - min_scale);
        const font_size = min_font_size + (max_font_size - min_font_size) * lambda;
        node.label.fontSize = font_size;
        node.label.visible = true;
        const node_bound = node.labelBounds(font_size);
        for (let j = 0; j < i; j++) {
            const other = final_nodes[j];
            if (other.label.visible && rectIntersectsRect(node_bound, other.labelBounds(font_size))) {
                node.label.visible = false;
                break;
            }
        }

    }
}


export function drawImages(nodes: FullNode[], viewport: Viewport) {
    for (let node of nodes) {
        if (node.sprite) {
            node.sprite.visible = false;
            node.graphics.visible = true;
        }
    }

    const visible_nodes = getViewportNodes(nodes, viewport) as FullNode[];
    if (viewport.screenWidthInWorldPixels > 1000) {
        return;
    }

    for (let node of visible_nodes) {
        if (!node.sprite) {
            node.initSprite(viewport);
        }
        node.sprite.visible = true;
        node.sprite.zIndex = node.graphics.zIndex + 1;
        // node.graphics.visible = false;
        node.label.y = node.y + node.sprite.height / 2;
        node.sprite.alpha = node.brightness;
    }
}