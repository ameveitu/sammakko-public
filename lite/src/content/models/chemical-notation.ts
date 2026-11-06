/** Element symbols follow IUPAC. Formula/coefficient conventions follow OpenStax Chemistry 2e §§2.4,4.1. */
export const chemicalNotationSources = [
  'https://iupac.org/wp-content/uploads/2022/07/IUPAC_Periodic_Table-04May22_CRA.pdf',
  'https://openstax.org/books/chemistry-2e/pages/2-4-chemical-formulas',
  'https://openstax.org/books/chemistry-2e/pages/4-1-writing-and-balancing-chemical-equations',
  'https://openstax.org/books/chemistry-2e/pages/4-exercises',
  'https://openstax.org/books/chemistry-2e/pages/g-standard-thermodynamic-properties-for-selected-substances',
] as const;
export const chemicalElements = {
  H:'vety', He:'helium', C:'hiili', N:'typpi', O:'happi', F:'fluori', Ne:'neon',
  Na:'natrium', Mg:'magnesium', Al:'alumiini', Si:'pii', P:'fosfori', S:'rikki', Cl:'kloori',
  K:'kalium', Ca:'kalsium', Fe:'rauta', Co:'koboltti', Cu:'kupari', Zn:'sinkki', Br:'bromi',
} as const;
export const MAX_CHEMICAL_ATOMS=256*1000*8;
export type ChemicalElement = keyof typeof chemicalElements;
export type AtomInventory = Partial<Record<ChemicalElement,number>>;
export type FormulaToken = { element:ChemicalElement; count:number; explicit:boolean; start:number; end:number; multiplier:number };
export type ParsedChemicalFormula = { atoms:AtomInventory; tokens:readonly FormulaToken[] };
export type ChemicalSample = { formula:string; name:string; form:'molecule'|'lattice'|'atom' };
export type ChemicalReaction = { left:readonly ChemicalSample[]; right:readonly ChemicalSample[]; condition:string };
type SymbolsTask = { mode:'symbols'; samples:readonly { id:string; shown:string; name?:string }[] };
type FormulaTask = { mode:'formula'; sample:ChemicalSample; objective:'species'|'ratio'|'both'; palette:readonly ChemicalElement[];
  draft?:AtomInventory; monochrome:boolean };
type SubscriptTask = { mode:'subscript'; sample:ChemicalSample; target:number; palette:readonly ChemicalElement[] };
type GroupsTask = { mode:'groups'; sample:ChemicalSample; coefficient:number; source:'notation'|'groups'; palette:readonly ChemicalElement[] };
type RolesTask = { mode:'roles'; reaction:ChemicalReaction; coefficients:readonly number[]; draft?:readonly ('reactant'|'product')[] };
type BalanceTask = { mode:'balance'; reaction:ChemicalReaction; draft:readonly number[]; primitive:boolean };
export type ChemicalNotationTask = (SymbolsTask|FormulaTask|SubscriptTask|GroupsTask|RolesTask|BalanceTask)
  & {kind:'chemical-notation'; title:string};
export type ChemicalNotationResponse = (
  | { mode:'symbols'; rows:readonly {id:string;element:string;symbol:string}[] }
  | { mode:'formula'; species:readonly string[]; atoms:AtomInventory; model:AtomInventory }
  | { mode:'subscript'; element:string; count:number; implicit:boolean|null; atoms:AtomInventory }
  | { mode:'groups'; groups:number; atoms:AtomInventory }
  | { mode:'roles'; roles:readonly string[]; arrow:'change'|'equals'|'mixture'|null }
  | { mode:'balance'; coefficients:readonly number[]; left:AtomInventory; right:AtomInventory }
) & {kind:'chemical-notation'};

const kind='chemical-notation' as const;
const own=(object:object,key:PropertyKey)=>Object.prototype.hasOwnProperty.call(object,key);
export const isChemicalElement=(value:unknown):value is ChemicalElement=>typeof value==='string'&&own(chemicalElements,value);
const boundedInteger=(value:unknown,min=0,max=MAX_CHEMICAL_ATOMS):value is number=>typeof value==='number'&&Number.isSafeInteger(value)&&value>=min&&value<=max;
const record=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value)
  &&[Object.prototype,null].includes(Object.getPrototypeOf(value));
const dense=(value:unknown,max:number)=>Array.isArray(value)&&value.length<=max&&Array.from(value).every(item=>item!==undefined);

/** A school-scope grammar. One level of parentheses, no charges, hydrates, leading coefficients or arbitrary symbols. */
export function parseChemicalFormula(raw:unknown):ParsedChemicalFormula|undefined {
  if(typeof raw!=='string'||raw.length===0||raw.length>64||!/^[A-Za-z0-9()]+$/.test(raw))return;
  let position=0;
  const tokens:FormulaToken[]=[];
  const number=()=>{
    const start=position;
    while(position<raw.length&&/[0-9]/.test(raw[position]!))position++;
    if(start===position)return {count:1,explicit:false};
    const text=raw.slice(start,position),count=Number(text);
    return /^[1-9][0-9]?$/.test(text)&&count<=24?{count,explicit:true}:undefined;
  };
  const sequence=(group:boolean):AtomInventory|undefined=>{
    const atoms:AtomInventory={};
    let terms=0;
    while(position<raw.length&&raw[position]!==')'){
      if(raw[position]==='('){
        if(group)return;
        position++;
        const tokenStart=tokens.length,inside=sequence(true);
        if(!inside||raw[position]!==')')return;
        position++;
        const times=number();if(!times)return;
        for(const token of tokens.slice(tokenStart))token.multiplier*=times.count;
        for(const [symbol,count] of Object.entries(inside))atoms[symbol as ChemicalElement]=(atoms[symbol as ChemicalElement]??0)+count*times.count;
      }else{
        const start=position;
        if(!/[A-Z]/.test(raw[position]!))return;
        position++;
        if(position<raw.length&&/[a-z]/.test(raw[position]!))position++;
        const symbol=raw.slice(start,position);
        if(!isChemicalElement(symbol))return;
        const count=number();if(!count)return;
        tokens.push({element:symbol,...count,start,end:position,multiplier:1});
        atoms[symbol]=(atoms[symbol]??0)+count.count;
      }
      terms++;
    }
    return terms>0&&Object.values(atoms).every(n=>boundedInteger(n,1,256))?atoms:undefined;
  };
  const atoms=sequence(false);
  return atoms&&position===raw.length?{atoms,tokens}:undefined;
}
export function chemicalInventory(raw:string,coefficient=1):AtomInventory|undefined {
  const parsed=parseChemicalFormula(raw);
  if(!parsed||!boundedInteger(coefficient,1,1000))return;
  return Object.fromEntries(Object.entries(parsed.atoms).map(([element,n])=>[element,n*coefficient]));
}
export function chemicalReactionInventory(reaction:ChemicalReaction,coefficients:readonly number[]){
  const all=[...reaction.left,...reaction.right];
  if(!dense(coefficients,8)||coefficients.length!==all.length||!coefficients.every(n=>boundedInteger(n,1,1000)))return;
  const total=(samples:readonly ChemicalSample[],offset:number):AtomInventory|undefined=>{
    const atoms:AtomInventory={};
    for(const [index,sample] of samples.entries()){
      const counts=chemicalInventory(sample.formula,coefficients[index+offset]);
      if(!counts)return;
      for(const [symbol,n] of Object.entries(counts))atoms[symbol as ChemicalElement]=(atoms[symbol as ChemicalElement]??0)+n;
    }
    return atoms;
  };
  const left=total(reaction.left,0),right=total(reaction.right,reaction.left.length);
  return left&&right?{left,right}:undefined;
}
function validInventory(value:unknown):value is AtomInventory {
  return record(value)&&Reflect.ownKeys(value).every(key=>isChemicalElement(key)
    &&own(Object.getOwnPropertyDescriptor(value,key)??{},'value')&&boundedInteger(value[key]));
}
function sameInventory(value:unknown,wanted:AtomInventory){
  return validInventory(value)&&Object.keys(chemicalElements).every(symbol=>
    (value[symbol as ChemicalElement]??0)===(wanted[symbol as ChemicalElement]??0));
}
function proportionalInventory(value:unknown,wanted:AtomInventory){
  if(!validInventory(value))return false;
  const first=Object.keys(wanted)[0] as ChemicalElement;
  const a=value[first],b=wanted[first]!;
  return boundedInteger(a,1)&&Object.keys(chemicalElements).every(symbol=>{
    const element=symbol as ChemicalElement;
    return (value[element]??0)*b===(wanted[element]??0)*a;
  });
}
const fail=(why:string)=>({ok:false,why});
const pass={ok:true};
const gcd=(a:number,b:number):number=>b?gcd(b,a%b):a;
const sampleElement=(sample:SymbolsTask['samples'][number])=>sample.name===undefined?
  (isChemicalElement(sample.shown)?sample.shown:undefined):
  (Object.keys(chemicalElements) as ChemicalElement[]).find(element=>chemicalElements[element]===sample.name);

export function checkChemicalNotation(task:ChemicalNotationTask,answer:ChemicalNotationResponse){
  if(answer?.kind!==kind||answer.mode!==task.mode)return fail('Täydennä tämän kaavapöydän oma vastaus.');
  if(task.mode==='symbols'&&answer.mode==='symbols'){
    if(!dense(answer.rows,8)||answer.rows.length!==task.samples.length)return fail('Anna jokaiselle näytteelle oma nimi ja tarkka merkki.');
    if(!task.samples.every(sample=>{
      const matches=answer.rows.filter(row=>record(row)&&row.id===sample.id),element=sampleElement(sample);
      return element&&matches.length===1&&matches[0]!.element===element&&matches[0]!.symbol===element;
    }))return fail('Merkin ensimmäinen kirjain on iso ja mahdollinen toinen pieni. Co on koboltti, CO on hiilen ja hapen kaava.');
    return pass;
  }
  if(task.mode==='formula'&&answer.mode==='formula'){
    const atoms=chemicalInventory(task.sample.formula)!;
    if(task.objective!=='ratio'&&(!dense(answer.species,21)||answer.species.length!==Object.keys(atoms).length||
      !Object.keys(atoms).every(element=>answer.species.filter(symbol=>symbol===element).length===1)))
      return fail('Etsi kaikki eri alkuaineet. Kaksikirjaiminen merkki on yksi alkuaineen tunnus.');
    if(task.objective!=='species'&&!proportionalInventory(answer.atoms,atoms))
      return fail('Lukusuhteen pitää säilyttää jokaisen atomilajin osuus. Kirjoittamaton alaindeksi tarkoittaa yhtä.');
    if(task.objective==='both'&&!sameInventory(answer.model,atoms))
      return fail('Rakenna lisäksi yhden kaavan mukainen kokonainen koostumusmalli. Pelkkä atomilajien lista tai oikea yhteismäärä ei riitä.');
    return pass;
  }
  if(task.mode==='subscript'&&answer.mode==='subscript'){
    const parsed=parseChemicalFormula(task.sample.formula)!,token=parsed.tokens[task.target]!;
    if(answer.element!==token.element||answer.count!==token.count||answer.implicit!==!token.explicit)
      return fail('Kohdista pieni numero sitä edeltävään alkuaineen merkkiin. Jos numeroa ei ole, paikallinen määrä on yksi.');
    return sameInventory(answer.atoms,parsed.atoms)?pass:fail('Kokoa myös koko kaavan atomit. Saman merkin eri esiintymät lasketaan yhteen ja sulku kertoo koko ryhmän.');
  }
  if(task.mode==='groups'&&answer.mode==='groups'){
    if(answer.groups!==task.coefficient)return fail('Kerroin kertoo kokonaisten kaavaryhmien määrän. Pidä jokaisen ryhmän kaava samana.');
    return sameInventory(answer.atoms,chemicalInventory(task.sample.formula,task.coefficient)!)?pass:
      fail('Kerro jokaisen atomilajin määrä kokonaisten ryhmien määrällä. Kerroin vaikuttaa koko kaavaan.');
  }
  if(task.mode==='roles'&&answer.mode==='roles'){
    const wanted=[...task.reaction.left.map(()=>'reactant'),...task.reaction.right.map(()=>'product')];
    if(!dense(answer.roles,8)||answer.roles.length!==wanted.length||!wanted.every((role,i)=>answer.roles[i]===role))
      return fail('Vasemmalla ovat tämän reaktion lähtöaineet ja oikealla tuotteet. Tarkista jokainen aine erikseen.');
    return answer.arrow==='change'?pass:fail('Nuoli osoittaa annetun reaktion suunnan lähtöaineista tuotteisiin.');
  }
  if(task.mode==='balance'&&answer.mode==='balance'){
    const totals=chemicalReactionInventory(task.reaction,answer.coefficients);
    if(!totals)return fail('Anna jokaiselle lukitulle kaavalle positiivinen kokonaislukukerroin, enintään 1000.');
    if(!sameInventory(totals.left,totals.right))return fail('Tarkista jokainen atomilaji molemmilta puolilta. Kaavoja ja alaindeksejä säilytetään, kertoimia muutetaan.');
    if(task.primitive&&answer.coefficients.reduce(gcd)!==1)return fail('Tässä pyydetään pienintä kokonaislukusuhdetta. Jaa kaikki kertoimet samalla yhteisellä tekijällä.');
    if(!sameInventory(answer.left,totals.left)||!sameInventory(answer.right,totals.right))
      return fail('Kirjaa oman yhtälösi todelliset atomimäärät kummallekin puolelle. Pelkkä kaikkien atomien yhteissumma ei riitä.');
    return pass;
  }
  return fail('Täydennä tämän kaavapöydän oma vastaus.');
}

/** Bounded search used for authored demonstrations. Assessment independently checks conservation. */
export function smallestChemicalBalance(reaction:ChemicalReaction):readonly number[]|undefined {
  const count=reaction.left.length+reaction.right.length;
  if(count<2||count>5)return;
  const inventories=[...reaction.left,...reaction.right].map(sample=>parseChemicalFormula(sample.formula)?.atoms);
  if(inventories.some(atoms=>!atoms))return;
  const elements=[...new Set(inventories.flatMap(atoms=>Object.keys(atoms!)))] as ChemicalElement[];
  const coefficients=Array<number>(count).fill(1);
  let found:readonly number[]|undefined;
  const visit=(index:number)=>{
    if(found)return;
    if(index===count){
      const conserved=elements.every(element=>inventories.reduce((sum,atoms,i)=>sum+
        (i<reaction.left.length?1:-1)*(atoms![element]??0)*coefficients[i]!,0)===0);
      if(conserved)found=[...coefficients];
      return;
    }
    for(let n=1;n<=12&&!found;n++){coefficients[index]=n;visit(index+1);}
  };
  visit(0);
  return found;
}
export function solutionChemicalNotation(task:ChemicalNotationTask):ChemicalNotationResponse{
  switch(task.mode){
    case 'symbols':return {kind,mode:task.mode,rows:task.samples.map(sample=>({id:sample.id,element:sampleElement(sample)!,symbol:sampleElement(sample)!}))};
    case 'formula':return {kind,mode:task.mode,species:Object.keys(chemicalInventory(task.sample.formula)!),atoms:chemicalInventory(task.sample.formula)!,model:chemicalInventory(task.sample.formula)!};
    case 'subscript':{
      const parsed=parseChemicalFormula(task.sample.formula)!,token=parsed.tokens[task.target]!;
      return {kind,mode:task.mode,element:token.element,count:token.count,implicit:!token.explicit,atoms:parsed.atoms};
    }
    case 'groups':return {kind,mode:task.mode,groups:task.coefficient,atoms:chemicalInventory(task.sample.formula,task.coefficient)!};
    case 'roles':return {kind,mode:task.mode,roles:[...task.reaction.left.map(()=>'reactant'),...task.reaction.right.map(()=>'product')],arrow:'change'};
    case 'balance':{
      const coefficients=smallestChemicalBalance(task.reaction);
      if(!coefficients)throw new RangeError('Authored reaction cannot be balanced within the demonstration bounds');
      const totals=chemicalReactionInventory(task.reaction,coefficients)!;
      return {kind,mode:task.mode,coefficients,left:totals.left,right:totals.right};
    }
  }
}
export function wrongChemicalNotationResponses(task:ChemicalNotationTask):ChemicalNotationResponse[]{
  const answer=solutionChemicalNotation(task);
  switch(answer.mode){
    case 'symbols':return [{...answer,rows:[]},{...answer,rows:answer.rows.map(row=>({...row,symbol:row.symbol.toLowerCase()}))}];
    case 'formula':return [{...answer,species:[],atoms:{},model:{}},{...answer,species:[...answer.species,answer.species[0]!],atoms:{H:1},model:{H:1}}];
    case 'subscript':return [{...answer,count:0},{...answer,implicit:!answer.implicit}];
    case 'groups':return [{...answer,groups:0},{...answer,atoms:{}}];
    case 'roles':return [{...answer,roles:answer.roles.map(role=>role==='reactant'?'product':'reactant')},{...answer,arrow:'equals'}];
    case 'balance':return [{...answer,coefficients:answer.coefficients.map(()=>0)},{...answer,left:{},right:{}}];
  }
}
