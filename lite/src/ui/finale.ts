import {
  FINALE_CHAPTERS, FINALE_CREDITS, FINALE_SECONDS, FINALE_TITLE,
  finaleAt, finaleElapsed, pauseFinale, seekFinale, type FinaleArt, type FinaleClock,
} from '../content/finale';
import { sulka } from './art';
import { h } from './dom';
import { calmByAdult, poseUrl, spriteSvg } from './sprite';
import { mountFinaleCinema, type FinaleCinema } from '../world/finale-cinema';
import './finale.css';
import { createFinaleSound } from './finale-audio';

const frame = (art: string) => `<svg viewBox="0 0 960 540" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
  <defs>
    <linearGradient id="ep-sky" x2="0" y2="1"><stop stop-color="#4b8e9d"/><stop offset="1" stop-color="#e7c58b"/></linearGradient>
    <linearGradient id="ep-dusk" x2="0" y2="1"><stop stop-color="#132f54"/><stop offset="1" stop-color="#d8976f"/></linearGradient>
    <linearGradient id="ep-water" x2="0" y2="1"><stop stop-color="#5d9894"/><stop offset="1" stop-color="#153b56"/></linearGradient>
    <linearGradient id="ep-pond" x2="0" y2="1"><stop stop-color="#1a4b61"/><stop offset="1" stop-color="#0b233a"/></linearGradient>
    <linearGradient id="ep-wood" x2="0" y2="1"><stop stop-color="#ca8e59"/><stop offset="1" stop-color="#673f35"/></linearGradient>
    <linearGradient id="ep-shell" x2="1" y2="1"><stop stop-color="#fff7dc"/><stop offset="1" stop-color="#d3ae81"/></linearGradient>
    <radialGradient id="ep-night"><stop stop-color="#2a426a"/><stop offset="1" stop-color="#0b172e"/></radialGradient>
  </defs>${art}</svg>`;

const palette = {
  spring: ['#76a898', '#bed4a4', '#44695b', '#7d9671'],
  summer: ['#4b8e9d', '#ead2a1', '#406c5f', '#668855'],
  autumn: ['#779297', '#deb086', '#516b61', '#936d4c'],
  winter: ['#718ea4', '#ced8d9', '#687e89', '#aec3c2'],
  evening: ['#213b5a', '#c18070', '#244856', '#414c45'],
} as const;

function landscape(look: keyof typeof palette = 'summer'): string {
  const [high, low, far, near] = palette[look];
  return `
    <defs><linearGradient id="ep-weather" x2="0" y2="1"><stop stop-color="${high}"/><stop offset="1" stop-color="${low}"/></linearGradient></defs>
    <rect width="960" height="540" fill="url(#ep-weather)"/>
    <circle cx="${look === 'evening' ? 718 : 762}" cy="${look === 'evening' ? 204 : 108}" r="62" fill="#fff3cc" opacity=".38"/>
    <path d="M0 243 Q100 188 218 238 T449 245 Q547 205 653 242 Q797 180 960 240 V350H0Z" fill="${far}"/>
    <path d="M0 266 Q104 222 232 268 Q367 233 541 272 Q740 223 960 258 V330H0Z" fill="${near}"/>
    <path d="M0 285H960V540H0Z" fill="url(#ep-water)"/>
    <g fill="none" stroke="#f4e0ac" stroke-width="2" opacity=".31">
      <path d="M31 315h194m155 0h110m107 4h279M62 346h292m216 2h147m-273 33h406M194 399h127m-259 38h391m98 16h271"/>
      <path d="M621 293h224m-252 13h258m-237 27h236m-223 33h228m-174 47h130" opacity=".63"/>
    </g>`;
}

function reeds(x: number, y: number, scale = 1): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})" fill="none" stroke="#485f4d" stroke-linecap="round">
    <path d="M0 0Q-12-71-29-110M0 0Q1-65 17-135M0 0Q21-57 52-82M0 0Q-25-46-58-61M0 0Q6-75 0-105" stroke-width="6"/>
    <path d="M-30-109l-8-22m56-2 7-24m27 75 17-12" stroke="#6e533f" stroke-width="10"/>
    <path d="M-7-26q-12-48-55-69M5-33q21-34 62-47" stroke="#7d9261" stroke-width="4"/>
  </g>`;
}

function stone(x: number, y: number, scale = 1): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})"><ellipse cy="5" rx="50" ry="12" fill="#101e24" opacity=".24"/>
    <path d="M-49 1Q-47-15-22-25Q11-35 35-15L47 0Q19 14-33 9Z" fill="#89918c" stroke="#555f5d" stroke-width="2"/>
    <path d="M-35-9Q-4-33 21-19" fill="none" stroke="#c1c2a8" stroke-width="3" opacity=".58"/></g>`;
}

function pond(): string {
  return `<rect width="960" height="540" fill="url(#ep-pond)"/>
    <path d="M0 206Q197 179 341 207T960 199M0 290Q303 249 639 275T960 260M0 425Q312 398 559 423T960 409"
      fill="none" stroke="#7ba19b" opacity=".25" stroke-width="3"/>
    <path d="M0 127H276m394 34h290M53 368h210m456 14h173M0 469h190m341-111h107"
      stroke="#d8c6a0" opacity=".32" stroke-width="3"/>
    <ellipse cx="476" cy="272" rx="89" ry="28" stroke="#b3d4c5" stroke-width="2" fill="none" opacity=".52" data-ep-ring/>
    <ellipse cx="476" cy="272" rx="133" ry="43" stroke="#81b1ad" stroke-width="1.5" fill="none" opacity=".29"/>
    ${reeds(39, 562, 1.6)}${reeds(916, 551, 1.35)}`;
}

function bank(look: keyof typeof palette, adult = false): string {
  const snow = look === 'winter';
  const rush = look === 'spring' ? .55 : 1.1;
  return `${landscape(look)}
    <path d="M0 464Q186 403 343 441Q488 478 705 453Q874 438 960 391V540H0Z" fill="${snow ? '#c6d5d5' : '#55684d'}"/>
    <path d="M0 510Q256 463 451 508Q740 506 960 481V540H0Z" fill="${snow ? '#9eb3bc' : '#3d5148'}"/>
    <path d="M301 484L479 445 570 459 470 495Z" fill="#584e45" opacity=".26"/>
    ${stone(477, 461, 1.33)}
    ${snow ? '<path d="M421 450Q466 417 510 445Q476 457 430 452Z" fill="#e0e6e3"/>' : reeds(375, 463, rush)}
    ${look === 'autumn' ? '<path d="M548 433q26-28 39-7q-12 19-39 7" fill="#d49c55"/>' : ''}
    ${adult ? spriteSvg('aava', 352, 460, 260, 'point') : ''}
    ${reeds(914, 530, 1.45)}`;
}

function room(): string {
  return `<rect width="960" height="540" fill="#6e554a"/>
    <path d="M0 0H960V355H0Z" fill="#91664f"/><path d="M0 364H960V540H0Z" fill="url(#ep-wood)"/>
    <path d="M32 0V400M244 0V400M737 0V400M912 0V400" stroke="#573f39" stroke-width="13" opacity=".55"/>
    <rect x="325" y="48" width="310" height="224" rx="6" fill="#65473e" stroke="#543b37" stroke-width="15"/>
    <svg x="332" y="55" width="296" height="210" viewBox="140 45 680 460" preserveAspectRatio="xMidYMid slice">${landscape()}</svg>
    <path d="M480 52V271M327 161H633" stroke="#60463f" stroke-width="9"/>
    <path d="M0 392H960M0 439H960M0 493H960" stroke="#69463a" stroke-width="2" opacity=".45"/>`;
}

function notebook(x: number, y: number, mark = false, scale = 1): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <path d="M-99-49Q-38-55 0-29Q46-57 99-45L88 65Q40 53 0 79Q-51 54-90 65Z" fill="#4d6567" stroke="#35474d" stroke-width="4"/>
    <path d="M-95-54Q-39-57 0-32Q46-62 95-50L84 58Q40 47 0 74Q-47 48-85 59Z" fill="#f8e6bf" stroke="#9b785c" stroke-width="2"/>
    <path d="M0-31V74" stroke="#ae8c6b" stroke-width="2"/>
    ${mark ? '<circle cx="-46" cy="12" r="17" fill="none" stroke="#54646e" stroke-width="3"/><path d="M37 1q8-15 20-5q8 8-2 15l-7 6v7m0 8v2" fill="none" stroke="#54646e" stroke-width="4"/>' : ''}
  </g>`;
}

function rocket(x: number, y: number, scale = 1, withPilot = false, exhaust = false): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    ${exhaust ? '<path d="M-20 86Q-34 130 0 162Q31 124 20 86Z" fill="#ecc083" opacity=".7"/><path d="M-12 87Q-18 108 0 134Q18 112 13 87Z" fill="#fff4bd"/>' : ''}
    <path d="M-38 43Q-59 56-69 91L-39 83M38 43Q59 56 69 91L39 83" fill="#9f544d" stroke="#4b4350" stroke-width="4"/>
    <path d="M-37 88Q-54-29 0-98Q54-29 37 88Z" fill="#ded1b6" stroke="#4b5360" stroke-width="5"/>
    <path d="M-28-45Q-18-78 0-98Q20-77 28-45Z" fill="#ae6557"/>
    <path d="M-40 65H40M-31 87H31" stroke="#8c796d" stroke-width="6"/>
    <circle cy="-3" r="24" fill="#2b4b65" stroke="#7f958f" stroke-width="5"/>
    ${withPilot ? spriteSvg('loikka', -2, 18, 55, 'wave') : ''}
    <circle cx="-27" cy="51" r="4" fill="#f4e3a0"/><circle cx="27" cy="51" r="4" fill="#f4e3a0"/>
  </g>`;
}

function stars(): string {
  const field = Array.from({ length: 55 }, (_, i) => {
    const x = 25 + (i * 173) % 916;
    const y = 20 + (i * i * 29 + i * 17) % 493;
    return `<circle cx="${x}" cy="${y}" r="${i % 9 === 0 ? 2.5 : 1.1}" fill="${i % 3 === 0 ? '#edc697' : '#b7d5df'}" opacity="${0.29 + (i % 7) * 0.09}"/>`;
  }).join('');
  return `<rect width="960" height="540" fill="url(#ep-night)"/>${field}`;
}

function nest(x: number, y: number, scale = 1, eggs = true): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <ellipse cy="7" rx="109" ry="28" fill="#293a37" opacity=".34"/>
    <ellipse rx="99" ry="34" fill="#755343" stroke="#a88156" stroke-width="7"/>
    ${eggs ? '<ellipse cx="-36" cy="-18" rx="24" ry="33" fill="url(#ep-shell)" transform="rotate(-15 -36 -18)"/><ellipse cx="12" cy="-24" rx="25" ry="36" fill="url(#ep-shell)"/><ellipse cx="48" cy="-14" rx="20" ry="29" fill="url(#ep-shell)" transform="rotate(21 48 -14)"/>' : ''}
    <path d="M-107-1Q-25 34 106-5M-97 11Q4 51 97 13M-82 26Q10 52 83 26" fill="none" stroke="#ba915b" stroke-width="6" stroke-linecap="round"/>
    <path d="M-95 7Q-40 39 32 35m-6-11q36 3 80-22M-86 27Q-29 48 56 36" fill="none" stroke="#d4ac70" stroke-width="3" stroke-linecap="round"/>
  </g>`;
}

function workbench(art: 'map' | 'tools' | 'keepsakes'): string {
  const paper = `<path d="M244 312L565 291 722 379 328 418Z" fill="#e8cd9e" stroke="#7c6052" stroke-width="3"/>
    <path d="M295 330q78-32 137-5q54 24 93 9m-177 59q67-53 123-25q42 14 82 2" fill="none" stroke="#648483" stroke-width="7" opacity=".76"/>
    <path d="M354 314l33 92m103-101l52 94m-248-50l355-25m-319 61l376-30" stroke="#745d56" opacity=".2" stroke-width="1"/>`;
  const skyMap = `<path d="M330 330L571 310 655 370 400 401Z" fill="#35546a" stroke="#e6cc9b" stroke-width="3"/>
    <path d="M390 346l75 17 69-23 61 20" fill="none" stroke="#d3c8ab" stroke-width="1.3"/>
    <g fill="#f9e4a4"><circle cx="390" cy="346" r="4"/><circle cx="465" cy="363" r="3"/><circle cx="534" cy="340" r="4"/><circle cx="595" cy="360" r="3"/></g>`;
  return `${room()}
    ${spriteSvg('aava', 248, 362, 265, 'read')}${spriteSvg('loikka', 717, 367, 248, 'curious', true)}
    ${art === 'tools' ? sulka(794, 205, 59) : ''}
    <path d="M100 343L714 304 906 395 190 465Z" fill="#b07e55" stroke="#6b483e" stroke-width="5"/>
    <path d="M190 465L906 395V420L190 491Z" fill="#795043"/><path d="M207 485v55m639-109v94" stroke="#513d3a" stroke-width="16"/>
    ${art === 'map' ? paper : art === 'tools' ? skyMap : `${notebook(620, 353, false, .7)}${stone(372, 387, .76)}${stone(300, 398, .44)}`}
    ${art === 'tools' ? '<path d="M589 363l93-19 44 26-103 23Z" fill="#b17651" stroke="#6f4b3d" stroke-width="3"/><path d="M615 369l57-12" stroke="#e8bc77" stroke-width="7"/>' : ''}
    ${art === 'keepsakes' ? '<path d="M428 374l79-30 37 13-79 29Z" fill="#d4a06d" stroke="#784d3d" stroke-width="3"/>' : ''}`;
}

function shelterScene(art: 'nest' | 'shelter' | 'choice' | 'evening-nest'): string {
  const evening = art === 'evening-nest';
  return `${landscape(evening ? 'evening' : 'summer')}
    <path d="M0 416Q241 374 495 431Q723 384 960 423V540H0Z" fill="${evening ? '#3d5048' : '#647951'}"/>
    ${reeds(784, 492, 1.45)}${reeds(862, 543, 1.7)}${reeds(76, 518, 1.2)}
    ${art === 'shelter' || art === 'choice' ? '<path d="M612 378Q696 302 770 370M617 380v88m148-97v96" stroke="#8a654a" stroke-width="11" fill="none"/><path d="M606 378Q681 282 777 370Q704 360 606 378Z" fill="#9f985b"/>' : ''}
    ${!evening && art !== 'nest' ? spriteSvg('loikka', 729, 441, 218, art === 'shelter' ? 'point' : 'curious', true) : ''}
    ${evening
      ? `<image href="${poseUrl('aava', 'crouch')}" x="344" y="192" width="282" height="282"/>`
      : spriteSvg('aava', 393, 454, 282, 'point')}
    ${nest(582, 464, 1.1, evening)}${stone(685, 490, .62)}`;
}

function feast(art: 'feast' | 'wood-box' | 'bench' | 'toast'): string {
  if (art === 'bench') {
    return `${landscape('evening')}<path d="M0 417Q498 388 960 410V540H0Z" fill="#59634a"/>
      <path d="M332 441v62m288-62v62M280 444l370-9M294 405l341-7" stroke="#694b40" stroke-width="20" stroke-linecap="round"/>
      <path d="M339 438l-11-214m-5 2q84-74 178-2q-104 56-178 2" fill="#829453" stroke="#526c44" stroke-width="5"/>
      <image href="${import.meta.env.BASE_URL}models/characters/sisi/film-sleep.png" x="356" y="206" width="306" height="306"/>
      <path d="M594 261q42-41 83-15q-40 32-83 15" fill="#d9b164" data-ep-leaf/>${reeds(109, 530, 1.7)}`;
  }
  const box = art === 'wood-box';
  return `${landscape('evening')}
    <path d="M0 412Q438 373 960 405V540H0Z" fill="#665f49"/>
    ${spriteSvg('aava', box ? 193 : 251, 393, box ? 231 : 282, 'idle')}
    ${spriteSvg('loikka', box ? 737 : 645, 404, 252, 'happy', true)}
    ${art === 'toast' ? sulka(504, 235, 61) : ''}
    <path d="M96 393L731 347 919 405 212 464Z" fill="#bc8b5e" stroke="#684e43" stroke-width="5"/>
    <path d="M211 464L919 405V429L212 489Z" fill="#805743"/><path d="M231 484v56m603-102v83" stroke="#63463b" stroke-width="17"/>
    ${box ? '<path d="M345 370l179-35 103 52-207 43Z" fill="#cd9764" stroke="#6b473b" stroke-width="5"/><path d="M420 430v34l207-45v-32M345 370v39l75 55" fill="#9e6c51" stroke="#6b473b" stroke-width="5"/><path d="M433 407l40-9 14 8 37-8" fill="none" stroke="#e0b484" stroke-width="6"/>' :
      '<g fill="#e2c49c" stroke="#8c6550" stroke-width="2"><ellipse cx="356" cy="403" rx="34" ry="13"/><ellipse cx="606" cy="379" rx="39" ry="12"/><rect x="494" y="336" width="27" height="37" rx="4"/></g><path d="M772 389v-47m-12 6h24v36h-24z" fill="#f3cf83" stroke="#5f5243" stroke-width="5"/><path d="M801 402q38-29 84-15l-20 18h-62" fill="#a97653"/><path d="M678 391q-14-29-32-32q7 25 32 32q10-29 32-29q-8 21-32 29" fill="#6b8855"/>'}`;
}

function cape(art: 'cape' | 'embrace' | 'departure' | 'launch' | 'turn-home'): string {
  const embrace = art === 'embrace';
  const launch = art === 'launch';
  const departure = art === 'departure';
  const home = art === 'turn-home';
  return `${landscape('evening')}
    <path d="M0 471Q190 350 432 415Q618 436 960 353V540H0Z" fill="#3e504b"/>
    <path d="M0 503Q309 408 551 488Q738 470 960 425V540H0Z" fill="#2d4241"/>
    <path d="M546 435Q650 411 803 413" fill="none" stroke="#c1ac7c" stroke-width="3" stroke-dasharray="8 14" opacity=".55"/>
    ${home ? '<circle cx="722" cy="136" r="4.8" fill="#ffdfa9"/><circle cx="722" cy="136" r="11" fill="#f5e0aa" opacity=".18"/>' :
      `<g ${launch ? 'data-ep-launch' : ''}>${rocket(725, launch ? 272 : 304, embrace ? 1 : 1.15, departure, launch)}</g>`}
    ${spriteSvg('aava', home ? 250 : embrace ? 356 : 281, 461, embrace ? 315 : 268, departure ? 'wave' : home ? 'walk' : 'idle', home)}
    ${launch || departure || home ? '' : spriteSvg('loikka', embrace ? 506 : 485, 456, embrace ? 296 : 246, embrace ? 'happy' : 'curious', true)}
    ${reeds(108, 552, 1.15)}${reeds(922, 519, .92)}`;
}

function cockpit(art: 'islands' | 'cabin' | 'stars' | 'notebook' | 'recording'): string {
  const viewedLand = art === 'islands';
  const scenery = viewedLand
    ? '<rect width="960" height="540" fill="#557e87"/><path d="M-50 370Q204 91 479 99Q672 55 920 215Q660 368 544 540H-50Z" fill="#80946e"/><path d="M-30 450Q249 240 517 215T866 105M361 269Q310 177 323 93M432 236Q533 292 564 499" fill="none" stroke="#577f8a" stroke-width="34"/><path d="M132 269q101-82 181-87m240 154q132-102 224-112m-494 224q122-95 184-120" fill="none" stroke="#4a7461" stroke-width="48" opacity=".64"/>'
    : stars();
  return `<rect width="960" height="540" fill="#243646"/>
    <svg x="78" y="46" width="805" height="340" viewBox="0 50 960 415" preserveAspectRatio="xMidYMid slice">${scenery}</svg>
    <path d="M59 44H900V387H59Z" fill="none" stroke="#596568" stroke-width="24"/>
    <path d="M78 47H881V382H78Z" fill="none" stroke="#858c7f" stroke-width="4"/>
    <path d="M0 426Q478 356 960 426V540H0Z" fill="#263b48" stroke="#56645f" stroke-width="6"/>
    ${art === 'notebook' || art === 'recording' ? notebook(504, 411, true, 1.03) : ''}
    ${art === 'cabin' ? `${stone(625, 428, .68)}<path d="M579 456l106-6" stroke="#6c817c" stroke-width="7"/>` : ''}
    ${art === 'recording' ? '<rect x="658" y="406" width="49" height="26" rx="6" fill="#718688" stroke="#263b48" stroke-width="3"/><circle cx="694" cy="419" r="5" fill="#efa483"/>' : ''}
    ${art === 'stars' || viewedLand ? '' : spriteSvg('loikka', 342, 460, 269, art === 'recording' ? 'point' : 'curious')}
    <g fill="#afbf95"><circle cx="53" cy="443" r="4"/><circle cx="74" cy="439" r="4"/><circle cx="94" cy="436" r="4"/></g>`;
}

function shell(art: 'shell' | 'crack' | 'bill'): string {
  const reveal = art === 'bill';
  return `${landscape('evening')}
    <path d="M0 432Q424 363 960 408V540H0Z" fill="#3a4845"/>
    ${reeds(829, 488, 1.95)}${reeds(932, 526, 2.5)}${reeds(96, 535, 1.7)}
    ${spriteSvg('aava', 341, 542, 530, 'idle')}
    <ellipse cx="631" cy="462" rx="163" ry="55" fill="#755343" stroke="#a58255" stroke-width="9"/>
    <ellipse cx="617" cy="385" rx="69" ry="101" fill="url(#ep-shell)" stroke="#c8a67f" stroke-width="2" transform="rotate(-9 617 385)"/>
    ${art === 'shell' ? '' : '<path d="M587 353l18 10 7 16 17-5 9 13 17-2" fill="none" stroke="#775d52" stroke-width="3" stroke-linecap="round"/>'}
    ${reveal ? `<path d="M605 363l14-8 16 8 10 17-11 14-21-2-10-13z" fill="#675044"/>
      <g data-ep-bill><svg x="616" y="353" width="55" height="50" viewBox="182 75 57 78" preserveAspectRatio="xMinYMid meet">
        <defs><clipPath id="ep-bill-only"><path d="M222 78H239V150H194L189 139L183 134L181 129L185 123L188 118L190 111L192 101L197 93L206 88Z"/></clipPath></defs>
        <image href="${poseUrl('aava', 'idle')}" width="256" height="256" clip-path="url(#ep-bill-only)"/>
      </svg></g><path d="M601 367l9 14 2 12 18 2-9 7-22-5z" fill="#e8d4aa"/>` : ''}
    <path d="M473 461Q606 527 790 451M476 478Q635 533 774 476M500 501Q610 535 740 495" fill="none" stroke="#ba925f" stroke-width="8" stroke-linecap="round"/>
    <path d="M495 470q105 52 267 3m-252 21q100 46 212 5" fill="none" stroke="#d2a776" stroke-width="3"/>
    ${stone(802, 493, .6)}`;
}

function shotArt(art: FinaleArt): string {
  switch (art) {
    case 'water': return pond();
    case 'spring': case 'summer': case 'autumn': case 'winter': return bank(art);
    case 'adult-bank': return bank('summer', true);
    case 'growth': return `${room()}<path d="M170 0H402V540H170Z" fill="#a97850" stroke="#5e4238" stroke-width="12"/>
      <path d="M257 379h61m-58-64h51m-45-65h66m-67-63h53m-46-59h70" stroke="#f0ce8e" stroke-width="4"/>
      <path d="M492 425h306m-230 38h311M552 422v17m51-17v12m58-16v20m57-19v10m60-18v18" stroke="#ddac76" stroke-width="4"/>`;
    case 'hatch': return `${room()}${rocket(612, 325, 2.02, true)}${spriteSvg('aava', 278, 468, 298, 'talk')}`;
    case 'map': case 'tools': case 'keepsakes': return workbench(art);
    case 'nest': case 'shelter': case 'choice': case 'evening-nest': return shelterScene(art);
    case 'feast': case 'wood-box': case 'bench': case 'toast': return feast(art);
    case 'cape': case 'embrace': case 'departure': case 'launch': case 'turn-home': return cape(art);
    case 'luggage': return `${room()}
      ${spriteSvg('loikka', 294, 456, 297, 'curious')}${rocket(786, 303, 1.12)}
      <path d="M426 355H652L692 477H409Z" fill="#a47155" stroke="#61473d" stroke-width="6"/>
      <path d="M426 353l38-71h166l22 73Z" fill="#724c43" stroke="#61473d" stroke-width="6"/>
      ${notebook(551, 406, false, .69)}${stone(462, 418, .46)}`;
    case 'islands': case 'cabin': case 'stars': case 'notebook': case 'recording': return cockpit(art);
    case 'shell': case 'crack': case 'bill': return shell(art);
    case 'credits': return `<rect width="960" height="540" fill="url(#ep-night)"/>
      <path d="M0 431Q230 402 431 449Q682 485 960 428V540H0Z" fill="#152c42"/>
      <path d="M0 472Q173 437 405 479T960 464" fill="none" stroke="#587276" stroke-width="2" opacity=".55"/>
      ${reeds(32, 554, 1.5)}${reeds(931, 561, 1.8)}`;
  }
}

function timestamp(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds) % 60).padStart(2, '0')}`;
}

function transcript() {
  return h('details', { class: 'ep-transcript' },
    h('summary', {}, 'Tarina tekstinä ja kuvat kuvailtuina'),
    ...FINALE_CHAPTERS.map((chapter) => {
      const lines = [
        ...chapter.shots.map((shot) => ({ at: shot.start, text: shot.description, speaker: undefined })),
        ...chapter.captions.map((caption) => ({ at: caption.start, text: caption.text, speaker: caption.speaker })),
      ].sort((a, b) => a.at - b.at);
      return h('section', { class: 'ep-transcript-part' },
        h('h2', {}, `${timestamp(chapter.start)} · ${chapter.title}`),
        ...lines.map(({ text, speaker }) => h('p', {}, speaker ? h('strong', {}, `${speaker} — `) : null, text)));
    }));
}

/** Mounts an optional, independent viewing experience with no learner-store dependency. */
export function finale(host: HTMLElement, { onExit }: { onExit: () => void }): () => void {
  const sound = createFinaleSound();
  const reduced = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : undefined;
  let clock: FinaleClock = { position: 0, playingSince: null };
  let raf = 0;
  let disposed = false;
  let audible = false;
  let currentShot = -1;
  let currentCaption: string | undefined;
  let cinema: FinaleCinema | undefined;
  let filmReady = false;
  // The picture story is the default; the 3D film loads only when asked for (3D characters are not release art yet).
  let pictureMode = true;
  const previousTextHook = window.render_game_to_text, previousTimeHook = window.advanceTime;
  const adultStill = calmByAdult();
  let rings: Element | null = null;
  let launch: Element | null = null;
  let leaf: Element | null = null;
  let bill: Element | null = null;

  const image = h('div', { class: 'ep-art', 'aria-hidden': 'true' });
  const film = h('div', { class: 'ep-film', 'aria-hidden': 'true', 'data-ready': 'false' });
  const shade = h('div', { class: 'ep-shade', 'aria-hidden': 'true' });
  const caption = h('figcaption', { class: 'ep-caption', hidden: true });
  const credit = h('section', { class: 'ep-credits', hidden: true, 'aria-label': 'Lopputekstit' },
    h('p', { class: 'ep-kicker' }, 'Aavan matkassa'),
    h('h2', {}, FINALE_TITLE),
    h('dl', {}, ...FINALE_CREDITS.flatMap(({ label, text }) => [h('dt', {}, label), h('dd', {}, text)])));
  const screen = h('figure', { class: 'ep-screen' }, image, film, shade, caption, credit);
  const play = h('button', { type: 'button', class: 'ep-primary' }, 'Katso');
  const audio = h('button', { type: 'button', 'aria-pressed': 'false' }, 'Äänet');
  const pictures = h('button', { type: 'button', 'aria-pressed': 'false' }, '3D-elokuva');
  const elapsed = h('span', { class: 'ep-time', 'aria-hidden': 'true' }, '0:00');
  const seek = h('input', { type: 'range', min: 0, max: FINALE_SECONDS, step: '0.1', value: 0, 'aria-label': 'Etene tarinassa' });
  const chapter = h('select', { 'aria-label': 'Valitse kohtaus' },
    ...FINALE_CHAPTERS.map((part) => h('option', { value: part.start }, part.title)));
  const text = transcript();
  const returnButton = h('button', { type: 'button', class: 'ep-primary', onclick: exit }, 'Palaa saaristoon');
  const memory = h('button', { type: 'button', onclick: () => {
    text.open = true;
    text.querySelector('summary')?.focus();
    text.scrollIntoView?.({ block: 'nearest' });
  } }, 'Katso muistoja');
  const ending = h('div', { class: 'ep-ending', hidden: true }, returnButton, memory);

  function buttonLabel(label: string): void {
    if (play.textContent !== label) play.textContent = label;
  }

  function animateArt(time: number, progress: number, art: FinaleArt): void {
    const still = adultStill || reduced?.matches;
    if (rings) {
      rings.setAttribute('rx', String(still ? 89 : 40 + progress * 113));
      rings.setAttribute('ry', String(still ? 28 : 13 + progress * 32));
      rings.setAttribute('opacity', String(still ? .52 : .71 - progress * .57));
    }
    launch?.setAttribute('transform', `translate(0 ${still ? -51 : -progress * 172})`);
    leaf?.setAttribute('transform', `rotate(${still ? 0 : Math.sin(progress * 8) * 7} 594 261)`);
    const billMovement = art === 'bill' && !still ? -Math.sin(Math.min(1, progress * 4) * Math.PI) * 2.2 : 0;
    bill?.setAttribute('transform', `translate(0 ${billMovement})`);
    const first = art === 'water' && clock.playingSince !== null ? Math.max(0, 1 - time / 2) : 0;
    const last = art === 'bill' ? Math.max(0, (time - 516) / 4) : 0;
    shade.style.opacity = String(still ? 0 : Math.max(first, last));
  }

  function render(now: number): void {
    const view = finaleAt(finaleElapsed(clock, now));
    if (currentShot !== view.shot.start) {
      currentShot = view.shot.start;
      screen.dataset.shot = view.shot.art;
      image.innerHTML = frame(shotArt(view.shot.art));
      rings = image.querySelector('[data-ep-ring]');
      launch = image.querySelector('[data-ep-launch]');
      leaf = image.querySelector('[data-ep-leaf]');
      bill = image.querySelector('[data-ep-bill]');
      chapter.value = String(view.chapter.start);
      credit.hidden = view.shot.art !== 'credits';
    }
    const message = view.caption?.text;
    if (message !== currentCaption) {
      currentCaption = message;
      caption.hidden = !view.caption;
      if (view.caption) caption.replaceChildren(view.caption.speaker ? h('b', {}, `${view.caption.speaker} — `) : '', view.caption.text);
    }
    animateArt(view.time, view.progress, view.shot.art);
    if (!pictureMode) cinema?.setTime(view.time, !!adultStill || !!reduced?.matches);
    if (audible) sound.sync(view.time, clock.playingSince !== null);
    const label = `${timestamp(view.time)} / ${timestamp(FINALE_SECONDS)}`;
    if (elapsed.textContent !== label) {
      elapsed.textContent = label;
      seek.setAttribute('aria-valuetext', label);
    }
    seek.value = String(view.time);
    ending.hidden = !view.ended;
    if (view.ended) {
      clock = pauseFinale(clock, now);
      buttonLabel('Katso uudelleen');
    }
  }

  function tick(now: number): void {
    if (disposed) return;
    render(now);
    if (clock.playingSince !== null) raf = requestAnimationFrame(tick);
  }

  function pause(): void {
    if (clock.playingSince === null) return;
    const now = performance.now();
    clock = pauseFinale(clock, now);
    cancelAnimationFrame(raf);
    sound.stop();
    buttonLabel('Jatka');
    render(now);
  }

  function jump(position: number): void {
    const now = performance.now();
    sound.stop();
    clock = seekFinale(clock, position, now);
    if (clock.playingSince === null) buttonLabel(position >= FINALE_SECONDS ? 'Katso uudelleen' : position === 0 ? 'Katso' : 'Jatka');
    render(now);
  }

  function cleanup(): void {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(raf);
    sound.dispose();
    cinema?.dispose();
    window.render_game_to_text = previousTextHook; window.advanceTime = previousTimeHook;
    document.removeEventListener('visibilitychange', visibility);
    reduced?.removeEventListener('change', motionChange);
  }

  function exit(): void { if (!disposed) { cleanup(); onExit(); } }
  const visibility = () => { if (document.hidden) pause(); };
  const motionChange = () => render(performance.now());
  document.addEventListener('visibilitychange', visibility);
  reduced?.addEventListener('change', motionChange);

  play.addEventListener('click', () => {
    if (clock.playingSince !== null) { pause(); return; }
    const now = performance.now();
    const position = clock.position >= FINALE_SECONDS ? 0 : clock.position;
    clock = { position, playingSince: now };
    buttonLabel('Pysäytä');
    render(now);
    raf = requestAnimationFrame(tick);
  });
  seek.addEventListener('input', () => jump(Number(seek.value)));
  chapter.addEventListener('change', () => jump(Number(chapter.value)));
  audio.addEventListener('click', () => {
    audible = !audible && sound.enable();
    if (!audible) sound.stop();
    audio.setAttribute('aria-pressed', String(audible));
  });
  pictures.addEventListener('click', () => {
    pictureMode = !pictureMode;
    pictures.setAttribute('aria-pressed', String(!pictureMode));
    if (!pictureMode && !cinema) mountFilm();
    film.dataset.ready = String(filmReady && !pictureMode);
    image.style.visibility = filmReady && !pictureMode ? 'hidden' : 'visible';
    render(performance.now());
  });

  const skip = h('button', { type: 'button', onclick: exit }, 'Ohita tarina');
  const viewer = h('section', { class: 'epilogue', 'aria-label': FINALE_TITLE },
    h('header', { class: 'ep-header' }, h('div', {}, h('p', { class: 'ep-kicker' }, 'Aavan matkassa · Tulevaisuuden tarina'), h('h1', {}, FINALE_TITLE)), skip),
    screen,
    h('div', { class: 'ep-player' },
      h('div', { class: 'ep-actions' }, play, audio, chapter, pictures),
      h('div', { class: 'ep-scrub' }, seek, elapsed)),
    ending, text,
    h('p', { class: 'ep-production' }, 'Tulevaisuuden tarina · 8 min 40 s ja lopputekstit'));
  host.replaceChildren(viewer);
  function mountFilm() {
    pictures.disabled = true;
    cinema = mountFinaleCinema(film, { onStatus: status => {
      filmReady = status === 'ready';
      film.dataset.ready = String(filmReady && !pictureMode);
      image.style.visibility = filmReady && !pictureMode ? 'hidden' : 'visible';
      pictures.disabled = status === 'loading';
      if (status !== 'loading' && !filmReady) { pictureMode = true; pictures.setAttribute('aria-pressed', 'false'); }
      render(performance.now());
    } });
  }
  window.render_game_to_text = () => JSON.stringify({ mode: 'finale', time: finaleElapsed(clock, performance.now()), playing: clock.playingSince !== null, pictureMode, audible, audio: sound.snapshot(), film: cinema?.snapshot() ?? null });
  window.advanceTime = (ms: number) => { if (Number.isFinite(ms) && ms >= 0) jump(finaleElapsed(clock, performance.now()) + ms / 1000); };
  render(performance.now());
  return cleanup;
}
