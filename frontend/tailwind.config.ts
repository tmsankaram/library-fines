import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				ember: "#b91c1c",
				pine: "#166534",
				paper: "#fff8e8",
			},
			fontFamily: {
				display: ["Georgia", "serif"],
				body: ["ui-sans-serif", "system-ui", "sans-serif"],
			},
		},
	},
	plugins: [],
};

export default config;
