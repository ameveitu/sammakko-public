// Living water: Hugo Elias height-field ripples simulated on the GPU (ping-pong render targets,
// the technique of three.js' webgl_gpgpu_water example), shaded with sky reflection, Fresnel,
// sunset glitter and twinkling four-point glints. Lily pads ride the same height field.
import * as THREE from 'three';
import { SKY_GLSL } from './island.js';

export const SIM = 512, SIM_SIZE = 46, SIM_CENTER = new THREE.Vector2(1, 1.5);
const MAX_DROPS = 8;

export function makeWater(renderer, skyTex, sunDir, land) {
  const ok = renderer.capabilities.isWebGL2 &&
    (renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float'));
  const opts = { type: THREE.HalfFloatType, format: THREE.RGBAFormat, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false };
  let a = new THREE.WebGLRenderTarget(SIM, SIM, opts), b = new THREE.WebGLRenderTarget(SIM, SIM, opts);
  const drops = Array.from({ length: MAX_DROPS }, () => new THREE.Vector4());
  const queue = [];
  const simMat = new THREE.ShaderMaterial({
    uniforms: { uPrev: { value: null }, uTexel: { value: 1 / SIM }, uDrops: { value: drops }, uCount: { value: 0 }, uDamp: { value: 0.993 } },
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
    fragmentShader: /* glsl */`
      uniform sampler2D uPrev;uniform float uTexel;uniform vec4 uDrops[${MAX_DROPS}];uniform int uCount;uniform float uDamp;varying vec2 vUv;
      void main(){
        vec4 c=texture2D(uPrev,vUv);
        float s=texture2D(uPrev,vUv+vec2(uTexel,0.)).r+texture2D(uPrev,vUv-vec2(uTexel,0.)).r
               +texture2D(uPrev,vUv+vec2(0.,uTexel)).r+texture2D(uPrev,vUv-vec2(0.,uTexel)).r;
        float h=(s*.5-c.g)*uDamp;
        for(int i=0;i<${MAX_DROPS};i++){ if(i>=uCount) break; vec4 d=uDrops[i]; float r=length(vUv-d.xy)/d.z; if(r<1.) h+=d.w*(cos(r*3.14159)+1.)*.5; }
        float e=smoothstep(0.,.05,min(min(vUv.x,vUv.y),min(1.-vUv.x,1.-vUv.y)));
        gl_FragColor=vec4(clamp(h*e,-2.,2.),c.r*e,0.,1.);
      }`,
  });
  const simScene = new THREE.Scene(), simCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  simScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), simMat));
  if (ok) for (const rt of [a, b]) { renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0); renderer.clear(); }
  renderer.setRenderTarget(null);

  const uniforms = {
    uHeight: { value: a.texture }, uSky: { value: skyTex }, uSkyTint: { value: new THREE.Vector3(1,1,1) }, uSun: { value: sunDir }, uTime: { value: 0 },
    uSimCenter: { value: SIM_CENTER }, uSimSize: { value: SIM_SIZE }, uSimOn: { value: ok ? 1 : 0 }, uLand: { value: land.landTex }, uLandB: { value: land.bounds },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: 'varying vec3 vWorld;void main(){vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader: SKY_GLSL + /* glsl */`
      uniform sampler2D uHeight;uniform vec3 uSun;uniform float uTime,uSimSize,uSimOn;uniform vec2 uSimCenter;uniform sampler2D uLand;uniform vec4 uLandB;varying vec3 vWorld;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec3 n=vec3(0.,1.,0.);
        vec2 suv=(vWorld.xz-uSimCenter)/uSimSize+.5;
        if(uSimOn>.5&&suv.x>0.&&suv.y>0.&&suv.x<1.&&suv.y<1.){
          float t=1./${SIM}.;
          float hl=texture2D(uHeight,suv-vec2(t,0.)).r,hr=texture2D(uHeight,suv+vec2(t,0.)).r;
          float hd=texture2D(uHeight,suv-vec2(0.,t)).r,hu=texture2D(uHeight,suv+vec2(0.,t)).r;
          n=vec3((hl-hr)*1.6,1.,(hd-hu)*1.6);
        }
        vec2 p=vWorld.xz;
        n.xz+=.028*vec2(sin(p.x*1.9+uTime*1.3+sin(p.y*1.4+uTime*.4)),cos(p.y*2.3-uTime*1.1+sin(p.x*1.2)))
             +.014*vec2(sin(p.x*5.1-p.y*3.3+uTime*2.7),cos(p.y*4.7+p.x*2.9-uTime*2.3));
        n=normalize(n);
        vec3 V=normalize(vWorld-cameraPosition);
        vec3 R=reflect(V,n);R.y=abs(R.y);
        float fres=.03+.97*pow(1.-max(dot(-V,n),0.),5.);
        vec2 luv=(vWorld.xz-uLandB.xy)/uLandB.zw;
        float L=(luv.x>0.&&luv.y>0.&&luv.x<1.&&luv.y<1.)?texture2D(uLand,luv).r:0.;
        vec3 deep=mix(vec3(.015,.075,.1),vec3(.1,.3,.27),smoothstep(.12,.7,L));
        vec3 col=mix(deep,skyColor(R),clamp(fres*.92+.12,0.,1.));
        float foam=smoothstep(.6,.78,L)*(1.-smoothstep(.86,.97,L))*(.55+.45*sin(uTime*1.7-L*38.+sin(p.x*.7)*2.));
        col+=vec3(1.,.9,.8)*foam*.32;
        float path=pow(max(dot(R,uSun),0.),9.);
        col+=vec3(1.,.62,.3)*pow(max(dot(R,uSun),0.),260.)*2.4;
        // Twinkling four-point glints on the sun path: one candidate per cell, short bright flash.
        vec2 g=p*2.2;vec2 cell=floor(g);float s=hash(cell);vec2 d=fract(g)-.5-(vec2(hash(cell+1.7),hash(cell+3.1))-.5)*.5;
        float tw=pow(max(0.,sin(uTime*(1.1+s*1.7)+s*40.)),10.)*step(.55,s);
        vec2 e=abs(d);float star=(1.-smoothstep(.0,.06,length(d)))+(1.-smoothstep(.0,.015,e.y))*max(0.,1.-e.x*5.)+(1.-smoothstep(.0,.015,e.x))*max(0.,1.-e.y*5.);
        col+=vec3(1.,.9,.7)*star*tw*(path*2.2+.12)*smoothstep(60.,8.,length(vWorld.xz-cameraPosition.xz));
        float dist=length(vWorld-cameraPosition);
        vec3 hz=skyColor(normalize(vec3(V.x,.015,V.z)));
        col=mix(col,hz,smoothstep(35.,160.,dist));
        gl_FragColor=vec4(col,1.);
        #include <colorspace_fragment>
      }`,
  });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), mat);
  water.rotation.x = -Math.PI / 2;

  // Lily pads: notched discs that read the ripple field in the vertex shader.
  const PADS = [[-3.2, 6.5], [-0.6, 4.2], [2.2, 6.8], [-5.4, 2.4], [0.8, 1.2], [-2.6, -1.4], [3.4, 2.6]];
  const padGeo = new THREE.CircleGeometry(0.62, 28, 0.35, Math.PI * 2 - 0.7).rotateX(-Math.PI / 2);
  const padMat = new THREE.ShaderMaterial({
    uniforms: { uHeight: uniforms.uHeight, uSimCenter: uniforms.uSimCenter, uSimSize: uniforms.uSimSize, uSimOn: uniforms.uSimOn, uTime: uniforms.uTime, uSun: uniforms.uSun },
    vertexShader: /* glsl */`
      uniform sampler2D uHeight;uniform vec2 uSimCenter;uniform float uSimSize,uSimOn,uTime;varying vec2 vLocal;varying float vLit;
      void main(){
        vec3 c=(instanceMatrix*vec4(0.,0.,0.,1.)).xyz;
        vec2 suv=(c.xz-uSimCenter)/uSimSize+.5;float t=2./${SIM}.;
        float h=0.,gx=0.,gz=0.;
        if(uSimOn>.5){h=texture2D(uHeight,suv).r;gx=texture2D(uHeight,suv+vec2(t,0.)).r-texture2D(uHeight,suv-vec2(t,0.)).r;gz=texture2D(uHeight,suv+vec2(0.,t)).r-texture2D(uHeight,suv-vec2(0.,t)).r;}
        vec3 w=(instanceMatrix*vec4(position,1.)).xyz;vec3 o=w-c;
        w.y=.02+h*.12+sin(uTime*1.3+c.x)*.015+(o.x*gx+o.z*gz)*.9;
        vLocal=position.xz;vLit=.75+clamp((gx+gz)*4.,-.25,.25);
        gl_Position=projectionMatrix*viewMatrix*vec4(w,1.);
      }`,
    fragmentShader: /* glsl */`
      varying vec2 vLocal;varying float vLit;
      void main(){
        float r=length(vLocal)/.62;float a=atan(vLocal.y,vLocal.x);
        float vein=smoothstep(.06,0.,abs(sin(a*7.))*r)*.18;
        vec3 col=mix(vec3(.16,.42,.2),vec3(.42,.66,.3),.55+.45*sin(r*3.))*vLit+vein;
        col=mix(col,vec3(.1,.26,.14),smoothstep(.86,1.,r));
        gl_FragColor=vec4(col,1.);
        #include <colorspace_fragment>
      }`,
  });
  const pads = new THREE.InstancedMesh(padGeo, padMat, PADS.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), up = new THREE.Vector3(0, 1, 0);
  const padPos = PADS.map(([x, z], i) => {
    const s = 0.8 + ((i * 37) % 10) / 22;
    m.compose(new THREE.Vector3(x, 0, z), q.setFromAxisAngle(up, i * 1.7), new THREE.Vector3(s, 1, s));
    pads.setMatrixAt(i, m);
    return new THREE.Vector3(x, 0, z);
  });
  pads.frustumCulled = false;

  const toUv = (x, z) => [(x - SIM_CENTER.x) / SIM_SIZE + 0.5, (z - SIM_CENTER.y) / SIM_SIZE + 0.5];
  return {
    mesh: water, pads, padPos, ok, uniforms,
    dispose() { a.dispose(); b.dispose(); simScene.children[0].geometry.dispose(); simMat.dispose(); },
    /** Queue a drop: world x/z, radius (m), strength. */
    drop(x, z, radius = 0.3, strength = 0.4) {
      if (!ok) return;
      const [u, v] = toUv(x, z);
      if (u < 0 || v < 0 || u > 1 || v > 1) return;
      if (queue.length >= MAX_DROPS) queue.shift();
      queue.push([u, v, radius / SIM_SIZE, strength]);
    },
    step() {
      if (!ok) return;
      simMat.uniforms.uCount.value = queue.length;
      queue.forEach((d, i) => drops[i].set(...d));
      queue.length = 0;
      simMat.uniforms.uPrev.value = a.texture;
      renderer.setRenderTarget(b); renderer.render(simScene, simCam); renderer.setRenderTarget(null);
      [a, b] = [b, a];
      uniforms.uHeight.value = a.texture;
    },
  };
}
