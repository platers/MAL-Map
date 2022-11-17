<script lang="ts">
	import { onMount } from "svelte";
	import { Application, Graphics, Point } from "pixi.js";
	import _ from "lodash";
	import { FullNode, Node, NODE_RADIUS } from "./ts/node";
	import { Edge, LineContainer } from "./ts/edge";
	import { Viewport } from "pixi-viewport";
	import { drawImages, drawLabels } from "./ts/draw";
	import { Layout } from "../../data-collection/layout";
	import { params_dict, updateHashParams } from "./ts/base_utils";
	import { Writable } from "svelte/store";
	import { Cluster_Nodes } from "./ts/utils";
	import { METADATA_DICT } from "./ts/base_types";

	let canvas: HTMLCanvasElement;
	export let onInit: (
		nodes: FullNode[],
		node_map: { [id: number]: FullNode }
	) => void;
	export let selected_movie: Writable<any>;

	export let Metadata_: METADATA_DICT;
	export let Edges: (number | string)[][];
	export let Layout_: any;

	onMount(async () => {
		const app = new Application({
			view: canvas,
			width: window.innerWidth,
			height: window.innerHeight,
			resolution: window.devicePixelRatio || 1,
			autoDensity: true,
			backgroundColor: 0x2c2620,
			resizeTo: window,
		});
		const zoomIn = document.getElementById("zoom-in") as HTMLElement;
		const zoomOut = document.getElementById("zoom-out") as HTMLElement;
		const circle_template: Graphics = new Graphics();
		circle_template.beginFill(0xffffff);
		circle_template.drawCircle(0, 0, NODE_RADIUS);
		const texture = app.renderer.generateTexture(circle_template);

		const SCALE_BY = 0.95;
		zoomIn.addEventListener(
			"click",
			function () {
				viewport.zoomPercent(SCALE_BY, true);
			},
			false
		);
		zoomOut.addEventListener(
			"click",
			function () {
				viewport.zoomPercent(-(SCALE_BY / (1 + SCALE_BY)), true);
			},
			false
		);

		const viewport = new Viewport({
			interaction: app.renderer.plugins.interaction,
			stopPropagation: true,
		});
		viewport.sortableChildren = true;
		viewport.moveCenter(0, 0);

		viewport.drag().pinch().wheel().decelerate();
		window.addEventListener("resize", () => {
			viewport.resize(window.innerWidth, window.innerHeight);
		});

		app.stage.addChild(viewport);

		console.log(`${_.size(Metadata_)} movies`);

		let nodes: Node[] = [];
		let edges = [];
		let line_container = new LineContainer(20);

		viewport.on("clicked", () => {
			if (FullNode.last_click_time > Date.now() - 200) {
				return;
			}
			Node.selected = null;
			selected_movie.set(undefined); // force update
			selected_movie.set(null);
		});

		// Render loop
		if (params_dict.animate === "true") {
			app.ticker.add(updateSimulation);
		} else {
			drawLayout(Layout_);
		}

		function updateNodes() {
			for (const node of nodes) {
				node.graphics.visible = false;
			}
			const viewport_bounds = viewport.getVisibleBounds();
			viewport_bounds.pad(viewport_bounds.width * 0.2);
			let vis_nodes = nodes.filter((node) =>
				viewport_bounds.contains(node.x, node.y)
			) as FullNode[];
			vis_nodes.sort((a, b) => {
				return b.metadata.members - a.metadata.members;
			});
			vis_nodes = vis_nodes.slice(0, 1000);
			for (const node of vis_nodes) {
				node.update();
				node.graphics.visible = true;
			}
			const invisible_nodes = _.difference(nodes, vis_nodes);
			for (const node of invisible_nodes) {
				node.label.visible = false;
			}

			drawLabels(vis_nodes as FullNode[], viewport);
			drawImages(nodes as FullNode[], viewport);
			// line_container.setEdges(edges);
		}

		const all_edges = Edges.map((v) => {
			return [v[0] as number, v[1] as number, parseFloat(v[2] as string)];
		});
		const layout = new Layout(Cluster_Nodes, all_edges, 20);
		const start_layout = Date.now();
		function updateSimulation() {
			if (layout.done) {
				app.ticker.remove(updateSimulation);
				console.log(
					`layout took ${(Date.now() - start_layout) / 1000}s`
				);
				drawLayout(layout.toJSON());
				return;
			}

			layout.tick(5);
			updateView();

			function updateView() {
				viewport.removeChildren();
				let node_map = {};
				nodes = layout.simulation.nodes().map((node) => {
					const new_node = new Node(node.id);
					new_node.x = node.x;
					new_node.y = node.y;
					new_node.hue = node.hue;
					node_map[node.id] = new_node;
					return new_node;
				});
				edges = layout.edges.map((e) => {
					return new Edge(
						node_map[e.source.id],
						node_map[e.target.id],
						e.weight
					);
				});
				line_container.setEdges(edges);

				for (const line of line_container.buckets) {
					viewport.addChild(line);
				}

				for (const node of nodes) {
					node.addSprite(texture);
					viewport.addChild(node.graphics);
					node.update();
				}
			}
		}

		function drawLayout(layout_json) {
			viewport.removeChildren();
			let node_map: { [id: number]: Node } = {};
			nodes = _.entries(layout_json.nodes).filter(([id_, _]) => {
				return Metadata_[id_];
			}).map(([id_, pos]) => {
				let id = parseInt(id_);
				let new_node = FullNode.fromPos(id, pos, Metadata_[id]);
				node_map[id] = new_node;
				return new_node;
			});
			edges = layout_json.edges.map((e) => {
				if (!node_map[e[0]] || !node_map[e[1]]) {
					return;
				}
				return new Edge(node_map[e[0]], node_map[e[1]], e[2]);
			});
			line_container.setEdges(edges);

			for (const line of line_container.buckets) {
				viewport.addChild(line);
			}

			for (const node of nodes) {
				node.addSprite(texture);
				viewport.addChild(node.graphics);
				viewport.addChild(node.label);
				node.update();
			}
			app.ticker.add(updateNodes);

			viewport.clampZoom({
				minWidth: 50,
				maxWidth: 10000,
			});
			viewport.setZoom(0.01);

			if (params_dict.movie) {
				const node = (nodes as FullNode[]).find(
					(node) =>
						node.metadata.canonicalTitle() === params_dict.movie
				);
				if (node) {
					selected_movie.set(node.metadata);
				}
			}

			selected_movie.subscribe((movie) => {
				if (!movie) {
					params_dict.movie = null;
					updateHashParams();
					return;
				}

				const node = node_map[movie.id] as FullNode;
				if (FullNode.last_click_time < Date.now() - 200) {
					Node.selected = node;
					viewport.animate({
						position: new Point(node.x, node.y),
						scale: 2,
						time: 500,
						ease: "easeInOutSine",
					});
				}

				// update hash
				params_dict.movie = node.metadata.canonicalTitle();
				updateHashParams();
			});

			onInit(nodes as FullNode[], node_map as { [id: number]: FullNode });

			Node.selected_movie = selected_movie;
		}
	});
</script>

<canvas bind:this={canvas}></canvas>
<div class="zoom-options">
	<button class="zoom-option" id="zoom-in">+</button>
	<button class="zoom-option" id="zoom-out">-</button>
</div>

<style>
	.zoom-options {
		position: fixed;
		bottom: 10px;
		right: 10px;
	}
	.zoom-option {
		font-size: 2rem;
		width: 40px;
		height: 40px;
		background-color: var(--color-d-white);
		border-radius: 6px;
		border: none;
		cursor: pointer;
		color: var(--color-d-gray-40);
		font-weight: bold;
	}
</style>
