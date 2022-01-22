<script lang="ts">
    export let githubURL: string;
</script>

<div style="text-align: center;">
    <a href={githubURL} class="github-link">
        <i class="fa fa-github" style="font-size: 30px;" />
    </a>
    <slot />
</div>

<style>
    .github-link {
        color: var(--color-d-gray-20);
    }
</style>
