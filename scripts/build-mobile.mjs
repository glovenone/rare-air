import { cp, mkdir, rm, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { build } from "esbuild";

const destination = resolve("dist/mobile");
const siteOrigin = process.env.SITE_URL ? new URL(process.env.SITE_URL).origin : "";
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
const sourceOnlyArt = new Set([
  "app-icon-source.png",
  "balloon.png",
  "cloud-bank.png",
  "dawn-sky.png",
]);
await cp("public", destination, {
  recursive: true,
  filter: source => !sourceOnlyArt.has(basename(source)),
});
const notices = [
  ["Capacitor", "node_modules/@capacitor/core/LICENSE"],
  ["Capacitor App", "node_modules/@capacitor/app/LICENSE"],
  ["Capacitor Haptics", "node_modules/@capacitor/haptics/LICENSE"],
  ["Capacitor Network", "node_modules/@capacitor/network/LICENSE"],
  ["Capacitor Share", "node_modules/@capacitor/share/LICENSE"],
  [
    "AndroidX and Apache-licensed Android dependencies",
    "native/licenses/Apache-2.0.txt",
  ],
  ["DM Sans", "public/fonts/DMSans-OFL.txt"],
  ["Bricolage Grotesque", "public/fonts/BricolageGrotesque-OFL.txt"],
];
const sections = [];
for (const [name, path] of notices) {
  const license = (await readFile(path, "utf8"))
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;");
  sections.push(`<section><h2>${name}</h2><pre>${license}</pre></section>`);
}
await mkdir(destination + "/licenses", { recursive: true });
await writeFile(
  destination + "/licenses/index.html",
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>Third-party notices | RARE Air</title><link rel="stylesheet" href="/guide.css"></head><body><header><a href="/">Back to RARE Air</a></header><main><h1>Third-party notices</h1>${sections.join("")}</main></body></html>`,
);
await build({
  entryPoints: ["public/app.js"],
  outfile: destination + "/app.js",
  bundle: true,
  format: "esm",
  target: ["safari15.4", "chrome110"],
  minify: false,
  define: {
    "process.env.SITE_URL": JSON.stringify(siteOrigin),
  },
  external: ["/sky.js"],
  plugins: [
    {
      name: "native-platform",
      setup(builder) {
        builder.onResolve({ filter: /^\.\/platform\.js$/ }, () => ({
          path: resolve("native/platform.js"),
        }));
      },
    },
  ],
});
console.log(
  "Built packaged mobile game with native sharing, haptics and offline practice.",
);
