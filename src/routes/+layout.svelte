<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

{@render children()}

<style>
:global(body) {
  font-family: "JetBrains Mono", monospace;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
}
</style>