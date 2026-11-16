import type { PageDraw } from '../pages';
import { formula, sequence, table } from '../figures';

/** Divisibility, primes and powers: count the factors and the rules follow. */
export const DRAW: Record<string, () => PageDraw> = {
  'M79-POWER-SIMPLIFY': () => ({ beats: [
    table({ head: ['', 'sääntö'], rows: [['tulo', 'aᵐ · aⁿ = aᵐ⁺ⁿ'], ['osamäärä', 'aᵐ : aⁿ = aᵐ⁻ⁿ'], ['potenssin potenssi', '(aᵐ)ⁿ = aᵐⁿ']], label: 'Saman kannan potenssien säännöt' }),
  ] }),
  'M79-DIVIS-01': () => ({ beats: [
    undefined,
    formula({ lines: ['18 = 4 · 4 + 2', 'jakojäännös 2, ei nolla'], note: '18 ei ole jaollinen neljällä', label: '18 kivestä jää kaksi yli' }),
    table({ head: ['luku', 'neljällä', 'jäännös', 'jaollinen'], rows: [['16', '4 · 4 + 0', '0', '✓'], ['18', '4 · 4 + 2', '2', '✗']], label: 'Jaollinen, kun jakojäännös on nolla' }),
  ] }),
  'M79-PRIME-01': () => ({ beats: [
    table({ head: ['luku', 'positiiviset jakajat', 'montako'], rows: [['13', '1 ja 13', '2']], label: 'Tasan kaksi jakajaa: alkuluku' }),
    undefined,
    table({ head: ['luku', 'jakajat', 'montako', ''], rows: [['1', '1', '1', 'ei kumpikaan'], ['13', '1, 13', '2', 'alkuluku'], ['15', '1, 3, 5, 15', '4', 'yhdistetty']], mark: 0, label: 'Luku 1 ei ole alkuluku eikä yhdistetty' }),
  ] }),
  'M79-POWER-POS': () => ({ beats: [
    sequence({ values: [1, 3, 9, 27], steps: ['· 3', '· 3', '· 3'], note: 'kolme haarautumista: 3 · 3 · 3 = 27', label: 'Jokainen lyhty haarautuu kolmeen' }),
  ] }),
  'M79-POWER-ZERO': () => ({ beats: [
    sequence({ values: [27, 9, 3], steps: [': 3', ': 3'], note: '3³, 3² ja 3¹', label: 'Eksponentti pienenee: arvo jaetaan kolmella' }),
  ] }),
  'M79-POWER-NEG': () => ({ beats: [
    table({ head: ['3¹', '3⁰', '3⁻¹', '3⁻²'], rows: [['3', '1', '1/3', '1/9']], label: 'Joka askeleella arvo jaetaan kolmella' }),
  ] }),
  'M79-POWER-PROD': () => ({ beats: [
    formula({ lines: ['3² · 3⁴', '(3 · 3) · (3 · 3 · 3 · 3)'], note: 'kolmosia yhteensä 2 + 4 = 6', label: 'Kaksi ja neljä kolmosta tekijöinä' }),
  ] }),
};
