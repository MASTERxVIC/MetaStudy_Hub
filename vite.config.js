import { defineConfig } from 'vite';

export default defineConfig({
    root: './public', // Default: The current directory containing index.html
    server: {
        port: 5173, // Optional: Define the port for the dev server
    },
});