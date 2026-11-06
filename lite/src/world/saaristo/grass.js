// Thousands of instanced grass blades bent by a wind field and pushed by the pointer,
// plus GPU-animated fireflies. One draw call each.
import * as THREE from 'three';
import { sampleSurface } from './island.js';

export function makeGrass(island, count) {
  const SEG = 4, base = [], index = [];
  for (let i = 0; i <= SEG; i++) {
    const t = i / SEG, w = (1 - t) ** 0.85 * 0.5;
    base.push(-w, t, 0, w, t, 0);
    if (i < SEG) { const k = i * 2; index.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(base, 3));
  geo.setIndex(index);
  const rand = mulberry(20261104);
  const pts = sampleSurface(island.pos, island.nor, island.idx, count * 3, rand);
  const off = [], par = [];
  for (let i = 0; i < pts.length && off.length < count * 3; i += 4) {
    const y = pts[i + 1], ny = pts[i + 3];
    if (ny < 0.72 || y < 0.32) continue; // no grass on sand or steep rock
    off.push(pts[i], y - 0.03, pts[i + 2]);
    par.push(rand() * Math.PI, 0.28 + rand() * 0.42 + Math.min(0.25, (y - 0.3) * 0.06), 0.035 + rand() * 0.035, rand());
  }
  geo.setAttribute('aOffset', new THREE.InstancedBufferAttribute(new Float32Array(off), 3));
  geo.setAttribute('aParams', new THREE.InstancedBufferAttribute(new Float32Array(par), 4));
  geo.instanceCount = off.length / 3;
  const uniforms = { uTime: { value: 0 }, uPointer: { value: new THREE.Vector3(1e4, 0, 1e4) }, uPush: { value: 0 }, uWind: { value: 1 } };
  const mat = new THREE.ShaderMaterial({
    uniforms, side: THREE.DoubleSide,
    vertexShader: /* glsl */`
      attribute vec3 aOffset;attribute vec4 aParams;uniform float uTime,uPush,uWind;uniform vec3 uPointer;varying float vT,vShade;
      void main(){
        float t=position.y,hgt=aParams.y,w=aParams.z;
        vec2 dir=vec2(cos(aParams.x),sin(aParams.x));
        vec3 p=vec3(position.x*w*dir.x,0.,position.x*w*dir.y);
        float gust=sin(uTime*1.25+aOffset.x*.33+aOffset.z*.21)*.5+.5;
        gust*=.6+.4*sin(uTime*.37+aOffset.z*.09);
        vec2 bend=vec2(.65*gust+.12*sin(uTime*4.3+aParams.w*6.28),.22*sin(uTime*.8+aOffset.x*.4))*uWind;
        vec2 dp=aOffset.xz-uPointer.xz;float pd=length(dp);
        bend+=dp/(pd+1e-3)*uPush*smoothstep(2.4,.2,pd)*1.7;
        float k=t*t;
        p.xz+=bend*k*hgt;
        p.y=t*hgt*(1.-.3*min(length(bend),1.2)*k);
        vT=t;vShade=aParams.w;
        gl_Position=projectionMatrix*viewMatrix*vec4(aOffset+p,1.);
      }`,
    fragmentShader: /* glsl */`
      varying float vT,vShade;
      void main(){
        vec3 col=mix(vec3(.05,.16,.06),vec3(.45,.62,.2),vT)*(.8+.4*vShade);
        col+=vec3(1.,.55,.22)*pow(vT,3.)*.35;
        gl_FragColor=vec4(col,1.);
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  return { mesh, uniforms, count: geo.instanceCount };
}

export function makeFireflies(center, n = 240) {
  const rand = mulberry(7), pos = new Float32Array(n * 3), seed = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const a = rand() * Math.PI * 2, r = 2 + rand() * 13;
    pos.set([center.x + Math.cos(a) * r - 3, 0.3 + rand() * 2.6, center.z + Math.sin(a) * r * 0.8 + 3], i * 3);
    seed[i] = rand();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const uniforms = { uTime: { value: 0 }, uScale: { value: 1 } };
  const mat = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      attribute float aSeed;uniform float uTime,uScale;varying float vGlow;
      void main(){
        float s=aSeed*6.2831;
        vec3 p=position+vec3(sin(uTime*.31+s)*1.2,sin(uTime*.53+s*2.)*.35,cos(uTime*.27+s*1.3)*1.1);
        vGlow=pow(max(0.,sin(uTime*(.9+aSeed)+s*3.)),3.);
        vec4 mv=viewMatrix*vec4(p,1.);
        gl_PointSize=uScale*(10.+vGlow*22.)/max(-mv.z,1.)*6.;
        gl_Position=projectionMatrix*mv;
      }`,
    fragmentShader: /* glsl */`
      varying float vGlow;
      void main(){
        float d=length(gl_PointCoord-.5);
        float a=pow(smoothstep(.5,0.,d),2.)*(.15+vGlow);
        gl_FragColor=vec4(vec3(1.,.86,.42)*a,a);
      }`,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  return { mesh: pts, uniforms };
}

export function mulberry(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
