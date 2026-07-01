/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}

declare module '*.jpg?*' {
	const src: string;
	export default src;
}

declare module '*.jpeg?*' {
	const src: string;
	export default src;
}

declare module '*.png?*' {
	const src: string;
	export default src;
}

declare module '*.webp?*' {
	const src: string;
	export default src;
}

declare module '*?w=150;480;768;1280&format=webp;jpg&quality=72&as=srcset' {
	const srcset: string;
	export default srcset;
}

declare module '*?w=150;480;768;1280&format=webp;jpg&as=srcset' {
	const srcset: string;
	export default srcset;
}

declare module '*?*as=srcset' {
	const srcset: string;
	export default srcset;
}

declare module '*?*' {
	const src: string;
	export default src;
}

declare module '*?w=960;1280;1600;1920&format=webp;jpg&as=srcset' {
	const srcset: string;
	export default srcset;
}

declare module '*?w=1600&format=webp' {
	const src: string;
	export default src;
}

declare module '*?w=96;160;240&format=webp;png&as=srcset' {
	const srcset: string;
	export default srcset;
}

declare module '*?w=160&format=png' {
	const src: string;
	export default src;
}
