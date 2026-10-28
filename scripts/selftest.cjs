// Basic schema and asset tests. Node built-in assert + local TypeScript compiler.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const modules = new Map();
const localStorage = (() => {
  const map = new Map();
  return { getItem(k) { return map.get(k) ?? null; }, setItem(k,v) { map.set(k,v); }, removeItem(k) {map.delete(k);} };
})();

function load(relativeFile) {
  const file = path.resolve(root, relativeFile);
  if (modules.has(file)) return modules.get(file);
  const source = fs.readFileSync(file, 'utf8');
  const js = ts.transpileModule(source, { fileName:file, compilerOptions: {
    target:ts.ScriptTarget.ES2022, module:ts.ModuleKind.CommonJS,
  }, reportDiagnostics:true });
  if ((js.diagnostics || []).some((d) => d.category === ts.DiagnosticCategory.Error)) throw new Error(`Syntax error: ${relativeFile}`);
  const exports = {};
  const context = { exports, localStorage, Date, console,
    require(name) { return load(path.relative(root,path.resolve(path.dirname(file),name + '.ts'))); },
  };
  vm.runInNewContext(js.outputText, context, { filename:file });
  modules.set(file, exports);
  return exports;
}

const { fighters } = load('src/data/characters.ts');
const { commands, categories, tags } = load('src/data/commands.ts');
const { parseAppData, loadAppData, saveAppData, STORAGE_KEY } = load('src/lib/storage.ts');
assert.equal(new Set(fighters.map((f) => f.id)).size, fighters.length);
assert.equal(new Set(commands.map((c) => c.key)).size, commands.length);
assert.equal(categories.length,9);
assert.equal(tags.length,3);
for(const c of commands) if(c.image) assert.ok(fs.existsSync(path.join(root,'public',c.image)),'Missing '+c.image);
const now = new Date().toISOString();
const example = { version:1,mains:['ryu'],combos:[{
  id:'test-combo',characterId:'ryu',name:'Combo de teste',category:'Basic combos',
  tags:['Favorito'],damage:2100,notes:'test',steps:[{id:'a',key:'qcf'},{id:'b',key:'mp'}],
  createdAt:now,updatedAt:now,
}] };
assert.equal(parseAppData(example).combos[0].steps.length,2);
saveAppData(example);
assert.equal(loadAppData().data.combos[0].name,'Combo de teste');
assert.throws(()=>parseAppData({...example,version:2}));
assert.throws(()=>parseAppData({...example,combos:[{...example.combos[0],steps:[{id:'c',key:'unknown-command'}]}]}));
assert.throws(()=>parseAppData({...example,combos:[example.combos[0],example.combos[0]]}));
assert.throws(()=>parseAppData({...example,mains:['hacker']}));
localStorage.setItem(STORAGE_KEY,'{bad data');
const recovery = loadAppData();
assert.ok(recovery.warning);
assert.equal(recovery.data.combos.length,0);
console.log(`PASS: ${fighters.length} fighters, ${commands.length} commands, persistence and invalid backup protection.`);
