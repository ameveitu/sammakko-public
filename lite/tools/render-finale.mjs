#!/usr/bin/env node
import { mkdir,writeFile,readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { createServer } from 'vite';

const args=Object.fromEntries(process.argv.slice(2).reduce((pairs,v,i,a)=>v.startsWith('--')?[...pairs,[v.slice(2),a[i+1]]]:pairs,[]));
const url=new URL(args.url??'http://127.0.0.1:5278/?qa=1#saaristo/loppu');
if(!['127.0.0.1','localhost','[::1]'].includes(url.hostname)||url.protocol!=='http:')throw Error('Render only an explicitly started local preview.');
const start=Number(args.start??0),seconds=Number(args.seconds??548),width=Number(args.width??960),fps=Number(args.fps??24);
if(![start,seconds,width,fps].every(Number.isFinite)||start<0||seconds<=0||start+seconds>548||![640,960,1280].includes(width)||![12,24,30].includes(fps))throw Error('Invalid bounded render interval or quality.');
const output=path.resolve(args.output??'output/finale');await mkdir(output,{recursive:true});
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const vite=await createServer({root,configFile:false,server:{middlewareMode:true},appType:'custom'});
let pcm;
try{const module=await vite.ssrLoadModule('/src/content/finale-score.ts');pcm=module.renderFinaleScore(22050,start,seconds);}finally{await vite.close();}
const wav=Buffer.alloc(44+pcm.length*2);wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(22050,24);wav.writeUInt32LE(44100,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(pcm.length*2,40);
let peak=0;for(let i=0;i<pcm.length;i++){peak=Math.max(peak,Math.abs(pcm[i]));wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,pcm[i]))*32767),44+i*2);}pcm=undefined;
const audioFile=path.join(output,'score.wav');await writeFile(audioFile,wav);
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
const errors=[];let receipt;
try{
  const page=await browser.newPage({viewport:{width:Math.max(1024,width+64),height:900},deviceScaleFactor:1,reducedMotion:'no-preference',acceptDownloads:true});
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  await page.route('**/__local-finale-score.wav',route=>route.fulfill({status:200,contentType:'audio/wav',body:wav}));
  await page.goto(url.href);await page.waitForFunction(()=>document.querySelector('.ep-film')?.getAttribute('data-ready')==='true',null,{timeout:60000});
  await page.waitForFunction(()=>document.querySelector('.ep-film')?.getAttribute('data-saaristo-sky')==='ready');
  await page.getByRole('button',{name:'Äänet',exact:true}).click();
  await page.locator('.ep-screen').evaluate((element,w)=>{element.style.width=`${w}px`;element.style.height=`${w*9/16}px`;element.style.maxWidth='none';},width);
  await page.waitForTimeout(300);
  const downloaded=page.waitForEvent('download',{timeout:(seconds+120)*1000});
  receipt=await page.evaluate(async({start,seconds,width,fps})=>{
    const input=document.querySelector('.ep-controls input[type=range]')??document.querySelector('input[aria-label="Etene tarinassa"]');
    const source=document.querySelector('.ep-film canvas');if(!input||!source)throw Error('Missing film clock or canvas');
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=width*9/16;const ctx=canvas.getContext('2d');if(!ctx)throw Error('No export canvas');
    const audio=new AudioContext(),buffer=await audio.decodeAudioData(await(await fetch('/__local-finale-score.wav')).arrayBuffer()),destination=audio.createMediaStreamDestination(),sound=audio.createBufferSource();sound.buffer=buffer;sound.connect(destination);await audio.resume();
    const stream=canvas.captureStream(0),video=stream.getVideoTracks()[0];stream.addTrack(destination.stream.getAudioTracks()[0]);
    const type='video/webm;codecs=vp8,opus';if(!MediaRecorder.isTypeSupported(type))throw Error('WebM/Opus recording unavailable');
    const recorder=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:width>=960?4000000:1600000,audioBitsPerSecond:96000}),chunks=[];
    recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
    const done=new Promise((resolve,reject)=>{recorder.onstop=resolve;recorder.onerror=reject;});
    const lineHeight=width*.024,font=width*.021;
    function lines(text,maxWidth){const result=[];let line='';for(const word of text.trim().split(/\s+/)){const next=line?`${line} ${word}`:word;if(ctx.measureText(next).width>maxWidth&&line){result.push(line);line=word;}else line=next;}if(line)result.push(line);return result;}
    function draw(t){
      input.value=String(start+t);input.dispatchEvent(new Event('input',{bubbles:true}));
      ctx.drawImage(source,0,0,canvas.width,canvas.height);
      const shade=Number(document.querySelector('.ep-shade')?.style.opacity??0);if(shade>0){ctx.fillStyle=`rgba(8,23,38,${shade})`;ctx.fillRect(0,0,canvas.width,canvas.height);}
      const caption=document.querySelector('.ep-caption');ctx.font=`600 ${font}px sans-serif`;ctx.textAlign='center';
      if(caption&&!caption.hidden){const rows=lines(caption.textContent,width*.87),height=rows.length*lineHeight+font;ctx.fillStyle='rgba(10,30,44,.91)';ctx.fillRect(width*.04,canvas.height-height-font,width*.92,height);ctx.fillStyle='#fff2d2';rows.forEach((line,i)=>ctx.fillText(line,width/2,canvas.height-height+(i+.45)*lineHeight));}
      const credits=document.querySelector('.ep-credits');if(credits&&!credits.hidden){ctx.fillStyle='rgba(9,27,43,.82)';ctx.fillRect(0,0,width,canvas.height);ctx.fillStyle='#fff2d2';const rows=lines(credits.textContent,width*.72);rows.forEach((line,i)=>ctx.fillText(line,width/2,canvas.height*.3+i*lineHeight*1.6));}
      video.requestFrame();
    }
    let frames=0;recorder.start(1000);sound.start();const began=performance.now();draw(0);frames++;
    await new Promise(resolve=>{const next=()=>{const t=Math.min(seconds,(performance.now()-began)/1000);draw(t);frames++;if(t>=seconds)resolve();else setTimeout(next,1000/fps);};setTimeout(next,1000/fps);});
    recorder.stop();sound.stop();await done;stream.getTracks().forEach(t=>t.stop());await audio.close();
    const blob=new Blob(chunks,{type}),link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='finale.webm';link.click();
    return {start,seconds,width,height:canvas.height,requestedFps:fps,frames,observedMeanFps:frames/seconds,bytes:blob.size,format:type,renderer:JSON.parse(window.render_game_to_text()).film.status};
  },{start,seconds,width,fps});
  const download=await downloaded;const filename=path.join(output,`finale-${width}-${start}-${seconds}.webm`);await download.saveAs(filename);receipt.file=filename;
  receipt.sha256=createHash('sha256').update(await readFile(filename)).digest('hex');
}finally{await browser.close();}
receipt={...receipt,scorePeak:peak,errors,environment:'Local headless Chromium with SwiftShader; export timing is not a device performance benchmark.',reviewStatus:'Rendered local production candidate; no human artwork, acting or listening approval implied.'};
await writeFile(path.join(output,'render-receipt.json'),`${JSON.stringify(receipt,null,2)}\n`);console.log(JSON.stringify(receipt,null,2));if(errors.length)process.exitCode=1;
