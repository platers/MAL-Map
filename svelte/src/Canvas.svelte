<script lang="ts">
	import { onMount } from "svelte";
	import { Application, Graphics, Point } from "pixi.js";
	import _ from "lodash";
	import Animes from "../../data-collection/data/min_metadata.json";
	import { AnimeNode, Node, NODE_RADIUS } from "./ts/node";
	import { Edge, LineContainer } from "./ts/edge";
	import { Viewport } from "pixi-viewport";
	import { ANIME_DICT } from "../../data-collection/types";
	import { completedList, selected_anime, settings } from "./store";
	import { drawImages, drawLabels } from "./ts/draw";
	import Edges from "../../data-collection/data/edges.json";
	import Layout_ from "../../data-collection/data/layout.json";
	import { Layout } from "constellation-graph";
	import { Cluster_Nodes } from "./ts/cluster";
	import { params_dict, updateHashParams } from "./ts/utils";
	let canvas: HTMLCanvasElement;

	const Metadata = Animes as unknown as ANIME_DICT;

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
		const circle_template: Graphics = new Graphics();
		circle_template.beginFill(0xffffff);
		circle_template.drawCircle(0, 0, NODE_RADIUS);
		const texture = app.renderer.generateTexture(circle_template);

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

		console.log(`${_.size(Metadata)} anime`);

		let nodes: Node[] = [];
		let edges = [];
		let line_container = new LineContainer(20);

		viewport.on("clicked", (event) => {
			if (AnimeNode.last_click_time > Date.now() - 200) {
				return;
			}
			Node.selected = null;
			selected_anime.set(undefined); // force update
			selected_anime.set(null);
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
			) as AnimeNode[];
			vis_nodes.sort((a, b) => {
				return a.metadata.popularity - b.metadata.popularity;
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

			drawLabels(vis_nodes as AnimeNode[], viewport);
			drawImages(nodes as AnimeNode[], viewport);
			// line_container.setEdges(edges);
		}

		const all_edges = Edges["Edges"].map((v) => {
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
			nodes = _.entries(layout_json.nodes).map(([id_, pos]) => {
				let id = parseInt(id_);
				let new_node = AnimeNode.fromPos(id, pos, Metadata[id]);
				node_map[id] = new_node;
				return new_node;
			});
			edges = layout_json.edges.map((e) => {
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

			if (params_dict.show) {
				const node = (nodes as AnimeNode[]).find(
					(node) => node.canonicalTitle() === params_dict.show
				);
				if (node) {
					selected_anime.set(node.metadata);
				}
			}

			selected_anime.subscribe((anime) => {
				if (!anime) {
					params_dict.show = null;
					updateHashParams();
					return;
				}

				const node = node_map[anime.id] as AnimeNode;
				if (AnimeNode.last_click_time < Date.now() - 200) {
					Node.selected = node;
					viewport.animate({
						position: new Point(node.x, node.y),
						scale: 2,
						time: 500,
						ease: "easeInOutSine",
					});
				}

				// update hash
				params_dict.show = node.canonicalTitle();
				updateHashParams();
			});

			completedList.subscribe((list) => {
				const startNodes =
					list?.length > 0
						? list.map((id) => node_map[id]).filter((node) => node)
						: nodes;
				Node.bfs(startNodes, nodes);
			});
		}
	});
</script>

<canvas bind:this={canvas} />
