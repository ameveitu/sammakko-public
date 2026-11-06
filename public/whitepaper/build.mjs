import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {renderSiteHeader} from '../shared/navigation.mjs';

export function renderWhitepaper(source){
  const escape=t=>String(t??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
  const slug=t=>String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  const inline=text=>{
    const tokens=/\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*|#[^)\s]*)\)|\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*/g;
    let out='',p=0;
    for(const m of text.matchAll(tokens)){out+=escape(text.slice(p,m.index));if(m[1])out+=`<a href="${escape(m[2])}">${escape(m[1])}</a>`;else if(m[3])out+=`<strong>${escape(m[3])}</strong>`;else if(m[4])out+=`<code>${escape(m[4])}</code>`;else out+=`<em>${escape(m[5])}</em>`;p=m.index+m[0].length}
    return out+escape(text.slice(p));
  };
  const lines=source.replace(/\r/g,'').split('\n');
  if(!lines[0]?.startsWith('# '))throw new Error('Whitepaper title missing');
  const title=lines[0].slice(2).trim();
  let i=1,subtitle='';
  if(lines[i]?.startsWith('## ')){subtitle=lines[i].slice(3).trim();i++}
  const front=[];
  while(i<lines.length&&lines[i].trim()!=='---'){if(lines[i].trim())front.push(lines[i].trim().replace(/\s{2}$/,''));i++}
  if(lines[i]?.trim()==='---')i++;
  const headings=[],parts=[],ids=new Set();let sectionOpen=false;
  const isBlockStart=line=>/^(#{1,3})\s|^---$|^```|^>\s?|^[-*]\s+|^\d+\.\s+/.test(line);
  while(i<lines.length){
    const line=lines[i];
    if(!line.trim()){i++;continue}
    const h=/^(#{1,3})\s+(.+)$/.exec(line);
    if(h){
      const explicit=/^(.*?)\s+\{#([a-z0-9-]+)\}$/.exec(h[2].trim());
      const raw=explicit?explicit[1]:h[2].trim(),id=explicit?explicit[2]:slug(raw),level=h[1].length;
      if(!id||ids.has(id))throw new Error(`Duplicate or empty heading anchor: ${id}`);ids.add(id);
      if(level===1){if(sectionOpen)parts.push('</section>');sectionOpen=true;parts.push(`<section aria-labelledby="${id}"><h2 id="${id}">${inline(raw)}</h2>`);headings.push({id,text:raw})}
      else parts.push(`<h${level+1} id="${id}">${inline(raw)}</h${level+1}>`);
      i++;continue;
    }
    if(line.trim()==='---'){parts.push('<hr>');i++;continue}
    if(line.startsWith('```')){const lang=line.slice(3).trim();i++;const code=[];while(i<lines.length&&!lines[i].startsWith('```'))code.push(lines[i++]);if(!lines[i]?.startsWith('```'))throw new Error('Unclosed code block');i++;parts.push(`<pre><code${lang?` class="language-${escape(lang)}"`:''}>${escape(code.join('\n'))}</code></pre>`);continue}
    if(line.startsWith('>')){const q=[];while(i<lines.length&&lines[i].startsWith('>'))q.push(lines[i++].replace(/^>\s?/,''));parts.push(`<blockquote><p>${inline(q.join(' '))}</p></blockquote>`);continue}
    if(/^[-*]\s+/.test(line)){const items=[];while(i<lines.length&&/^[-*]\s+/.test(lines[i]))items.push(lines[i++].replace(/^[-*]\s+/,''));parts.push(`<ul>${items.map(x=>`<li>${inline(x)}</li>`).join('')}</ul>`);continue}
    if(/^\d+\.\s+/.test(line)){const items=[];while(i<lines.length&&/^\d+\.\s+/.test(lines[i]))items.push(lines[i++].replace(/^\d+\.\s+/,''));parts.push(`<ol>${items.map(x=>`<li>${inline(x)}</li>`).join('')}</ol>`);continue}
    const para=[line.trim()];i++;while(i<lines.length&&lines[i].trim()&&!isBlockStart(lines[i])){para.push(lines[i].trim());i++}parts.push(`<p>${inline(para.join(' '))}</p>`);
  }
  if(sectionOpen)parts.push('</section>');
  const themeFor=t=>{const n=parseInt((/^(\d+)/.exec(t)||[])[1]||'99',10);if(n<=4)return'Idea';if(n<=11)return'Oppimismalli';if(n<=14)return'Tekninen rakenne';if(n<=18)return'Tutkimus';return'Avoimuus ja status'};
  const grouped=[];for(const h of headings){const g=themeFor(h.text);let group=grouped.find(x=>x.name===g);if(!group){group={name:g,items:[]};grouped.push(group)}group.items.push(h)}
  const toc=grouped.map(g=>`<div class="paper-toc-group"><strong>${escape(g.name)}</strong><ol>${g.items.map(h=>`<li><a href="#${h.id}">${escape(h.text)}</a></li>`).join('')}</ol></div>`).join('');
  const research=(source.match(/Saavuttaako Sammakko saman tai paremman[^?\n]+\?/)||[])[0]||'';
  const metadata=front.filter(line=>!line.startsWith('>')).map(inline).join('<br>');
  const wordCount=source.split(/\s+/).filter(Boolean).length,reading=Math.ceil(wordCount/170);
  return `<!doctype html>
<!-- Generated from Sammakko_whitepaper_FI.md by build.mjs. Do not hand-edit. -->
<html lang="fi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#f7f3e7">
<meta name="description" content="Sammakon alkuperäiseen 22 luvun whitepaperiin perustuva pedagoginen, tekninen ja tutkimuksellinen kuvaus.">
<title>Whitepaper — Sammakko</title><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/brand.css"><link rel="stylesheet" href="./whitepaper.css"><script src="/assets/site.js" defer></script></head>
<body class="whitepaper-page"><a class="skip-link" href="#main">Siirry sisältöön</a>
${renderSiteHeader('whitepaper')}
<main id="main">
<header class="paper-hero wrap"><div class="paper-intro"><p class="eyebrow">Whitepaper · tutkimus- ja kehityspaperi</p><h1>${escape(title)}</h1><p class="paper-subtitle">${escape(subtitle)}</p><p class="paper-metadata">${metadata}<br>Luettavaa noin ${reading} minuuttia</p><div class="paper-actions"><a class="button button-primary" href="#tiivistelma">Lue tiivistelmä <span aria-hidden="true">↓</span></a><a class="button button-secondary" href="/oppimisverkko/">Tutki 690 KC:n verkkoa</a><button class="button button-secondary" type="button" data-print>Tulosta / PDF</button></div><p class="paper-source"><a href="./Sammakko_whitepaper_FI.md" download="Sammakko_whitepaper_FI.md">Lataa whitepaper tekstinä (Markdown)</a></p></div><figure class="paper-aava"><div class="paper-aava-island"><img src="/lite/characters/aava/map.png" width="224" height="224" alt="Aava-ankanpoikanen tutkii karttaa."></div><figcaption>Aava näyttää suunnan. Väitteet ratkaisee näyttö.</figcaption></figure></header>
<section class="paper-status wrap"><div><strong>Nykyinen julkaisu</strong><span>1.11.2026</span></div><div class="paper-stats"><span><b>690</b> osaamiskohdetta</span><span><b>1 287</b> relaatiota</span><span><b>181</b> Lite-aihetta</span><span><b>509</b> sisältöpohjaa</span></div><p><strong>Ei empiirisesti validoitu kokonaisuus.</strong> Verkko, prerequisite-suhteet ja mastery-säännöt ovat tutkimus- ja kehityshypoteeseja. Tekninen tarkistus ei ole oppimistulosnäyttöä.</p></section>
${research?`<section class="paper-question wrap" aria-label="Tutkimuskysymys"><p class="eyebrow">Ydinhypoteesi</p><blockquote>${escape(research)}</blockquote><p>Kyse on hypoteesista, ei markkinointiväitteestä.</p></section>`:''}
<div class="paper-layout wrap"><nav class="paper-toc" aria-label="Whitepaperin sisällys"><p class="eyebrow">Sisällys</p>${toc}</nav><article class="paper-content" id="whitepaper-content">${parts.join('\n')}</article></div>
<section class="paper-next wrap"><p class="eyebrow">Paperista rakenteeseen</p><h2>Tutki sama ajatus datana tai sisältönä.</h2><p>Oppimisverkko näyttää kaikki 690 osaamiskohdetta ja niiden relaatiot.</p><div class="paper-actions"><a class="button button-primary" href="/oppimisverkko/">Avaa oppimisverkko</a></div></section>
</main><footer class="site-footer"><div class="wrap footer-inner"><a class="brand-link" href="/">Sammakko<small>Hulluttelulaboratorio</small></a><p>Uteliaisuudelle tilaa.<br>Oivalluksille aikaa.</p><nav aria-label="Alatunniste"><a href="/oppimisverkko/">Oppimisverkko</a><a href="/whitepaper/" aria-current="page">Whitepaper</a><a href="/tietoa/">Käyttö ja tiedot</a></nav><span class="footer-edition">Whitepaper v0.1 · verkkoversio 1.11.2026</span></div></footer></body></html>`;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const directory=path.dirname(fileURLToPath(import.meta.url));
  const source=await readFile(path.join(directory,'Sammakko_whitepaper_FI.md'),'utf8');
  const html=renderWhitepaper(source);
  const output=path.join(directory,'index.html');
  if(process.argv.includes('--check')){
    if(await readFile(output,'utf8')!==html)throw new Error('Whitepaper HTML is stale: run node public/whitepaper/build.mjs');
    console.log('Whitepaper HTML matches the editable source.');
  }else{
    await writeFile(output,html);
    console.log('Whitepaper built from Sammakko_whitepaper_FI.md');
  }
}
