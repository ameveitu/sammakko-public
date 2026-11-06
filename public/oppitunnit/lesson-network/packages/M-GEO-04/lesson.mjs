const mounted=new WeakMap();
export const shapes=[
 {id:'triangle',letter:'A',points:[[-52,38],[49,38],[-18,-48]],closed:true,straight:true},
 {id:'thin',letter:'B',points:[[-12,54],[18,-54],[35,43]],closed:true,straight:true},
 {id:'square',letter:'C',points:[[-40,-40],[40,-40],[40,40],[-40,40]],closed:true,straight:true},
 {id:'rectangle',letter:'D',points:[[-60,-30],[60,-30],[60,30],[-60,30]],closed:true,straight:true},
 {id:'rhombus',letter:'E',points:[[0,-32],[60,0],[0,32],[-60,0]],closed:true,straight:true},
 {id:'circle',letter:'F',circle:true,radius:46},
 {id:'open',letter:'G',points:[[-48,40],[48,40],[0,-44],[-34,16]],closed:false,straight:true},
 {id:'curved',letter:'H',points:[[-48,40],[48,40],[0,-44]],closed:true,straight:false}
];
export const rules=[{key:'triangle',name:'kolmiot'},{key:'rectangle',name:'suorakulmiot'},{key:'square',name:'neliöt'},{key:'circle',name:'ympyrät'}];
const getShape=id=>{const s=shapes.find(x=>x.id===id);if(!s)throw new RangeError('Unknown shape');return s;};
export function polygonFacts(points){
 if(!Array.isArray(points)||points.length<3||Array.from(points).some(p=>!Array.isArray(p)||p.length!==2||Array.from(p).some(x=>!Number.isFinite(x))))throw new RangeError('Invalid polygon');
 const edges=points.map(([x,y],i)=>{const q=points[(i+1)%points.length];return[q[0]-x,q[1]-y];});
 const squared=edges.map(([x,y])=>x*x+y*y);
 const dots=edges.map(([x,y],i)=>{const q=edges[(i+1)%edges.length];return x*q[0]+y*q[1];});
 const area=Math.abs(points.reduce((sum,[x,y],i)=>{const q=points[(i+1)%points.length];return sum+x*q[1]-y*q[0];},0))/2;
 return {count:points.length,squared,dots,area,equalSides:squared.every(x=>Math.abs(x-squared[0])<1e-7),rightAngles:dots.every(x=>Math.abs(x)<1e-7),nondegenerate:area>0&&squared.every(x=>x>0)};
}
export function belongs(id,rule){
 if(!rules.some(r=>r.key===rule))throw new RangeError('Unknown group');
 const s=getShape(id);if(rule==='circle')return s.circle===true;
 if(s.circle||!s.closed||!s.straight)return false;
 const f=polygonFacts(s.points);if(!f.nondegenerate)return false;
 if(rule==='triangle')return f.count===3;
 if(rule==='rectangle')return f.count===4&&f.rightAngles;
 return f.count===4&&f.rightAngles&&f.equalSides;
}
export function rotatePoints(points,degrees){
 polygonFacts(points);if(!Number.isFinite(degrees))throw new RangeError('Invalid rotation');
 const a=degrees*Math.PI/180;return points.map(([x,y])=>[x*Math.cos(a)-y*Math.sin(a),x*Math.sin(a)+y*Math.cos(a)]);
}
function reason(id,rule){
 const s=getShape(id);
 if(id==='open')return 'Reunassa on aukko. Kolmion, neliön, suorakulmion ja ympyrän reuna on suljettu.';
 if(id==='curved')return 'Yksi sivu kaartuu. Tämä ei ole suorasivuinen monikulmio eikä koko reunaltaan ympyrä.';
 if(s.circle)return 'Reuna on ympyrän kaari: siinä ei ole suoria sivuja tai teräviä kulmia.';
 const f=polygonFacts(s.points);
 if(rule==='triangle')return `Tässä on ${f.count} suoraa sivua. Kolmiossa on kolme ja reuna on suljettu.`;
 if(rule==='circle')return 'Reunassa on suoria sivuja ja teräviä kulmia. Ympyrän reuna on kokonaan kaareva.';
 if(f.count!==4)return 'Tässä on kolme sivua. Suorakulmiossa ja neliössä on neljä sivua.';
 if(!f.rightAngles)return 'Sivut ovat yhtä pitkät, mutta kulmat eivät vastaa paperin suoraa nurkkaa. Pelkkä sivujen yhtä pitkä mitta ei tee neliötä tai suorakulmiota.';
 if(rule==='square'&&!f.equalSides)return 'Kulmat ovat suorat, mutta kaikki sivut eivät ole yhtä pitkiä. Tämä on suorakulmio, mutta ei neliö.';
 return id==='square'?'Neliöllä on neljä suoraa kulmaa ja neljä yhtä pitkää sivua. Se kuuluu myös suorakulmioihin.':rule==='triangle'?'Kolme suoraa sivua ja suljettu reuna: kolmio.':'Neljän suoran kulman kuvio on suorakulmio.';
}
export function checkGroup(selected,rule){
 if(!Array.isArray(selected))throw new RangeError('Invalid selection');
 Array.from(selected).forEach(getShape);if(!rules.some(r=>r.key===rule))throw new RangeError('Unknown group');
 const chosen=[...new Set(selected)];
 const extra=chosen.find(id=>!belongs(id,rule));
 if(extra)return{ok:false,code:'extra',id:extra,message:`Katso kuviota ${getShape(extra).letter}. ${reason(extra,rule)} Poista se tästä ryhmästä.`};
 const missing=shapes.find(s=>belongs(s.id,rule)&&!chosen.includes(s.id));
 if(missing)return{ok:false,code:'missing',id:missing.id,message:`Valitse vielä kuvio ${missing.letter}. ${missing.id==='square'&&rule==='rectangle'?'Myös neliössä on neljä suoraa kulmaa. Se on siis suorakulmio.':rule==='triangle'?'Siinä on kolme suoraa sivua ja suljettu reuna. Myös kapea tai käännetty kolmio kuuluu mukaan.':rule==='square'?'Siinä on neljä yhtä pitkää sivua ja neljä suoraa kulmaa. Asento ei muuta niitä.':'Ympyrän reuna on kokonaan kaareva, ilman teräviä kulmia.'} Aiemmat sopivat valinnat saavat jäädä.`};
 return{ok:true,code:'match',message:`Valintasi vastaavat sääntöä: ${rules.find(r=>r.key===rule).name}. Väri ja asento eivät muuta ryhmää. Kerro yhden kuvion ratkaiseva ominaisuus.`};
}
const ink='#183e36';
const pathFor=s=>s.points.map((p,i)=>(i?'L':'M')+p.join(' ')).join(' ')+(s.closed?' Z':'');
function outline(s,fill,stroke=ink){
 if(s.circle)return `<circle cx="0" cy="0" r="${s.radius}" fill="${fill}" stroke="${stroke}" stroke-width="3"/>`;
 if(!s.straight)return `<path d="M-48 40 L48 40 Q65 -5 0 -44 Z" fill="${fill}" stroke="${stroke}" stroke-width="3"/>`;
 return `<path d="${pathFor(s)}" fill="${s.closed?fill:'none'}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>`;
}
export function shapeSvg(id,angle=0,changed=false){
 const s=getShape(id);if(!Number.isFinite(angle))throw new RangeError('Invalid drawing rotation');
 const info=s.circle?'Suljettu kaareva reuna ilman teräviä kulmia.':!s.closed?'Reuna on auki.':!s.straight?'Yksi sivu on kaareva.':`${s.points.length} suoraa sivua, suljettu reuna.`;
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-90 -90 180 180" role="img" aria-label="Kuvio ${s.letter}. ${info}"><g transform="rotate(${angle})">${outline(s,changed?'#edcf89':'#c8e0e6')}</g></svg>`;
}
const demoIds=['triangle','square','rectangle','circle','rhombus'];
export function demoSvg(id,angle=0,step=0){
 if(!demoIds.includes(id)||!Number.isInteger(step)||step<0||step>(id==='circle'?4:getShape(id).points.length))throw new RangeError('Invalid edge demonstration');
 const s=getShape(id);let trace='';
 if(s.circle){const circumference=2*Math.PI*s.radius;trace=`<circle cx="0" cy="0" r="${s.radius}" fill="none" stroke="#8d4314" stroke-width="6" stroke-dasharray="${circumference*step/4} ${circumference}" transform="rotate(-90)"/>`;}
 else if(step){trace=`<path d="M${s.points[0].join(' ')} ${Array.from({length:step},(_,i)=>'L'+s.points[(i+1)%s.points.length].join(' ')).join(' ')}" fill="none" stroke="#8d4314" stroke-width="6"/>`+Array.from({length:step},(_,i)=>`<circle cx="${s.points[(i+1)%s.points.length][0]}" cy="${s.points[(i+1)%s.points.length][1]}" r="6" fill="#8d4314"/>`).join('');}
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-90 -90 180 180" role="img" aria-label="Reunan tutkiminen. ${id==='circle'?'Kaareva reuna, ei teräviä kulmia.':step+' suoraa sivua seurattu.'}"><g transform="rotate(${angle})">${outline(s,'#fffaf0','#81968b')}${trace}</g></svg>`;
}
const descriptions={triangle:'Kolme suoraa sivua, kolme kulmaa ja suljettu reuna: kolmio.',square:'Neljä yhtä pitkää sivua ja neljä paperin nurkan kaltaista suoraa kulmaa: neliö. Neliö on myös suorakulmio.',rectangle:'Neljä suoraa kulmaa: suorakulmio. Tässä vierekkäiset sivut ovat eripituiset.',circle:'Ympyrän reuna kaartuu tasaisesti. Siinä ei ole teräviä kulmia. Reuna on joka suunnassa yhtä kaukana keskeltä.',rhombus:'Tässäkin on neljä yhtä pitkää sivua. Kulmat eivät ole suoria: se ei ole neliö. Vertaa kulmia paperin nurkkaan.'};
export function mount(host){
 const scope=host.closest('#lesson-body')?.querySelector('[data-shape-lesson]');if(!scope)throw new Error('Missing shape lesson');
 mounted.get(scope)?.dispose();let model='triangle',angle=0,step=0,rule=0,chosen=[],changed=false,paused=false,disposed=false;
 const disabled=new Map(),el=s=>scope.querySelector(s);
 const freeze=()=>{for(const b of scope.querySelectorAll('button,select')){if(!disabled.has(b))disabled.set(b,b.disabled);b.disabled=true;}};
 const restore=()=>{for(const[b,v]of disabled)b.disabled=v;disabled.clear();};
 const tell=(message,result='neutral',code=null)=>{const o=el('[data-shape-feedback]');o.textContent=message;o.dataset.result=result;if(code)o.dataset.code=code;else delete o.dataset.code;};
 function renderDemo(){el('[data-shape-demo]').innerHTML=demoSvg(model,angle,step);el('[data-shape-demo-caption]').textContent=descriptions[model]+(step?model==='circle'?' Seurattu kaari jatkuu ilman terävää käännöskohtaa.':` Seurattu ${step} suoraa sivua. Aloituskohta lasketaan kulmaksi vain kerran, kun kierros sulkeutuu.`:' Tutki reuna vaihe kerrallaan.');el('[data-shape-step]').disabled=step===(model==='circle'?4:getShape(model).points.length);el('[data-shape-model]').value=model;}
 function renderBoard(focus=null){el('[data-shape-rule]').textContent=`Etsi kaikki ${rules[rule].name}. Valitse sopivat kuviot ja tarkista.`;el('[data-shape-board]').innerHTML=shapes.map((s,i)=>`<button type="button" data-shape-card="${s.id}" aria-pressed="${chosen.includes(s.id)}">${shapeSvg(s.id,(changed?35:0)+[25,-20,45,0,15,0,0,0][i],changed)}<span>Kuvio ${s.letter}${chosen.includes(s.id)?' ✓ valittu':''}</span></button>`).join('');if(focus)el(`[data-shape-card="${focus}"]`)?.focus();}
 function reset(){if(disposed)return;restore();model='triangle';angle=0;step=0;rule=0;chosen=[];changed=false;renderDemo();renderBoard();tell('Tutki ominaisuuksia. Valitse kuviot ja tarkista rauhassa.');if(paused)freeze();}
 function click(e){const b=e.target.closest('button');if(!b||!scope.contains(b)||paused||disposed)return;
  if(b.hasAttribute('data-shape-card')){const id=b.dataset.shapeCard;chosen=chosen.includes(id)?chosen.filter(x=>x!==id):[...chosen,id];tell('Valintaa muutettu. Tarkista, kun olet valmis.');renderBoard(id);}
  else if(b.hasAttribute('data-shape-check')){const r=checkGroup(chosen,rules[rule].key);tell(r.message,r.ok?'correct':'retry',r.code);}
  else if(b.hasAttribute('data-shape-clear')){chosen=[];renderBoard();tell('Valinnat poistettu. Sama sääntö jatkuu.');}
  else if(b.hasAttribute('data-shape-rule-next')){rule=(rule+1)%rules.length;chosen=[];renderBoard();tell('Uusi sääntö, uusi ryhmä. Valinnat poistettiin.');}
  else if(b.hasAttribute('data-shape-transfer')){changed=!changed;renderBoard();tell('Värit ja asennot vaihtuivat. Aiemmat valinnat säilyivät. Ennusta ensin, tarvitseeko ryhmää muuttaa. Tarkista sitten.');}
  else if(b.hasAttribute('data-shape-turn')){angle=(angle+15)%360;renderDemo();}
  else if(b.hasAttribute('data-shape-upright')){angle=0;renderDemo();}
  else if(b.hasAttribute('data-shape-step')){step=Math.min(model==='circle'?4:getShape(model).points.length,step+1);renderDemo();}
  else if(b.hasAttribute('data-shape-trace-reset')){step=0;renderDemo();}
 }
 function change(e){if(paused||disposed||!e.target.hasAttribute('data-shape-model'))return;model=e.target.value;angle=0;step=0;renderDemo();}
 scope.addEventListener('click',click);scope.addEventListener('change',change);reset();scope.dataset.moduleReady='true';
 const api={pause(){if(disposed)return;paused=true;freeze();},resume(){if(disposed)return;paused=false;restore();},reset,dispose(){if(disposed)return;disposed=true;restore();scope.removeEventListener('click',click);scope.removeEventListener('change',change);delete scope.dataset.moduleReady;if(mounted.get(scope)===api)mounted.delete(scope);}};
 mounted.set(scope,api);return api;
}
