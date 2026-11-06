import assert from 'node:assert/strict';

const escape = text => String(text).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function publicationSettings(input, originOverride) {
  assert.equal(input.schema,'sammakko-public-site/1');
  assert(input.authorName===null||(typeof input.authorName==='string'&&input.authorName.trim()),'Author must be a name or null');
  assert(input.contactEmail===null||(typeof input.contactEmail==='string'&&/^[^\s@<>"]+@[^\s@<>"]+\.[A-Za-z]{2,}$/.test(input.contactEmail)),'Contact must be an email or null');
  const value=originOverride ?? input.publicOrigin;
  let publicOrigin=null;
  if(value!==null){
    const url=new URL(value);
    assert(url.protocol==='https:' && !url.username && !url.password && !url.search && !url.hash && url.pathname==='/', 'Public origin must be an HTTPS origin without a path or credentials');
    assert(!['localhost','127.0.0.1','[::1]'].includes(url.hostname) && !url.hostname.endsWith('.invalid'), 'A preview host is not a public origin');
    publicOrigin=url.origin;
  }
  return {publicOrigin,mode:publicOrigin?'public':'preview',authorName:input.authorName,contactEmail:input.contactEmail};
}
export function pagePath(relative) {
  return '/' + (relative==='index.html'?'':relative.replace(/index\.html$/,''));
}
export function decorateHtml(html,relative,settings,scaffold=false) {
  const audience=relative.startsWith('oppitunnit/presentations/');
  // The authored 404 already declares noindex; preserve that conservative source rule.
  if(relative==='404.html')html=html.replace(/<meta name="robots" content="noindex"\s*\/?\>/i,'');
  if(audience)html=html.replace(/<meta name="robots" content="noindex, follow"\s*\/?\>/i,'');
  assert(!/name=["']robots["']|rel=["']canonical["']/i.test(html), `Duplicate metadata ownership: ${relative}`);
  if(settings.authorName)html=html.replace(/<span data-publication-author>[^<]*<\/span>/,`<span data-publication-author>${escape(settings.authorName)}</span>`);
  if(settings.contactEmail)html=html.replace(/<span data-publication-contact>[^<]*<\/span>/,`<span data-publication-contact><a href="mailto:${escape(settings.contactEmail)}">${escape(settings.contactEmail)}</a></span>`);
  const redirect=relative==='saaristo/index.html';
  const noindex=redirect||!settings.publicOrigin||scaffold||audience||relative==='404.html';
  const tags=[`<meta name="robots" content="${noindex?'noindex, follow':'index, follow'}">`];
  if(settings.publicOrigin&&relative!=='404.html'){
    const url=settings.publicOrigin+pagePath(redirect?'index.html':audience?relative.replace('oppitunnit/presentations/','oppitunnit/lessons/'):relative);
    tags.push(`<link rel="canonical" href="${escape(url)}">`,`<meta property="og:url" content="${escape(url)}">`,
      `<meta property="og:image" content="${escape(settings.publicOrigin)}/assets/share.png">`,
      '<meta property="og:image:width" content="1200">','<meta property="og:image:height" content="630">',
      '<meta property="og:image:alt" content="Aava ja Loikka kutsuvat tutkimaan matematiikkaa ja luonnontieteitä.">');
  }
  if(settings.authorName)tags.push(`<meta name="author" content="${escape(settings.authorName)}">`);
  assert(html.includes('</head>'),`Missing document head: ${relative}`);
  return html.replace('</head>',`<!-- Publication metadata: ${settings.mode}; author/contact remain in publication-config.json. -->\n${tags.join('\n')}\n</head>`);
}
export function sitemap(settings,htmlFiles,liteIds) {
  const urls=settings.publicOrigin?htmlFiles.filter(name=>name!=='404.html'&&name!=='saaristo/index.html'&&!name.startsWith('oppitunnit/presentations/')&&(!name.startsWith('oppitunnit/lessons/')||liteIds.has(name.split('/').at(-1).slice(0,-5)))):[];
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.sort().map(name=>`  <url><loc>${escape(settings.publicOrigin+pagePath(name))}</loc></url>`).join('\n')+'\n</urlset>\n';
}
