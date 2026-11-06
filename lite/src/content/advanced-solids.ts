import type { Rng } from '../engine/rng';
import type { Item, NodeSpec, Task } from '../engine/types';
import { cases } from './kit';
import {
  advancedMeasurementPlan, advancedShapeClass, comparisonFigure, solutionAdvancedSolids, solidGroupLabel, volumeConversion,
  type AdvancedFigure, type AdvancedShape, type AdvancedSolidsTask, type SolidBase, type SolidGroup, type SolidPose, type VolumeUnit,
} from './models/advanced-solids';
import { advancedSolidsPaint, advancedSolidsScene } from './scenes/advanced-solids';

type Measure = Extract<AdvancedSolidsTask, { mode: 'measure' }>;
type Draft = Omit<Item,'tag'> & { sceneModel: ReturnType<typeof advancedSolidsScene> };
type Author = (r: Rng) => Draft;
type Family = readonly [string, Author];
type Variant = 'first' | 'second' | 'transfer';
const kind = 'advanced-solids' as const;
const palette = ['#c27650','#4d8d88','#d0a951','#786698','#659760','#507f9c'] as const;
const colors = (r:Rng,variant:Variant) => variant==='transfer' ? r.shuffle(palette).slice(1) : r.shuffle(palette);
const pose = (r:Rng,variant:Variant):SolidPose => variant==='transfer'?'horizontal':r.pick(['upright','horizontal','tilted'] as const);
const baseCircle = (radius:number):SolidBase => ({kind:'circle',radius});
const triplets = [[3,4,5],[5,12,13],[8,15,17],[7,24,25],[9,12,15],[6,8,10]] as const;
const transferTriplets = [[12,16,20],[12,35,37],[20,21,29],[10,24,26]] as const;
const nameBase = (base:SolidBase) => base.kind==='circle'?'ympyrä':base.kind==='rectangle'?'suorakulmio':'suorakulmainen kolmio';

function polygon(r:Rng,triangle:boolean):SolidBase {
  if (!triangle) return {kind:'rectangle',width:r.int(3,9),depth:r.int(2,8)};
  const [width,depth,diagonal] = r.pick(triplets);
  return {kind:'right-triangle',width,depth,diagonal};
}
function figure(r:Rng,shape:AdvancedShape,variant:Variant,id='A'):AdvancedFigure {
  return {id,shape,pose:pose(r,variant),color:r.pick(palette)};
}
function measureFigure<S extends Measure['figure']['shape']>(r:Rng,shape:S,variant:Variant):Measure['figure'] {
  return {...figure(r,shape,variant,'Uusi'),shape,pose:'upright'};
}
const pretty = (value:string|number) => String(value).replace('.',',');

function make(task: AdvancedSolidsTask, say: string, hint: string, explain: string): Draft {
  const scene = advancedSolidsPaint(task);
  const sceneModel = advancedSolidsScene(task);
  return {
    task:task as unknown as Task,scene,sceneModel,say,hint,explain,
    afterCorrect(host) {
      scene(host);
      const worked=document.createElement('p');
      worked.textContent=explain;
      host.append(worked);
    },
  };
}
function spec(id:string,stop:string,intro:string,goal:string,reward:string,a:Family,b:Family,transfer:Author):NodeSpec {
  const rev=`advanced-solids-${id.toLowerCase()}-v1`;
  return {id,stop,icon:'⬡',intro,goal,reward,rev,validRevs:[rev],produce:[a[0],b[0]],
    produceWhat:'rakennettu kappaleen ominaisuus, oma laskurivi ja pyydetty mittayksikkö',
    demo(r) {
      const sample=a[1](r);
      const task=sample.task as unknown as AdvancedSolidsTask;
      return [{say:sample.explain,scene:sample.afterCorrect!,sceneModel:advancedSolidsScene(task,solutionAdvancedSolids(task))}];
    },
    item:cases({[a[0]]:a[1],[b[0]]:b[1]},transfer),
  };
}

function identify(r:Rng,target:SolidGroup|'all',variant:Variant):Draft {
  const height=r.int(3,10),radius=r.int(2,6);
  const round=baseCircle(radius), poly=polygon(r,variant==='second');
  const cone:AdvancedShape={kind:'cone',base:variant==='first'?round:poly,height,caps:1};
  const column:AdvancedShape={kind:'column',base:variant==='first'?round:poly,height,caps:2};
  const sphere:AdvancedShape={kind:'sphere',radius};
  const flat:AdvancedShape={kind:'flat',base:target==='cone'&&variant==='second'?poly:round};
  const cut:AdvancedShape={kind:'frustum',lower:radius,upper:Math.max(1,radius-1),height};
  const elongated:AdvancedShape={kind:'ellipsoid',radii:[radius, radius+r.int(1,3), radius]};
  const group:AdvancedShape[] = target==='cone'?[cone,cut,flat]
    : target==='column'?[column,cone,variant==='second'?flat:cut]
      : target==='sphere'?[sphere,flat,elongated]
        : [column,cone,sphere,variant==='first'?flat:variant==='second'?cut:elongated];
  const tones=colors(r,variant);
  const figures=r.shuffle(group).map((shape,i)=>({id:'ABCD'[i]!,shape,pose:pose(r,variant),color:tones[i]!}));
  const firstView=variant==='second'||(variant==='transfer'&&target==='sphere')?'section':'body';
  const title=target==='all'?'Kuppelikaupungin mallisarja':`${solidGroupLabel[target]} ja vertailumallit`;
  const say=target==='all'
    ? 'Luokittele kaikki mallit. Kirjaa lieriölle ja kartiolle pohjien ja huippujen tuntomerkit ja pallolle kolme keskus–pinta-mittaa.'
    : `Etsi jokainen ${target==='column'?'lieriö':target==='cone'?'kartio':'pallo'}. Merkitse muut erikseen ja kirjaa löytämäsi kappaleen tuntomerkit.`;
  const hint=target==='sphere'?'Vertaa kolmea suuntaa. Ympyrälevyllä ei ole paksuutta, ja pitkänomaisen kappaleen mitat eroavat.'
    : 'Katso eri suunnista. Lieriön kaksi pohjaa ovat yhdensuuntaiset ja yhtenevät. Kartiolla on yksi pohja ja yksi yhteinen huippu.';
  const results=figures.map(({id,shape})=>`${id} on ${solidGroupLabel[advancedShapeClass(shape)].toLowerCase()}`).join(', ');
  return make({kind,mode:'identify',title,figures,target,firstView},say,hint,
    `${results}. Kartio voi päättyä yhteiseen huippuun myös monikulmaisesta pohjasta. Lieriön pohjat toistuvat yhdensuuntaisina. Pallon pinnan pisteet ovat yhtä kaukana keskuksesta.`);
}

function measure(r:Rng,mode:'cone-surface'|'cone-volume'|'column-surface'|'column-volume'|'sphere-surface'|'sphere-volume',variant:Variant):Draft {
  const unit=variant==='transfer'?'m':'cm';
  const result=variant==='first'?'exact':variant==='second'?'approx':'either';
  let task:Measure;
  switch(mode) {
    case 'cone-surface': {
      const [radius,height,slant]=r.pick<readonly [number,number,number]>(variant==='transfer'?transferTriplets:triplets);
      const caps=variant==='second'?1:0;
      task={kind,mode:'measure',title:caps?'Pohjallinen mallikatos':'Avoimen katoksen vaippa',
        figure:measureFigure(r,{kind:'cone',base:baseCircle(radius),height,slant,caps},variant),target:'surface',unit,
        radiusGiven:variant==='second'?'diameter':'radius',result};
      break;
    }
    case 'cone-volume': {
      const radius=r.int(2,10),height=3*r.int(2,6);
      task={kind,mode:'measure',title:'Kartio ja yhtä korkea vertailulieriö',
        figure:measureFigure(r,{kind:'cone',base:baseCircle(radius),height,caps:0},variant),target:'volume',unit,
        radiusGiven:variant==='second'?'diameter':'radius',demoFill:'cone-to-column',result,
        ...(variant==='transfer'?{compare:r.chance(.5)?{earlierRadius:radius+r.pick([-1,1]),factor:false}:
          {earlierHeight:height+r.pick([-3,3]),factor:false}}:{})};
      break;
    }
    case 'column-surface': {
      const base=variant==='second'?polygon(r,r.chance(.5)):baseCircle(r.int(2,10));
      const caps=variant==='first'?1:2;
      task={kind,mode:'measure',title:`${caps===1?'Kansi auki':'Suljettu säiliö'} · pohjana ${nameBase(base)}`,
        figure:measureFigure(r,{kind:'column',base,height:r.int(4,14),caps},variant),target:'surface',unit,
        radiusGiven:'radius',result,context:{kind:'solid-base',base:base.kind==='circle'?'circle':'polygon'}};
      break;
    }
    case 'column-volume': {
      const base=variant==='first'?baseCircle(r.int(2,9)):polygon(r,variant==='second'&&r.chance(.5));
      const height=3*r.int(2,7);
      const target=variant==='transfer'?'height':'volume';
      const givenVolume=target==='height'&&base.kind==='rectangle'?base.width*base.depth*height:undefined;
      task={kind,mode:'measure',title:target==='height'?'Säiliön mitoitettava korkeus':`Täyttökerrokset · pohjana ${nameBase(base)}`,
        figure:measureFigure(r,{kind:'column',base,height,caps:1},variant),target,unit,radiusGiven:'radius',result,givenVolume,
        context:{kind:'solid-base',base:base.kind==='circle'?'circle':'polygon'},...(target==='volume'?{demoFill:'layers'}:{})};
      break;
    }
    case 'sphere-surface':
    case 'sphere-volume': {
      const surface=mode==='sphere-surface',compare=variant==='transfer'||variant==='second';
      const radius=variant==='transfer'&&surface?r.int(5,21)/2:r.int(2,12);
      const earlierRadius=surface?(r.chance(.5)?radius*2:radius/2):radius*2;
      // Volume transfer doubles the earlier radius. Choose an even new radius to keep all givens on whole or half units.
      const adjusted=compare&&!surface&&variant==='transfer'?2*r.int(2,8):radius;
      const previous=surface?(earlierRadius*2%1===0?earlierRadius:radius*2):variant==='transfer'?adjusted/2:earlierRadius;
      task={kind,mode:'measure',title:surface?'Pallon suojapinta':'Pallon sisätila',
        figure:measureFigure(r,{kind:'sphere',radius:adjusted},variant),target:surface?'surface':'volume',unit,
        radiusGiven:variant==='transfer'?'diameter':'radius',result,
        ...(compare?{compare:{earlierRadius:previous,factor:true}}:{})};
      break;
    }
  }
  const plan=advancedMeasurementPlan(task);
  const solved=solutionAdvancedSolids(task);
  if(solved.mode!=='measure')throw Error('Expected measurement');
  const exact=solved.values.total!;
  const resultLine=plan.pi?`${exact} × π ${plan.unit} eli noin ${pretty(solved.rounded!)} ${plan.unit}`:`${exact} ${plan.unit}`;
  const ask=task.target==='surface'?'Muodosta kuoren pinta-ala pyydetyistä osista.'
    : task.target==='height'?'Ratkaise tarvittava kohtisuora korkeus tilavuudesta ja pohjan alasta.'
      : 'Laske sisätilan tilavuus.';
  const compare=task.compare?' Lukitse ensin ennuste uuden ja entisen mitan vertailusta.':'';
  const fill=task.demoFill?' Tutki kaikki kolme täyttövaihetta.':'';
  const hint=mode==='cone-surface'?'Sivujana kulkee pohjan reunalta huippuun. Kohtisuora korkeus kulkee keskeltä pohjaa.'
    : mode==='cone-volume'?'Vertailulieriöllä on sama pohja ja korkeus. Yksi kartio täyttää siitä yhden kolmasosan.'
      : mode==='column-surface'?'Vaippa aukeaa pohjan reunan mittaiseksi kaistaksi. Laske mukaan vain oikeat pohjat ja kannet.'
        : mode==='column-volume'?'Kerro pohjan ala kohtisuoralla korkeudella. Kun korkeus puuttuu, jaa tilavuus pohjan alalla.'
          : task.target==='surface'?'Pallon pinta käyttää säteen neliötä. Pallosta ei avaudu vääristymätöntä tasoverkkoa.'
            : 'Pallon sisätila käyttää säteen kuutiota. Halkaisija on kaksi sädettä.';
  const previous=comparisonFigure(task);
  const compareLine=previous&&solved.values.scale?` Uuden ja entisen suhde on ${solved.values.scale}.`:'';
  const steps=plan.requirements.filter(field=>field.key!=='total'&&field.key!=='scale')
    .map(field=>`${field.label.toLowerCase()} ${solved.values[field.key]}${field.pi?' × π':''}`).join(', ');
  return make(task,ask+compare+fill,hint,`${hint} Laskurivin arvot ovat ${steps}. Tulos on ${resultLine}.${compareLine}`);
}
function conversion(r:Rng,variant:Variant):Draft {
  const largeToSmall = [['m³','dm³'],['dm³','cm³'],['cm³','mm³']] as const;
  const pair = r.pick(largeToSmall);
  const from:VolumeUnit=variant==='transfer'?'cm³':variant==='first'?pair[0]:pair[1];
  const to:VolumeUnit=variant==='transfer'?'l':variant==='first'?pair[1]:pair[0];
  const amount=variant==='first'?r.int(1,19)/2:variant==='second'?25*r.int(2,150):125*r.int(2,72);
  const task:AdvancedSolidsTask={kind,mode:'convert',title:'Yksi tila ja kaksi tilavuusyksikköä',from,to,amount};
  const result=volumeConversion(task),answer=solutionAdvancedSolids(task);
  if(answer.mode!=='convert')throw Error('Expected conversion');
  return make(task,'Merkitse pienten särmien määrät kaikissa kolmessa suunnassa. Muunna sama tilavuus uuteen yksikköön.',
    'Tilassa on kolme mittasuuntaa. Kuutioi pituuden muunnoskerroin ja tarkista, kumpi yksikkö on suurempi.',
    `Yhden suunnan kerroin on ${result.step}. Kolmen suunnan yhteinen kerroin on ${result.factor[0]}. ${pretty(amount)} ${from} = ${answer.value} ${to}.`);
}

export const advancedSolidsSpecs:NodeSpec[]=[
  spec('M79-CONE-ID','Huippuun kokoontuva katto','Loikka etsii mallimajalle kattoa. Aava tuo rinnalle litteän kuvion ja katkaistun mallin.',
    'Tunnista kartio pohjasta ja yhteisestä huipusta.','Sopiva katto asettuu mallimajan päälle.',
    ['round-apex',r=>identify(r,'cone','first')],['polygon-apex',r=>identify(r,'cone','second')],r=>identify(r,'cone','transfer')),
  spec('M79-CYLINDER-ID','Saman pohjan torni','Aava vertailee mallivaraston runkoja eri asennoissa.',
    'Tunnista yhdensuuntaiset ja yhtenevät pohjat.','Mallivaraston rungosta näkyy sisätila.',
    ['round-bases',r=>identify(r,'column','first')],['polygon-bases',r=>identify(r,'column','second')],r=>identify(r,'column','transfer')),
  spec('M79-SPHERE-ID','Pieni maailma kädessä','Loikka vertaa palloa, litteää ympyrälevyä ja pitkänomaista mallia.',
    'Tutki kolmea keskus–pinta-suuntaa.','Mallipallo saa paikan avaruushyllyssä.',
    ['silhouette-contrast',r=>identify(r,'sphere','first')],['radial-section',r=>identify(r,'sphere','second')],r=>identify(r,'sphere','transfer')),
  spec('M79-SOLID-01','Kuppelikaupungin rakennuslaatikko','Aava ja Loikka kokoavat tutkimusasemalle eri asennoissa olevat mallikappaleet.',
    'Luokittele kokoelma ja kirjaa tunnusomaiset rakenteet.','Mallikaupunki nousee pöydälle.',
    ['classify-and-measure',r=>identify(r,'all','first')],['audit-with-section',r=>identify(r,'all','second')],r=>identify(r,'all','transfer')),
  spec('M79-CONE-SA','Teltan avoin pohja','Katoksen kangas kulkee pohjan reunalta huippuun.',
    'Laske vaippa ja malliin kuuluva pohja.','Mallikatos suojaa lukupaikan.',
    ['lateral-only',r=>measure(r,'cone-surface','first')],['with-floor',r=>measure(r,'cone-surface','second')],r=>measure(r,'cone-surface','transfer')),
  spec('M79-CONE-V','Kolmen kaadon yllätys','Loikka täyttää vertailulieriötä saman pohjan ja korkeuden mallikartiolla.',
    'Yhdistä kartion tilavuus kolmasosaan saman lieriön tilavuudesta.','Suppilovarasto täydentää pajan vesimallin.',
    ['three-pours',r=>measure(r,'cone-volume','first')],['diameter-and-fill',r=>measure(r,'cone-volume','second')],r=>measure(r,'cone-volume','transfer')),
  spec('M79-CYL-V','Vettä koko kerrokseen','Aava ja Loikka täyttävät säiliön yhtä korkeina kerroksina.',
    'Käytä pohjan alaa ja kohtisuoraa korkeutta.','Mallisäiliöstä riittää vettä koepuroon.',
    ['round-layers',r=>measure(r,'column-volume','first')],['polygon-layers',r=>measure(r,'column-volume','second')],r=>measure(r,'column-volume','transfer')),
  spec('M79-SPHERE-SA','Maailman ohut kuori','Mallimaailman pintaan tarvitaan yhtenäinen peite.',
    'Käytä säteen neliötä ja pinta-alayksikköä.','Aava lisää kotisaaren merkin pallon kuoreen.',
    ['cover-area',r=>measure(r,'sphere-surface','first')],['compare-shells',r=>measure(r,'sphere-surface','second')],r=>measure(r,'sphere-surface','transfer')),
  spec('M79-SPHERE-V','Pallon sisäinen meri','Loikka tutkii läpinäkyvän pallon sisätilaa.',
    'Käytä säteen kuutiota ja tilavuusyksikköä.','Pallomallin sisämeri valmistuu.',
    ['inside-volume',r=>measure(r,'sphere-volume','first')],['compare-interiors',r=>measure(r,'sphere-volume','second')],r=>measure(r,'sphere-volume','transfer')),
  spec('M79-CYL-SA','Säiliön koko kuori','Säiliön kuori avataan verkoksi. Aava selvittää, mitkä pohjat kuuluvat mukaan.',
    'Yhdistä vaippa ja tarvittavat pohjat.','Kuiva varastopaikka saa ehjän kuoren.',
    ['open-round-shell',r=>measure(r,'column-surface','first')],['closed-polygon-shell',r=>measure(r,'column-surface','second')],r=>measure(r,'column-surface','transfer')),
  spec('M79-UNIT-VOL','Tuhat pientä kuutiota','Loikka avaa yksikkökuution ja tutkii kerroksia, rivejä ja syvyyttä.',
    'Johda tilavuuden kerroin kolmesta mittasuunnasta.','Säiliön yksikkölaput kuvaavat samaa vesimäärää.',
    ['large-to-small',r=>conversion(r,'first')],['small-to-large',r=>conversion(r,'second')],r=>conversion(r,'transfer')),
];
export const advancedSolidsEvidence=Object.fromEntries(advancedSolidsSpecs.map(s=>[s.id,{families:s.produce??[],
  limit:s.id==='M79-SOLID-01'||s.id==='M79-SPHERE-ID'
    ? 'Oman luokittelun rakennemitat erottelevat annetut mallit. Pallomaisuuden yleinen todistus edellyttää kaikkien pinnan pisteiden etäisyyden perustelua.'
    : 'Tarkistin arvioi rakennettuja tuntomerkkejä, laskun mittoja ja tilavuusmallin kokeita. Vapaa sanallinen todistus ja fyysinen mittaaminen kuuluvat erilliseen näyttöön.'}]));
