<script lang="ts">
    export let genres:string[] = [];
</script>

<div class="genre-container">
    {#each genres as genre}
        <span class="genre-name">{genre}</span>
    {/each}

</div>

<style lang="scss">
    .genre-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
    }

    .genre-name {
        margin: 5px;
        padding: 5px;
        border: 1px solid var(--color-d-gray-10);
        border-radius: 5px;
        font-size: .8em;
        background: transparent;
        color: var(--color-d-gray-10);
    }
</style>