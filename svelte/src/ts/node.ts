import { Graphics, BitmapFont, BitmapText, Point, Sprite, Loader, Rectangle } from 'pixi.js';
import { Viewport } from 'pixi-viewport';
import _ from 'lodash';
import { Edge } from './edge';
import { Writable } from 'svelte/store';
import { hslToHex } from './base_utils';
import { METADATA } from './base_types';
export const NODE_RADIUS = 400; // big so circle is smooth


export function createCircleSprite(texture): Sprite {
	return new Sprite(texture);
}

BitmapFont.from("TitleFont", {
	fill: 0xe6cfb3,
	fontSize: 80,
}, {
	chars: BitmapFont.ASCII.concat(['∀']),
});

export class Node {
	static selected: Node = null;
	static selected_anime: Writable<METADATA>;
	static hovered: Node = null;

	id: number;

	x: number = NaN;
	y: number = NaN;

	hue: number = 0;
	saturation: number = 30;
	lightness: number = 50;
	brightness: number = 1.0; // mutiplier based on filters

	scale: number = 1;
	dist_to_selected: number = NaN;
	recommendation_score: number = NaN;
	recommendation_rank: number = 0;

	graphics: Sprite;

	neighbors: Node[] = [];
	edges: Edge[] = [];
	all_neighbors: Node[] = [];

	label: BitmapText;

	constructor(id: number) {
		this.id = id;

	}

	addSprite(texture) {
		this.graphics = new Sprite(texture);
		this.graphics.interactive = true;
		this.graphics.on('pointerover', () => Node.hovered = this);
		this.graphics.on('pointerout', () => Node.hovered = null);
		this.graphics.anchor.set(0.5);
	}

	addLabel(label: string) {
		this.label = new BitmapText(label, {
			// fill: 0xe6cfb3,
			fontSize: 80,
			fontName: "TitleFont"
		});
		this.label.anchor.set(0.5, -0.3);
		this.label.scale.set(0.04);
		this.label.zIndex = 10;
		this.label.visible = false;
	}

	labelBounds(font_size: number) {
		// approximate the bounding box of the label. getBounds is slow
		const height = font_size * this.label.scale.y;
		const width = this.label.text.length * font_size * this.label.scale.x / 2;
		const x = this.x - width / 2;
		const y = this.y - height / 2;
		const bounds = new Rectangle(x, y, width, height);
		bounds.pad(bounds.width * 0.1, bounds.height * 0.1);
		return bounds;
	}

	update() {
		this.graphics.scale.set(this.scale / 100);
		this.unhighlight();
		if (Node.selected == this) {
			this.highlight(0);
		} else if (Node.hovered == this) {
			this.highlight(0);
		} else if (Node.selected && Node.selected.neighbors.includes(this)) {
			this.highlight(1);
		} else if (Node.hovered && Node.hovered.neighbors.includes(this)) {
			this.highlight(1);
		} else if (this.dist_to_selected === 0) {
			// this.graphics.tint = WATCHED_NODE_COLOR;
		}
		this.graphics.tint = hslToHex(this.hue, this.saturation, this.lightness * this.brightness);

		this.graphics.position.set(this.x, this.y);
	}

	highlight(degree: number) {
		// this.graphics.scale.set(1.2);
		this.graphics.zIndex = 10 - degree;
		if (degree == 0) {
			this.lightness = 60;
			this.saturation = 90;
		} else if (degree == 1) {
			this.lightness = 70;
			this.saturation = 60;
		}
		this.label.alpha = 1;
	}

	unhighlight() {
		this.lightness = 50;
		this.saturation = 30;
		this.graphics.zIndex = 0;
	}

	dist(node: Node | Point) {
		return Math.sqrt(Math.pow(this.x - node.x, 2) + Math.pow(this.y - node.y, 2));
	}

	norm() {
		return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
	}

	setScale(scale: number) {
		this.scale = scale;
	}

	radius() {
		return NODE_RADIUS * this.scale;
	}

	static bfs(start: Node[], all_nodes: Node[]) {
		const queue = new Set<Node>();
		for (const node of all_nodes) {
			node.dist_to_selected = Infinity;
			node.recommendation_score = 0;
		}

		for (const node of start) {
			queue.add(node);
			node.dist_to_selected = 0;
			node.recommendation_score = 1;
		}

		while (queue.size > 0) {
			const node = queue.values().next().value;
			queue.delete(node);

			for (const edge of node.edges) {
				const neighbor = edge.target == node ? edge.source : edge.target;
				if (neighbor.dist_to_selected < node.dist_to_selected + 1) {
					continue;
				}

				neighbor.dist_to_selected = node.dist_to_selected + 1;
				neighbor.recommendation_score += node.recommendation_score * edge.weight;
				queue.add(neighbor);
			}
		}

		const sorted = [...all_nodes]
			.sort((a: Node, b: Node) => {
				if (a.dist_to_selected != b.dist_to_selected)
					return a.dist_to_selected - b.dist_to_selected;
				return b.recommendation_score - a.recommendation_score;
			});

		for (let i = 0; i < sorted.length; i++) {
			const node = sorted[i];
			node.recommendation_rank = node.dist_to_selected === 0 ?
				0 :
				(i - start.length) / (sorted.length - start.length);
		}
	}
}


export class FullNode extends Node {
	static username = '';
	static watched_nodes = [];
	static last_click_time = 0;
	metadata: METADATA;
	sprite: Sprite = null;

	constructor(id: number, metadata: METADATA) {
		super(id);
		this.metadata = metadata;
		this.addLabel(this.metadata.display_title || this.metadata.title);
		this.setScale(Math.sqrt(this.metadata.members) / 300);
	}


	addSprite(renderer) {
		super.addSprite(renderer);
		this.graphics.on('pointerdown', () => {
			FullNode.last_click_time = Date.now();
		});
		this.graphics.on('pointerup', () => {
			if (Date.now() - FullNode.last_click_time < 200) {
				Node.selected_anime.set(this.metadata);
				Node.selected = this;
			}
		});
	}

	initSprite(view: Viewport) {
		const loader = new Loader();
		loader.add(this.metadata.picture);
		this.sprite = new Sprite();
		loader.load((loader, resources) => {
			this.sprite = new Sprite(resources[this.metadata.picture].texture);
			this.sprite.anchor.set(0.5);
			let ratio = this.sprite.texture.baseTexture.width / this.sprite.texture.baseTexture.height;
			this.sprite.width = this.graphics.width * 0.95;
			this.sprite.height = this.sprite.width / ratio;
			this.sprite.x = this.x;
			this.sprite.y = this.y;
			this.sprite.interactive = true;
			let mask = new Graphics();
			mask.beginFill(0xffffff);
			mask.drawCircle(this.x, this.y, this.sprite.width / 2);
			mask.endFill();
			this.sprite.mask = mask;
			view.addChild(mask);
			view.addChild(this.sprite);
			this.sprite.on('pointerover', () => Node.hovered = this);
			this.sprite.on('pointerout', () => Node.hovered = null);
			this.sprite.on('pointerdown', () => {
				FullNode.last_click_time = Date.now();
			});
			this.sprite.on('pointerup', () => {
				if (Date.now() - FullNode.last_click_time < 200) {
					Node.selected_anime.set(this.metadata);
					Node.selected = this;
				}
			});
		});
	}

	static fromPos(id: number, pos, metadata: METADATA) {
		const node = new FullNode(id, metadata);
		node.x = pos.x;
		node.y = pos.y;
		node.hue = pos.hue;
		return node;
	}
}
