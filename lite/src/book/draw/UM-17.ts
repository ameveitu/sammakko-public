import type { PageDraw } from '../pages';
import { cylinderNet, formula, solids, unitCubes } from '../figures';

/** Solids: turning 3D bodies with their measures, cylinder nets and the 1 dm³ cube. */
export const DRAW: Record<string, () => PageDraw> = {
  'M79-CYLINDER-ID': () => ({ beats: [
    solids({ items: [{ kind: 'cylinder', name: 'lieriö' }, { kind: 'cone', name: 'kartio' }, { kind: 'frustum', name: 'katkaistu kartio' }], label: 'Lieriö, kartio ja katkaistu kartio' }),
    solids({ items: [{ kind: 'cylinder', name: 'pystyssä', mark: 'ok' }, { kind: 'cylinder', name: 'kyljellään', lying: true, mark: 'ok' }], caption: 'kaksi samanlaista, yhdensuuntaista pohjaa', label: 'Pystyssä ja kyljellään oleva lieriö: kummallakin kaksi samanlaista pohjaa' }),
    solids({ items: [{ kind: 'cylinder', name: 'pohjat samankokoiset', mark: 'ok' }, { kind: 'frustum', name: 'pohjat eri kokoiset', mark: 'no' }], label: 'Lieriön pohjat ovat samankokoiset, katkaistun kartion eri kokoiset' }),
  ] }),
  'M79-CONE-ID': () => ({ beats: [
    solids({ items: [{ kind: 'cone', name: 'kartio' }, { kind: 'frustum', name: 'katkaistu kartio' }, { kind: 'disc', name: 'ympyrä' }], label: 'Kartio, katkaistu kartio ja litteä ympyrä' }),
    solids({ items: [{ kind: 'cone', name: 'pohja ja huippu', mark: 'ok' }, { kind: 'frustum', name: 'huippu puuttuu', mark: 'no' }, { kind: 'disc', name: 'tasokuvio', mark: 'no' }], label: 'Vain kartiolla on yksi pohja ja huippu' }),
  ] }),
  'M79-SPHERE-ID': () => ({ beats: [
    solids({ items: [{ kind: 'sphere', name: 'pallo' }, { kind: 'disc', name: 'ympyrä' }, { kind: 'ellipsoid', name: 'pitkänomainen' }], label: 'Pallo, litteä ympyrä ja pitkänomainen kappale' }),
    solids({ items: [{ kind: 'sphere', name: 'sama säde joka suuntaan', ghost: true, dims: { radii: true } }], label: 'Pallon keskeltä pintaan on joka suuntaan yhtä pitkä matka' }),
    solids({ items: [{ kind: 'sphere', name: 'pallo', mark: 'ok' }, { kind: 'ellipsoid', name: 'mitat eri suuret', mark: 'no' }, { kind: 'disc', name: 'ei paksuutta', mark: 'no' }], label: 'Vain pallolla säde on joka suuntaan sama' }),
  ] }),
  'M79-SOLID-01': () => ({ beats: [
    solids({ items: [{ kind: 'cylinder', name: 'lieriö', lying: true }, { kind: 'cone', name: 'kartio' }, { kind: 'sphere', name: 'pallo' }, { kind: 'disc', name: 'ympyrä' }], label: 'Kokoelma: lieriö kyljellään, kartio, pallo ja litteä ympyrä' }),
    solids({ items: [{ kind: 'cylinder', name: '2 pohjaa' }, { kind: 'cone', name: '1 pohja + huippu' }, { kind: 'sphere', name: 'sama säde', ghost: true, dims: { radii: true } }], label: 'Lieriöllä kaksi pohjaa, kartiolla pohja ja huippu, pallolla sama säde joka suuntaan' }),
    solids({ items: [{ kind: 'cylinder', name: 'kappale', mark: 'ok' }, { kind: 'disc', name: 'tasokuvio', mark: 'no' }], label: 'Ympyrällä ei ole paksuutta, joten se ei ole kappale' }),
  ] }),
  'M79-CYL-V': () => ({ beats: [
    solids({ items: [{ kind: 'cylinder', ghost: true, water: 1, dims: { r: '5 cm', h: '12 cm' } }], label: 'Lieriö: säde 5 cm, korkeus 12 cm' }),
    solids({ items: [{ kind: 'cylinder', ghost: true, water: 0.5, name: 'kerros kerrokselta' }], caption: 'V = pohjan ala · korkeus', label: 'Säiliö täyttyy pohjan alan kokoisina kerroksina' }),
  ] }),
  'M79-SPHERE-SA': () => ({ beats: [
    solids({ items: [{ kind: 'sphere', dims: { r: '7 cm' } }], caption: 'A = 4πr²', label: 'Pallo, säde 7 cm' }),
    solids({ items: [{ kind: 'sphere', ghost: true, dims: { equator: 'πr²' } }], caption: 'A = 4 · πr²', label: 'Pinta-ala on neljä keskipisteen kautta kulkevan ympyrän alaa' }),
  ] }),
  'M79-SPHERE-V': () => ({ beats: [
    solids({ items: [{ kind: 'sphere', ghost: true, dims: { r: '7 cm' } }], caption: 'V = 4πr³ : 3', label: 'Läpinäkyvä pallo, säde 7 cm' }),
    formula({ lines: ['säde 2 · r', 'tilavuus 2³ = 8-kertainen'], note: 'säde on kaavassa kuutiona', label: 'Kun säde kaksinkertaistuu, tilavuus kasvaa 8-kertaiseksi' }),
  ] }),
  'M79-CYL-SA': () => ({ beats: [
    cylinderNet({ r: '6 cm', h: '8 cm', around: '2π · 6 cm = 12π cm', bases: 1, label: 'Vaippa avautuu suorakulmioksi, pohjia on yksi' }),
    formula({ lines: ['vaippa 96π cm²', '+ pohja 36π cm²', '= 132π cm² ≈ 414,69 cm²'], label: 'Kuoren ala: vaippa ja yksi pohja' }),
    cylinderNet({ r: 'r', h: 'h', around: '2πr', bases: 2, label: 'Suljettu lieriö: vaippa ja kaksi pohjaa' }),
  ] }),
  'M79-CONE-SA': () => ({ beats: [
    solids({ items: [{ kind: 'cone', ghost: true, dims: { r: '8 cm', h: '15 cm', s: '17 cm' } }], caption: 'vaippa = π · r · s', label: 'Kartio: säde 8 cm, korkeus 15 cm, sivujana 17 cm' }),
    solids({ items: [{ kind: 'cone', ghost: true, dims: { r: 'r', h: 'h', s: 's' } }], caption: 'vaippaan sivujana s, ei korkeutta h', label: 'Sivujana kulkee reunalta huippuun, korkeus keskeltä huippuun' }),
  ] }),
  'M79-CONE-V': () => ({ beats: [
    solids({ items: [{ kind: 'cone', name: 'kartio', ghost: true }, { kind: 'cylinder', name: 'lieriö', ghost: true, water: 'pour3' }], label: 'Kolme kartiollista vettä täyttää lieriön' }),
    formula({ lines: ['V = pohjan ala · korkeus : 3'], note: 'kolmasosa saman pohjan ja korkeuden lieriöstä', label: 'Kartion tilavuus on kolmasosa lieriön tilavuudesta' }),
    solids({ items: [{ kind: 'cone', ghost: true, dims: { r: '6 cm', h: '12 cm' } }], label: 'Kartio: säde 6 cm, korkeus 12 cm' }),
  ] }),
  'M79-UNIT-VOL': () => ({ beats: [
    unitCubes({ layers: 1, note: '10 · 10 = 100 kuutiota kerroksessa', label: 'Yhteen kerrokseen mahtuu 100 pientä kuutiota' }),
    unitCubes({ layers: 10, note: '10 kerrosta · 100 = 1000 cm³', label: '1 dm³ = 1000 cm³' }),
    formula({ lines: ['4,5 dm³ = 4,5 · 1000 cm³', '= 4500 cm³'], label: '4,5 dm³ on 4500 cm³' }),
  ] }),
};
