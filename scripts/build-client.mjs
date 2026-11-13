import { build } from "esbuild";

await build({
  entryPoints: ["client/crystal.js"],
  outfile: "public/crystal.js",
  bundle: true,
  format: "esm",
  target: "es2022",
  minify: true,
  legalComments: "eof",
});
console.log("Built the interactive crystal scene.");
