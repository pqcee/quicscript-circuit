import { defineConfig, loadEnv } from "vite";
import banner from "vite-plugin-banner";
import react from "@vitejs/plugin-react-swc";
import fs from "fs";
import { viteStaticCopy } from "vite-plugin-static-copy";

const licenseString = fs.readFileSync("./LICENSE", "utf-8");

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const community = env.TYPE == "community";
  const license = `${licenseString}\n${community ? "Community " : ""}Version: ${
    process.env.npm_package_version
  }\n`;

  const plugins = [react(), banner(license)];

  // If not community version, copy the QuICScript files
  if (!community) {
    plugins.push(
      viteStaticCopy({
        targets: [
          {
            src: "QuICScript/target/QuICScript.wasm",
            dest: "assets",
          },
          {
            src: "QuICScript/target/QuICScript.js",
            dest: "assets",
          },
        ],
      })
    );
  }

  return {
    base: "",
    plugins,
    server: {
      watch: {
        usePolling: true,
      },
    },
    define: {
      "import.meta.env.quicscript_url": JSON.stringify(
        community ? "../QuICScript.js" : "./assets/QuICScript.js"
      ),
      "import.meta.env.__APP_VERSION__": JSON.stringify(
        process.env.npm_package_version +
          (community ? "\nCommunity Version" : "")
      ),
      "import.meta.env.COMMUNITY": community,
    },
    build: {
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`,
        },
      },
    },
  };
});
