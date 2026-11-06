import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {renderWhitepaper} from './build.mjs';

const source=await readFile(new URL('./Sammakko_whitepaper_FI.md',import.meta.url),'utf8');
test('all 22 original chapters and reader download survive the web presentation',()=>{
  assert.deepEqual([...source.matchAll(/^# (\d+)\./gm)].map(m=>Number(m[1])),Array.from({length:22},(_,i)=>i+1));
  const html=renderWhitepaper(source);
  assert.match(html,/<a href="\.\/Sammakko_whitepaper_FI\.md" download="Sammakko_whitepaper_FI\.md">/);
  assert.match(html,/<a href="https:\/\/doi.org\/10\.1111\/j\.1467-9280\.2006\.01693\.x">DOI<\/a>/);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(new Set(ids).size,ids.length);
  for(const match of html.matchAll(/href="#([^"]+)"/g))assert(ids.includes(match[1]),`Missing ${match[1]}`);
});
test('explicit anchors preserve links across heading edits; duplicate anchors fail',()=>{
  const fixture='# Paper\n## Subtitle\n\nMetadata\n---\n# New title {#stable}\nText\n';
  assert.match(renderWhitepaper(fixture),/<h2 id="stable">New title<\/h2>/);
  assert.throws(()=>renderWhitepaper(fixture+'# Another title {#stable}\n'),/Duplicate/);
});
test('markup is escaped and unfinished code blocks fail',()=>{
  const fixture='# Paper\n## Subtitle\n---\n# Chapter\n<script>alert(1)</script>\n';
  assert.match(renderWhitepaper(fixture),/&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.throws(()=>renderWhitepaper(fixture+'\n```text\nunfinished'),/Unclosed/);
});
