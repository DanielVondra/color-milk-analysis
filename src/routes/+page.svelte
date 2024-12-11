<div class="px-8 py-10 grid place-content-center gap-16 place-items-center bg-slate-300 text-slate-950 w-full min-h-screen">
	<div class="flex gap-16 justify-between w-full">
		<div class="flex gap-16">
			<div class="flex gap-4 items-center">
				<div class="flex flex-col gap-0 max-w-[20rem]">
					<div class="w-[12rem] h-[12rem] rounded-md" style:background-color={color_rgb}></div>
				</div>
				<div class="flex flex-col justify-between self-stretch h-auto max-w-[20rem]">
					<div class="flex flex-col gap-0 w-full">
						<div class="flex gap-2 items-center">
							<span>r</span>
							<input type="range" bind:value={colorState.r} min="0" max="255">
							<span class="block w-6 text-end text-mono">{colorState.r}</span>
						</div>
						<div class="flex gap-2 items-center">
							<span>g</span>
							<input type="range" bind:value={colorState.g} min="0" max="255">
							<span class="block w-6 text-end text-mono">{colorState.g}</span>
						</div>
						<div class="flex gap-2 items-center">
							<span>b</span>
							<input type="range" bind:value={colorState.b} min="0" max="255">
							<span class="block w-6 text-end text-mono">{colorState.b}</span>
						</div>
					</div>
					<div class="flex gap-2 items-center">
						<input type="color" value={color_rgb} oninput="{updateColorState}">
						<span class="text-mono">{color_rgb}</span>
					</div>
				</div>
			</div>
		
			<div class="flex flex-col gap-4">
				<div class="flex flex-col gap-0">
					<span class="text-mono">threshold:</span>
					<div class="flex gap-2 items-center">
						<input class="rounded" type="checkbox" bind:checked={useThreshold}>
						<input type="range" bind:value={threshold} min="0" max="1" step="0.01">
						<span class="block w-10 text-end text-mono">{threshold}</span>
					</div>
				</div>
				<select bind:value={selected} class="py-1 text-mono rounded">
					{#each options as option}
						<option value={option} class="p-0 text-mono">
							{option.label}
						</option>
					{/each}
				</select>
				<select bind:value={blendOption} class="py-1 text-mono rounded">
					{#each blendOptions as option}
						<option value={option} class="p-0 text-mono">
							{option}
						</option>
					{/each}
				</select>
			</div>
		</div>
		
		<div class="flex flex-col gap-4 justify-between self-stretch">
			<div class="flex flex-col gap-0">
				<span>legenda:</span>
				<div class="flex gap-4 items-center">
					<div class="w-3 h-3 bg-[{COLORS.valid}]"></div>
					<span>x &lt; threshold</span>
				</div>
				<div class="flex gap-4 items-center">
					<div class="w-3 h-3 bg-[{COLORS.invalid}]"></div>
					<span>x &gt; threshold</span>
				</div>
			</div>
			<div class="flex flex-col gap-0">
				{#each options as option}
					{@const value = option.value(colorState.r, colorState.g, colorState.b).toFixed(2)}
					<div class="flex gap-2 items-center">
						<div class="w-3 h-3 bg-{useThreshold ? `[${+value < threshold ? COLORS.valid : COLORS.invalid}]` : 'transparent'}"></div>
						<span class="grow">{option.label}</span>
						<span>{value}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
	
	<div class="flex gap-12">
		<div class="flex flex-col gap-1 items-center">
			<div class="flex gap-4 items-center">
				<span class="font-bold text-md text-mono">statické R</span>
				<div class="w-3 h-3 bg-[#ff0000]"></div>
			</div>
			<div class="relative">
				<canvas class="w-[20rem] rounded" width="{WIDTH}" height="{HEIGHT}" bind:this={canvasR}></canvas>
				<div class="axis axis--x">g</div>
				<div class="axis axis--y">b</div>
				<div class="axis axis--o whitespace-nowrap">^[0, 0]</div>
			</div>
		</div>

		<div class="flex flex-col gap-1 items-center">
			<div class="flex gap-4 items-center">
				<span class="font-bold text-md text-mono">statické G</span>
				<div class="w-3 h-3 bg-[#00ff00]"></div>
			</div>
			<div class="relative">
				<canvas class="w-[20rem] rounded" width="{WIDTH}" height="{HEIGHT}" bind:this={canvasG}></canvas>
				<div class="axis axis--x">r</div>
				<div class="axis axis--y">b</div>
				<div class="axis axis--o whitespace-nowrap">^[0, 0]</div>
			</div>
		</div>

		<div class="flex flex-col gap-1 items-center">
			<div class="flex gap-4 items-center">
				<span class="font-bold text-md text-mono">statické B</span>
				<div class="w-3 h-3 bg-[#0000ff]"></div>
			</div>
			<div class="relative">
				<canvas class="w-[20rem] rounded" width="{WIDTH}" height="{HEIGHT}" bind:this={canvasB}></canvas>
				<div class="axis axis--x">r</div>
				<div class="axis axis--y">g</div>
				<div class="axis axis--o whitespace-nowrap">^[0, 0]</div>
			</div>
		</div>
	</div>
</div>

<script lang="ts">
	import { browser } from '$app/environment';
	import type { FormEventHandler } from 'svelte/elements';
	const WIDTH = 255;
	const HEIGHT = 255;
	const MAX_SQUARED_DISTANCE = Math.sqrt(255**2+255**2+255**2);
	const colorState = $state({ r: 0, g: 0, b: 0 });
	const offscreen = browser ? new OffscreenCanvas(WIDTH, HEIGHT) : undefined;
	const COLORS = {
		// if chagned, need to update safelist in tailwind.config.js
		valid: '#16a34a',
		invalid: '#dc2626',
	} as const;

	let canvasR: HTMLCanvasElement | undefined;
	let canvasG: HTMLCanvasElement | undefined;
	let canvasB: HTMLCanvasElement | undefined;

	type Option = {
		label: string;
		value: (r: number, g: number, b: number) => number;
	};

	let selected = $state<Option>();
	let blendOption = $state<GlobalCompositeOperation>('source-over');
	let threshold = $state<number>(0);
	let useThreshold = $state<boolean>(false);
	
	type AnyFunction = (...args: any[]) => void
	const createDebounceFunction = <T extends AnyFunction>(fn: T, ms = 100) => {
		let timer: ReturnType<typeof setTimeout> | undefined;
		return (...args: Parameters<T>) => {
			clearInterval(timer);
			timer = setTimeout(() => fn(...args), ms);
		}
	}
	const hex2rgbMap = new Map<string, Array<number>>();
	const hex2rgb = (hex: string) => {
		if (hex2rgbMap.has(hex)) return hex2rgbMap.get(hex)!;
		const rgb = [
			parseInt(hex.slice(1, 3), 16),
			parseInt(hex.slice(3, 5), 16),
			parseInt(hex.slice(5, 7), 16),
		];

		hex2rgbMap.set(hex, rgb);
		return rgb;
	}
	const updateColorState: FormEventHandler<HTMLInputElement> = createDebounceFunction((event) => {
		const value = event.target.value;
		const res = /^#(?<r>[0-9a-f]{2})(?<g>[0-9a-f]{2})(?<b>[0-9a-f]{2})$/.exec(value);
		if (!(res && res.groups && res.groups.r && res.groups.g && res.groups.b)) return;
		colorState.r = parseInt(res.groups.r, 16);
		colorState.g = parseInt(res.groups.g, 16);
		colorState.b = parseInt(res.groups.b, 16);
	});
		
	const color_rgb = $derived(`#${colorState.r.toString(16).padStart(2, '0')}${colorState.g.toString(16).padStart(2, '0')}${colorState.b.toString(16).padStart(2, '0')}`);
	const draw = async (ctx: CanvasRenderingContext2D, transform: (x: number, y: number) => number) => {
		const imageData = ctx.createImageData(WIDTH, HEIGHT);
		const imageDataThreshold = ctx.createImageData(WIDTH, HEIGHT);
		const color = hex2rgb(COLORS.valid);

		for (let y = 0; y < HEIGHT; y++) {
			for (let x = 0; x < WIDTH; x++) {
				const index = (y * WIDTH + x) * 4;
				const v = transform(x, HEIGHT - y);
				imageData.data[index + 0] = v * 255;
				imageData.data[index + 1] = v * 255;
				imageData.data[index + 2] = v * 255;
				imageData.data[index + 3] = 255;
				
				if (useThreshold && v < threshold) {
					imageDataThreshold.data[index + 0] = color[0];
					imageDataThreshold.data[index + 1] = color[1];
					imageDataThreshold.data[index + 2] = color[2];
					imageDataThreshold.data[index + 3] = 255;
				}
			}
		}

		ctx.putImageData(imageData, 0, 0);
		if (useThreshold && offscreen) {
			ctx.globalCompositeOperation = blendOption ?? 'source-over';
			const offscreenCtx = offscreen.getContext('2d');
			if (!offscreenCtx) return;
			offscreenCtx.putImageData(imageDataThreshold, 0, 0);
			ctx.drawImage(offscreen, 0, 0);
			ctx.globalCompositeOperation = 'source-over';
		}
	};

	const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
	const map = (n: number, start1: number, stop1: number, start2: number, stop2: number, withinBounds = true) => {
		const newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
		if (!withinBounds) {
			return newval;
		}
		if (start2 < stop2) {
			return clamp(newval, start2, stop2);
		} else {
			return clamp(newval, stop2, start2);
		}
	};

	const blendOptions: Array<GlobalCompositeOperation> = [
		'color',
		'color-burn',
		'color-dodge',
		'copy',
		'darken',
		'destination-atop',
		'destination-in',
		'destination-out',
		'destination-over',
		'difference',
		'exclusion',
		'hard-light',
		'hue',
		'lighten',
		'lighter',
		'luminosity',
		'multiply',
		'overlay',
		'saturation',
		'screen',
		'soft-light',
		'source-atop',
		'source-in',
		'source-out',
		'source-over',
		'xor'
	];

	const options: Array<Option> = [
		{
			label: 'průměr rgb',
			value: (r, g, b) => {
				const n = (r + g + b) / 3;
				return map(n, 0, 255, 0, 1);
			},
		},
		{
			label: 'světlost hsl',
			value: (r, g, b) => {
				const _r = r / 255;
				const _g = g / 255;
				const _b = b / 255;
				return (Math.max(_r, _g, _b) + Math.min(_r, _g, _b)) / 2;
			},
		},
		{
			label: 'vzdálenost',
			value: (r, g, b) => {
				const d = Math.sqrt(r**2 + g**2 + b**2);
				return map(d, 0, MAX_SQUARED_DISTANCE, 0, 1);
			},
		}
	];

	$effect(() => {
		if (!canvasR || !canvasG || !canvasB) return;

		const [ctxR, ctxG, ctxB] = [canvasR.getContext('2d'), canvasG.getContext('2d'), canvasB.getContext('2d')];
		if (!ctxR || !ctxG || !ctxB) return;
		
		draw(ctxR, (x, y) => selected ? selected.value(colorState.r, x, y) : 1);
		draw(ctxG, (x, y) => selected ? selected.value(x, colorState.g, y) : 1);
		draw(ctxB, (x, y) => selected ? selected.value(x, y, colorState.b) : 1);


	});
</script>

<style lang="postcss">
.axis {
	position: absolute;
	width: 1.4rem;
	height: 1.4rem;
	display: grid;
	place-content: center;
}
.axis--y {
	top: 50%;
	right: 100%;
	transform: translateY(-50%);
}
.axis--x {
	top: 100%;
	left: 50%;
	transform: translateX(-50%);
}
.axis--o {
	top: 100%;
	left: 0%;
	width: auto;
}
</style>
