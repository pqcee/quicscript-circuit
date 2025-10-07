import { defineConfig, loadEnv } from "vite";
import banner from "vite-plugin-banner";
import react from "@vitejs/plugin-react-swc";
import fs from "fs";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const wasmModuleUrl = env.VITE_WASM_MODULE_URL;

  if (!wasmModuleUrl) {
    throw new Error(
      "VITE_WASM_MODULE_URL environment variable is required.\n" +
        "Please set it to point to the hosted WASM module endpoint.\n" +
        "VITE_WASM_MODULE_URL=https://quicscript.pqcee.com/module/QuICScript.js"
    );
  }

  // Read license for production builds
  let licenseString = "";
  try {
    licenseString = fs.readFileSync("./LICENSE", "utf-8");
  } catch {
    console.warn("LICENSE file not found - skipping banner in build");
  }

  const plugins = [react()];

  // Add license banner for production builds
  if (process.env.NODE_ENV === "production" && licenseString !== "") {
    const license = `${licenseString}\nVersion: ${process.env.npm_package_version}\n`;
    plugins.push(banner(license));
  }

  // Copy .wasm and .js files - will be served with the same nginx instance
  plugins.push(
    viteStaticCopy({
      targets: [
        {
          src: "public/appConfig.json",
          dest: ".",
        },
      ],
    })
  );

  return {
    base: "",
    publicDir: "public", // Explicitly set public directory
    plugins,
    server: {
      port: 5173,
      watch: {
        interval: 1000,
      },
    },
    define: {
      "import.meta.env.quicscript_url": JSON.stringify(wasmModuleUrl),
      "import.meta.env.__APP_VERSION__": JSON.stringify(
        process.env.npm_package_version
      ),
    },
    build: {
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name]-[hash].js`,
          chunkFileNames: `assets/[name]-[hash].js`,
          assetFileNames: `assets/[name]-[hash].[ext]`,
        },
      },
    },
  };
});
