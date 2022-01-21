<script lang="ts">
    import AnimeView from "./AnimeView.svelte";
    import Canvas from "./Canvas.svelte";
    import Filters from "./Filters.svelte";
    import Searchbar from "./Searchbar.svelte";
    import Sidebar from "./Sidebar.svelte";
    import SidebarHeader from "./SidebarHeader.svelte";
</script>

<Canvas />

<Sidebar>
    <SidebarHeader slot="top-header" />
    <Searchbar slot="searchbar" />
    <Filters slot="filters" />

    <AnimeView slot="metadata-view" />
</Sidebar>

<style lang="scss">
</style>
