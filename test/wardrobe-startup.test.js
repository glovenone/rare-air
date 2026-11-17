import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { build } from "esbuild";
const replacements = {
  "./i18n.js": `export const language=()=> 'en'; export function t(a,...v){return Array.isArray(a)?a.reduce((s,p,i)=>s+(i?v[i-1]:'')+p,''):String(a)}`,
  "./avatars.js": `export const avatars=[{id:'swallow',name:'Paper swallow',cost:0},{id:'wren',name:'Cloud wren',cost:0}]; export const avatarImage=id=>id,selectedAvatar=()=>({id:__selected,name:__selected}),selectAvatar=id=>{__selected=id;window.dispatchEvent(new Event('rare:avatar'))}`,
};
const compiled = await build({
  entryPoints: ["public/wardrobe.js"],
  bundle: true,
  format: "cjs",
  write: false,
  plugins: [
    {
      name: "ui-boundaries",
      setup(builder) {
        builder.onResolve({ filter: /.*/ }, (args) =>
          args.path in replacements
            ? { path: args.path, namespace: "test" }
            : undefined,
        );
        builder.onLoad({ filter: /.*/, namespace: "test" }, (args) => ({
          contents: replacements[args.path],
        }));
      },
    },
  ],
});
const tick = () => new Promise((resolve) => setImmediate(resolve));
function deferred() {
  let resolve;
  const promise = new Promise((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function widget(passport, request) {
  const events = new EventTarget(),
    nodes = new Map();
  const node = (id) => {
    if (!nodes.has(id)) nodes.set(id, { textContent: "", src: "" });
    return nodes.get(id);
  };
  const context = vm.createContext({
    module: { exports: {} },
    __selected: "swallow",
    Event,
    Promise,
    window: events,
    addEventListener: events.addEventListener.bind(events),
    document: { getElementById: node },
  });
  vm.runInContext(compiled.outputFiles[0].text, context);
  context.module.exports.initWardrobe({
    passport,
    request,
    openDialog() {
      throw Error("Unexpected dialog");
    },
    progression: {},
  });
  return { events, node, context };
}
test("wardrobe waits for initial passport history synchronization before requesting status", async () => {
  const ready = deferred();
  let loads = 0;
  const account = { id: "a" };
  const ui = widget(
    {
      ready: ready.promise,
      account: () => account,
      load: async () => {
        loads++;
        return { account };
      },
    },
    async () => ({ balance: 50, selected: "swallow" }),
  );
  await tick();
  assert.equal(loads, 0);
  ready.resolve();
  await tick();
  assert.equal(loads, 1);
  assert.equal(ui.node("reward-balance").textContent, "50 Sky points");
});
test("late reward responses from a previous passport cannot replace the new avatar or balance", async () => {
  let account = { id: "a" };
  const old = deferred();
  const ui = widget(
    {
      ready: Promise.resolve(),
      account: () => account,
      load: async () => ({ account }),
    },
    () =>
      account.id === "a"
        ? old.promise
        : Promise.resolve({ balance: 20, selected: "wren" }),
  );
  await tick();
  account = { id: "b" };
  ui.events.dispatchEvent(new Event("rare:identity"));
  await tick();
  assert.equal(ui.node("reward-balance").textContent, "20 Sky points");
  assert.equal(ui.context.__selected, "wren");
  old.resolve({ balance: 900, selected: "dragon" });
  await tick();
  assert.equal(ui.node("reward-balance").textContent, "20 Sky points");
  assert.equal(ui.context.__selected, "wren");
});
