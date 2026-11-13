import { build } from "esbuild";
import { cp, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";

const destination = resolve("dist/wechat");
const siteOrigin = process.env.SITE_URL ? new URL(process.env.SITE_URL).origin : "";
await mkdir(destination + "/assets", { recursive: true });
let project = {};
try {
  project = JSON.parse(await readFile(destination + "/project.config.json", "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const { outputFiles } = await build({
  entryPoints: ["wechat/game.js"],
  outfile: destination + "/game.js",
  bundle: true,
  format: "iife",
  target: "es2019",
  minify: false,
  write: false,
  define: { "process.env.SITE_URL": JSON.stringify(siteOrigin) },
});
for (const name of ["balloon", "cloud-bank", "dawn-sky"])
  await cp(`public/art/${name}.webp`, `${destination}/assets/${name}.webp`);
for (const name of ["bricolage-800.ttf", "dm-sans-400.ttf", "dm-sans-600.ttf", "BricolageGrotesque-OFL.txt", "DMSans-OFL.txt"])
  await cp(`public/fonts/${name}`, `${destination}/assets/${name}`);
await cp("LICENSE", destination + "/LICENSE");
await writeFile(destination + "/game.json", JSON.stringify({
  deviceOrientation: "portrait",
  showStatusBar: false,
}, null, 2) + "\n");
await writeFile(destination + "/project.config.json", JSON.stringify({
  ...project,
  description: "RARE Air native Canvas trivia game",
  projectname: "RARE Air",
  appid: process.env.WECHAT_APP_ID || project.appid || "touristappid",
  compileType: "game",
  libVersion: "latest",
  setting: { ...project.setting, es6: true, minified: true, urlCheck: true },
}, null, 2) + "\n");
// DevTools watches the project. Replace its entry only after the build is complete.
const entry = resolve(`dist/.wechat-game-${randomUUID()}.js`);
await writeFile(entry, outputFiles[0].contents);
await rename(entry, destination + "/game.js");
console.log("Built WeChat game in dist/wechat. A production game AppID is required for publication.");
