import { defineConfig, RolldownPluginOption } from "rolldown";
import fs from "node:fs";
import path from "node:path";

const rolldownCopyCssPlugin: RolldownPluginOption = {
  name: "rolldown-plugin-copy-css",
  buildStart() {
    const srcDir = path.resolve("public/scss");

    // 如果目录不存在则直接跳过
    if (!fs.existsSync(srcDir)) return;

    const files = fs.readdirSync(srcDir);

    for (const file of files) {
      if (file.endsWith(".scss")) {
        const filePath = path.join(srcDir, file);
        const source = fs.readFileSync(filePath, "utf-8");

        // 将 CSS 注册为 Asset 资源
        // 这里的 fileName 是相对于 Rolldown 配置中 output.dir（例如 'build'）的路径
        this.emitFile({
          type: "asset",
          fileName: `css/${file}`,
          source: source
        });
      }
    }
  }
};

export default defineConfig([
  {
    input: ["lib/index.ts"],
    platform: "node",
    output: {
      dir: "build",
      format: "es",
      cleanDir: true,
      strict: true,
      topLevelVar: true,
      minify: {
        compress: true,
        mangle: false
      },
      sourcemap: true
    }
  },
  {
    input: ["public/client.ts"],
    platform: "node",
    output: {
      dir: "build/public",
      format: "umd",
      cleanDir: true,
      strict: true,
      topLevelVar: true,
      minify: {
        compress: true,
        mangle: false
      },
      sourcemap: true
    },
    plugins: [rolldownCopyCssPlugin]
  }
]);
