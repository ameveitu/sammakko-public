/** Ideal steady DC networks: one ideal voltage source, ideal wires and positive linear resistors.
 * Supported authoring range: 0–1000 V, 10⁻⁶–10⁶ Ω, at most 128 edges and 128 terminals.
 * The solver rejects ill-conditioned systems; it does not claim arbitrary networks.
 * Models deliberately exclude batteries' internal resistance, transients and real meter loading.
 * https://openstax.org/books/university-physics-volume-2/pages/10-4-electrical-measuring-instruments
 * https://openstax.org/books/university-physics-volume-2/pages/9-4-ohms-law
 */
export interface DCEdge {id:string;a:string;b:string;kind:'wire'|'resistor';ohms?:number;role?:'lamp'|'resistor'|'ammeter'}
export interface DCCircuit {positive:string;negative:string;volts:number;edges:readonly DCEdge[]}
export interface DCSolution {status:'ok'|'short';potentials:Readonly<Record<string,number|null>>;currents:Readonly<Record<string,number>>;sourceCurrent:number|null;lit:readonly string[];islands:Readonly<Record<string,string>>}
function gaussian(a:number[][],b:number[]):number[]{
 const n=b.length;for(let i=0;i<n;i++){let p=i;for(let j=i+1;j<n;j++)if(Math.abs(a[j]![i]!)>Math.abs(a[p]![i]!))p=j;if(Math.abs(a[p]![i]!)<1e-12)throw new RangeError('Unanchored or ill-conditioned network');[a[i],a[p]]=[a[p]!,a[i]!];[b[i],b[p]]=[b[p]!,b[i]!];const q=a[i]![i]!;for(let k=i;k<n;k++)a[i]![k]!/=q;b[i]!/=q;for(let j=0;j<n;j++)if(j!==i){const t=a[j]![i]!;for(let k=i;k<n;k++)a[j]![k]!-=t*a[i]![k]!;b[j]!-=t*b[i]!;}}return b;
}
export function solveDC(c:DCCircuit):DCSolution {
 if(!c.positive||!c.negative||!Number.isFinite(c.volts)||c.volts<0||c.volts>1000||c.edges.length>128)throw new RangeError('Invalid source');
 const nodes=new Set([c.positive,c.negative]),ids=new Set<string>();
 for(const e of c.edges){if(!e.id||ids.has(e.id)||!e.a||!e.b||!['wire','resistor'].includes(e.kind)||(e.kind==='resistor'&&(!Number.isFinite(e.ohms)||e.ohms!<1e-6||e.ohms!>1e6)))throw new RangeError('Invalid component');ids.add(e.id);nodes.add(e.a);nodes.add(e.b);}
 if(nodes.size>128)throw new RangeError('Too many terminals');
 const parent=new Map([...nodes].map(n=>[n,n]));const find=(n:string):string=>{const p=parent.get(n)!;if(p===n)return n;const root=find(p);parent.set(n,root);return root;};
 for(const e of c.edges)if(e.kind==='wire')parent.set(find(e.a),find(e.b));
 const plus=find(c.positive),minus=find(c.negative);if(plus===minus)return {status:'short',potentials:{},currents:{},sourceCurrent:null,lit:[],islands:{}};
 const resistors=c.edges.filter(e=>e.kind==='resistor');const adjacent=new Map<string,Set<string>>();const join=(a:string,b:string)=>{if(!adjacent.has(a))adjacent.set(a,new Set());adjacent.get(a)!.add(b);};
 for(const e of resistors){const a=find(e.a),b=find(e.b);join(a,b);join(b,a);}
 const anchored=new Set([plus,minus]),queue=[plus,minus];while(queue.length){const n=queue.pop()!;for(const v of adjacent.get(n)??[])if(!anchored.has(v)){anchored.add(v);queue.push(v);}}
 const unknown=[...anchored].filter(n=>n!==plus&&n!==minus),idx=new Map(unknown.map((n,i)=>[n,i])),matrix=unknown.map(()=>unknown.map(()=>0)),rhs=unknown.map(()=>0);
 for(const e of resistors){const a=find(e.a),b=find(e.b);if(a===b||!anchored.has(a)||!anchored.has(b))continue;const g=1/e.ohms!;for(const [x,y] of [[a,b],[b,a]]){const i=idx.get(x!);if(i===undefined)continue;matrix[i]![i]!+=g;const j=idx.get(y!);if(j===undefined){if(y===plus)rhs[i]!+=g*c.volts;}else matrix[i]![j]!-=g;}}
 const vals=gaussian(matrix,rhs),voltage=(n:string):number|null=>{const r=find(n);return r===plus?c.volts:r===minus?0:idx.has(r)?vals[idx.get(r)!]!:null;};
 const potentials=Object.fromEntries([...nodes].map(n=>[n,voltage(n)])),currents:Record<string,number>=Object.create(null);let sourceCurrent=0;const lit:string[]=[];
 for(const e of resistors){const va=voltage(e.a),vb=voltage(e.b),current=va===null||vb===null?0:(va-vb)/e.ohms!;currents[e.id]=current;if(find(e.a)===plus&&find(e.b)!==plus)sourceCurrent+=current;if(find(e.b)===plus&&find(e.a)!==plus)sourceCurrent-=current;if(e.role==='lamp'&&Math.abs(current)>1e-10)lit.push(e.id);}
 const islands:Record<string,string>=Object.create(null);let serial=0;for(const node of nodes){const root=find(node);if(Object.prototype.hasOwnProperty.call(islands,root))continue;const group=[root],name=String(serial++);islands[root]=name;while(group.length){const n=group.pop()!;for(const v of adjacent.get(n)??[])if(!Object.prototype.hasOwnProperty.call(islands,v)){islands[v]=name;group.push(v);}}}const nodeIslands:Record<string,string>=Object.create(null);for(const node of nodes)nodeIslands[node]=islands[find(node)]!;
 return {status:'ok',potentials,currents,sourceCurrent,lit,islands:nodeIslands};
}
/** Ideal meter connections are assessed topologically, irrespective of drawn layout. */
export function voltageAcross(result:DCsolutionLike,a:string,b:string):number|null{if(result.status!=='ok')return null;if(!Object.prototype.hasOwnProperty.call(result.potentials,a)||!Object.prototype.hasOwnProperty.call(result.potentials,b))return null;const va=result.potentials[a],vb=result.potentials[b];if(va==null||vb==null)return va==null&&vb==null&&result.islands[a]===result.islands[b]?0:null;return va-vb;}
type DCsolutionLike=Pick<DCSolution,'status'|'potentials'|'islands'>;
