import type { Rng } from '../engine/rng';
import type { Item, NodeSpec, Task } from '../engine/types';
import { cases } from './kit';
import { chemicalElements, chemicalInventory, parseChemicalFormula, smallestChemicalBalance, solutionChemicalNotation,
  type ChemicalElement, type ChemicalNotationTask, type ChemicalReaction, type ChemicalSample } from './models/chemical-notation';
import { chemicalNotationPaint } from './scenes/chemical-notation';

type Draft=Omit<Item,'tag'>;
type Family=readonly [string,(r:Rng)=>Draft];
const kind='chemical-notation' as const;
const molecule=(formula:string,name:string):ChemicalSample=>({formula,name,form:'molecule'});
const lattice=(formula:string,name:string):ChemicalSample=>({formula,name,form:'lattice'});
const atom=(formula:string,name:string):ChemicalSample=>({formula,name,form:'atom'});
export const chemicalSamples:readonly ChemicalSample[]=[
  molecule('H2O','vesi'),molecule('CO2','hiilidioksidi'),molecule('NH3','ammoniakki'),molecule('CH4','metaani'),
  molecule('H2O2','vetyperoksidi'),molecule('SO2','rikkidioksidi'),molecule('SO3','rikkitrioksidi'),molecule('NO2','typpidioksidi'),
  molecule('CO','hiilimonoksidi'),molecule('C2H6','etaani'),molecule('C3H8','propaani'),molecule('C2H5OH','etanoli'),
  molecule('CH3COOH','etikkahappo'),molecule('N2O','dityppioksidi'),
  lattice('NaCl','natriumkloridi'),lattice('MgO','magnesiumoksidi'),lattice('CaCl2','kalsiumkloridi'),
  lattice('Al2O3','alumiinioksidi'),lattice('Na2CO3','natriumkarbonaatti'),lattice('CaCO3','kalsiumkarbonaatti'),
  lattice('KCl','kaliumkloridi'),lattice('CuO','kupari(II)oksidi'),lattice('Fe2O3','rauta(III)oksidi'),
  lattice('NaOH','natriumhydroksidi'),lattice('Ca(OH)2','kalsiumhydroksidi'),
];
const byFormula=(formula:string):ChemicalSample=>chemicalSamples.find(sample=>sample.formula===formula)??
  ({H2:molecule('H2','vety'),O2:molecule('O2','happi'),N2:molecule('N2','typpi'),Cl2:molecule('Cl2','kloori'),
    Mg:atom('Mg','magnesium'),Al:atom('Al','alumiini'),Na:atom('Na','natrium'),Fe:atom('Fe','rauta'),Cu:atom('Cu','kupari'),
    CaO:lattice('CaO','kalsiumoksidi'),KClO3:lattice('KClO3','kaliumkloraatti'),
    NaHCO3:lattice('NaHCO3','natriumvetykarbonaatti'),HCl:molecule('HCl','vetykloridi')} as Record<string,ChemicalSample>)[formula]!;
const reaction=(left:string[],right:string[],condition:string):ChemicalReaction=>({left:left.map(byFormula),right:right.map(byFormula),condition});
export const chemicalReactions={
  join:[
    reaction(['H2','O2'],['H2O'],'veden muodostumisen kaavamalli'),
    reaction(['N2','H2'],['NH3'],'ammoniakin muodostumisen kaavamalli'),
    reaction(['Mg','O2'],['MgO'],'magnesiumoksidin muodostumisen kaavamalli'),
    reaction(['Al','O2'],['Al2O3'],'alumiinioksidin muodostumisen kaavamalli'),
    reaction(['Na','Cl2'],['NaCl'],'natriumkloridin muodostumisen kaavamalli'),
    reaction(['Fe','O2'],['Fe2O3'],'rauta(III)oksidin muodostumisen kaavamalli'),
    reaction(['Cu','O2'],['CuO'],'kupari(II)oksidin muodostumisen kaavamalli'),
  ],
  split:[
    reaction(['H2O'],['H2','O2'],'veden hajotuksen kaavamalli'),
    reaction(['H2O2'],['H2O','O2'],'vetyperoksidin hajotuksen kaavamalli'),
    reaction(['CaCO3'],['CaO','CO2'],'kalsiumkarbonaatin hajotuksen kaavamalli'),
    reaction(['KClO3'],['KCl','O2'],'kaliumkloraatin hajotuksen kaavamalli'),
    reaction(['NaHCO3'],['Na2CO3','H2O','CO2'],'natriumvetykarbonaatin hajotuksen kaavamalli'),
  ],
  transfer:[
    reaction(['CH4','O2'],['CO2','H2O'],'metaanin täydellisen palamisen kaavamalli'),
    reaction(['C2H6','O2'],['CO2','H2O'],'etaanin täydellisen palamisen kaavamalli'),
    reaction(['C3H8','O2'],['CO2','H2O'],'propaanin täydellisen palamisen kaavamalli'),
    reaction(['C2H5OH','O2'],['CO2','H2O'],'etanolin täydellisen palamisen kaavamalli'),
    reaction(['HCl','NaOH'],['NaCl','H2O'],'neutraloitumisen molekyyliyhtälö, vesiliuoksen esitysmalli'),
  ],
};
const palette=(sample:ChemicalSample,r:Rng)=>{
  const species=Object.keys(chemicalInventory(sample.formula)!) as ChemicalElement[];
  const distractors=r.shuffle((Object.keys(chemicalElements) as ChemicalElement[]).filter(element=>!species.includes(element))).slice(0,2);
  return r.shuffle([...species,...distractors]);
};
function item(task:ChemicalNotationTask,say:string,hint:string,explain:string):Draft{
  return {task:task as unknown as Task,scene:chemicalNotationPaint(task),say,hint,explain};
}
function symbols(r:Rng,variant:'read'|'repair'|'transfer'):Draft{
  const keys=r.shuffle(Object.keys(chemicalElements) as ChemicalElement[]);
  const chosen=variant==='transfer'?r.shuffle(['Co','C','O','Ca','Cl','Na','N','He'] as const).slice(0,3):keys.slice(0,3);
  const samples=chosen.map((element,i)=>({id:String(i+1),shown:variant==='repair'?(element.length===1?element.toLowerCase():r.pick([element.toLowerCase(),element.toUpperCase()])):element,
    ...(variant==='repair'?{name:chemicalElements[element]}:{})}));
  const task:ChemicalNotationTask={kind,mode:'symbols',title:variant==='transfer'?'Tutkimusraportin merkit':'Näytteiden pienet nimiliput',samples};
  return item(task,variant==='repair'?'Korjaa nimilipun kirjainkoko annetun alkuaineen mukaan. Yhdistä tarkka merkki oikeaan nimeen.':'Yhdistä jokainen kemiallinen merkki alkuaineeseen. Kirjoita sen tarkka merkki nimilippuun.',
    'Katso taulukosta koko tunnus. Alkuaineen merkissä on yksi iso kirjain ja mahdollisesti yksi pieni kirjain.',
    'Yksi merkki nimeää yhden alkuaineen. Co tarkoittaa kobolttia, kun taas CO sisältää hiilen ja hapen merkit.');
}
function formula(r:Rng,objective:'species'|'ratio'|'both',variant:'read'|'repair'|'transfer'):Draft{
  const pool=variant==='transfer'?chemicalSamples.filter(sample=>/[a-z]/.test(sample.formula)||sample.formula==='CH3COOH'):chemicalSamples.filter(sample=>!sample.formula.includes('('));
  const sample=r.pick(pool),atoms=chemicalInventory(sample.formula)!;
  const first=Object.keys(atoms)[0] as ChemicalElement,options=palette(sample,r);
  const other=options.find(element=>!(element in atoms))!;
  const draft=variant==='repair'?{...atoms,[first]:atoms[first]!+(objective==='species'?0:1),[other]:1}:undefined;
  const task:ChemicalNotationTask={kind,mode:'formula',title:'Kaavakirjan näytesivu',sample,objective,palette:options,draft,monochrome:variant==='transfer'};
  const say=objective==='species'?'Merkitse kaikki kaavan eri alkuaineet. Jätä muut alkuaineet valitsematta.':objective==='ratio'?
    'Rakenna kaavan atomilajien lukusuhdemalli. Samanarvoinen kokonaislukusuhde kelpaa.':
    'Merkitse eri alkuaineet, rakenna lukusuhde ja kokoa lisäksi yhden kaavan mukainen koostumusmalli.';
  return item(task,`${draft?'Luonnosmallissa on virhe. ':''}${say}`,
    'Lue iso kirjain ja siihen liittyvä pieni kirjain yhdessä. Alaindeksi koskee edeltävää merkkiä. Sulku kertoo koko sisällön määrän.',
    'Atomilajit, niiden lukusuhde ja yhden kaavan koostumus ovat eri tietoja. Hilayhdisteen kaavayksikkö kuvaa ionien suhdetta kiteessä.');
}
function subscript(r:Rng,variant:'explicit'|'implicit'|'transfer'):Draft{
  const pool=chemicalSamples.filter(sample=>!sample.formula.includes('('));
  const sample=r.pick(pool.filter(sample=>parseChemicalFormula(sample.formula)!.tokens.some(token=>variant==='implicit'?!token.explicit:token.explicit)));
  const tokens=parseChemicalFormula(sample.formula)!.tokens;
  const eligible=tokens.map((token,i)=>({token,i})).filter(({token})=>variant==='implicit'?!token.explicit:token.explicit);
  const target=variant==='transfer'?r.pick(eligible.slice(-1)):r.pick(eligible);
  const task:ChemicalNotationTask={kind,mode:'subscript',title:'Pieni numero oikeassa paikassa',sample,target:target.i,palette:palette(sample,r)};
  return item(task,'Kohdista alleviivattu kohta alkuaineeseen. Anna sen paikallinen atomimäärä ja kokoa koko kaavan atomit.',
    'Pieni numero kuuluu heti sitä edeltävään merkkiin. Kun numero puuttuu, määrä on yksi. Sama merkki voi esiintyä kaavassa useasti.',
    'Paikallinen alaindeksi koskee yhtä merkkikohtaa. Koko kaavan määrää varten saman alkuaineen esiintymät yhdistetään.');
}
function groups(r:Rng,variant:'notation'|'groups'|'transfer'):Draft{
  const sample=r.pick(variant==='transfer'?chemicalSamples.filter(sample=>Object.keys(chemicalInventory(sample.formula)!).length===3):chemicalSamples.filter(sample=>!sample.formula.includes('(')));
  const task:ChemicalNotationTask={kind,mode:'groups',title:'Kokonaiset kaavaryhmät',sample,coefficient:r.int(2,4),source:variant==='groups'?'groups':'notation',palette:palette(sample,r)};
  return item(task,variant==='groups'?'Tulkitse annettujen kokonaisten malliryhmien kerroin ja laske jokaisen atomilajin kokonaismäärä.':
    'Rakenna kertoimen osoittama määrä kokonaisia kaavaryhmiä. Laske sitten jokaisen atomilajin kokonaismäärä.',
    'Lisää kokonaisia samanlaisia ryhmiä. Ryhmän sisäinen kaava säilyy, jokaisen atomilajin kokonaismäärä kertautuu.',
    'Kerroin kertoo kokonaisia molekyylejä tai kaavayksiköitä. Alaindeksi kuuluu aineen kaavaan, ja sen muuttaminen muuttaa koostumusta.');
}
function reactionItem(r:Rng,mode:'roles'|'balance',variant:'join'|'split'|'transfer'):Draft{
  const given=r.pick(chemicalReactions[variant]);
  const reaction={...given,left:r.shuffle(given.left),right:r.shuffle(given.right)};
  const task:ChemicalNotationTask=mode==='roles'?{kind,mode,title:'Muutoksen kaksi rantaa',reaction,
    coefficients:smallestChemicalBalance(reaction)!,
    ...(variant==='split'?{draft:[...reaction.left.map(()=>'product' as const),...reaction.right.map(()=>'reactant' as const)]}:{})}:
    {kind,mode,title:'Yksikään atomi ei jää rannalle',reaction,draft:[...reaction.left,...reaction.right].map(()=>1),primitive:false};
  return item(task,mode==='roles'?'Merkitse jokaisen aineen tehtävä tässä reaktioyhtälössä ja tulkitse nuolen merkitys.':
    'Muuta vain kertoimia ja tasapainota yhtälö. Laske jokaisen atomilajin määrä molemmilta puolilta. Yhteinen kokonaiskerrannainen kelpaa.',
    'Kaavat ovat lukittuja. Vasemman rannan aineista muodostuu oikean rannan aineita. Tavallisessa kemiallisessa reaktiossa atomilajit säilyvät.',
    mode==='roles'?'Lähtöaineet näkyvät ennen nuolta ja tuotteet sen jälkeen. Nuoli kertoo tässä kuvatun muutoksen suunnan.':
      'Tasapainoisessa kaavamallissa jokaisen alkuaineen atomimäärä on sama molemmin puolin. Näyttö kuvaa koostumusta ja lukusuhdetta.');
}
function spec(id:string,stop:string,intro:string,goal:string,reward:string,a:Family,b:Family,transfer:Family[1]):NodeSpec{
  const rev=`chemical-notation-${id.toLowerCase()}-v1`;
  return {id,stop,icon:'H₂O',intro,goal,reward,rev,validRevs:[rev],produce:[a[0],b[0]],produceWhat:'omat alkuaine-, koostumus- tai atomikirjanpitomerkinnät',
    demo(r){const sample=a[1](r),task=sample.task as unknown as ChemicalNotationTask;return [{say:sample.explain,scene:chemicalNotationPaint(task,solutionChemicalNotation(task))}];},
    item:cases({[a[0]]:a[1],[b[0]]:b[1]},transfer)};
}
export const chemicalNotationSpecs:NodeSpec[]=[
  spec('CHEM79-SYMBOL','Ainekirjaston lyhyet nimet','Aava järjestää näytteiden nimettömiä tutkimuslippuja. Loikka vertaa isoja ja pieniä kirjaimia.',
    'Yhdistä tarkka kemiallinen merkki alkuaineeseen.','Näytteet saavat oikeat nimilippunsa.',
    ['read-symbol-to-element',r=>symbols(r,'read')],['repair-element-label-case',r=>symbols(r,'repair')],r=>symbols(r,'transfer')),
  ...(['species','ratio','both'] as const).map(objective=>spec(objective==='species'?'CHEM79-FORMULA-ELEMENTS':objective==='ratio'?'CHEM79-FORMULA-RATIO':'CHEM79-FORMULA',
    objective==='species'?'Kaavakortin atomilajit':objective==='ratio'?'Lukusuhteen sinetti':'Kaavakirjan avautuva sivu',
    'Aava tutkii kirjaston näytekorttia. Loikka vertaa merkkien kokoa ja pienten numeroiden paikkaa.',
    objective==='species'?'Erota kaavan eri alkuaineet.':objective==='ratio'?'Rakenna atomilajien oikea lukusuhde.':'Tuota sekä atomilajit että kaavan koostumus ja lukusuhde.',
    'Näytesivun oma sinetti valmistuu.',
    [`read-${objective}-from-formula`,r=>formula(r,objective,'read')],[`repair-${objective}-model`,r=>formula(r,objective,'repair')],r=>formula(r,objective,'transfer'))),
  spec('CHEM79-SUBSCRIPT','Pieni numero, suuri ero','Loikka tutkii pienen numeron paikkaa. Aava pitää koko kaavan näkyvissä.',
    'Kohdista alaindeksi oikeaan merkkiin ja tunnista myös kirjoittamaton ykkönen.','Kaavakirjan pieni merkintä saa oikean lukutavan.',
    ['read-explicit-local-subscript',r=>subscript(r,'explicit')],['recover-implicit-one',r=>subscript(r,'implicit')],r=>subscript(r,'transfer')),
  spec('CHEM79-COEFF','Montako kokonaista mallia?','Aava nostaa samanlaisia näyteryhmiä laatikoihin. Loikka pitää jokaisen ryhmän kaavan samana.',
    'Tulkitse kokonaiset kaavaryhmät ja jokaisen alkuaineen kokonaismäärä.','Kuljetuslaatikot täyttyvät oikeista kokonaisista ryhmistä.',
    ['build-whole-groups-from-coefficient',r=>groups(r,'notation')],['infer-coefficient-from-group-model',r=>groups(r,'groups')],r=>groups(r,'transfer')),
  spec('CHEM79-REACTION-EQ-01','Muutoksen vasen ja oikea ranta','Aava avaa muutoskirjan. Loikka seuraa nuolta kahden rannan välillä.',
    'Nimeä lähtöaineiden ja tuotteiden roolit ja nuolen suunta.','Muutoskartta saa omat lähtö- ja tulorannan nimikilpensä.',
    ['read-combination-reaction-roles',r=>reactionItem(r,'roles','join')],['repair-decomposition-role-labels',r=>reactionItem(r,'roles','split')],r=>reactionItem(r,'roles','transfer')),
  spec('CHEM79-BALANCE','Yksikään atomi ei jää rannalle','Aava valmistelee muutosesitystä. Loikka tarkistaa jokaisen atomilajin kummallakin rannalla.',
    'Tuota tasapainoiset kertoimet kaavoja säilyttäen ja tarkista jokainen atomilaji.','Muutoskirjan kaksi rantaa yhdistyvät ja sinetti sulkeutuu.',
    ['balance-joining-formulas',r=>reactionItem(r,'balance','join')],['balance-splitting-formula',r=>reactionItem(r,'balance','split')],r=>reactionItem(r,'balance','transfer')),
];
const limits:Record<string,string>={
  'CHEM79-SYMBOL':'Annetun taulukon avulla kohdistettu merkki, alkuaine ja oikea kirjainkoko. Valmiiden vaihtoehtojen tunnistus ei osoita ulkomuistia tai vapaata sanallista selitystä.',
  'CHEM79-FORMULA-ELEMENTS':'Kaavan atomilajien erottelu merkkitaulukon avulla. Määrien tai koko kaavan lukusuhteen hallintaa ei päätellä tästä näytöstä.',
  'CHEM79-FORMULA-RATIO':'Oma kokonaislukusuhdemalli, myös samanarvoiset suhdeluvut. Suhde ei määrää molekyylin rakennetta tai kaikkia saman suhteen aineita.',
  'CHEM79-FORMULA':'Lajit, oma lukusuhde ja yhden kaavan koostumus vaaditaan samassa tuotoksessa. Hilayhdisteen kaavayksikkö on suhdetta kuvaava laskentayksikkö.',
  'CHEM79-SUBSCRIPT':'Merkkikohdan paikallinen lukumäärä ja koko kaavan atomikirjanpito. Mallilaatoista ei päätellä molekyylin rakennetta.',
  'CHEM79-COEFF':'Omat kokonaiset kaavaryhmät ja jokaisen atomilajin kokonaismäärä. Koostumuslaattojen paikat ovat laskentamalli.',
  'CHEM79-REACTION-EQ-01':'Roolien ja nuolen tulkinta on rakenteista tunnistamista. Vapaa sanallinen selitys jää erilliseksi.',
  'CHEM79-BALANCE':'Omat kokonaislukukertoimet 1–1000 ja jokaisen alkuaineen atomikirjanpito. Kaavamalli ei osoita reaktion ehtoja, mekanismia tai turvallista laboratoriotyötä.',
};
export const chemicalNotationEvidence:Readonly<Record<string,{families:readonly string[];limit:string}>>=Object.fromEntries(chemicalNotationSpecs.map(spec=>
  [spec.id,{families:spec.produce??[],limit:limits[spec.id]!}]));
