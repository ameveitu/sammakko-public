import {test} from 'node:test';
import assert from 'node:assert/strict';
import {publicationSettings,decorateHtml,sitemap} from './publication-metadata.mjs';

const config={schema:'sammakko-public-site/1',publicOrigin:null,authorName:null,contactEmail:null};
const html='<html><head><title>Sammakko</title></head><body></body></html>';
test('TBD stays honest: preview is not indexed and no invented canonical host or author appears',()=>{
  const settings=publicationSettings(config);
  const out=decorateHtml(html,'index.html',settings);
  assert.match(out,/noindex, follow/);assert.doesNotMatch(out,/rel="canonical"|name="author"/);
  assert.doesNotMatch(sitemap(settings,['index.html'],new Set()),/<loc>/);
});
test('a configured origin produces real canonical, share image and only useful sitemap entries',()=>{
  const settings=publicationSettings(config,'https://sammakko.example');
  const out=decorateHtml(html,'whitepaper/index.html',settings);
  assert.match(out,/href="https:\/\/sammakko.example\/whitepaper\/"/);
  assert.match(out,/content="https:\/\/sammakko.example\/assets\/share.png"/);
  const redirect=decorateHtml(html,'saaristo/index.html',settings);
  assert.match(redirect,/noindex, follow/);
  assert.match(redirect,/rel="canonical" href="https:\/\/sammakko.example\/"/);
  const xml=sitemap(settings,['index.html','saaristo/index.html','404.html','oppitunnit/lessons/A.html','oppitunnit/lessons/B.html'],new Set(['A']));
  assert.match(xml,/lessons\/A.html/);assert.doesNotMatch(xml,/saaristo|404|lessons\/B.html/);
  assert.match(decorateHtml(html,'oppitunnit/lessons/B.html',settings,true),/noindex, follow/);
});
test('malformed origins and duplicate metadata fail before packaging',()=>{
  for(const value of ['http://site.example','https://site.example/path','https://user:pass@site.example','https://localhost','TBD'])assert.throws(()=>publicationSettings(config,value));
  assert.throws(()=>decorateHtml('<head><meta name="robots" content="index"></head>','index.html',publicationSettings(config)),/Duplicate metadata/);
});

test('audience documents stay unindexed and canonicalize to the same lesson without adding sitemap URLs',()=>{
  const settings=publicationSettings(config,'https://sammakko.example');
  const source=html.replace('</head>','<meta name="robots" content="noindex, follow"></head>');
  const out=decorateHtml(source,'oppitunnit/presentations/M-MEAS-00.html',settings);
  assert.equal((out.match(/name="robots"/g)??[]).length,1);
  assert.match(out,/<meta name="robots" content="noindex, follow">/);
  assert.match(out,/rel="canonical" href="https:\/\/sammakko.example\/oppitunnit\/lessons\/M-MEAS-00.html"/);
  const xml=sitemap(settings,['index.html','oppitunnit/lessons/M-MEAS-00.html','oppitunnit/presentations/M-MEAS-00.html'],new Set(['M-MEAS-00']));
  assert.equal((xml.match(/<loc>/g)??[]).length,2);
  assert.doesNotMatch(xml,/presentations/);
  assert.match(decorateHtml(source,'oppitunnit/presentations/M-MEAS-00.html',publicationSettings(config)),/noindex, follow/);
});

test('provided author/contact govern both visible contact information and author metadata',()=>{
  const settings=publicationSettings({...config,authorName:'Test <author>',contactEmail:'teacher@example.test'});
  const source='<head></head><span data-publication-author>TBD</span><span data-publication-contact>TBD</span>';
  const out=decorateHtml(source,'tietoa/index.html',settings);
  assert.match(out,/name="author" content="Test &lt;author&gt;"/);
  assert.match(out,/<span data-publication-author>Test &lt;author&gt;<\/span>/);
  assert.match(out,/href="mailto:teacher@example.test"/);
  assert.throws(()=>publicationSettings({...config,contactEmail:'not-an-email'}));
});
