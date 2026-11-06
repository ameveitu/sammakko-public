// Reed bundles (kaislat) in the shallows: tall instanced blades plus cattail heads that share
// one bend function, so heads ride exactly on their stems. Wind sways them, the pointer parts them.
import * as THREE from 'three';
import { ISLAND_POS } from './island.js';
import { mulberry } from './grass.js';

const BEND = /* glsl */`
  attribute vec3 aOffset;attribute vec4 aParams;uniform float uTime,uPush;uniform vec3 uPointer;
  vec2 bendAt(float t){
    float g=sin(uTime*.85+aOffset.x*.35+aParams.w*3.)*.5+.5;
    vec2 b=vec2(.32*g+.07*sin(uTime*2.6+aParams.w*9.),.1*sin(uTime*.7+aOffset.z*.5));
    vec2 dp=aOffset.xz-uPointer.xz;float pd=length(dp);
    b+=dp/(pd+1e-3)*uPush*smoothstep(2.2,.2,pd)*1.3;
    return b*t*t*aParams.y;
  }`;

export function makeReeds(heightAt, uniforms) {
  const rand = mulberry(4242), B = heightAt.bounds, cand = [];
  for (let i = 0; i < 20000; i++) {
    const x = B.x + rand() * B.z, z = B.y + rand() * B.w, h = heightAt(x, z);
    if (h > -0.45 && h < -0.08) cand.push([x, z]);
  }
  const pickMin = (f) => cand.reduce((a, c) => (f(c) < f(a) ? c : a), cand[0]);
  const centers = cand.length ? [
    [pickMin(([x, z]) => x - z * 0.6), 70],                                   // the bundle on the left shore
    [pickMin(([x, z]) => Math.abs(x - (ISLAND_POS.x + 9)) - z * 0.4), 40],    // front of the headland
    [pickMin(([x, z]) => Math.abs(x - (ISLAND_POS.x + 17)) - z * 0.3), 34],
    [pickMin(([x, z]) => Math.abs(x - (ISLAND_POS.x - 3)) + Math.abs(z - (ISLAND_POS.z - 8))), 24],
  ] : [];
  const off = [], par = [], hoff = [], hpar = [];
  for (const [[cx, cz], n] of centers) {
    for (let i = 0; i < n; i++) {
      const r = Math.sqrt(rand()) * 0.85, a = rand() * Math.PI * 2;
      const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r * 0.7;
      const p = [rand() * Math.PI, 1.2 + rand() * 1.1 * (1 - r * 0.4), 0.035 + rand() * 0.03, rand()];
      off.push(x, -0.25, z); par.push(...p);
      if (rand() < 0.3) { hoff.push(x, -0.25, z); hpar.push(...p); }
    }
  }
  const blade = [], index = [], SEG = 6;
  for (let i = 0; i <= SEG; i++) { const t = i / SEG, w = (1 - t) ** 0.7 * 0.5; blade.push(-w, t, 0, w, t, 0); if (i < SEG) { const k = i * 2; index.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); } }
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(blade, 3)); geo.setIndex(index);
  geo.setAttribute('aOffset', new THREE.InstancedBufferAttribute(new Float32Array(off), 3));
  geo.setAttribute('aParams', new THREE.InstancedBufferAttribute(new Float32Array(par), 4));
  geo.instanceCount = off.length / 3;
  const blades = new THREE.Mesh(geo, new THREE.ShaderMaterial({
    uniforms, side: THREE.DoubleSide,
    vertexShader: BEND + /* glsl */`
      varying float vT,vS;
      void main(){
        float t=position.y,h=aParams.y;vec2 dir=vec2(cos(aParams.x),sin(aParams.x));
        vec3 p=vec3(position.x*aParams.z*dir.x,t*h,position.x*aParams.z*dir.y);
        vec2 b=bendAt(t);p.xz+=b;p.y*=1.-.12*min(length(b),1.);
        vT=t;vS=aParams.w;
        gl_Position=projectionMatrix*viewMatrix*vec4(aOffset+p,1.);
      }`,
    fragmentShader: /* glsl */`
      varying float vT,vS;
      void main(){
        vec3 c=mix(vec3(.08,.14,.06),vec3(.5,.52,.25),smoothstep(.1,1.,vT))*(.8+.35*vS);
        c+=vec3(1.,.55,.25)*pow(vT,4.)*.4;
        gl_FragColor=vec4(c,1.);
        #include <colorspace_fragment>
      }`,
  }));
  const hgeo = new THREE.InstancedBufferGeometry().copy(new THREE.CylinderGeometry(0.04, 0.045, 0.28, 7));
  hgeo.setAttribute('aOffset', new THREE.InstancedBufferAttribute(new Float32Array(hoff), 3));
  hgeo.setAttribute('aParams', new THREE.InstancedBufferAttribute(new Float32Array(hpar), 4));
  hgeo.instanceCount = hoff.length / 3;
  const heads = new THREE.Mesh(hgeo, new THREE.ShaderMaterial({
    uniforms,
    vertexShader: BEND + /* glsl */`
      varying float vL;
      void main(){
        float t=.84;vec3 c=aOffset+vec3(bendAt(t),t*aParams.y).xzy;
        c.y=aOffset.y+t*aParams.y;
        vL=.6+.4*normal.x;
        gl_Position=projectionMatrix*viewMatrix*vec4(c+position,1.);
      }`,
    fragmentShader: /* glsl */`
      varying float vL;
      void main(){ vec3 c=vec3(.33,.19,.09)*vL+vec3(.25,.12,.04)*max(0.,vL-.8);gl_FragColor=vec4(c,1.);
      #include <colorspace_fragment>
      }`,
  }));
  const group = new THREE.Group();
  group.add(blades, heads);
  blades.frustumCulled = heads.frustumCulled = false;
  return { group, count: geo.instanceCount, bundles: centers.map(([c]) => new THREE.Vector3(c[0], 0, c[1])) };
}
