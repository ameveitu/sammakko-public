/*! Sammakko /saaristo/ experiment (tools/saaristo). Includes three.js 0.187.0 | MIT License | Copyright © 2010-2026 three.js authors | https://github.com/mrdoob/three.js/blob/dev/LICENSE */
/**
* @license
* Copyright 2010-2026 Three.js Authors
* SPDX-License-Identifier: MIT
*/
const e=1e3,t=1001,n=1002,r=1003,i=1006,a=1008,o=1009,s=1012,c=1014,l=1015,u=1016,d=1017,f=1018,p=1020,m=1023,h=1026,g=1027,_=1028,v=1029,y=1030,b=1031,x=1033,S=2300,C=2301,w=2302,T=2303,E=2400,D=2401,O=2402,k=`srgb`,A=`srgb-linear`,ee=`linear`,j=`srgb`,M=7680,N=2e3;function te(e){for(let t=e.length-1;t>=0;--t)if(e[t]>=65535)return!0;return!1}function ne(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function P(e){return document.createElementNS(`http://www.w3.org/1999/xhtml`,e)}function re(){let e=P(`canvas`);return e.style.display=`block`,e}const F={};function ie(...e){let t=`THREE.`+e.shift();console.log(t,...e)}function I(e){let t=e[0];if(typeof t==`string`&&t.startsWith(`TSL:`)){let t=e[1];t&&t.isStackTrace?e[0]+=` `+t.getLocation():e[1]=`Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.`}return e}function L(...e){e=I(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.warn(n.getError(t)):console.warn(t,...e)}}function R(...e){e=I(e);let t=`THREE.`+e.shift();{let n=e[0];n&&n.isStackTrace?console.error(n.getError(t)):console.error(t,...e)}}function z(...e){let t=e.join(` `);t in F||(F[t]=!0,L(...e))}function ae(e,t,n){return new Promise(function(r,i){function a(){switch(e.clientWaitSync(t,e.SYNC_FLUSH_COMMANDS_BIT,0)){case e.WAIT_FAILED:i();break;case e.TIMEOUT_EXPIRED:setTimeout(a,n);break;default:r()}}setTimeout(a,n)})}const oe={0:0,2:6,4:4,3:5,1:1,6:2,7:7,5:3};var se=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n!==void 0&&n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let r=n[e];if(r!==void 0){let e=r.indexOf(t);e!==-1&&r.splice(e,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let t=n.slice(0);for(let n=0,r=t.length;n<r;n++)t[n].call(this,e);e.target=null}}};const ce=/* @__PURE__ */ `00.01.02.03.04.05.06.07.08.09.0a.0b.0c.0d.0e.0f.10.11.12.13.14.15.16.17.18.19.1a.1b.1c.1d.1e.1f.20.21.22.23.24.25.26.27.28.29.2a.2b.2c.2d.2e.2f.30.31.32.33.34.35.36.37.38.39.3a.3b.3c.3d.3e.3f.40.41.42.43.44.45.46.47.48.49.4a.4b.4c.4d.4e.4f.50.51.52.53.54.55.56.57.58.59.5a.5b.5c.5d.5e.5f.60.61.62.63.64.65.66.67.68.69.6a.6b.6c.6d.6e.6f.70.71.72.73.74.75.76.77.78.79.7a.7b.7c.7d.7e.7f.80.81.82.83.84.85.86.87.88.89.8a.8b.8c.8d.8e.8f.90.91.92.93.94.95.96.97.98.99.9a.9b.9c.9d.9e.9f.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9.aa.ab.ac.ad.ae.af.b0.b1.b2.b3.b4.b5.b6.b7.b8.b9.ba.bb.bc.bd.be.bf.c0.c1.c2.c3.c4.c5.c6.c7.c8.c9.ca.cb.cc.cd.ce.cf.d0.d1.d2.d3.d4.d5.d6.d7.d8.d9.da.db.dc.dd.de.df.e0.e1.e2.e3.e4.e5.e6.e7.e8.e9.ea.eb.ec.ed.ee.ef.f0.f1.f2.f3.f4.f5.f6.f7.f8.f9.fa.fb.fc.fd.fe.ff`.split(`.`);let le=1234567;const ue=Math.PI/180,de=180/Math.PI;function fe(){let e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(ce[e&255]+ce[e>>8&255]+ce[e>>16&255]+ce[e>>24&255]+`-`+ce[t&255]+ce[t>>8&255]+`-`+ce[t>>16&15|64]+ce[t>>24&255]+`-`+ce[n&63|128]+ce[n>>8&255]+`-`+ce[n>>16&255]+ce[n>>24&255]+ce[r&255]+ce[r>>8&255]+ce[r>>16&255]+ce[r>>24&255]).toLowerCase()}function B(e,t,n){return Math.max(t,Math.min(n,e))}function pe(e,t){return(e%t+t)%t}function me(e,t,n,r,i){return r+(e-t)*(i-r)/(n-t)}function he(e,t,n){return e===t?0:(n-e)/(t-e)}function ge(e,t,n){return(1-n)*e+n*t}function _e(e,t,n,r){return ge(e,t,1-Math.exp(-n*r))}function ve(e,t=1){return t-Math.abs(pe(e,t*2)-t)}function ye(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*(3-2*e))}function be(e,t,n){return e<=t?0:e>=n?1:(e=(e-t)/(n-t),e*e*e*(e*(e*6-15)+10))}function xe(e,t){return e+Math.floor(Math.random()*(t-e+1))}function Se(e,t){return e+Math.random()*(t-e)}function Ce(e){return e*(.5-Math.random())}function we(e){e!==void 0&&(le=e);let t=le+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Te(e){return e*ue}function Ee(e){return e*de}function De(e){return e>0&&Number.isInteger(e)&&2**Math.round(Math.log2(e))===e}function Oe(e){return 2**Math.ceil(Math.log(e)/Math.LN2)}function ke(e){return 2**Math.floor(Math.log(e)/Math.LN2)}function Ae(e,t,n,r,i){let a=Math.cos,o=Math.sin,s=a(n/2),c=o(n/2),l=a((t+r)/2),u=o((t+r)/2),d=a((t-r)/2),f=o((t-r)/2),p=a((r-t)/2),m=o((r-t)/2);switch(i){case`XYX`:e.set(s*u,c*d,c*f,s*l);break;case`YZY`:e.set(c*f,s*u,c*d,s*l);break;case`ZXZ`:e.set(c*d,c*f,s*u,s*l);break;case`XZX`:e.set(s*u,c*m,c*p,s*l);break;case`YXY`:e.set(c*p,s*u,c*m,s*l);break;case`ZYZ`:e.set(c*m,c*p,s*u,s*l);break;default:L(`MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: `+i)}}function je(e){switch(e.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function Me(e,t){if(t.constructor===Float32Array)return e;let n=je(t);if(n===void 0)throw Error(`THREE.MathUtils: Invalid component type.`);return Math.max(e/n,-1)}function Ne(e,t){if(t.constructor===Float32Array)return e;let n=je(t);if(n===void 0)throw Error(`THREE.MathUtils: Invalid component type.`);return Math.round(e*n)}const Pe={DEG2RAD:ue,RAD2DEG:de,generateUUID:fe,clamp:B,euclideanModulo:pe,mapLinear:me,inverseLerp:he,lerp:ge,damp:_e,pingpong:ve,smoothstep:ye,smootherstep:be,randInt:xe,randFloat:Se,randFloatSpread:Ce,seededRandom:we,degToRad:Te,radToDeg:Ee,isPowerOfTwo:De,ceilPowerOfTwo:Oe,floorPowerOfTwo:ke,setQuaternionFromProperEuler:Ae,normalize:Ne,denormalize:Me};var V=class{static{this.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw Error(`THREE.Vector2: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw Error(`THREE.Vector2: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6],this.y=r[1]*t+r[4]*n+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=B(this.x,e.x,t.x),this.y=B(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=B(this.x,e,t),this.y=B(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(B(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(B(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),r=Math.sin(t),i=this.x-e.x,a=this.y-e.y;return this.x=i*n-a*r+e.x,this.y=i*r+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},H=class{constructor(e=0,t=0,n=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=r}static slerpFlat(e,t,n,r,i,a,o){let s=n[r+0],c=n[r+1],l=n[r+2],u=n[r+3],d=i[a+0],f=i[a+1],p=i[a+2],m=i[a+3];if(u!==m||s!==d||c!==f||l!==p){let e=s*d+c*f+l*p+u*m;e<0&&(d=-d,f=-f,p=-p,m=-m,e=-e);let t=1-o;if(e<.9995){let n=Math.acos(e),r=Math.sin(n);t=Math.sin(t*n)/r,o=Math.sin(o*n)/r,s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o}else{s=s*t+d*o,c=c*t+f*o,l=l*t+p*o,u=u*t+m*o;let e=1/Math.sqrt(s*s+c*c+l*l+u*u);s*=e,c*=e,l*=e,u*=e}}e[t]=s,e[t+1]=c,e[t+2]=l,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,r,i,a){let o=n[r],s=n[r+1],c=n[r+2],l=n[r+3],u=i[a],d=i[a+1],f=i[a+2],p=i[a+3];return e[t]=o*p+l*u+s*f-c*d,e[t+1]=s*p+l*d+c*u-o*f,e[t+2]=c*p+l*f+o*d-s*u,e[t+3]=l*p-o*u-s*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,r){return this._x=e,this._y=t,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,r=e._y,i=e._z,a=e._order,o=Math.cos,s=Math.sin,c=o(n/2),l=o(r/2),u=o(i/2),d=s(n/2),f=s(r/2),p=s(i/2);switch(a){case`XYZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`YXZ`:this._x=d*l*u+c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`ZXY`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u-d*f*p;break;case`ZYX`:this._x=d*l*u-c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u+d*f*p;break;case`YZX`:this._x=d*l*u+c*f*p,this._y=c*f*u+d*l*p,this._z=c*l*p-d*f*u,this._w=c*l*u-d*f*p;break;case`XZY`:this._x=d*l*u-c*f*p,this._y=c*f*u-d*l*p,this._z=c*l*p+d*f*u,this._w=c*l*u+d*f*p;break;default:L(`Quaternion: .setFromEuler() encountered an unknown order: `+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,r=Math.sin(n);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],r=t[4],i=t[8],a=t[1],o=t[5],s=t[9],c=t[2],l=t[6],u=t[10],d=n+o+u;if(d>0){let e=.5/Math.sqrt(d+1);this._w=.25/e,this._x=(l-s)*e,this._y=(i-c)*e,this._z=(a-r)*e}else if(n>o&&n>u){let e=2*Math.sqrt(1+n-o-u);this._w=(l-s)/e,this._x=.25*e,this._y=(r+a)/e,this._z=(i+c)/e}else if(o>u){let e=2*Math.sqrt(1+o-n-u);this._w=(i-c)/e,this._x=(r+a)/e,this._y=.25*e,this._z=(s+l)/e}else{let e=2*Math.sqrt(1+u-n-o);this._w=(a-r)/e,this._x=(i+c)/e,this._y=(s+l)/e,this._z=.25*e}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(B(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let r=Math.min(1,t/n);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x*=e,this._y*=e,this._z*=e,this._w*=e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=t._x,s=t._y,c=t._z,l=t._w;return this._x=n*l+a*o+r*c-i*s,this._y=r*l+a*s+i*o-n*c,this._z=i*l+a*c+n*s-r*o,this._w=a*l-n*o-r*s-i*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,r=e._y,i=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,r=-r,i=-i,a=-a,o=-o);let s=1-t;if(o<.9995){let e=Math.acos(o),c=Math.sin(e);s=Math.sin(s*e)/c,t=Math.sin(t*e)/c,this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this._onChangeCallback()}else this._x=this._x*s+n*t,this._y=this._y*s+r*t,this._z=this._z*s+i*t,this._w=this._w*s+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),i=Math.sqrt(n);return this.set(r*Math.sin(e),r*Math.cos(e),i*Math.sin(t),i*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},U=class{static{this.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw Error(`THREE.Vector3: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw Error(`THREE.Vector3: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Ie.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Ie.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6]*r,this.y=i[1]*t+i[4]*n+i[7]*r,this.z=i[2]*t+i[5]*n+i[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=e.elements,a=1/(i[3]*t+i[7]*n+i[11]*r+i[15]);return this.x=(i[0]*t+i[4]*n+i[8]*r+i[12])*a,this.y=(i[1]*t+i[5]*n+i[9]*r+i[13])*a,this.z=(i[2]*t+i[6]*n+i[10]*r+i[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,r=this.z,i=e.x,a=e.y,o=e.z,s=e.w,c=2*(a*r-o*n),l=2*(o*t-i*r),u=2*(i*n-a*t);return this.x=t+s*c+a*u-o*l,this.y=n+s*l+o*c-i*u,this.z=r+s*u+i*l-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,r=this.z,i=e.elements;return this.x=i[0]*t+i[4]*n+i[8]*r,this.y=i[1]*t+i[5]*n+i[9]*r,this.z=i[2]*t+i[6]*n+i[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=B(this.x,e.x,t.x),this.y=B(this.y,e.y,t.y),this.z=B(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=B(this.x,e,t),this.y=B(this.y,e,t),this.z=B(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(B(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,r=e.y,i=e.z,a=t.x,o=t.y,s=t.z;return this.x=r*s-i*o,this.y=i*a-n*s,this.z=n*o-r*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Fe.copy(this).projectOnVector(e),this.sub(Fe)}reflect(e){return this.sub(Fe.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(B(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,r=this.z-e.z;return t*t+n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let r=Math.sin(t)*e;return this.x=r*Math.sin(n),this.y=Math.cos(t)*e,this.z=r*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};const Fe=/*@__PURE__*/ new U,Ie=/*@__PURE__*/ new H;var W=class{static{this.prototype.isMatrix3=!0}constructor(e,t,n,r,i,a,o,s,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c)}set(e,t,n,r,i,a,o,s,c){let l=this.elements;return l[0]=e,l[1]=r,l[2]=o,l[3]=t,l[4]=i,l[5]=s,l[6]=n,l[7]=a,l[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[3],s=n[6],c=n[1],l=n[4],u=n[7],d=n[2],f=n[5],p=n[8],m=r[0],h=r[3],g=r[6],_=r[1],v=r[4],y=r[7],b=r[2],x=r[5],S=r[8];return i[0]=a*m+o*_+s*b,i[3]=a*h+o*v+s*x,i[6]=a*g+o*y+s*S,i[1]=c*m+l*_+u*b,i[4]=c*h+l*v+u*x,i[7]=c*g+l*y+u*S,i[2]=d*m+f*_+p*b,i[5]=d*h+f*v+p*x,i[8]=d*g+f*y+p*S,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8];return t*a*l-t*o*c-n*i*l+n*o*s+r*i*c-r*a*s}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=l*a-o*c,d=o*s-l*i,f=c*i-a*s,p=t*u+n*d+r*f;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);let m=1/p;return e[0]=u*m,e[1]=(r*c-l*n)*m,e[2]=(o*n-r*a)*m,e[3]=d*m,e[4]=(l*t-r*s)*m,e[5]=(r*i-o*t)*m,e[6]=f*m,e[7]=(n*s-c*t)*m,e[8]=(a*t-n*i)*m,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,r,i,a,o){let s=Math.cos(i),c=Math.sin(i);return this.set(n*s,n*c,-n*(s*a+c*o)+a+e,-r*c,r*s,-r*(-c*a+s*o)+o+t,0,0,1),this}scale(e,t){return z(`Matrix3: .scale() is deprecated. Use .makeScale() instead.`),this.premultiply(G.makeScale(e,t)),this}rotate(e){return z(`Matrix3: .rotate() is deprecated. Use .makeRotation() instead.`),this.premultiply(G.makeRotation(-e)),this}translate(e,t){return z(`Matrix3: .translate() is deprecated. Use .makeTranslation() instead.`),this.premultiply(G.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<9;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};const G=/*@__PURE__*/ new W,Le=/*@__PURE__*/ new W().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),K=/*@__PURE__*/ new W().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function q(){let e={enabled:!0,workingColorSpace:A,spaces:{},convert:function(e,t,n){return this.enabled===!1||t===n||!t||!n||(this.spaces[t].transfer===`srgb`&&(e.r=Re(e.r),e.g=Re(e.g),e.b=Re(e.b)),this.spaces[t].primaries!==this.spaces[n].primaries&&(e.applyMatrix3(this.spaces[t].toXYZ),e.applyMatrix3(this.spaces[n].fromXYZ)),this.spaces[n].transfer===`srgb`&&(e.r=ze(e.r),e.g=ze(e.g),e.b=ze(e.b))),e},workingToColorSpace:function(e,t){return this.convert(e,this.workingColorSpace,t)},colorSpaceToWorking:function(e,t){return this.convert(e,t,this.workingColorSpace)},getPrimaries:function(e){return this.spaces[e].primaries},getTransfer:function(e){return e===``?ee:this.spaces[e].transfer},getToneMappingMode:function(e){return this.spaces[e].outputColorSpaceConfig.toneMappingMode||`standard`},getLuminanceCoefficients:function(e,t=this.workingColorSpace){return e.fromArray(this.spaces[t].luminanceCoefficients)},define:function(e){Object.assign(this.spaces,e)},_getMatrix:function(e,t,n){return e.copy(this.spaces[n].fromXYZ).multiply(this.spaces[t].toXYZ)},_getDrawingBufferColorSpace:function(e){return this.spaces[e].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(e=this.workingColorSpace){return this.spaces[e].workingColorSpaceConfig.unpackColorSpace}},t=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return e.define({[A]:{primaries:t,whitePoint:r,transfer:ee,toXYZ:Le,fromXYZ:K,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:k},outputColorSpaceConfig:{drawingBufferColorSpace:k}},[k]:{primaries:t,whitePoint:r,transfer:j,toXYZ:Le,fromXYZ:K,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:k}}}),e}const J=/*@__PURE__*/ q();function Re(e){return e<.04045?e*.0773993808:(e*.9478672986+.0521327014)**2.4}function ze(e){return e<.0031308?e*12.92:1.055*e**.41666-.055}let Be;var Ve=class{static getDataURL(e,t=`image/png`){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>`u`)return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Be===void 0&&(Be=P(`canvas`)),Be.width=e.width,Be.height=e.height;let t=Be.getContext(`2d`);e instanceof ImageData?t.putImageData(e,0,0):t.drawImage(e,0,0,e.width,e.height),n=Be}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap){let t=P(`canvas`);t.width=e.width,t.height=e.height;let n=t.getContext(`2d`);n.drawImage(e,0,0,e.width,e.height);let r=n.getImageData(0,0,e.width,e.height),i=r.data;for(let e=0;e<i.length;e++)i[e]=Re(i[e]/255)*255;return n.putImageData(r,0,0),t}if(e.data){let t=e.data.slice(0);for(let e=0;e<t.length;e++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[e]=Math.floor(Re(t[e]/255)*255):t[e]=Re(t[e]);return{data:t,width:e.width,height:e.height}}return L(`ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied.`),e}};let He=0;var Ue=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:He++}),this.uuid=fe(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<`u`&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<`u`&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t===null?e.set(0,0,0):e.set(t.width||0,t.height||0,t.depth||0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:``},r=this.data;if(r!==null){let e;if(Array.isArray(r)){e=[];for(let t=0,n=r.length;t<n;t++)r[t].isDataTexture?e.push(We(r[t].image)):e.push(We(r[t]))}else e=We(r);n.url=e}return t||(e.images[this.uuid]=n),n}};function We(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap?Ve.getDataURL(e):e.data?{data:Array.from(e.data),width:e.width,height:e.height,type:e.data.constructor.name}:(L(`Texture: Unable to serialize Texture.`),{})}let Ge=0;const Ke=/*@__PURE__*/ new U;var qe=class r extends se{constructor(e=r.DEFAULT_IMAGE,n=r.DEFAULT_MAPPING,s=t,c=t,l=i,u=a,d=m,f=o,p=r.DEFAULT_ANISOTROPY,h=``){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Ge++}),this.uuid=fe(),this.name=``,this.source=new Ue(e),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=s,this.wrapT=c,this.magFilter=l,this.minFilter=u,this.anisotropy=p,this.format=d,this.internalFormat=null,this.type=f,this.offset=new V(0,0),this.repeat=new V(1,1),this.center=new V(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new W,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Ke).x}get height(){return this.source.getSize(Ke).y}get depth(){return this.source.getSize(Ke).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){L(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?L(`Texture.setValues(): property '${t}' does not exist.`):r&&n&&r.isVector2&&n.isVector2||r&&n&&r.isVector3&&n.isVector3||r&&n&&r.isMatrix3&&n.isMatrix3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:`Texture`,generator:`Texture.toJSON`},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:`dispose`})}transformUv(r){if(this.mapping!==300)return r;if(r.applyMatrix3(this.matrix),r.x<0||r.x>1)switch(this.wrapS){case e:r.x-=Math.floor(r.x);break;case t:r.x=r.x<0?0:1;break;case n:Math.abs(Math.floor(r.x)%2)===1?r.x=Math.ceil(r.x)-r.x:r.x-=Math.floor(r.x)}if(r.y<0||r.y>1)switch(this.wrapT){case e:r.y-=Math.floor(r.y);break;case t:r.y=r.y<0?0:1;break;case n:Math.abs(Math.floor(r.y)%2)===1?r.y=Math.ceil(r.y)-r.y:r.y-=Math.floor(r.y)}return this.flipY&&(r.y=1-r.y),r}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};qe.DEFAULT_IMAGE=null,qe.DEFAULT_MAPPING=300,qe.DEFAULT_ANISOTROPY=1;var Je=class{static{this.prototype.isVector4=!0}constructor(e=0,t=0,n=0,r=1){this.x=e,this.y=t,this.z=n,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,r){return this.x=e,this.y=t,this.z=n,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw Error(`THREE.Vector4: index is out of range: `+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw Error(`THREE.Vector4: index is out of range: `+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w===void 0?1:e.w,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,r=this.z,i=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*r+a[12]*i,this.y=a[1]*t+a[5]*n+a[9]*r+a[13]*i,this.z=a[2]*t+a[6]*n+a[10]*r+a[14]*i,this.w=a[3]*t+a[7]*n+a[11]*r+a[15]*i,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,r,i,a=.01,o=.1,s=e.elements,c=s[0],l=s[4],u=s[8],d=s[1],f=s[5],p=s[9],m=s[2],h=s[6],g=s[10];if(Math.abs(l-d)<a&&Math.abs(u-m)<a&&Math.abs(p-h)<a){if(Math.abs(l+d)<o&&Math.abs(u+m)<o&&Math.abs(p+h)<o&&Math.abs(c+f+g-3)<o)return this.set(1,0,0,0),this;t=Math.PI;let e=(c+1)/2,s=(f+1)/2,_=(g+1)/2,v=(l+d)/4,y=(u+m)/4,b=(p+h)/4;return e>s&&e>_?e<a?(n=0,r=.707106781,i=.707106781):(n=Math.sqrt(e),r=v/n,i=y/n):s>_?s<a?(n=.707106781,r=0,i=.707106781):(r=Math.sqrt(s),n=v/r,i=b/r):_<a?(n=.707106781,r=.707106781,i=0):(i=Math.sqrt(_),n=y/i,r=b/i),this.set(n,r,i,t),this}let _=Math.sqrt((h-p)*(h-p)+(u-m)*(u-m)+(d-l)*(d-l));return Math.abs(_)<.001&&(_=1),this.x=(h-p)/_,this.y=(u-m)/_,this.z=(d-l)/_,this.w=Math.acos((c+f+g-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=B(this.x,e.x,t.x),this.y=B(this.y,e.y,t.y),this.z=B(this.z,e.z,t.z),this.w=B(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=B(this.x,e,t),this.y=B(this.y,e,t),this.z=B(this.z,e,t),this.w=B(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(B(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Ye=class extends se{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:i,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new Je(0,0,e,t),this.scissorTest=!1,this.viewport=new Je(0,0,e,t),this.textures=[];let r=n.count;for(let i=0;i<r;i++)this.textures[i]=new qe({width:e,height:t,depth:n.depth}),this.textures[i].isRenderTargetTexture=!0,this.textures[i].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:i,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let e=0;e<this.textures.length;e++)this.textures[e].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let r=0,i=this.textures.length;r<i;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=n,this.textures[r].isData3DTexture!==!0&&(this.textures[r].isArrayTexture=this.textures[r].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let n=Object.assign({},e.textures[t].image);this.textures[t].source=new Ue(n)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null){if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture}else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:`dispose`})}},Xe=class extends Ye{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Ze=class extends qe{constructor(e=null,n=1,i=1,a=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:n,height:i,depth:a},this.magFilter=r,this.minFilter=r,this.wrapR=t,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=/* @__PURE__ */ new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}},Qe=class extends qe{constructor(e=null,n=1,i=1,a=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:n,height:i,depth:a},this.magFilter=r,this.minFilter=r,this.wrapR=t,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}},Y=class e{static{this.prototype.isMatrix4=!0}constructor(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h)}set(e,t,n,r,i,a,o,s,c,l,u,d,f,p,m,h){let g=this.elements;return g[0]=e,g[4]=t,g[8]=n,g[12]=r,g[1]=i,g[5]=a,g[9]=o,g[13]=s,g[2]=c,g[6]=l,g[10]=u,g[14]=d,g[3]=f,g[7]=p,g[11]=m,g[15]=h,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new e().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,r=1/$e.setFromMatrixColumn(e,0).length(),i=1/$e.setFromMatrixColumn(e,1).length(),a=1/$e.setFromMatrixColumn(e,2).length();return t[0]=n[0]*r,t[1]=n[1]*r,t[2]=n[2]*r,t[3]=0,t[4]=n[4]*i,t[5]=n[5]*i,t[6]=n[6]*i,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,r=e.y,i=e.z,a=Math.cos(n),o=Math.sin(n),s=Math.cos(r),c=Math.sin(r),l=Math.cos(i),u=Math.sin(i);if(e.order===`XYZ`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=-s*u,t[8]=c,t[1]=n+r*c,t[5]=e-i*c,t[9]=-o*s,t[2]=i-e*c,t[6]=r+n*c,t[10]=a*s}else if(e.order===`YXZ`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e+i*o,t[4]=r*o-n,t[8]=a*c,t[1]=a*u,t[5]=a*l,t[9]=-o,t[2]=n*o-r,t[6]=i+e*o,t[10]=a*s}else if(e.order===`ZXY`){let e=s*l,n=s*u,r=c*l,i=c*u;t[0]=e-i*o,t[4]=-a*u,t[8]=r+n*o,t[1]=n+r*o,t[5]=a*l,t[9]=i-e*o,t[2]=-a*c,t[6]=o,t[10]=a*s}else if(e.order===`ZYX`){let e=a*l,n=a*u,r=o*l,i=o*u;t[0]=s*l,t[4]=r*c-n,t[8]=e*c+i,t[1]=s*u,t[5]=i*c+e,t[9]=n*c-r,t[2]=-c,t[6]=o*s,t[10]=a*s}else if(e.order===`YZX`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=i-e*u,t[8]=r*u+n,t[1]=u,t[5]=a*l,t[9]=-o*l,t[2]=-c*l,t[6]=n*u+r,t[10]=e-i*u}else if(e.order===`XZY`){let e=a*s,n=a*c,r=o*s,i=o*c;t[0]=s*l,t[4]=-u,t[8]=c*l,t[1]=e*u+i,t[5]=a*l,t[9]=n*u-r,t[2]=r*u-n,t[6]=o*l,t[10]=i*u+e}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(tt,e,nt)}lookAt(e,t,n){let r=this.elements;return at.subVectors(e,t),at.lengthSq()===0&&(at.z=1),at.normalize(),rt.crossVectors(n,at),rt.lengthSq()===0&&(Math.abs(n.z)===1?at.x+=1e-4:at.z+=1e-4,at.normalize(),rt.crossVectors(n,at)),rt.normalize(),it.crossVectors(at,rt),r[0]=rt.x,r[4]=it.x,r[8]=at.x,r[1]=rt.y,r[5]=it.y,r[9]=at.y,r[2]=rt.z,r[6]=it.z,r[10]=at.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,r=t.elements,i=this.elements,a=n[0],o=n[4],s=n[8],c=n[12],l=n[1],u=n[5],d=n[9],f=n[13],p=n[2],m=n[6],h=n[10],g=n[14],_=n[3],v=n[7],y=n[11],b=n[15],x=r[0],S=r[4],C=r[8],w=r[12],T=r[1],E=r[5],D=r[9],O=r[13],k=r[2],A=r[6],ee=r[10],j=r[14],M=r[3],N=r[7],te=r[11],ne=r[15];return i[0]=a*x+o*T+s*k+c*M,i[4]=a*S+o*E+s*A+c*N,i[8]=a*C+o*D+s*ee+c*te,i[12]=a*w+o*O+s*j+c*ne,i[1]=l*x+u*T+d*k+f*M,i[5]=l*S+u*E+d*A+f*N,i[9]=l*C+u*D+d*ee+f*te,i[13]=l*w+u*O+d*j+f*ne,i[2]=p*x+m*T+h*k+g*M,i[6]=p*S+m*E+h*A+g*N,i[10]=p*C+m*D+h*ee+g*te,i[14]=p*w+m*O+h*j+g*ne,i[3]=_*x+v*T+y*k+b*M,i[7]=_*S+v*E+y*A+b*N,i[11]=_*C+v*D+y*ee+b*te,i[15]=_*w+v*O+y*j+b*ne,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[12],a=e[1],o=e[5],s=e[9],c=e[13],l=e[2],u=e[6],d=e[10],f=e[14],p=e[3],m=e[7],h=e[11],g=e[15],_=s*f-c*d,v=o*f-c*u,y=o*d-s*u,b=a*f-c*l,x=a*d-s*l,S=a*u-o*l;return t*(m*_-h*v+g*y)-n*(p*_-h*b+g*x)+r*(p*v-m*b+g*S)-i*(p*y-m*x+h*S)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],r=e[8],i=e[1],a=e[5],o=e[9],s=e[2],c=e[6],l=e[10];return t*(a*l-o*c)-n*(i*l-o*s)+r*(i*c-a*s)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],r=e[2],i=e[3],a=e[4],o=e[5],s=e[6],c=e[7],l=e[8],u=e[9],d=e[10],f=e[11],p=e[12],m=e[13],h=e[14],g=e[15],_=t*o-n*a,v=t*s-r*a,y=t*c-i*a,b=n*s-r*o,x=n*c-i*o,S=r*c-i*s,C=l*m-u*p,w=l*h-d*p,T=l*g-f*p,E=u*h-d*m,D=u*g-f*m,O=d*g-f*h,k=_*O-v*D+y*E+b*T-x*w+S*C;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/k;return e[0]=(o*O-s*D+c*E)*A,e[1]=(r*D-n*O-i*E)*A,e[2]=(m*S-h*x+g*b)*A,e[3]=(d*x-u*S-f*b)*A,e[4]=(s*T-a*O-c*w)*A,e[5]=(t*O-r*T+i*w)*A,e[6]=(h*y-p*S-g*v)*A,e[7]=(l*S-d*y+f*v)*A,e[8]=(a*D-o*T+c*C)*A,e[9]=(n*T-t*D-i*C)*A,e[10]=(p*x-m*y+g*_)*A,e[11]=(u*y-l*x-f*_)*A,e[12]=(o*w-a*E-s*C)*A,e[13]=(t*E-n*w+r*C)*A,e[14]=(m*v-p*b-h*_)*A,e[15]=(l*b-u*v+d*_)*A,this}scale(e){let t=this.elements,n=e.x,r=e.y,i=e.z;return t[0]*=n,t[4]*=r,t[8]*=i,t[1]*=n,t[5]*=r,t[9]*=i,t[2]*=n,t[6]*=r,t[10]*=i,t[3]*=n,t[7]*=r,t[11]*=i,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,r))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),r=Math.sin(t),i=1-n,a=e.x,o=e.y,s=e.z,c=i*a,l=i*o;return this.set(c*a+n,c*o-r*s,c*s+r*o,0,c*o+r*s,l*o+n,l*s-r*a,0,c*s-r*o,l*s+r*a,i*s*s+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,r,i,a){return this.set(1,n,i,0,e,1,a,0,t,r,1,0,0,0,0,1),this}compose(e,t,n){let r=this.elements,i=t._x,a=t._y,o=t._z,s=t._w,c=i+i,l=a+a,u=o+o,d=i*c,f=i*l,p=i*u,m=a*l,h=a*u,g=o*u,_=s*c,v=s*l,y=s*u,b=n.x,x=n.y,S=n.z;return r[0]=(1-(m+g))*b,r[1]=(f+y)*b,r[2]=(p-v)*b,r[3]=0,r[4]=(f-y)*x,r[5]=(1-(d+g))*x,r[6]=(h+_)*x,r[7]=0,r[8]=(p+v)*S,r[9]=(h-_)*S,r[10]=(1-(d+m))*S,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,n){let r=this.elements;e.x=r[12],e.y=r[13],e.z=r[14];let i=this.determinantAffine();if(i===0)return n.set(1,1,1),t.identity(),this;let a=$e.set(r[0],r[1],r[2]).length(),o=$e.set(r[4],r[5],r[6]).length(),s=$e.set(r[8],r[9],r[10]).length();i<0&&(a=-a),et.copy(this);let c=1/a,l=1/o,u=1/s;return et.elements[0]*=c,et.elements[1]*=c,et.elements[2]*=c,et.elements[4]*=l,et.elements[5]*=l,et.elements[6]*=l,et.elements[8]*=u,et.elements[9]*=u,et.elements[10]*=u,t.setFromRotationMatrix(et),n.x=a,n.y=o,n.z=s,this}makePerspective(e,t,n,r,i,a,o=N,s=!1){let c=this.elements,l=2*i/(t-e),u=2*i/(n-r),d=(t+e)/(t-e),f=(n+r)/(n-r),p,m;if(s)p=i/(a-i),m=a*i/(a-i);else if(o===2e3)p=-(a+i)/(a-i),m=-2*a*i/(a-i);else if(o===2001)p=-a/(a-i),m=-a*i/(a-i);else throw Error(`THREE.Matrix4.makePerspective(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,r,i,a,o=N,s=!1){let c=this.elements,l=2/(t-e),u=2/(n-r),d=-(t+e)/(t-e),f=-(n+r)/(n-r),p,m;if(s)p=1/(a-i),m=a/(a-i);else if(o===2e3)p=-2/(a-i),m=-(a+i)/(a-i);else if(o===2001)p=-1/(a-i),m=-i/(a-i);else throw Error(`THREE.Matrix4.makeOrthographic(): Invalid coordinate system: `+o);return c[0]=l,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=p,c[14]=m,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let e=0;e<16;e++)if(t[e]!==n[e])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};const $e=/*@__PURE__*/ new U,et=/*@__PURE__*/ new Y,tt=/*@__PURE__*/ new U(0,0,0),nt=/*@__PURE__*/ new U(1,1,1),rt=/*@__PURE__*/ new U,it=/*@__PURE__*/ new U,at=/*@__PURE__*/ new U,ot=/*@__PURE__*/ new Y,st=/*@__PURE__*/ new H;var X=class e{constructor(t=0,n=0,r=0,i=e.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=n,this._z=r,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,r=this._order){return this._x=e,this._y=t,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let r=e.elements,i=r[0],a=r[4],o=r[8],s=r[1],c=r[5],l=r[9],u=r[2],d=r[6],f=r[10];switch(t){case`XYZ`:this._y=Math.asin(B(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-l,f),this._z=Math.atan2(-a,i)):(this._x=Math.atan2(d,c),this._z=0);break;case`YXZ`:this._x=Math.asin(-B(l,-1,1)),Math.abs(l)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(s,c)):(this._y=Math.atan2(-u,i),this._z=0);break;case`ZXY`:this._x=Math.asin(B(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(s,i));break;case`ZYX`:this._y=Math.asin(-B(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(s,i)):(this._x=0,this._z=Math.atan2(-a,c));break;case`YZX`:this._z=Math.asin(B(s,-1,1)),Math.abs(s)<.9999999?(this._x=Math.atan2(-l,c),this._y=Math.atan2(-u,i)):(this._x=0,this._y=Math.atan2(o,f));break;case`XZY`:this._z=Math.asin(-B(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,i)):(this._x=Math.atan2(-l,f),this._y=0);break;default:L(`Euler: .setFromRotationMatrix() encountered an unknown order: `+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return ot.makeRotationFromQuaternion(e),this.setFromRotationMatrix(ot,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return st.setFromEuler(this),this.setFromQuaternion(st,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};X.DEFAULT_ORDER=`XYZ`;var ct=class{constructor(){this.mask=1}set(e){this.mask=1<<e>>>0}enable(e){this.mask|=1<<e}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e}disable(e){this.mask&=~(1<<e)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return!!(this.mask&1<<e)}};let lt=0;const ut=/*@__PURE__*/ new U,dt=/*@__PURE__*/ new H,ft=/*@__PURE__*/ new Y,pt=/*@__PURE__*/ new U,mt=/*@__PURE__*/ new U,ht=/*@__PURE__*/ new U,gt=/*@__PURE__*/ new H,_t=/*@__PURE__*/ new U(1,0,0),vt=/*@__PURE__*/ new U(0,1,0),yt=/*@__PURE__*/ new U(0,0,1),bt={type:`added`},xt={type:`removed`},St={type:`childadded`,child:null},Ct={type:`childremoved`,child:null};var wt=class e extends se{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:lt++}),this.uuid=fe(),this.name=``,this.type=`Object3D`,this.parent=null,this.children=[],this.up=e.DEFAULT_UP.clone();let t=new U,n=new X,r=new H,i=new U(1,1,1);function a(){r.setFromEuler(n,!1)}function o(){n.setFromQuaternion(r,void 0,!1)}n._onChange(a),r._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Y},normalMatrix:{value:new W}}),this.matrix=new Y,this.matrixWorld=new Y,this.matrixAutoUpdate=e.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ct,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return dt.setFromAxisAngle(e,t),this.quaternion.multiply(dt),this}rotateOnWorldAxis(e,t){return dt.setFromAxisAngle(e,t),this.quaternion.premultiply(dt),this}rotateX(e){return this.rotateOnAxis(_t,e)}rotateY(e){return this.rotateOnAxis(vt,e)}rotateZ(e){return this.rotateOnAxis(yt,e)}translateOnAxis(e,t){return ut.copy(e).applyQuaternion(this.quaternion),this.position.add(ut.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(_t,e)}translateY(e){return this.translateOnAxis(vt,e)}translateZ(e){return this.translateOnAxis(yt,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ft.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?pt.copy(e):pt.set(e,t,n);let r=this.parent;this.updateWorldMatrix(!0,!1),mt.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ft.lookAt(mt,pt,this.up):ft.lookAt(pt,mt,this.up),this.quaternion.setFromRotationMatrix(ft),r&&(ft.extractRotation(r.matrixWorld),dt.setFromRotationMatrix(ft),this.quaternion.premultiply(dt.invert()))}add(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return e===this?(R(`Object3D.add: object can't be added as a child of itself.`,e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(bt),St.child=e,this.dispatchEvent(St),St.child=null):R(`Object3D.add: object not an instance of THREE.Object3D.`,e),this)}remove(e){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.remove(arguments[e]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(xt),Ct.child=e,this.dispatchEvent(Ct),Ct.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ft.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ft.multiply(e.parent.matrixWorld)),e.applyMatrix4(ft),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(bt),St.child=e,this.dispatchEvent(St),St.child=null,this}getObjectById(e){return this.getObjectByProperty(`id`,e)}getObjectByName(e){return this.getObjectByProperty(`name`,e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,r=this.children.length;n<r;n++){let r=this.children[n].getObjectByProperty(e,t);if(r!==void 0)return r}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let r=this.children;for(let i=0,a=r.length;i<a;i++)r[i].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(mt,e,ht),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(mt,gt,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,r=e.z,i=this.matrix.elements;i[12]+=t-i[0]*t-i[4]*n-i[8]*r,i[13]+=n-i[1]*t-i[5]*n-i[9]*r,i[14]+=r-i[2]*t-i[6]*n-i[10]*r}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,r=t.length;n<r;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let e=this.children;for(let t=0,r=e.length;t<r;t++)e[t].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e==`string`,n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:`Object`,generator:`Object3D.toJSON`});let r={};r.uuid=this.uuid,r.type=this.type,r.name=this.name,r.castShadow=this.castShadow,r.receiveShadow=this.receiveShadow,r.visible=this.visible,r.frustumCulled=this.frustumCulled,r.renderOrder=this.renderOrder,r.static=this.static,r.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.pivot!==null&&(r.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(r.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(r.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(r.type=`InstancedMesh`,r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type=`BatchedMesh`,r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.geometryInfo=this._geometryInfo.map(e=>({...e,boundingBox:e.boundingBox?e.boundingBox.toJSON():void 0,boundingSphere:e.boundingSphere?e.boundingSphere.toJSON():void 0})),r.instanceInfo=this._instanceInfo.map(e=>({...e})),r.availableInstanceIds=this._availableInstanceIds.slice(),r.availableGeometryIds=this._availableGeometryIds.slice(),r.nextIndexStart=this._nextIndexStart,r.nextVertexStart=this._nextVertexStart,r.geometryCount=this._geometryCount,r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.matricesTexture=this._matricesTexture.toJSON(e),r.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(r.boundingBox=this.boundingBox.toJSON()));function i(t,n){return t[n.uuid]===void 0&&(t[n.uuid]=n.toJSON(e)),n.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=i(e.geometries,this.geometry);let t=this.geometry.parameters;if(t!==void 0&&t.shapes!==void 0){let n=t.shapes;if(Array.isArray(n))for(let t=0,r=n.length;t<r;t++){let r=n[t];i(e.shapes,r)}else i(e.shapes,n)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(i(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0){if(Array.isArray(this.material)){let t=[];for(let n=0,r=this.material.length;n<r;n++)t.push(i(e.materials,this.material[n]));r.material=t}else r.material=i(e.materials,this.material)}if(this.children.length>0){r.children=[];for(let t=0;t<this.children.length;t++)r.children.push(this.children[t].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let t=0;t<this.animations.length;t++){let n=this.animations[t];r.animations.push(i(e.animations,n))}}if(t){let t=a(e.geometries),r=a(e.materials),i=a(e.textures),o=a(e.images),s=a(e.shapes),c=a(e.skeletons),l=a(e.animations),u=a(e.nodes);t.length>0&&(n.geometries=t),r.length>0&&(n.materials=r),i.length>0&&(n.textures=i),o.length>0&&(n.images=o),s.length>0&&(n.shapes=s),c.length>0&&(n.skeletons=c),l.length>0&&(n.animations=l),u.length>0&&(n.nodes=u)}return n.object=r,n;function a(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot===null?null:e.pivot.clone(),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let t=0;t<e.children.length;t++){let n=e.children[t];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:`dispose`})}};wt.DEFAULT_UP=/*@__PURE__*/ new U(0,1,0),wt.DEFAULT_MATRIX_AUTO_UPDATE=!0,wt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Tt=class extends wt{constructor(){super(),this.isGroup=!0,this.type=`Group`}};const Et={type:`move`};var Dt=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Tt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Tt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new U,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new U),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Tt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new U,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new U,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:`connected`,data:e}),this}disconnect(e){return this.dispatchEvent({type:`disconnected`,data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let r=null,i=null,a=null,o=this._targetRay,s=this._grip,c=this._hand;if(e&&t.session.visibilityState!==`visible-blurred`){if(c&&e.hand){a=!0;for(let r of e.hand.values()){let e=t.getJointPose(r,n),i=this._getHandJoint(c,r);e!==null&&(i.matrix.fromArray(e.transform.matrix),i.matrix.decompose(i.position,i.quaternion,i.scale),i.matrixWorldNeedsUpdate=!0,i.jointRadius=e.radius),i.visible=e!==null}let r=c.joints[`index-finger-tip`],i=c.joints[`thumb-tip`],o=r.position.distanceTo(i.position);c.inputState.pinching&&o>.025?(c.inputState.pinching=!1,this.dispatchEvent({type:`pinchend`,handedness:e.handedness,target:this})):!c.inputState.pinching&&o<=.015&&(c.inputState.pinching=!0,this.dispatchEvent({type:`pinchstart`,handedness:e.handedness,target:this}))}else s!==null&&e.gripSpace&&(i=t.getPose(e.gripSpace,n),i!==null&&(s.matrix.fromArray(i.transform.matrix),s.matrix.decompose(s.position,s.quaternion,s.scale),s.matrixWorldNeedsUpdate=!0,i.linearVelocity?(s.hasLinearVelocity=!0,s.linearVelocity.copy(i.linearVelocity)):s.hasLinearVelocity=!1,i.angularVelocity?(s.hasAngularVelocity=!0,s.angularVelocity.copy(i.angularVelocity)):s.hasAngularVelocity=!1,s.eventsEnabled&&s.dispatchEvent({type:`gripUpdated`,data:e,target:this})));o!==null&&(r=t.getPose(e.targetRaySpace,n),r===null&&i!==null&&(r=i),r!==null&&(o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,r.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(r.linearVelocity)):o.hasLinearVelocity=!1,r.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(r.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Et)))}return o!==null&&(o.visible=r!==null),s!==null&&(s.visible=i!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Tt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}};const Ot={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},kt={h:0,s:0,l:0},At={h:0,s:0,l:0};function jt(e,t,n){return n<0&&(n+=1),n>1&&--n,n<1/6?e+(t-e)*6*n:n<1/2?t:n<2/3?e+(t-e)*6*(2/3-n):e}var Z=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let t=e;t&&t.isColor?this.copy(t):typeof t==`number`?this.setHex(t):typeof t==`string`&&this.setStyle(t)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=k){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,J.colorSpaceToWorking(this,t),this}setRGB(e,t,n,r=J.workingColorSpace){return this.r=e,this.g=t,this.b=n,J.colorSpaceToWorking(this,r),this}setHSL(e,t,n,r=J.workingColorSpace){if(e=pe(e,1),t=B(t,0,1),n=B(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,i=2*n-r;this.r=jt(i,r,e+1/3),this.g=jt(i,r,e),this.b=jt(i,r,e-1/3)}return J.colorSpaceToWorking(this,r),this}setStyle(e,t=k){function n(t){t!==void 0&&parseFloat(t)<1&&L(`Color: Alpha component of `+e+` will be ignored.`)}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let i,a=r[1],o=r[2];switch(a){case`rgb`:case`rgba`:if(i=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(255,parseInt(i[1],10))/255,Math.min(255,parseInt(i[2],10))/255,Math.min(255,parseInt(i[3],10))/255,t);if(i=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setRGB(Math.min(100,parseFloat(i[1]))/100,Math.min(100,parseFloat(i[2]))/100,Math.min(100,parseFloat(i[3]))/100,t);break;case`hsl`:case`hsla`:if(i=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return n(i[4]),this.setHSL(parseFloat(i[1])/360,parseFloat(i[2])/100,parseFloat(i[3])/100,t);break;default:L(`Color: Unknown color model `+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){let n=r[1],i=n.length;if(i===3)return this.setRGB(parseInt(n.charAt(0),16)/15,parseInt(n.charAt(1),16)/15,parseInt(n.charAt(2),16)/15,t);if(i===6)return this.setHex(parseInt(n,16),t);L(`Color: Invalid hex color `+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=k){let n=Ot[e.toLowerCase()];return n===void 0?L(`Color: Unknown color `+e):this.setHex(n,t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Re(e.r),this.g=Re(e.g),this.b=Re(e.b),this}copyLinearToSRGB(e){return this.r=ze(e.r),this.g=ze(e.g),this.b=ze(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=k){return J.workingToColorSpace(Mt.copy(this),e),Math.round(B(Mt.r*255,0,255))*65536+Math.round(B(Mt.g*255,0,255))*256+Math.round(B(Mt.b*255,0,255))}getHexString(e=k){return(`000000`+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=J.workingColorSpace){J.workingToColorSpace(Mt.copy(this),t);let n=Mt.r,r=Mt.g,i=Mt.b,a=Math.max(n,r,i),o=Math.min(n,r,i),s,c,l=(o+a)/2;if(o===a)s=0,c=0;else{let e=a-o;switch(c=l<=.5?e/(a+o):e/(2-a-o),a){case n:s=(r-i)/e+(r<i?6:0);break;case r:s=(i-n)/e+2;break;case i:s=(n-r)/e+4}s/=6}return e.h=s,e.s=c,e.l=l,e}getRGB(e,t=J.workingColorSpace){return J.workingToColorSpace(Mt.copy(this),t),e.r=Mt.r,e.g=Mt.g,e.b=Mt.b,e}getStyle(e=k){J.workingToColorSpace(Mt.copy(this),e);let t=Mt.r,n=Mt.g,r=Mt.b;return e===`srgb`?`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(r*255)})`:`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`}offsetHSL(e,t,n){return this.getHSL(kt),this.setHSL(kt.h+e,kt.s+t,kt.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(kt),e.getHSL(At);let n=ge(kt.h,At.h,t),r=ge(kt.s,At.s,t),i=ge(kt.l,At.l,t);return this.setHSL(n,r,i),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,r=this.b,i=e.elements;return this.r=i[0]*t+i[3]*n+i[6]*r,this.g=i[1]*t+i[4]*n+i[7]*r,this.b=i[2]*t+i[5]*n+i[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}};const Mt=/*@__PURE__*/ new Z;Z.NAMES=Ot;var Nt=class extends wt{constructor(){super(),this.isScene=!0,this.type=`Scene`,this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new X,this.environmentIntensity=1,this.environmentRotation=new X,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background===null?null:e.background.clone(),this.environment=e.environment===null?null:e.environment.clone(),this.fog=e.fog===null?null:e.fog.clone(),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial===null?null:e.overrideMaterial.clone(),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}};const Pt=/*@__PURE__*/ new U,Ft=/*@__PURE__*/ new U,It=/*@__PURE__*/ new U,Lt=/*@__PURE__*/ new U,Rt=/*@__PURE__*/ new U,zt=/*@__PURE__*/ new U,Bt=/*@__PURE__*/ new U,Vt=/*@__PURE__*/ new U,Ht=/*@__PURE__*/ new U,Ut=/*@__PURE__*/ new U,Wt=/*@__PURE__*/ new Je,Gt=/*@__PURE__*/ new Je,Kt=/*@__PURE__*/ new Je;var qt=class e{constructor(e=new U,t=new U,n=new U){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,r){r.subVectors(n,t),Pt.subVectors(e,t),r.cross(Pt);let i=r.lengthSq();return i>0?r.multiplyScalar(1/Math.sqrt(i)):r.set(0,0,0)}static getBarycoord(e,t,n,r,i){Pt.subVectors(r,t),Ft.subVectors(n,t),It.subVectors(e,t);let a=Pt.dot(Pt),o=Pt.dot(Ft),s=Pt.dot(It),c=Ft.dot(Ft),l=Ft.dot(It),u=a*c-o*o;if(u===0)return i.set(0,0,0),null;let d=1/u,f=(c*s-o*l)*d,p=(a*l-o*s)*d;return i.set(1-f-p,p,f)}static containsPoint(e,t,n,r){return this.getBarycoord(e,t,n,r,Lt)!==null&&Lt.x>=0&&Lt.y>=0&&Lt.x+Lt.y<=1}static getInterpolation(e,t,n,r,i,a,o,s){return this.getBarycoord(e,t,n,r,Lt)===null?(s.x=0,s.y=0,`z`in s&&(s.z=0),`w`in s&&(s.w=0),null):(s.setScalar(0),s.addScaledVector(i,Lt.x),s.addScaledVector(a,Lt.y),s.addScaledVector(o,Lt.z),s)}static getInterpolatedAttribute(e,t,n,r,i,a){return Wt.setScalar(0),Gt.setScalar(0),Kt.setScalar(0),Wt.fromBufferAttribute(e,t),Gt.fromBufferAttribute(e,n),Kt.fromBufferAttribute(e,r),a.setScalar(0),a.addScaledVector(Wt,i.x),a.addScaledVector(Gt,i.y),a.addScaledVector(Kt,i.z),a}static isFrontFacing(e,t,n,r){return Pt.subVectors(n,t),Ft.subVectors(e,t),Pt.cross(Ft).dot(r)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,r){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,n,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Pt.subVectors(this.c,this.b),Ft.subVectors(this.a,this.b),Pt.cross(Ft).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return e.getNormal(this.a,this.b,this.c,t)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,n){return e.getBarycoord(t,this.a,this.b,this.c,n)}getInterpolation(t,n,r,i,a){return e.getInterpolation(t,this.a,this.b,this.c,n,r,i,a)}containsPoint(t){return e.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return e.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,r=this.b,i=this.c,a,o;Rt.subVectors(r,n),zt.subVectors(i,n),Vt.subVectors(e,n);let s=Rt.dot(Vt),c=zt.dot(Vt);if(s<=0&&c<=0)return t.copy(n);Ht.subVectors(e,r);let l=Rt.dot(Ht),u=zt.dot(Ht);if(l>=0&&u<=l)return t.copy(r);let d=s*u-l*c;if(d<=0&&s>=0&&l<=0&&s-l>0)return a=s/(s-l),t.copy(n).addScaledVector(Rt,a);Ut.subVectors(e,i);let f=Rt.dot(Ut),p=zt.dot(Ut);if(p>=0&&f<=p)return t.copy(i);let m=f*c-s*p;if(m<=0&&c>=0&&p<=0)return o=c/(c-p),t.copy(n).addScaledVector(zt,o);let h=l*p-f*u;if(h<=0&&u-l>=0&&f-p>=0)return Bt.subVectors(i,r),o=(u-l)/(u-l+(f-p)),t.copy(r).addScaledVector(Bt,o);let g=1/(h+m+d);return a=m*g,o=d*g,t.copy(n).addScaledVector(Rt,a).addScaledVector(zt,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Jt=class{constructor(e=new U(1/0,1/0,1/0),t=new U(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Xt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Xt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Xt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute(`position`);if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let t=0,n=r.count;t<n;t++)e.isMesh===!0?e.getVertexPosition(t,Xt):Xt.fromBufferAttribute(r,t),Xt.applyMatrix4(e.matrixWorld),this.expandByPoint(Xt);else e.boundingBox===void 0?(n.boundingBox===null&&n.computeBoundingBox(),Zt.copy(n.boundingBox)):(e.boundingBox===null&&e.computeBoundingBox(),Zt.copy(e.boundingBox)),Zt.applyMatrix4(e.matrixWorld),this.union(Zt)}let r=e.children;for(let e=0,n=r.length;e<n;e++)this.expandByObject(r[e],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Xt),Xt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(an),on.subVectors(this.max,an),Qt.subVectors(e.a,an),$t.subVectors(e.b,an),en.subVectors(e.c,an),tn.subVectors($t,Qt),nn.subVectors(en,$t),rn.subVectors(Qt,en);let t=[0,-tn.z,tn.y,0,-nn.z,nn.y,0,-rn.z,rn.y,tn.z,0,-tn.x,nn.z,0,-nn.x,rn.z,0,-rn.x,-tn.y,tn.x,0,-nn.y,nn.x,0,-rn.y,rn.x,0];return!ln(t,Qt,$t,en,on)||(t=[1,0,0,0,1,0,0,0,1],!ln(t,Qt,$t,en,on))?!1:(sn.crossVectors(tn,nn),t=[sn.x,sn.y,sn.z],ln(t,Qt,$t,en,on))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Xt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Xt).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()||(Yt[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Yt[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Yt[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Yt[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Yt[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Yt[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Yt[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Yt[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Yt)),this}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}};const Yt=[/*@__PURE__*/ new U,/*@__PURE__*/ new U,/*@__PURE__*/ new U,/*@__PURE__*/ new U,/*@__PURE__*/ new U,/*@__PURE__*/ new U,/*@__PURE__*/ new U,/*@__PURE__*/ new U],Xt=/*@__PURE__*/ new U,Zt=/*@__PURE__*/ new Jt,Qt=/*@__PURE__*/ new U,$t=/*@__PURE__*/ new U,en=/*@__PURE__*/ new U,tn=/*@__PURE__*/ new U,nn=/*@__PURE__*/ new U,rn=/*@__PURE__*/ new U,an=/*@__PURE__*/ new U,on=/*@__PURE__*/ new U,sn=/*@__PURE__*/ new U,cn=/*@__PURE__*/ new U;function ln(e,t,n,r,i){for(let a=0,o=e.length-3;a<=o;a+=3){cn.fromArray(e,a);let o=i.x*Math.abs(cn.x)+i.y*Math.abs(cn.y)+i.z*Math.abs(cn.z),s=t.dot(cn),c=n.dot(cn),l=r.dot(cn);if(Math.max(-Math.max(s,c,l),Math.min(s,c,l))>o)return!1}return!0}const un=/*@__PURE__*/ new U,dn=/*@__PURE__*/ new V;let fn=0;var pn=class extends se{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw TypeError(`THREE.BufferAttribute: array should be a Typed Array.`);this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:fn++}),this.name=``,this.array=e,this.itemSize=t,this.count=e===void 0?0:e.length/t,this.normalized=n,this.usage=35044,this.updateRanges=[],this.gpuType=l,this.version=0,this._normalizationScale=e===void 0?void 0:je(e)}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let r=0,i=this.itemSize;r<i;r++)this.array[e+r]=t.array[n+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)dn.fromBufferAttribute(this,t),dn.applyMatrix3(e),this.setXY(t,dn.x,dn.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)un.fromBufferAttribute(this,t),un.applyMatrix3(e),this.setXYZ(t,un.x,un.y,un.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)un.fromBufferAttribute(this,t),un.applyMatrix4(e),this.setXYZ(t,un.x,un.y,un.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)un.fromBufferAttribute(this,t),un.applyNormalMatrix(e),this.setXYZ(t,un.x,un.y,un.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)un.fromBufferAttribute(this,t),un.transformDirection(e),this.setXYZ(t,un.x,un.y,un.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this}setXYZW(e,t,n,r,i){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),r=this._normalize(r),i=this._normalize(i)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=r,this.array[e+3]=i,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:`dispose`})}_denormalize(e){let t=this._normalizationScale;return t===void 0?Me(e,this.array):Math.max(e/t,-1)}_normalize(e){let t=this._normalizationScale;return t===void 0?Ne(e,this.array):Math.round(e*t)}},mn=class extends pn{constructor(e,t,n){super(new Uint16Array(e),t,n)}},hn=class extends pn{constructor(e,t,n){super(new Uint32Array(e),t,n)}},gn=class extends pn{constructor(e,t,n){super(new Float32Array(e),t,n)}};const _n=/*@__PURE__*/ new Jt,vn=/*@__PURE__*/ new U,yn=/*@__PURE__*/ new U;var bn=class{constructor(e=new U,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t===void 0?_n.setFromPoints(e).getCenter(n):n.copy(t);let r=0;for(let t=0,i=e.length;t<i;t++)r=Math.max(r,n.distanceToSquared(e[t]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius*=e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;vn.subVectors(e,this.center);let t=vn.lengthSq();if(t>this.radius*this.radius){let e=Math.sqrt(t),n=(e-this.radius)*.5;this.center.addScaledVector(vn,n/e),this.radius+=n}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(yn.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(vn.copy(e.center).add(yn)),this.expandByPoint(vn.copy(e.center).sub(yn))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}};let xn=0;const Sn=/*@__PURE__*/ new Y,Cn=/*@__PURE__*/ new wt,wn=/*@__PURE__*/ new U,Tn=/*@__PURE__*/ new Jt,En=/*@__PURE__*/ new Jt,Dn=/*@__PURE__*/ new U;var On=class e extends se{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:xn++}),this.uuid=fe(),this.name=``,this.type=`BufferGeometry`,this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return this.index=Array.isArray(e)?new(te(e)?hn:mn)(e,1):e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let t=new W().getNormalMatrix(e);n.applyNormalMatrix(t),n.needsUpdate=!0}let r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Sn.makeRotationFromQuaternion(e),this.applyMatrix4(Sn),this}rotateX(e){return Sn.makeRotationX(e),this.applyMatrix4(Sn),this}rotateY(e){return Sn.makeRotationY(e),this.applyMatrix4(Sn),this}rotateZ(e){return Sn.makeRotationZ(e),this.applyMatrix4(Sn),this}translate(e,t,n){return Sn.makeTranslation(e,t,n),this.applyMatrix4(Sn),this}scale(e,t,n){return Sn.makeScale(e,t,n),this.applyMatrix4(Sn),this}lookAt(e){return Cn.lookAt(e),Cn.updateMatrix(),this.applyMatrix4(Cn.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(wn).negate(),this.translate(wn.x,wn.y,wn.z),this}setFromPoints(e){let t=this.getAttribute(`position`);if(t===void 0){let t=[];for(let n=0,r=e.length;n<r;n++){let r=e[n];t.push(r.x,r.y,r.z||0)}this.setAttribute(`position`,new gn(t,3))}else{let n=Math.min(e.length,t.count);for(let r=0;r<n;r++){let n=e[r];t.setXYZ(r,n.x,n.y,n.z||0)}e.length>t.count&&L(`BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry.`),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Jt);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)R(`BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.`,this),this.boundingBox.set(new U(-1/0,-1/0,-1/0),new U(1/0,1/0,1/0));else{if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];Tn.setFromBufferAttribute(n),this.morphTargetsRelative?(Dn.addVectors(this.boundingBox.min,Tn.min),this.boundingBox.expandByPoint(Dn),Dn.addVectors(this.boundingBox.max,Tn.max),this.boundingBox.expandByPoint(Dn)):(this.boundingBox.expandByPoint(Tn.min),this.boundingBox.expandByPoint(Tn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&R(`BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.`,this)}}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new bn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute)R(`BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.`,this),this.boundingSphere.set(new U,1/0);else if(e){let n=this.boundingSphere.center;if(Tn.setFromBufferAttribute(e),t)for(let e=0,n=t.length;e<n;e++){let n=t[e];En.setFromBufferAttribute(n),this.morphTargetsRelative?(Dn.addVectors(Tn.min,En.min),Tn.expandByPoint(Dn),Dn.addVectors(Tn.max,En.max),Tn.expandByPoint(Dn)):(Tn.expandByPoint(En.min),Tn.expandByPoint(En.max))}Tn.getCenter(n);let r=0;for(let t=0,i=e.count;t<i;t++)Dn.fromBufferAttribute(e,t),r=Math.max(r,n.distanceToSquared(Dn));if(t)for(let i=0,a=t.length;i<a;i++){let a=t[i],o=this.morphTargetsRelative;for(let t=0,i=a.count;t<i;t++)Dn.fromBufferAttribute(a,t),o&&(wn.fromBufferAttribute(e,t),Dn.add(wn)),r=Math.max(r,n.distanceToSquared(Dn))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&R(`BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.`,this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){R(`BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)`);return}let n=t.position,r=t.normal,i=t.uv,a=this.getAttribute(`tangent`);(a===void 0||a.count!==n.count)&&(a=new pn(new Float32Array(4*n.count),4),this.setAttribute(`tangent`,a));let o=[],s=[],c=new Uint8Array(n.count);for(let e=0;e<n.count;e++)o[e]=new U,s[e]=new U;let l=new U,u=new U,d=new U,f=new V,p=new V,m=new V,h=new U,g=new U;function _(e,t,r){c[e]=c[t]=c[r]=1,l.fromBufferAttribute(n,e),u.fromBufferAttribute(n,t),d.fromBufferAttribute(n,r),f.fromBufferAttribute(i,e),p.fromBufferAttribute(i,t),m.fromBufferAttribute(i,r),u.sub(l),d.sub(l),p.sub(f),m.sub(f);let a=1/(p.x*m.y-m.x*p.y);isFinite(a)&&(h.copy(u).multiplyScalar(m.y).addScaledVector(d,-p.y).multiplyScalar(a),g.copy(d).multiplyScalar(p.x).addScaledVector(u,-m.x).multiplyScalar(a),o[e].add(h),o[t].add(h),o[r].add(h),s[e].add(g),s[t].add(g),s[r].add(g))}let v=this.groups;v.length===0&&(v=[{start:0,count:e.count}]);for(let t=0,n=v.length;t<n;++t){let n=v[t],r=n.start,i=n.count;for(let t=r,n=r+i;t<n;t+=3)_(e.getX(t+0),e.getX(t+1),e.getX(t+2))}let y=new U,b=new U,x=new U,S=new U;function C(e){x.fromBufferAttribute(r,e),S.copy(x);let t=o[e];y.copy(t),y.sub(x.multiplyScalar(x.dot(t))).normalize(),b.crossVectors(S,t);let n=b.dot(s[e])<0?-1:1;a.setXYZW(e,y.x,y.y,y.z,n)}for(let e=0,t=n.count;e<t;++e)c[e]&&C(e);this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute(`position`);if(t!==void 0){let n=this.getAttribute(`normal`);if(n===void 0||n.count!==t.count)n=new pn(new Float32Array(t.count*3),3),this.setAttribute(`normal`,n);else for(let e=0,t=n.count;e<t;e++)n.setXYZ(e,0,0,0);let r=new U,i=new U,a=new U,o=new U,s=new U,c=new U,l=new U,u=new U;if(e)for(let d=0,f=e.count;d<f;d+=3){let f=e.getX(d+0),p=e.getX(d+1),m=e.getX(d+2);r.fromBufferAttribute(t,f),i.fromBufferAttribute(t,p),a.fromBufferAttribute(t,m),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),o.fromBufferAttribute(n,f),s.fromBufferAttribute(n,p),c.fromBufferAttribute(n,m),o.add(l),s.add(l),c.add(l),n.setXYZ(f,o.x,o.y,o.z),n.setXYZ(p,s.x,s.y,s.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let e=0,o=t.count;e<o;e+=3)r.fromBufferAttribute(t,e+0),i.fromBufferAttribute(t,e+1),a.fromBufferAttribute(t,e+2),l.subVectors(a,i),u.subVectors(r,i),l.cross(u),n.setXYZ(e+0,l.x,l.y,l.z),n.setXYZ(e+1,l.x,l.y,l.z),n.setXYZ(e+2,l.x,l.y,l.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Dn.fromBufferAttribute(e,t),Dn.normalize(),e.setXYZ(t,Dn.x,Dn.y,Dn.z)}toNonIndexed(){function t(e,t){let n=e.array,r=e.itemSize,i=e.normalized,a=new n.constructor(t.length*r),o=0,s=0;for(let i=0,c=t.length;i<c;i++){o=e.isInterleavedBufferAttribute?t[i]*e.data.stride+e.offset:t[i]*r;for(let e=0;e<r;e++)a[s++]=n[o++]}return new pn(a,r,i)}if(this.index===null)return L(`BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed.`),this;let n=new e,r=this.index.array,i=this.attributes;for(let e in i){let a=i[e],o=t(a,r);n.setAttribute(e,o)}let a=this.morphAttributes;for(let e in a){let i=[],o=a[e];for(let e=0,n=o.length;e<n;e++){let n=o[e],a=t(n,r);i.push(a)}n.morphAttributes[e]=i}n.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let e=0,t=o.length;e<t;e++){let t=o[e];n.addGroup(t.start,t.count,t.materialIndex)}return n}toJSON(){let e={metadata:{version:4.7,type:`BufferGeometry`,generator:`BufferGeometry.toJSON`}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?`BufferGeometry`:this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let t=this.parameters;for(let n in t)t[n]!==void 0&&(e[n]=t[n]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let t in n){let r=n[t];e.data.attributes[t]=r.toJSON(e.data)}let r={},i=!1;for(let t in this.morphAttributes){let n=this.morphAttributes[t],a=[];for(let t=0,r=n.length;t<r;t++){let r=n[t];a.push(r.toJSON(e.data))}a.length>0&&(r[t]=a,i=!0)}i&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let r=e.attributes;for(let e in r){let n=r[e];this.setAttribute(e,n.clone(t))}let i=e.morphAttributes;for(let e in i){let n=[],r=i[e];for(let e=0,i=r.length;e<i;e++)n.push(r[e].clone(t));this.morphAttributes[e]=n}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let e=0,t=a.length;e<t;e++){let t=a[e];this.addGroup(t.start,t.count,t.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let s=e.boundingSphere;return s!==null&&(this.boundingSphere=s.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:`dispose`})}};const kn=/*@__PURE__*/ new U,An=/*@__PURE__*/ new U,jn=/*@__PURE__*/ new W;var Mn=class{constructor(e=new U(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,r){return this.normal.set(e,t,n),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let r=kn.subVectors(n,t).cross(An.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let r=e.delta(kn),i=this.normal.dot(r);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/i;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(r,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||jn.getNormalMatrix(e),r=this.coplanarPoint(kn).applyMatrix4(e),i=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(i),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}};let Nn=0;var Pn=class extends se{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Nn++}),this.uuid=fe(),this.name=``,this.type=`Material`,this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Z(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=M,this.stencilZFail=M,this.stencilZPass=M,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){L(`Material: parameter '${t}' has value of undefined.`);continue}let r=this[t];r===void 0?L(`Material: '${t}' is not a property of THREE.${this.type}.`):r&&r.isColor?r.set(n):r&&r.isVector2&&n&&n.isVector2||r&&r.isEuler&&n&&n.isEuler||r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e==`string`;t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:`Material`,generator:`Material.toJSON`}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(e=>e.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(e){let t=[];for(let n in e){let r=e[n];delete r.metadata,t.push(r)}return t}if(t){let t=r(e.textures),i=r(e.images);t.length>0&&(n.textures=t),i.length>0&&(n.images=i)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Z().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(e=>new Mn().fromJSON(e))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(this.vertexColors=typeof e.vertexColors==`number`?e.vertexColors>0:e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let t=e.normalScale;Array.isArray(t)===!1&&(t=[t,t]),this.normalScale=new V().fromArray(t)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new V().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let e=t.length;n=Array(e);for(let r=0;r!==e;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:`dispose`})}set needsUpdate(e){e===!0&&this.version++}};const Fn=/*@__PURE__*/ new U,In=/*@__PURE__*/ new U,Ln=/*@__PURE__*/ new U,Rn=/*@__PURE__*/ new U;var zn=class{constructor(e=new U,t=new U(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Fn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Fn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Fn.copy(this.origin).addScaledVector(this.direction,t),Fn.distanceToSquared(e))}distanceSqToSegment(e,t,n,r){In.copy(e).add(t).multiplyScalar(.5),Ln.copy(t).sub(e).normalize(),Rn.copy(this.origin).sub(In);let i=e.distanceTo(t)*.5,a=-this.direction.dot(Ln),o=Rn.dot(this.direction),s=-Rn.dot(Ln),c=Rn.lengthSq(),l=Math.abs(1-a*a),u,d,f,p;if(l>0){if(u=a*s-o,d=a*o-s,p=i*l,u>=0){if(d>=-p){if(d<=p){let e=1/l;u*=e,d*=e,f=u*(u+a*d+2*o)+d*(a*u+d+2*s)+c}else d=i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d=-i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c}else d<=-p?(u=Math.max(0,-(-a*i+o)),d=u>0?-i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c):d<=p?(u=0,d=Math.min(Math.max(-i,-s),i),f=d*(d+2*s)+c):(u=Math.max(0,-(a*i+o)),d=u>0?i:Math.min(Math.max(-i,-s),i),f=-u*u+d*(d+2*s)+c)}else d=a>0?-i:i,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*s)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(In).addScaledVector(Ln,d),f}intersectSphere(e,t){if(e.radius<0)return null;Fn.subVectors(e.center,this.origin);let n=Fn.dot(this.direction),r=Fn.dot(Fn)-n*n,i=e.radius*e.radius;if(r>i)return null;let a=Math.sqrt(i-r),o=n-a,s=n+a;return s<0?null:o<0?this.at(s,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,r,i,a,o,s,c=1/this.direction.x,l=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,r=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,r=(e.min.x-d.x)*c),l>=0?(i=(e.min.y-d.y)*l,a=(e.max.y-d.y)*l):(i=(e.max.y-d.y)*l,a=(e.min.y-d.y)*l),n>a||i>r||((i>n||isNaN(n))&&(n=i),(a<r||isNaN(r))&&(r=a),u>=0?(o=(e.min.z-d.z)*u,s=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,s=(e.min.z-d.z)*u),n>s||o>r)||((o>n||n!==n)&&(n=o),(s<r||r!==r)&&(r=s),r<0)?null:this.at(n>=0?n:r,t)}intersectsBox(e){return this.intersectBox(e,Fn)!==null}intersectTriangle(e,t,n,r,i){let a=this.origin,o=this.direction,s=o.x,c=o.y,l=o.z,u=e.x-a.x,d=e.y-a.y,f=e.z-a.z,p=t.x-a.x,m=t.y-a.y,h=t.z-a.z,g=n.x-a.x,_=n.y-a.y,v=n.z-a.z,y=Math.abs(s),b=Math.abs(c),x=Math.abs(l),S,C,w,T,E,D,O,k,A,ee,j,M;if(y>=b&&y>=x?(w=s,D=u,A=p,M=g,s>=0?(S=c,C=l,T=d,E=f,O=m,k=h,ee=_,j=v):(S=l,C=c,T=f,E=d,O=h,k=m,ee=v,j=_)):b>=x?(w=c,D=d,A=m,M=_,c>=0?(S=l,C=s,T=f,E=u,O=h,k=p,ee=v,j=g):(S=s,C=l,T=u,E=f,O=p,k=h,ee=g,j=v)):(w=l,D=f,A=h,M=v,l>=0?(S=s,C=c,T=u,E=d,O=p,k=m,ee=g,j=_):(S=c,C=s,T=d,E=u,O=m,k=p,ee=_,j=g)),w===0)return null;let N=S/w,te=C/w,ne=1/w,P=T-N*D,re=E-te*D,F=O-N*A,ie=k-te*A,I=ee-N*M,L=j-te*M,R=I*ie-L*F,z=P*L-re*I,ae=F*re-ie*P;if(r){if(R<0||z<0||ae<0)return null}else if((R<0||z<0||ae<0)&&(R>0||z>0||ae>0))return null;let oe=R+z+ae;if(oe===0)return null;let se=ne*(R*D+z*A+ae*M);return(oe>0?se<0:se>0)?null:this.at(se/oe,i)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Bn=class extends Pn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type=`MeshBasicMaterial`,this.color=new Z(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new X,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};const Vn=/*@__PURE__*/ new Y,Hn=/*@__PURE__*/ new zn,Un=/*@__PURE__*/ new bn,Wn=/*@__PURE__*/ new U,Gn=/*@__PURE__*/ new U,Kn=/*@__PURE__*/ new U,qn=/*@__PURE__*/ new U,Jn=/*@__PURE__*/ new U,Yn=/*@__PURE__*/ new U,Xn=/*@__PURE__*/ new U,Zn=/*@__PURE__*/ new U;var Qn=class extends wt{constructor(e=new On,t=new Bn){super(),this.isMesh=!0,this.type=`Mesh`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.morphTargetInfluences=e.morphTargetInfluences===void 0?void 0:e.morphTargetInfluences.slice(),this.morphTargetDictionary=e.morphTargetDictionary===void 0?void 0:Object.assign({},e.morphTargetDictionary),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}getVertexPosition(e,t){let n=this.geometry,r=n.attributes.position,i=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(r,e);let o=this.morphTargetInfluences;if(i&&o){Yn.set(0,0,0);for(let n=0,r=i.length;n<r;n++){let r=o[n],s=i[n];r!==0&&(Jn.fromBufferAttribute(s,e),a?Yn.addScaledVector(Jn,r):Yn.addScaledVector(Jn.sub(t),r))}t.add(Yn)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.material,i=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Un.copy(n.boundingSphere),Un.applyMatrix4(i),Hn.copy(e.ray).recast(e.near),!(Un.containsPoint(Hn.origin)===!1&&(Hn.intersectSphere(Un,Wn)===null||Hn.origin.distanceToSquared(Wn)>(e.far-e.near)**2))&&(Vn.copy(i).invert(),Hn.copy(e.ray).applyMatrix4(Vn),(n.boundingBox===null||Hn.intersectsBox(n.boundingBox)!==!1)&&this._computeIntersections(e,t,Hn)))}_computeIntersections(e,t,n){let r,i=this.geometry,a=this.material,o=i.index,s=i.attributes.position,c=i.attributes.uv,l=i.attributes.uv1,u=i.attributes.normal,d=i.groups,f=i.drawRange;if(o!==null){if(Array.isArray(a))for(let i=0,s=d.length;i<s;i++){let s=d[i],p=a[s.materialIndex],m=Math.max(s.start,f.start),h=Math.min(o.count,Math.min(s.start+s.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=o.getX(i),d=o.getX(i+1),f=o.getX(i+2);r=er(this,p,e,n,c,l,u,a,d,f),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=s.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),s=Math.min(o.count,f.start+f.count);for(let d=i,f=s;d<f;d+=3){let i=o.getX(d),s=o.getX(d+1),f=o.getX(d+2);r=er(this,a,e,n,c,l,u,i,s,f),r&&(r.faceIndex=Math.floor(d/3),t.push(r))}}}else if(s!==void 0){if(Array.isArray(a))for(let i=0,o=d.length;i<o;i++){let o=d[i],p=a[o.materialIndex],m=Math.max(o.start,f.start),h=Math.min(s.count,Math.min(o.start+o.count,f.start+f.count));for(let i=m,a=h;i<a;i+=3){let a=i,s=i+1,d=i+2;r=er(this,p,e,n,c,l,u,a,s,d),r&&(r.faceIndex=Math.floor(i/3),r.face.materialIndex=o.materialIndex,t.push(r))}}else{let i=Math.max(0,f.start),o=Math.min(s.count,f.start+f.count);for(let s=i,d=o;s<d;s+=3){let i=s,o=s+1,d=s+2;r=er(this,a,e,n,c,l,u,i,o,d),r&&(r.faceIndex=Math.floor(s/3),t.push(r))}}}}};function $n(e,t,n,r,i,a,o,s){let c;if(c=t.side===1?r.intersectTriangle(o,a,i,!0,s):r.intersectTriangle(i,a,o,t.side===0,s),c===null)return null;Zn.copy(s),Zn.applyMatrix4(e.matrixWorld);let l=n.ray.origin.distanceTo(Zn);return l<n.near||l>n.far?null:{distance:l,point:Zn.clone(),object:e}}function er(e,t,n,r,i,a,o,s,c,l){e.getVertexPosition(s,Gn),e.getVertexPosition(c,Kn),e.getVertexPosition(l,qn);let u=$n(e,t,n,r,Gn,Kn,qn,Xn);if(u){let e=new U;qt.getBarycoord(Xn,Gn,Kn,qn,e),i&&(u.uv=qt.getInterpolatedAttribute(i,s,c,l,e,new V)),a&&(u.uv1=qt.getInterpolatedAttribute(a,s,c,l,e,new V)),o&&(u.normal=qt.getInterpolatedAttribute(o,s,c,l,e,new U),u.normal.dot(r.direction)>0&&u.normal.multiplyScalar(-1));let t={a:s,b:c,c:l,normal:new U,materialIndex:0};qt.getNormal(Gn,Kn,qn,t.normal),u.face=t,u.barycoord=e}return u}var tr=class extends qe{constructor(e=null,t=1,n=1,i,a,o,s,c,l=r,u=r,d,f){super(null,o,s,c,l,u,i,a,d,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},nr=class extends pn{constructor(e,t,n,r=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}};const rr=/*@__PURE__*/ new Y,ir=/*@__PURE__*/ new Y,ar=[],or=/*@__PURE__*/ new Jt,sr=/*@__PURE__*/ new Y,cr=/*@__PURE__*/ new Qn,lr=/*@__PURE__*/ new bn;var ur=class extends Qn{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new nr(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let e=0;e<n;e++)this.setMatrixAt(e,sr)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Jt),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,rr),or.copy(e.boundingBox).applyMatrix4(rr),this.boundingBox.union(or)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new bn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,rr),lr.copy(e.boundingSphere).applyMatrix4(rr),this.boundingSphere.union(lr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),this.morphTexture=e.morphTexture===null?null:e.morphTexture.clone(),this.instanceColor=e.instanceColor===null?null:e.instanceColor.clone(),this.count=e.count,this.boundingBox=e.boundingBox===null?null:e.boundingBox.clone(),this.boundingSphere=e.boundingSphere===null?null:e.boundingSphere.clone(),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,r=this.morphTexture.source.data.data,i=e*(n.length+1)+1;for(let e=0;e<n.length;e++)n[e]=r[i+e]}raycast(e,t){let n=this.matrixWorld,r=this.count;if(cr.geometry=this.geometry,cr.material=this.material,cr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),lr.copy(this.boundingSphere),lr.applyMatrix4(n),e.ray.intersectsSphere(lr)!==!1))for(let i=0;i<r;i++){this.getMatrixAt(i,rr),ir.multiplyMatrices(n,rr),cr.matrixWorld=ir,cr.raycast(e,ar);for(let e=0,n=ar.length;e<n;e++){let n=ar[e];n.instanceId=i,n.object=this,t.push(n)}ar.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new nr(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,r=n.length+1;this.morphTexture===null&&(this.morphTexture=new tr(new Float32Array(r*this.count),r,this.count,_,l));let i=this.morphTexture.source.data.data,a=0;for(let e=0;e<n.length;e++)a+=n[e];let o=this.geometry.morphTargetsRelative?1:1-a,s=r*e;return i[s]=o,i.set(n,s+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}};const dr=/*@__PURE__*/ new bn,fr=/*@__PURE__*/ new V(.5,.5),pr=/*@__PURE__*/ new U;var mr=class{constructor(e=new Mn,t=new Mn,n=new Mn,r=new Mn,i=new Mn,a=new Mn){this.planes=[e,t,n,r,i,a]}set(e,t,n,r,i,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(r),o[4].copy(i),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=N,n=!1){let r=this.planes,i=e.elements,a=i[0],o=i[1],s=i[2],c=i[3],l=i[4],u=i[5],d=i[6],f=i[7],p=i[8],m=i[9],h=i[10],g=i[11],_=i[12],v=i[13],y=i[14],b=i[15];if(r[0].setComponents(c-a,f-l,g-p,b-_).normalize(),r[1].setComponents(c+a,f+l,g+p,b+_).normalize(),r[2].setComponents(c+o,f+u,g+m,b+v).normalize(),r[3].setComponents(c-o,f-u,g-m,b-v).normalize(),n)r[4].setComponents(s,d,h,y).normalize(),r[5].setComponents(c-s,f-d,g-h,b-y).normalize();else if(r[4].setComponents(c-s,f-d,g-h,b-y).normalize(),t===2e3)r[5].setComponents(c+s,f+d,g+h,b+y).normalize();else if(t===2001)r[5].setComponents(s,d,h,y).normalize();else throw Error(`THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: `+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),dr.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),dr.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(dr)}intersectsSprite(e){dr.center.set(0,0,0);let t=fr.distanceTo(e.center);return dr.radius=.7071067811865476+t,dr.applyMatrix4(e.matrixWorld),this.intersectsSphere(dr)}intersectsSphere(e){let t=this.planes,n=e.center,r=-e.radius;for(let e=0;e<6;e++)if(t[e].distanceToPoint(n)<r)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let r=t[n];if(pr.x=r.normal.x>0?e.max.x:e.min.x,pr.y=r.normal.y>0?e.max.y:e.min.y,pr.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(pr)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};const hr=/*@__PURE__*/ new Y;var gr=class e{constructor(){this.coordinateSystem=N,this._frustums=[],this._count=0}setFromArrayCamera(e){let t=e.cameras,n=this._frustums;for(let e=0;e<t.length;e++){let r=t[e];hr.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[e]===void 0&&(n[e]=new mr),n[e].setFromProjectionMatrix(hr,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){let t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;let t=this._frustums,n=e._frustums;for(let r=0;r<e._count;r++)t[r]===void 0&&(t[r]=new mr),t[r].copy(n[r]);return this._count=e._count,this}clone(){return new e().copy(this)}},_r=class extends Pn{constructor(e){super(),this.isPointsMaterial=!0,this.type=`PointsMaterial`,this.color=new Z(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}};const vr=/*@__PURE__*/ new Y,yr=/*@__PURE__*/ new zn,br=/*@__PURE__*/ new bn,xr=/*@__PURE__*/ new U;var Sr=class extends wt{constructor(e=new On,t=new _r){super(),this.isPoints=!0,this.type=`Points`,this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.morphTargetInfluences=e.morphTargetInfluences===void 0?void 0:e.morphTargetInfluences.slice(),this.morphTargetDictionary=e.morphTargetDictionary===void 0?void 0:Object.assign({},e.morphTargetDictionary),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,r=this.matrixWorld,i=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),br.copy(n.boundingSphere),br.applyMatrix4(r),br.radius+=i,e.ray.intersectsSphere(br)===!1)return;vr.copy(r).invert(),yr.copy(e.ray).applyMatrix4(vr);let o=i/((this.scale.x+this.scale.y+this.scale.z)/3),s=o*o,c=n.index,l=n.attributes.position;if(c!==null){let n=Math.max(0,a.start),i=Math.min(c.count,a.start+a.count);for(let a=n,o=i;a<o;a++){let n=c.getX(a);xr.fromBufferAttribute(l,n),Cr(xr,n,s,r,e,t,this)}}else{let n=Math.max(0,a.start),i=Math.min(l.count,a.start+a.count);for(let a=n,o=i;a<o;a++)xr.fromBufferAttribute(l,a),Cr(xr,a,s,r,e,t,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,t=Object.keys(e);if(t.length>0){let n=e[t[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let e=0,t=n.length;e<t;e++){let t=n[e].name||String(e);this.morphTargetInfluences.push(0),this.morphTargetDictionary[t]=e}}}}};function Cr(e,t,n,r,i,a,o){let s=yr.distanceSqToPoint(e);if(s<n){let n=new U;yr.closestPointToPoint(e,n),n.applyMatrix4(r);let c=i.ray.origin.distanceTo(n);if(c<i.near||c>i.far)return;a.push({distance:c,distanceToRay:Math.sqrt(s),point:n,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var wr=class extends qe{constructor(e=[],t=301,n,r,i,a,o,s,c,l){super(e,t,n,r,i,a,o,s,c,l),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Tr=class extends qe{constructor(e,t,n=c,i,a,o,s=r,l=r,u,d=h,f=1){if(d!==1026&&d!==1027)throw Error(`THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat`);super({width:e,height:t,depth:f},i,a,o,s,l,d,n,u),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Ue(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Er=class extends Tr{constructor(e,t=c,n=301,i,a,o=r,s=r,l,u=h){let d={width:e,height:e,depth:1},f=[d,d,d,d,d,d];super(e,e,t,n,i,a,o,s,l,u),this.image=f,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Dr=class extends qe{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Or=class e extends On{constructor(e=1,t=1,n=1,r=1,i=1,a=1){super(),this.type=`BoxGeometry`,this.parameters={width:e,height:t,depth:n,widthSegments:r,heightSegments:i,depthSegments:a};let o=this;r=Math.floor(r),i=Math.floor(i),a=Math.floor(a);let s=[],c=[],l=[],u=[],d=0,f=0;p(`z`,`y`,`x`,-1,-1,n,t,e,a,i,0),p(`z`,`y`,`x`,1,-1,n,t,-e,a,i,1),p(`x`,`z`,`y`,1,1,e,n,t,r,a,2),p(`x`,`z`,`y`,1,-1,e,n,-t,r,a,3),p(`x`,`y`,`z`,1,-1,e,t,n,r,i,4),p(`x`,`y`,`z`,-1,-1,e,t,-n,r,i,5),this.setIndex(s),this.setAttribute(`position`,new gn(c,3)),this.setAttribute(`normal`,new gn(l,3)),this.setAttribute(`uv`,new gn(u,2));function p(e,t,n,r,i,a,p,m,h,g,_){let v=a/h,y=p/g,b=a/2,x=p/2,S=m/2,C=h+1,w=g+1,T=0,E=0,D=new U;for(let a=0;a<w;a++){let o=a*y-x;for(let s=0;s<C;s++)D[e]=(s*v-b)*r,D[t]=o*i,D[n]=S,c.push(D.x,D.y,D.z),D[e]=0,D[t]=0,D[n]=m>0?1:-1,l.push(D.x,D.y,D.z),u.push(s/h),u.push(1-a/g),T+=1}for(let e=0;e<g;e++)for(let t=0;t<h;t++){let n=d+t+C*e,r=d+t+C*(e+1),i=d+(t+1)+C*(e+1),a=d+(t+1)+C*e;s.push(n,r,a),s.push(r,i,a),E+=6}o.addGroup(f,E,_),f+=E,d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}},kr=class e extends On{constructor(e=1,t=32,n=0,r=Math.PI*2){super(),this.type=`CircleGeometry`,this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:r},t=Math.max(3,t);let i=[],a=[],o=[],s=[],c=new U,l=new V;a.push(0,0,0),o.push(0,0,1),s.push(.5,.5);for(let i=0,u=3;i<=t;i++,u+=3){let d=n+i/t*r;c.x=e*Math.cos(d),c.y=e*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),l.x=(a[u]/e+1)/2,l.y=(a[u+1]/e+1)/2,s.push(l.x,l.y)}for(let e=1;e<=t;e++)i.push(e,e+1,0);this.setIndex(i),this.setAttribute(`position`,new gn(a,3)),this.setAttribute(`normal`,new gn(o,3)),this.setAttribute(`uv`,new gn(s,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.segments,t.thetaStart,t.thetaLength)}},Ar=class e extends On{constructor(e=1,t=1,n=1,r=32,i=1,a=!1,o=0,s=Math.PI*2){super(),this.type=`CylinderGeometry`,this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:r,heightSegments:i,openEnded:a,thetaStart:o,thetaLength:s};let c=this;r=Math.floor(r),i=Math.floor(i);let l=[],u=[],d=[],f=[],p=0,m=[],h=n/2,g=0;_(),a===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(l),this.setAttribute(`position`,new gn(u,3)),this.setAttribute(`normal`,new gn(d,3)),this.setAttribute(`uv`,new gn(f,2));function _(){let a=new U,_=new U,v=0,y=(t-e)/n;for(let c=0;c<=i;c++){let l=[],g=c/i,v=g*(t-e)+e;for(let e=0;e<=r;e++){let t=e/r,i=t*s+o,c=Math.sin(i),m=Math.cos(i);_.x=v*c,_.y=-g*n+h,_.z=v*m,u.push(_.x,_.y,_.z),a.set(c,y,m).normalize(),d.push(a.x,a.y,a.z),f.push(t,1-g),l.push(p++)}m.push(l)}for(let n=0;n<r;n++)for(let r=0;r<i;r++){let a=m[r][n],o=m[r+1][n],s=m[r+1][n+1],c=m[r][n+1];(e>0||r!==0)&&(l.push(a,o,c),v+=3),(t>0||r!==i-1)&&(l.push(o,s,c),v+=3)}c.addGroup(g,v,0),g+=v}function v(n){let i=p,a=new V,m=new U,_=0,v=n===!0?e:t,y=n===!0?1:-1;for(let e=1;e<=r;e++)u.push(0,h*y,0),d.push(0,y,0),f.push(.5,.5),p++;let b=p;for(let e=0;e<=r;e++){let t=e/r*s+o,n=Math.cos(t),i=Math.sin(t);m.x=v*i,m.y=h*y,m.z=v*n,u.push(m.x,m.y,m.z),d.push(0,y,0),a.x=n*.5+.5,a.y=i*.5*y+.5,f.push(a.x,a.y),p++}for(let e=0;e<r;e++){let t=i+e,r=b+e;n===!0?l.push(r,r+1,t):l.push(r+1,r,t),_+=3}c.addGroup(g,_,n===!0?1:2),g+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},jr=class e extends On{constructor(e=[],t=[],n=1,r=0){super(),this.type=`PolyhedronGeometry`,this.parameters={vertices:e,indices:t,radius:n,detail:r};let i=[],a=[];o(r),c(n),l(),this.setAttribute(`position`,new gn(i,3)),this.setAttribute(`normal`,new gn(i.slice(),3)),this.setAttribute(`uv`,new gn(a,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function o(e){let n=new U,r=new U,i=new U;for(let a=0;a<t.length;a+=3)f(t[a+0],n),f(t[a+1],r),f(t[a+2],i),s(n,r,i,e)}function s(e,t,n,r){let i=r+1,a=[];for(let r=0;r<=i;r++){a[r]=[];let o=e.clone().lerp(n,r/i),s=t.clone().lerp(n,r/i),c=i-r;for(let e=0;e<=c;e++)e===0&&r===i?a[r][e]=o:a[r][e]=o.clone().lerp(s,e/c)}for(let e=0;e<i;e++)for(let t=0;t<2*(i-e)-1;t++){let n=Math.floor(t/2);t%2==0?(d(a[e][n+1]),d(a[e+1][n]),d(a[e][n])):(d(a[e][n+1]),d(a[e+1][n+1]),d(a[e+1][n]))}}function c(e){let t=new U;for(let n=0;n<i.length;n+=3)t.x=i[n+0],t.y=i[n+1],t.z=i[n+2],t.normalize().multiplyScalar(e),i[n+0]=t.x,i[n+1]=t.y,i[n+2]=t.z}function l(){let e=new U;for(let t=0;t<i.length;t+=3){e.x=i[t+0],e.y=i[t+1],e.z=i[t+2];let n=h(e)/2/Math.PI+.5,r=g(e)/Math.PI+.5;a.push(n,1-r)}p(),u()}function u(){for(let e=0;e<a.length;e+=6){let t=a[e+0],n=a[e+2],r=a[e+4];Math.max(t,n,r)>.9&&Math.min(t,n,r)<.1&&(t<.2&&(a[e+0]+=1),n<.2&&(a[e+2]+=1),r<.2&&(a[e+4]+=1))}}function d(e){i.push(e.x,e.y,e.z)}function f(t,n){let r=t*3;n.x=e[r+0],n.y=e[r+1],n.z=e[r+2]}function p(){let e=new U,t=new U,n=new U,r=new U,o=new V,s=new V,c=new V;for(let l=0,u=0;l<i.length;l+=9,u+=6){e.set(i[l+0],i[l+1],i[l+2]),t.set(i[l+3],i[l+4],i[l+5]),n.set(i[l+6],i[l+7],i[l+8]),o.set(a[u+0],a[u+1]),s.set(a[u+2],a[u+3]),c.set(a[u+4],a[u+5]),r.copy(e).add(t).add(n).divideScalar(3);let d=h(r);m(o,u+0,e,d),m(s,u+2,t,d),m(c,u+4,n,d)}}function m(e,t,n,r){r<0&&e.x===1&&(a[t]=e.x-1),n.x===0&&n.z===0&&(a[t]=r/2/Math.PI+.5)}function h(e){return Math.atan2(e.z,-e.x)}function g(e){return Math.atan2(-e.y,Math.sqrt(e.x*e.x+e.z*e.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.vertices,t.indices,t.radius,t.detail)}},Mr=class e extends jr{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,r=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1];super(r,[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1],e,t),this.type=`IcosahedronGeometry`,this.parameters={radius:e,detail:t}}static fromJSON(t){return new e(t.radius,t.detail)}},Nr=class e extends On{constructor(e=1,t=1,n=1,r=1){super(),this.type=`PlaneGeometry`,this.parameters={width:e,height:t,widthSegments:n,heightSegments:r};let i=e/2,a=t/2,o=Math.floor(n),s=Math.floor(r),c=o+1,l=s+1,u=e/o,d=t/s,f=[],p=[],m=[],h=[];for(let e=0;e<l;e++){let t=e*d-a;for(let n=0;n<c;n++){let r=n*u-i;p.push(r,-t,0),m.push(0,0,1),h.push(n/o),h.push(1-e/s)}}for(let e=0;e<s;e++)for(let t=0;t<o;t++){let n=t+c*e,r=t+c*(e+1),i=t+1+c*(e+1),a=t+1+c*e;f.push(n,r,a),f.push(r,i,a)}this.setIndex(f),this.setAttribute(`position`,new gn(p,3)),this.setAttribute(`normal`,new gn(m,3)),this.setAttribute(`uv`,new gn(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.width,t.height,t.widthSegments,t.heightSegments)}},Pr=class e extends On{constructor(e=1,t=32,n=16,r=0,i=Math.PI*2,a=0,o=Math.PI){super(),this.type=`SphereGeometry`,this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:r,phiLength:i,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let s=Math.min(a+o,Math.PI),c=0,l=[],u=new U,d=new U,f=[],p=[],m=[],h=[];for(let f=0;f<=n;f++){let g=[],_=f/n,v=a+_*o,y=e*Math.cos(v),b=Math.sqrt(e*e-y*y),x=0;f===0&&a===0?x=.5/t:f===n&&s===Math.PI&&(x=-.5/t);for(let e=0;e<=t;e++){let n=e/t,a=r+n*i;u.x=-b*Math.cos(a),u.y=y,u.z=b*Math.sin(a),p.push(u.x,u.y,u.z),d.copy(u).normalize(),m.push(d.x,d.y,d.z),h.push(n+x,1-_),g.push(c++)}l.push(g)}for(let e=0;e<n;e++)for(let r=0;r<t;r++){let t=l[e][r+1],i=l[e][r],o=l[e+1][r],c=l[e+1][r+1];(e!==0||a>0)&&f.push(t,i,c),(e!==n-1||s<Math.PI)&&f.push(i,o,c)}this.setIndex(f),this.setAttribute(`position`,new gn(p,3)),this.setAttribute(`normal`,new gn(m,3)),this.setAttribute(`uv`,new gn(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(t){return new e(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};function Fr(e){let t={};for(let n in e){t[n]={};for(let r in e[n]){let i=e[n][r];if(Lr(i))i.isRenderTargetTexture?(L(`UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms().`),t[n][r]=null):t[n][r]=i.clone();else if(Array.isArray(i)){if(Lr(i[0])){let e=[];for(let t=0,n=i.length;t<n;t++)e[t]=i[t].clone();t[n][r]=e}else t[n][r]=i.slice()}else t[n][r]=i}}return t}function Ir(e){let t={};for(let n=0;n<e.length;n++){let r=Fr(e[n]);for(let e in r)t[e]=r[e]}return t}function Lr(e){return e&&(e.isColor||e.isMatrix3||e.isMatrix4||e.isVector2||e.isVector3||e.isVector4||e.isTexture||e.isQuaternion)}function Rr(e){let t=[];for(let n=0;n<e.length;n++)t.push(e[n].clone());return t}function zr(e){let t=e.getRenderTarget();return t===null?e.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:J.workingColorSpace}const Br={clone:Fr,merge:Ir};var Vr=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Hr=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Ur=class extends Pn{constructor(e){super(),this.isShaderMaterial=!0,this.type=`ShaderMaterial`,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Vr,this.fragmentShader=Hr,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Fr(e.uniforms),this.uniformsGroups=Rr(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let n in this.uniforms){let r=this.uniforms[n].value;r&&r.isTexture?t.uniforms[n]={type:`t`,value:r.toJSON(e).uuid}:r&&r.isColor?t.uniforms[n]={type:`c`,value:r.getHex()}:r&&r.isVector2?t.uniforms[n]={type:`v2`,value:r.toArray()}:r&&r.isVector3?t.uniforms[n]={type:`v3`,value:r.toArray()}:r&&r.isVector4?t.uniforms[n]={type:`v4`,value:r.toArray()}:r&&r.isMatrix3?t.uniforms[n]={type:`m3`,value:r.toArray()}:r&&r.isMatrix4?t.uniforms[n]={type:`m4`,value:r.toArray()}:t.uniforms[n]={value:r}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let e in this.extensions)this.extensions[e]===!0&&(n[e]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let r=e.uniforms[n];switch(this.uniforms[n]={},r.type){case`t`:this.uniforms[n].value=t[r.value]||null;break;case`c`:this.uniforms[n].value=new Z().setHex(r.value);break;case`v2`:this.uniforms[n].value=new V().fromArray(r.value);break;case`v3`:this.uniforms[n].value=new U().fromArray(r.value);break;case`v4`:this.uniforms[n].value=new Je().fromArray(r.value);break;case`m3`:this.uniforms[n].value=new W().fromArray(r.value);break;case`m4`:this.uniforms[n].value=new Y().fromArray(r.value);break;default:this.uniforms[n].value=r.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let t in e.extensions)this.extensions[t]=e.extensions[t];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Wr=class extends Ur{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type=`RawShaderMaterial`}},Gr=class extends Pn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type=`MeshStandardMaterial`,this.defines={STANDARD:``},this.color=new Z(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Z(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new V(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new X,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap=`round`,this.wireframeLinejoin=`round`,this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:``},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},Kr=class extends Pn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type=`MeshDepthMaterial`,this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},qr=class extends Pn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type=`MeshDistanceMaterial`,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Jr(e,t){return!e||e.constructor===t?e:typeof t.BYTES_PER_ELEMENT==`number`?new t(e):Array.prototype.slice.call(e)}function Yr(e){return e!==void 0&&e.inTangents!==void 0&&e.outTangents!==void 0}var Xr=class{constructor(e,t,n,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r===void 0?new t.constructor(n):r,this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,r=t[n],i=t[n-1];validate_interval:{seek:{let a;linear_scan:{forward_scan:if(!(e<r)){for(let a=n+2;;){if(r===void 0){if(e<i)break forward_scan;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(i=r,r=t[++n],e<r)break seek}a=t.length;break linear_scan}if(!(e>=i)){let o=t[1];e<o&&(n=2,i=o);for(let a=n-2;;){if(i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===a)break;if(r=i,i=t[--n-1],e>=i)break seek}a=n,n=0;break linear_scan}break validate_interval}for(;n<a;){let r=n+a>>>1;e<t[r]?a=r:n=r+1}if(r=t[n],i=t[n-1],i===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,i,r)}return this.interpolate_(n,i,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,r=this.valueSize,i=e*r;for(let e=0;e!==r;++e)t[e]=n[i+e];return t}interpolate_(){throw Error(`THREE.Interpolant: Call to abstract method.`)}intervalChanged_(){}},Zr=class extends Xr{constructor(e,t,n,r){super(e,t,n,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:E,endingEnd:E}}intervalChanged_(e,t,n){let r=this.parameterPositions,i=e-2,a=e+1,o=r[i],s=r[a];if(o===void 0)switch(this.getSettings_().endingStart){case D:i=e,o=2*t-n;break;case O:i=r.length-2,o=t+r[i]-r[i+1];break;default:i=e,o=n}if(s===void 0)switch(this.getSettings_().endingEnd){case D:a=e,s=2*n-t;break;case O:a=1,s=n+r[1]-r[0];break;default:a=e-1,s=t}let c=(n-t)*.5,l=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(s-n),this._offsetPrev=i*l,this._offsetNext=a*l}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,p=(n-t)/(r-t),m=p*p,h=m*p,g=-d*h+2*d*m-d*p,_=(1+d)*h+(-1.5-2*d)*m+(-.5+d)*p+1,v=(-1-f)*h+(1.5+f)*m+.5*p,y=f*h-f*m;for(let e=0;e!==o;++e)i[e]=g*a[l+e]+_*a[c+e]+v*a[s+e]+y*a[u+e];return i}},Qr=class extends Xr{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=(n-t)/(r-t),u=1-l;for(let e=0;e!==o;++e)i[e]=a[c+e]*u+a[s+e]*l;return i}},$r=class extends Xr{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e){return this.copySampleValue_(e-1)}},ei=class extends Xr{interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=e*o,c=s-o,l=this.inTangents,u=this.outTangents;if(!l||!u){let e=(n-t)/(r-t),l=1-e;for(let t=0;t!==o;++t)i[t]=a[c+t]*l+a[s+t]*e;return i}let d=o*2,f=e-1;for(let p=0;p!==o;++p){let o=a[c+p],m=a[s+p],h=f*d+p*2,g=u[h],_=u[h+1],v=e*d+p*2,y=l[v],b=l[v+1],x=ri(n,t,g,y,r);i[p]=ti(x,o,_,b,m)}return i}};function ti(e,t,n,r,i){let a=1-e;return a*a*a*t+3*a*a*e*n+3*a*e*e*r+e*e*e*i}function ni(e,t,n,r,i){let a=1-e;return 3*a*a*(n-t)+6*a*e*(r-n)+3*e*e*(i-r)}function ri(e,t,n,r,i){let a=(e-t)/(i-t);for(let o=0;o<8;o++){let o=ti(a,t,n,r,i)-e;if(Math.abs(o)<1e-10)break;let s=ni(a,t,n,r,i);if(Math.abs(s)<1e-10)break;a=Math.max(0,Math.min(1,a-o/s))}return a}var ii=class{constructor(e,t,n,r){if(e===void 0)throw Error(`THREE.KeyframeTrack: track name is undefined`);if(t===void 0||t.length===0)throw Error(`THREE.KeyframeTrack: no keyframes in track named `+e);this.name=e,this.times=Jr(t,this.TimeBufferType),this.values=Jr(n,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Jr(e.times,Array),values:Jr(e.values,Array)};let t=e.getInterpolation();t!==e.DefaultInterpolation&&(n.interpolation=t),Yr(e.settings)&&(n.settings={inTangents:Jr(e.settings.inTangents,Array),outTangents:Jr(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new $r(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Qr(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Zr(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new ei(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case S:t=this.InterpolantFactoryMethodDiscrete;break;case C:t=this.InterpolantFactoryMethodLinear;break;case w:t=this.InterpolantFactoryMethodSmooth;break;case T:t=this.InterpolantFactoryMethodBezier}if(t===void 0){let t=`unsupported interpolation for `+this.ValueTypeName+` keyframe track named `+this.name;if(this.createInterpolant===void 0){if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw Error(t)}return L(`KeyframeTrack:`,t),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return S;case this.InterpolantFactoryMethodLinear:return C;case this.InterpolantFactoryMethodSmooth:return w;case this.InterpolantFactoryMethodBezier:return T}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]+=e;Yr(this.settings)&&(ai(this.settings.inTangents,e),ai(this.settings.outTangents,e))}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,r=t.length;n!==r;++n)t[n]*=e;Yr(this.settings)&&(oi(this.settings.inTangents,e),oi(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,r=n.length,i=0,a=r-1;for(;i!==r&&n[i]<e;)++i;for(;a!==-1&&n[a]>t;)--a;if(++a,i!==0||a!==r){i>=a&&(a=Math.max(a,1),i=a-1);let e=this.getValueSize();this.times=n.slice(i,a),this.values=this.values.slice(i*e,a*e)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(R(`KeyframeTrack: Invalid value size in track.`,this),e=!1);let n=this.times,r=this.values,i=n.length;i===0&&(R(`KeyframeTrack: Track is empty.`,this),e=!1);let a=null;for(let t=0;t!==i;t++){let r=n[t];if(typeof r==`number`&&isNaN(r)){R(`KeyframeTrack: Time is not a valid number.`,this,t,r),e=!1;break}if(a!==null&&a>r){R(`KeyframeTrack: Out of order keys.`,this,t,r,a),e=!1;break}a=r}if(r!==void 0&&ne(r))for(let t=0,n=r.length;t!==n;++t){let n=r[t];if(isNaN(n)){R(`KeyframeTrack: Value is not a valid number.`,this,t,n),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),r=this.getInterpolation()===w,i=e.length-1,a=1;for(let o=1;o<i;++o){let i=!1,s=e[o];if(s!==e[o+1]&&(o!==1||s!==e[0])){if(r)i=!0;else{let e=o*n,r=e-n,a=e+n;for(let o=0;o!==n;++o){let n=t[e+o];if(n!==t[r+o]||n!==t[a+o]){i=!0;break}}}}if(i){if(o!==a){e[a]=e[o];let r=o*n,i=a*n;for(let e=0;e!==n;++e)t[i+e]=t[r+e]}++a}}if(i>0){e[a]=e[i];for(let e=i*n,r=a*n,o=0;o!==n;++o)t[r+o]=t[e+o];++a}return a===e.length?(this.times=e,this.values=t):(this.times=e.slice(0,a),this.values=t.slice(0,a*n)),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,r=new n(this.name,e,t);return r.createInterpolant=this.createInterpolant,Yr(this.settings)&&(r.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),r}};function ai(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]+=t}function oi(e,t){for(let n=0,r=e.length;n!==r;n+=2)e[n]*=t}ii.prototype.ValueTypeName=``,ii.prototype.TimeBufferType=Float32Array,ii.prototype.ValueBufferType=Float32Array,ii.prototype.DefaultInterpolation=C;var si=class extends ii{constructor(e,t,n){super(e,t,n)}};si.prototype.ValueTypeName=`bool`,si.prototype.ValueBufferType=Array,si.prototype.DefaultInterpolation=S,si.prototype.InterpolantFactoryMethodLinear=void 0,si.prototype.InterpolantFactoryMethodSmooth=void 0;var ci=class extends ii{constructor(e,t,n,r){super(e,t,n,r)}};ci.prototype.ValueTypeName=`color`;var li=class extends ii{constructor(e,t,n,r){super(e,t,n,r)}};li.prototype.ValueTypeName=`number`;var ui=class extends Xr{constructor(e,t,n,r){super(e,t,n,r)}interpolate_(e,t,n,r){let i=this.resultBuffer,a=this.sampleValues,o=this.valueSize,s=(n-t)/(r-t),c=e*o;for(let e=c+o;c!==e;c+=4)H.slerpFlat(i,0,a,c-o,a,c,s);return i}},di=class extends ii{constructor(e,t,n,r){super(e,t,n,r)}InterpolantFactoryMethodLinear(e){return new ui(this.times,this.values,this.getValueSize(),e)}};di.prototype.ValueTypeName=`quaternion`,di.prototype.InterpolantFactoryMethodSmooth=void 0;var fi=class extends ii{constructor(e,t,n){super(e,t,n)}};fi.prototype.ValueTypeName=`string`,fi.prototype.ValueBufferType=Array,fi.prototype.DefaultInterpolation=S,fi.prototype.InterpolantFactoryMethodLinear=void 0,fi.prototype.InterpolantFactoryMethodSmooth=void 0;var pi=class extends ii{constructor(e,t,n,r){super(e,t,n,r)}};pi.prototype.ValueTypeName=`vector`;const mi={enabled:!1,files:{},add:function(e,t){this.enabled!==!1&&(hi(e)||(this.files[e]=t))},get:function(e){if(this.enabled!==!1&&!hi(e))return this.files[e]},remove:function(e){delete this.files[e]},clear:function(){this.files={}}};function hi(e){try{let t=e.slice(e.indexOf(`:`)+1);return new URL(t).protocol===`blob:`}catch{return!1}}const gi=/*@__PURE__*/ new class{constructor(e,t,n){let r=this,i=!1,a=0,o=0,s,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(e){o++,i===!1&&r.onStart!==void 0&&r.onStart(e,a,o),i=!0},this.itemEnd=function(e){a++,r.onProgress!==void 0&&r.onProgress(e,a,o),a===o&&(i=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(e){r.onError!==void 0&&r.onError(e)},this.resolveURL=function(e){return e=e.normalize(`NFC`),s?s(e):e},this.setURLModifier=function(e){return s=e,this},this.addHandler=function(e,t){return c.push(e,t),this},this.removeHandler=function(e){let t=c.indexOf(e);return t!==-1&&c.splice(t,2),this},this.getHandler=function(e){for(let t=0,n=c.length;t<n;t+=2){let n=c[t],r=c[t+1];if(n.global&&(n.lastIndex=0),n.test(e))return r}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||=new AbortController,this._abortController}};var _i=class{constructor(e){this.manager=e===void 0?gi:e,this.crossOrigin=`anonymous`,this.withCredentials=!1,this.path=``,this.resourcePath=``,this.requestHeader={},this.priority=`auto`,this.cache=`default`,typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(r,i){n.load(e,r,t,i)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}setPriority(e){return this.priority=e,this}setCache(e){return this.cache=e,this}abort(){return this}};_i.DEFAULT_MATERIAL_NAME=`__DEFAULT`;const vi=/* @__PURE__ */ new WeakMap;var yi=class extends _i{constructor(e){super(e)}load(e,t,n,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let i=this,a=mi.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)i.manager.itemStart(e),setTimeout(function(){t&&t(a),i.manager.itemEnd(e)},0);else{let e=vi.get(a);e===void 0&&(e=[],vi.set(a,e)),e.push({onLoad:t,onError:r})}return a}let o=P(`img`);function s(){l(),t&&t(this);let n=vi.get(this)||[];for(let e=0;e<n.length;e++){let t=n[e];t.onLoad&&t.onLoad(this)}vi.delete(this),i.manager.itemEnd(e)}function c(t){l(),r&&r(t),mi.remove(`image:${e}`);let n=vi.get(this)||[];for(let e=0;e<n.length;e++){let r=n[e];r.onError&&r.onError(t)}vi.delete(this),i.manager.itemError(e),i.manager.itemEnd(e)}function l(){o.removeEventListener(`load`,s,!1),o.removeEventListener(`error`,c,!1)}return o.addEventListener(`load`,s,!1),o.addEventListener(`error`,c,!1),e.slice(0,5)!==`data:`&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),mi.add(`image:${e}`,o),i.manager.itemStart(e),o.fetchPriority=this.priority,o.src=e,o}},bi=class extends _i{constructor(e){super(e)}load(e,t,n,r){let i=new qe,a=new yi(this.manager);return a.setPriority(this.priority),a.setCache(this.cache),a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(e){i.image=e,i.needsUpdate=!0,t!==void 0&&t(i)},n,r),i}},xi=class extends wt{static registerNode(e){this.prototype._lightNode=e}constructor(e,t=1){super(),this.isLight=!0,this.type=`Light`,this.color=new Z(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Si=class extends xi{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type=`HemisphereLight`,this.position.copy(wt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Z(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}};const Ci=/*@__PURE__*/ new Y,wi=/*@__PURE__*/ new U,Ti=/*@__PURE__*/ new U;var Ei=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new V(512,512),this.mapType=o,this.map=null,this.mapPass=null,this.matrix=new Y,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new mr,this._frameExtents=new V(1,1),this._viewportCount=1,this._viewports=[new Je(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;wi.setFromMatrixPosition(e.matrixWorld),t.position.copy(wi),Ti.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Ti),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,r){Ci.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(Ci,e.coordinateSystem,e.reversedDepth);let i=this._frameExtents,a=r?r.z/i.x:1,o=r?r.w/i.y:1,s=r?r.x/i.x:0,c=r?r.y/i.y:0;e.coordinateSystem===2001||e.reversedDepth?t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+s,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(Ci)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.mapType=e.mapType,this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.mapType=this.mapType,e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}};const Di=/*@__PURE__*/ new U,Oi=/*@__PURE__*/ new H,ki=/*@__PURE__*/ new U;var Ai=class extends wt{constructor(){super(),this.isCamera=!0,this.type=`Camera`,this.matrixWorldInverse=new Y,this.projectionMatrix=new Y,this.projectionMatrixInverse=new Y,this.coordinateSystem=N,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Di,Oi,ki),ki.x===1&&ki.y===1&&ki.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Di,Oi,ki.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Di,Oi,ki),ki.x===1&&ki.y===1&&ki.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Di,Oi,ki.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}};const ji=/*@__PURE__*/ new U,Mi=/*@__PURE__*/ new V,Ni=/*@__PURE__*/ new V;var Pi=class extends Ai{constructor(e=50,t=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type=`PerspectiveCamera`,this.fov=e,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=de*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(ue*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return de*2*Math.atan(Math.tan(ue*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){ji.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ji.x,ji.y).multiplyScalar(-e/ji.z),ji.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ji.x,ji.y).multiplyScalar(-e/ji.z)}getViewSize(e,t){return this.getViewBounds(e,Mi,Ni),t.subVectors(Ni,Mi)}setViewOffset(e,t,n,r,i,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(ue*.5*this.fov)/this.zoom,n=2*t,r=this.aspect*n,i=-.5*r,a=this.view;if(this.view!==null&&this.view.enabled){let e=a.fullWidth,o=a.fullHeight;i+=a.offsetX*r/e,t-=a.offsetY*n/o,r*=a.width/e,n*=a.height/o}let o=this.filmOffset;o!==0&&(i+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(i,i+r,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},Fi=class extends Ai{constructor(e=-1,t=1,n=1,r=-1,i=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type=`OrthographicCamera`,this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=r,this.near=i,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,r,i,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=r,this.view.width=i,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2,i=n-e,a=n+e,o=r+t,s=r-t;if(this.view!==null&&this.view.enabled){let e=(this.right-this.left)/this.view.fullWidth/this.zoom,t=(this.top-this.bottom)/this.view.fullHeight/this.zoom;i+=e*this.view.offsetX,a=i+e*this.view.width,o-=t*this.view.offsetY,s=o-t*this.view.height}this.projectionMatrix.makeOrthographic(i,a,o,s,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Ii=class extends Ei{constructor(){super(new Fi(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Li=class extends xi{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type=`DirectionalLight`,this.position.copy(wt.DEFAULT_UP),this.updateMatrix(),this.target=new wt,this.shadow=new Ii}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}},Ri=class extends On{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type=`InstancedBufferGeometry`,this.instanceCount=1/0}copy(e){return super.copy(e),this.instanceCount=e.instanceCount,this}toJSON(){let e=super.toJSON();return e.instanceCount=this.instanceCount,e.isInstancedBufferGeometry=!0,e}},zi=class extends wt{constructor(e,t,n){super(),this.type=`CubeCamera`,this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let r=new Pi(-90,1,e,t);r.layers=this.layers,this.add(r);let i=new Pi(-90,1,e,t);i.layers=this.layers,this.add(i);let a=new Pi(-90,1,e,t);a.layers=this.layers,this.add(a);let o=new Pi(-90,1,e,t);o.layers=this.layers,this.add(o);let s=new Pi(-90,1,e,t);s.layers=this.layers,this.add(s);let c=new Pi(-90,1,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,r,i,a,o,s]=t;for(let e of t)this.remove(e);if(e===2e3)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),i.up.set(0,0,-1),i.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),s.up.set(0,1,0),s.lookAt(0,0,-1);else if(e===2001)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),i.up.set(0,0,1),i.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),s.up.set(0,-1,0),s.lookAt(0,0,-1);else throw Error(`THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: `+e);for(let e of t)this.add(e),e.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[i,a,o,s,c,l]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;let m=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let h=!1;h=e.isWebGLRenderer===!0?e.state.buffers.depth.getReversed():e.reversedDepthBuffer,e.setRenderTarget(n,0,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,i),e.setRenderTarget(n,1,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,s),e.setRenderTarget(n,4,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.mipmapsAutoUpdate=m,e.setRenderTarget(n,5,r),h&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(u,d,f),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}},Bi=class extends Pi{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}};const Vi=/* @__PURE__ */ RegExp(`[\\[\\]\\.:\\/]`,`g`),Hi=/* @__PURE__ */ RegExp(`^((?:[^\\[\\]\\.:\\/]+[\\/:])*)([^\\[\\]:\\/]+)?(?:\\.([^\\[\\]\\.:\\/]+)(?:\\[(.+)\\])?)?\\.([^\\[\\]\\.:\\/]+)(?:\\[(.+)\\])?$`),Ui=[`material`,`materials`,`bones`,`map`];var Wi=class{constructor(e,t,n){let r=n||Gi.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,r=this._bindings[n];r!==void 0&&r.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let r=this._targetGroup.nCachedObjects_,i=n.length;r!==i;++r)n[r].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Gi=class e{constructor(t,n,r){this.path=n,this.parsedPath=r||e.parseTrackName(n),this.node=e.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,n,r){return t&&t.isAnimationObjectGroup?new e.Composite(t,n,r):new e(t,n,r)}static sanitizeNodeName(e){return e.replace(/\s/g,`_`).replace(Vi,``)}static parseTrackName(e){let t=Hi.exec(e);if(t===null)throw Error(`THREE.PropertyBinding: Cannot parse trackName: `+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=n.nodeName&&n.nodeName.lastIndexOf(`.`);if(r!==void 0&&r!==-1){let e=n.nodeName.substring(r+1);Ui.indexOf(e)!==-1&&(n.nodeName=n.nodeName.substring(0,r),n.objectName=e)}if(n.propertyName===null||n.propertyName.length===0)throw Error(`THREE.PropertyBinding: can not parse propertyName from trackName: `+e);return n}static findNode(e,t){if(t===void 0||t===``||t===`.`||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(e){for(let r=0;r<e.length;r++){let i=e[r];if(i.name===t||i.uuid===t)return i;let a=n(i.children);if(a)return a}return null},r=n(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)e[t++]=n[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let r=0,i=n.length;r!==i;++r)n[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let t=this.node,n=this.parsedPath,r=n.objectName,i=n.propertyName,a=n.propertyIndex;if(t||(t=e.findNode(this.rootNode,n.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){L(`PropertyBinding: No target node found for track: `+this.path+`.`);return}if(r){let e=n.objectIndex;switch(r){case`materials`:if(!t.material){R(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.materials){R(`PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.`,this);return}t=t.material.materials;break;case`bones`:if(!t.skeleton){R(`PropertyBinding: Can not bind to bones as node does not have a skeleton.`,this);return}t=t.skeleton.bones;for(let n=0;n<t.length;n++)if(t[n].name===e){e=n;break}break;case`map`:if(`map`in t){t=t.map;break}if(!t.material){R(`PropertyBinding: Can not bind to material as node does not have a material.`,this);return}if(!t.material.map){R(`PropertyBinding: Can not bind to material.map as node.material does not have a map.`,this);return}t=t.material.map;break;default:if(t[r]===void 0){R(`PropertyBinding: Can not bind to objectName of node undefined.`,this);return}t=t[r]}if(e!==void 0){if(t[e]===void 0){R(`PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.`,this,t);return}t=t[e]}}let o=t[i];if(o===void 0){let e=n.nodeName;R(`PropertyBinding: Trying to update property for track: `+e+`.`+i+` but it wasn't found.`,t);return}let s=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?s=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(s=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(a!==void 0){if(i===`morphTargetInfluences`){if(!t.geometry){R(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.`,this);return}if(!t.geometry.morphAttributes){R(`PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.`,this);return}t.morphTargetDictionary[a]!==void 0&&(a=t.morphTargetDictionary[a])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=a}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][s]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Gi.Composite=Wi,Gi.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3},Gi.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2},Gi.prototype.GetterByBindingType=[Gi.prototype._getValue_direct,Gi.prototype._getValue_array,Gi.prototype._getValue_arrayElement,Gi.prototype._getValue_toArray],Gi.prototype.SetterByBindingTypeAndVersioning=[[Gi.prototype._setValue_direct,Gi.prototype._setValue_direct_setNeedsUpdate,Gi.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Gi.prototype._setValue_array,Gi.prototype._setValue_array_setNeedsUpdate,Gi.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Gi.prototype._setValue_arrayElement,Gi.prototype._setValue_arrayElement_setNeedsUpdate,Gi.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Gi.prototype._setValue_fromArray,Gi.prototype._setValue_fromArray_setNeedsUpdate,Gi.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];const Ki=/*@__PURE__*/ new Y;var qi=class{constructor(e,t,n=0,r=1/0){this.ray=new zn(e,t),this.near=n,this.far=r,this.camera=null,this.layers=new ct,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):R(`Raycaster: Unsupported camera type: `+t.type)}setFromXRController(e){return Ki.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Ki),this}intersectObject(e,t=!0,n=[]){return Yi(e,this,n,t),n.sort(Ji),n}intersectObjects(e,t=!0,n=[]){for(let r=0,i=e.length;r<i;r++)Yi(e[r],this,n,t);return n.sort(Ji),n}};function Ji(e,t){return e.distance-t.distance}function Yi(e,t,n,r){let i=!0;if(e.layers.test(t.layers)&&e.raycast(t,n)===!1&&(i=!1),i===!0&&r===!0){let r=e.children;for(let e=0,i=r.length;e<i;e++)Yi(r[e],t,n,!0)}}(class{static{this.prototype.isMatrix2=!0}constructor(e,t,n,r){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,r)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,r){let i=this.elements;return i[0]=e,i[2]=t,i[1]=n,i[3]=r,this}});function Xi(e,t,n,r){let i=Zi(r);switch(n){case 1021:return e*t;case _:return e*t/i.components*i.byteLength;case v:return e*t/i.components*i.byteLength;case y:return e*t*2/i.components*i.byteLength;case b:return e*t*2/i.components*i.byteLength;case 1022:return e*t*3/i.components*i.byteLength;case m:return e*t*4/i.components*i.byteLength;case x:return e*t*4/i.components*i.byteLength;case 33776:case 33777:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case 33778:case 33779:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case 35841:case 35843:return Math.max(e,16)*Math.max(t,8)/4;case 35840:case 35842:return Math.max(e,8)*Math.max(t,8)/2;case 36196:case 37492:case 37488:case 37489:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*8;case 37496:case 37490:case 37491:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case 37808:return Math.floor((e+3)/4)*Math.floor((t+3)/4)*16;case 37809:return Math.floor((e+4)/5)*Math.floor((t+3)/4)*16;case 37810:return Math.floor((e+4)/5)*Math.floor((t+4)/5)*16;case 37811:return Math.floor((e+5)/6)*Math.floor((t+4)/5)*16;case 37812:return Math.floor((e+5)/6)*Math.floor((t+5)/6)*16;case 37813:return Math.floor((e+7)/8)*Math.floor((t+4)/5)*16;case 37814:return Math.floor((e+7)/8)*Math.floor((t+5)/6)*16;case 37815:return Math.floor((e+7)/8)*Math.floor((t+7)/8)*16;case 37816:return Math.floor((e+9)/10)*Math.floor((t+4)/5)*16;case 37817:return Math.floor((e+9)/10)*Math.floor((t+5)/6)*16;case 37818:return Math.floor((e+9)/10)*Math.floor((t+7)/8)*16;case 37819:return Math.floor((e+9)/10)*Math.floor((t+9)/10)*16;case 37820:return Math.floor((e+11)/12)*Math.floor((t+9)/10)*16;case 37821:return Math.floor((e+11)/12)*Math.floor((t+11)/12)*16;case 36492:case 36494:case 36495:return Math.ceil(e/4)*Math.ceil(t/4)*16;case 36283:case 36284:return Math.ceil(e/4)*Math.ceil(t/4)*8;case 36285:case 36286:return Math.ceil(e/4)*Math.ceil(t/4)*16}throw Error(`Unable to determine texture byte length for ${n} format.`)}function Zi(e){switch(e){case o:case 1010:return{byteLength:1,components:1};case s:case 1011:case u:return{byteLength:2,components:1};case d:case f:return{byteLength:2,components:4};case c:case 1013:case l:return{byteLength:4,components:1};case 35902:case 35899:return{byteLength:4,components:3}}throw Error(`THREE.TextureUtils: Unknown texture type ${e}.`)}typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`register`,{detail:{revision:`187`}})),typeof window<`u`&&(window.__THREE__?L(`WARNING: Multiple instances of Three.js being imported.`):window.__THREE__=`187`);
/**
* @license
* Copyright 2010-2026 Three.js Authors
* SPDX-License-Identifier: MIT
*/
function Qi(){let e=null,t=!1,n=null,r=null;function i(t,a){r=e.requestAnimationFrame(i),n(t,a)}return{start:function(){t!==!0&&n!==null&&e!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e!==null&&e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function $i(e){let t=/* @__PURE__ */ new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}const Q={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,common:`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,lights_physical_pars_fragment:`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,lights_fragment_begin:`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lightprobes_pars_fragment:`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,depth_frag:`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distance_vert:`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,distance_frag:`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,linedashed_frag:`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,meshbasic_vert:`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,meshbasic_frag:`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshlambert_vert:`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshlambert_frag:`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshmatcap_vert:`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,meshmatcap_frag:`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshnormal_vert:`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,meshnormal_frag:`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,meshphong_vert:`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshphong_frag:`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshphysical_vert:`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,meshphysical_frag:`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,meshtoon_vert:`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,meshtoon_frag:`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,points_vert:`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,points_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,shadow_vert:`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,shadow_frag:`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sprite_vert:`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sprite_frag:`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`},$={common:{diffuse:{value:/*@__PURE__*/ new Z(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:/*@__PURE__*/ new W},alphaMap:{value:null},alphaMapTransform:{value:/*@__PURE__*/ new W},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:/*@__PURE__*/ new W}},envmap:{envMap:{value:null},envMapRotation:{value:/*@__PURE__*/ new W},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:/*@__PURE__*/ new W}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:/*@__PURE__*/ new W}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:/*@__PURE__*/ new W},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:/*@__PURE__*/ new W},normalScale:{value:/*@__PURE__*/ new V(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:/*@__PURE__*/ new W},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:/*@__PURE__*/ new W}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:/*@__PURE__*/ new W}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:/*@__PURE__*/ new W}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:/*@__PURE__*/ new Z(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:/*@__PURE__*/ new Z(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:/*@__PURE__*/ new W},alphaTest:{value:0},uvTransform:{value:/*@__PURE__*/ new W}},sprite:{diffuse:{value:/*@__PURE__*/ new Z(16777215)},opacity:{value:1},center:{value:/*@__PURE__*/ new V(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:/*@__PURE__*/ new W},alphaMap:{value:null},alphaMapTransform:{value:/*@__PURE__*/ new W},alphaTest:{value:0}}},ea={basic:{uniforms:/*@__PURE__*/ Ir([$.common,$.specularmap,$.envmap,$.aomap,$.lightmap,$.fog]),vertexShader:Q.meshbasic_vert,fragmentShader:Q.meshbasic_frag},lambert:{uniforms:/*@__PURE__*/ Ir([$.common,$.specularmap,$.envmap,$.aomap,$.lightmap,$.emissivemap,$.bumpmap,$.normalmap,$.displacementmap,$.fog,$.lights,{emissive:{value:/*@__PURE__*/ new Z(0)},envMapIntensity:{value:1}}]),vertexShader:Q.meshlambert_vert,fragmentShader:Q.meshlambert_frag},phong:{uniforms:/*@__PURE__*/ Ir([$.common,$.specularmap,$.envmap,$.aomap,$.lightmap,$.emissivemap,$.bumpmap,$.normalmap,$.displacementmap,$.fog,$.lights,{emissive:{value:/*@__PURE__*/ new Z(0)},specular:{value:/*@__PURE__*/ new Z(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Q.meshphong_vert,fragmentShader:Q.meshphong_frag},standard:{uniforms:/*@__PURE__*/ Ir([$.common,$.envmap,$.aomap,$.lightmap,$.emissivemap,$.bumpmap,$.normalmap,$.displacementmap,$.roughnessmap,$.metalnessmap,$.fog,$.lights,{emissive:{value:/*@__PURE__*/ new Z(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Q.meshphysical_vert,fragmentShader:Q.meshphysical_frag},toon:{uniforms:/*@__PURE__*/ Ir([$.common,$.aomap,$.lightmap,$.emissivemap,$.bumpmap,$.normalmap,$.displacementmap,$.gradientmap,$.fog,$.lights,{emissive:{value:/*@__PURE__*/ new Z(0)}}]),vertexShader:Q.meshtoon_vert,fragmentShader:Q.meshtoon_frag},matcap:{uniforms:/*@__PURE__*/ Ir([$.common,$.bumpmap,$.normalmap,$.displacementmap,$.fog,{matcap:{value:null}}]),vertexShader:Q.meshmatcap_vert,fragmentShader:Q.meshmatcap_frag},points:{uniforms:/*@__PURE__*/ Ir([$.points,$.fog]),vertexShader:Q.points_vert,fragmentShader:Q.points_frag},dashed:{uniforms:/*@__PURE__*/ Ir([$.common,$.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Q.linedashed_vert,fragmentShader:Q.linedashed_frag},depth:{uniforms:/*@__PURE__*/ Ir([$.common,$.displacementmap]),vertexShader:Q.depth_vert,fragmentShader:Q.depth_frag},normal:{uniforms:/*@__PURE__*/ Ir([$.common,$.bumpmap,$.normalmap,$.displacementmap,{opacity:{value:1}}]),vertexShader:Q.meshnormal_vert,fragmentShader:Q.meshnormal_frag},sprite:{uniforms:/*@__PURE__*/ Ir([$.sprite,$.fog]),vertexShader:Q.sprite_vert,fragmentShader:Q.sprite_frag},background:{uniforms:{uvTransform:{value:/*@__PURE__*/ new W},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Q.background_vert,fragmentShader:Q.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:/*@__PURE__*/ new W}},vertexShader:Q.backgroundCube_vert,fragmentShader:Q.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Q.cube_vert,fragmentShader:Q.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Q.equirect_vert,fragmentShader:Q.equirect_frag},distance:{uniforms:/*@__PURE__*/ Ir([$.common,$.displacementmap,{referencePosition:{value:/*@__PURE__*/ new U},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Q.distance_vert,fragmentShader:Q.distance_frag},shadow:{uniforms:/*@__PURE__*/ Ir([$.lights,$.fog,{color:{value:/*@__PURE__*/ new Z(0)},opacity:{value:1}}]),vertexShader:Q.shadow_vert,fragmentShader:Q.shadow_frag}};ea.physical={uniforms:/*@__PURE__*/ Ir([ea.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:/*@__PURE__*/ new W},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:/*@__PURE__*/ new W},clearcoatNormalScale:{value:/*@__PURE__*/ new V(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:/*@__PURE__*/ new W},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:/*@__PURE__*/ new W},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:/*@__PURE__*/ new W},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:/*@__PURE__*/ new W},sheen:{value:0},sheenColor:{value:/*@__PURE__*/ new Z(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:/*@__PURE__*/ new W},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:/*@__PURE__*/ new W},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:/*@__PURE__*/ new W},transmissionSamplerSize:{value:/*@__PURE__*/ new V},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:/*@__PURE__*/ new W},attenuationDistance:{value:0},attenuationColor:{value:/*@__PURE__*/ new Z(0)},specularColor:{value:/*@__PURE__*/ new Z(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:/*@__PURE__*/ new W},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:/*@__PURE__*/ new W},anisotropyVector:{value:/*@__PURE__*/ new V},anisotropyMap:{value:null},anisotropyMapTransform:{value:/*@__PURE__*/ new W}}]),vertexShader:Q.meshphysical_vert,fragmentShader:Q.meshphysical_frag};const ta={r:0,b:0,g:0},na=/*@__PURE__*/ new Y,ra=/*@__PURE__*/ new W;ra.set(-1,0,0,0,1,0,0,0,1);function ia(e,t,n,r,i,a){let o=new Z(0),s=i===!0?0:1,c,l,u=null,d=0,f=null;function p(e){let n=e.isScene===!0?e.background:null;if(n&&n.isTexture){let r=e.backgroundBlurriness>0;n=t.get(n,r)}return n}function m(t){let r=!1,i=p(t);i===null?g(o,s):i&&i.isColor&&(g(i,1),r=!0);let c=e.xr.getEnvironmentBlendMode();c===`additive`?n.buffers.color.setClear(0,0,0,1,a):c===`alpha-blend`&&n.buffers.color.setClear(0,0,0,0,a),(e.autoClear||r)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function h(t,n){let i=p(n);i&&i.isCubeTexture?(l===void 0&&(l=new Qn(new Or(1,1,1),new Ur({name:`BackgroundCubeMaterial`,uniforms:Fr(ea.backgroundCube.uniforms),vertexShader:ea.backgroundCube.vertexShader,fragmentShader:ea.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),l.geometry.deleteAttribute(`uv`),l.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(l)),l.material.uniforms.envMap.value=i,l.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(na.makeRotationFromEuler(n.backgroundRotation)).transpose(),i.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(ra),l.material.toneMapped=J.getTransfer(i.colorSpace)!==j,(u!==i||d!==i.version||f!==e.toneMapping)&&(l.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null)):i&&i.isTexture&&(c===void 0&&(c=new Qn(new Nr(2,2),new Ur({name:`BackgroundMaterial`,uniforms:Fr(ea.background.uniforms),vertexShader:ea.background.vertexShader,fragmentShader:ea.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute(`normal`),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=i,c.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,c.material.toneMapped=J.getTransfer(i.colorSpace)!==j,i.matrixAutoUpdate===!0&&i.updateMatrix(),c.material.uniforms.uvTransform.value.copy(i.matrix),(u!==i||d!==i.version||f!==e.toneMapping)&&(c.material.needsUpdate=!0,u=i,d=i.version,f=e.toneMapping),c.layers.enableAll(),t.unshift(c,c.geometry,c.material,0,0,null))}function g(t,r){t.getRGB(ta,zr(e)),n.buffers.color.setClear(ta.r,ta.g,ta.b,r,a)}function _(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(e,t=1){o.set(e),s=t,g(o,s)},getClearAlpha:function(){return s},setClearAlpha:function(e){s=e,g(o,s)},render:m,addToRenderList:h,dispose:_}}function aa(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(n,s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n,i){let a=i.wireframe===!0,o=r[t.id];o===void 0&&(o={},r[t.id]=o);let s=e.isInstancedMesh===!0?e.id:0,l=o[s];l===void 0&&(l={},o[s]=l);let u=l[n.id];u===void 0&&(u={},l[n.id]=u);let d=u[a];return d===void 0&&(d=f(c()),u[a]=d),d}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.isInterleavedBuffer===!0?t.stride:t.itemSize,p=s.offset;if(t.isInstancedInterleavedBuffer||t.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){T();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n){let t=n[e];for(let e in t)u(t[e].object),delete t[e];delete n[e]}}delete r[e.id]}function C(e){for(let t in r){let n=r[t];for(let t in n){let r=n[t];if(r[e.id]===void 0)continue;let i=r[e.id];for(let e in i)u(i[e].object),delete i[e];delete r[e.id]}}}function w(e){for(let t in r){let n=r[t],i=e.isInstancedMesh===!0?e.id:0,a=n[i];if(a!==void 0){for(let e in a){let t=a[e];for(let e in t)u(t[e].object),delete t[e];delete a[e]}delete n[i],Object.keys(n).length===0&&delete r[t]}}}function T(){E(),o=!0,a!==i&&(a=i,l(a.object))}function E(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:T,resetDefaultState:E,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfObject:w,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function oa(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s}function sa(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&n!==1015&&!i&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE))}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(L(`WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),f=n.logarithmicDepthBuffer===!0&&d===!1;n.reversedDepthBuffer===!0&&d===!1&&L(`WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.`),n.logarithmicDepthBuffer===!0&&d===!0&&L(`WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.`);let p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=e.getParameter(e.MAX_SAMPLES),S=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:f,reversedDepthBuffer:d,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,maxSamples:x,samples:S}}function ca(e){let t=this,n=null,r=0,i=!1,a=!1,o=new Mn,s=new W,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}var la=class extends Xe{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},r=[n,n,n,n,n,n];this.texture=new wr(r),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Or(5,5,5),a=new Ur({name:`CubemapFromEquirect`,uniforms:Fr(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:1,blending:0});a.uniforms.tEquirect.value=t;let o=new Qn(r,a),s=t.minFilter;return t.minFilter===1008&&(t.minFilter=i),new zi(1,10,this).update(e,o),t.minFilter=s,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,r=!0){let i=e.getRenderTarget();for(let i=0;i<6;i++)e.setRenderTarget(this,i),e.clear(t,n,r);e.setRenderTarget(i)}};const ua=/*@__PURE__*/ new U,da=/*@__PURE__*/ new Z;var fa=class e{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new zi(1,10,null),this._boxMesh=new Qn(new Or(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=ua}=i,s=this._renderer;this._setSize(a);let c=this._allocateTarget(),l=this._getSourceTarget(!0);t>0&&(l.texture.mipmapsAutoUpdate=!1);let u=s.autoClear,d=s.autoClearColor,f=s.autoClearDepth,p=s.autoClearStencil,m=e.background;s.autoClear=!0,s.autoClearColor=!0,s.autoClearDepth=!0,s.autoClearStencil=!0,m===null&&(e.background=s.getClearColor(da));let h=new zi(n,r,l);return h.position.copy(o),h.update(s,e),s.autoClear=u,s.autoClearColor=d,s.autoClearDepth=f,s.autoClearStencil=p,e.background=m,t>0&&(l.texture.mipmapsAutoUpdate=!0,this._blur(c,t)),this._applyPMREM(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ya(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=va(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(256,ke(e))}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?256:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);let n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){let e=this._cubeSize,t=pa(e,!1,!1),n=Math.log2(e)-3;for(let r=0;r<=n;r++)t.texture.mipmaps.push({width:e>>r,height:e>>r});return t.texture.name=`PMREM`,t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){let t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=pa(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){let r=this._boxMesh,i=this._cubeCamera;r.material=n,i.renderTarget=e,i.activeMipmapLevel=t;let a=e.width>>t;e.viewport.set(0,0,a,a),i.update(this._renderer,r),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===301||e.mapping===302?(this._cubemapMaterial===null&&(this._cubemapMaterial=ya()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=va()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(t){this._ggxMaterial===null&&(this._ggxMaterial=ha(),this._integrationMaterial=ga());let n=this._cubeSize,r=t.texture.mipmaps.length-1,i=this._ggxMaterial.uniforms;i.envMap.value=this._sourceTarget.texture;let a=this._integrationMaterial.uniforms;a.envMap.value=this._sourceTarget.texture,a.sourceLod.value=Math.log2(n/16);for(let o=0;o<=r;o++){let s=e.lodToRoughness(o,r);if(o>r-3)a.roughness.value=s,this._renderCube(t,o,this._integrationMaterial);else{let e=s>0?Math.log2(n)+.5*Math.log2(6/(256*s**4))+.5:0;i.roughness.value=s,i.lodBias.value=e,this._renderCube(t,o,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=_a());let n=this._blurMaterial,r=n.uniforms,i=this._sourceTarget;r.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,r.envMap.value=i.texture,this._renderCube(e,0,n),r.envMap.value=e.texture,this._renderCube(i,0,n)}};function pa(e,t,n){return new la(e,{minFilter:a,generateMipmaps:t,type:u,colorSpace:A,depthBuffer:n})}function ma(e,t,n){return new Ur({name:e,uniforms:t,vertexShader:Q.cube_vert,fragmentShader:n,side:1,blending:0,depthTest:!1,depthWrite:!1})}function ha(){return ma(`PMREMGGXConvolution`,{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES 256u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function ga(){return ma(`PMREMGGXIntegration`,{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:16}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function _a(){return ma(`PMREMSphericalGaussianBlur`,{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES 20
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function va(){return ma(`PMREMEquirectangularToCubemap`,{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function ya(){return ma(`PMREMCubemapToCubemap`,{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function ba(e){let t=/* @__PURE__ */ new WeakMap,n=/* @__PURE__ */ new WeakMap,r=null;function i(e,t=!1){return e==null?null:t?o(e):a(e)}function a(n){if(n&&n.isTexture){let r=n.mapping;if(r===303||r===304){if(t.has(n)){let e=t.get(n).texture;return s(e,n.mapping)}{let r=n.image;if(r&&r.height>0){let i=new la(r.height);return i.fromEquirectangularTexture(e,n),t.set(n,i),n.addEventListener(`dispose`,l),s(i.texture,n.mapping)}return null}}}return n}function o(t){if(t&&t.isTexture&&t.isPMREMTexture!==!0){let i=t.mapping,a=i===303||i===304,o=i===301||i===302;if(a||o){let i=n.get(t),s=i===void 0?0:i.texture.pmremVersion;if(t.isRenderTargetTexture&&t.pmremVersion!==s)return r===null&&(r=new fa(e)),i=a?r.fromEquirectangular(t,i):r.fromCubemap(t,i),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),i.texture;if(i!==void 0)return i.texture;{let s=t.image;return a&&s&&s.height>0||o&&s&&c(s)?(r===null&&(r=new fa(e)),i=a?r.fromEquirectangular(t):r.fromCubemap(t),i.texture.pmremVersion=t.pmremVersion,n.set(t,i),t.addEventListener(`dispose`,u),i.texture):null}}}return t}function s(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function c(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function l(e){let n=e.target;n.removeEventListener(`dispose`,l);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function u(e){let t=e.target;t.removeEventListener(`dispose`,u);let r=n.get(t);r!==void 0&&(n.delete(t),r.dispose())}function d(){t=/* @__PURE__ */ new WeakMap,n=/* @__PURE__ */ new WeakMap,r!==null&&(r.dispose(),r=null)}return{get:i,dispose:d}}function xa(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r=e.getExtension(n);return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&z(`WebGLRenderer: `+e+` extension not supported.`),t}}}function Sa(e,t,n,r){let i={},a=/* @__PURE__ */ new WeakMap,o=new FinalizationRegistry(e=>delete i[e]);function s(e){c(e.target)}function c(e){e.index!==null&&t.remove(e.index);for(let n in e.attributes)t.remove(e.attributes[n]);e.removeEventListener(`dispose`,s),delete i[e.id],o.unregister(e);let c=a.get(e);c&&(t.remove(c),a.delete(e)),r.releaseStatesOfGeometry(e),e.isInstancedBufferGeometry===!0&&delete e._maxInstanceCount,n.memory.geometries--}function l(e,t){return i[t.id]===void 0&&(t.addEventListener(`dispose`,s),i[t.id]=new WeakRef(t),o.register(t,t.id,t),n.memory.geometries++),t}function u(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function d(e){let n=e.index,r=e.attributes.position,i=0;if(r===void 0)return;let o=n===null?r.array.length/3-1:n.array.length,s=new(r.count>=65535?hn:mn)(Math.ceil(o/3)*6,1),c=s.array;if(n!==null){let e=n.array;i=n.version;for(let t=0,n=0;t<o;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];c[n++]=r,c[n++]=i,c[n++]=i,c[n++]=a,c[n++]=a,c[n++]=r}}else{i=r.version;for(let e=0,t=0;e<o;e+=3){let n=e+0,r=e+1,i=e+2;c[t++]=n,c[t++]=r,c[t++]=r,c[t++]=i,c[t++]=i,c[t++]=n}}s.version=i;let l=a.get(e);l&&t.remove(l),a.set(e,s)}function f(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&d(e)}else d(e);return a.get(e)}function p(){for(let e in i){let t=i[e].deref();t!==void 0&&c(t)}}return{get:l,update:u,getWireframeAttribute:f,dispose:p}}function Ca(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function wa(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:R(`WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function Ta(e,t,n){let r=/* @__PURE__ */ new WeakMap,i=new Je;function a(a,o,s){let c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=u===void 0?0:u.length,f=r.get(o);if(f===void 0||f.count!==d){f!==void 0&&f.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],u=o.morphAttributes.color||[],p=0;e===!0&&(p=1),n===!0&&(p=2),a===!0&&(p=3);let m=o.attributes.position.count*p,h=1;m>t.maxTextureSize&&(h=Math.ceil(m/t.maxTextureSize),m=t.maxTextureSize);let g=new Float32Array(m*h*4*d),_=new Ze(g,m,h,d);_.type=l,_.needsUpdate=!0;let v=p*4;for(let t=0;t<d;t++){let r=s[t],o=c[t],l=u[t],d=m*h*4*t;for(let t=0;t<r.count;t++){let s=t*v;e===!0&&(i.fromBufferAttribute(r,t),g[d+s+0]=i.x,g[d+s+1]=i.y,g[d+s+2]=i.z,g[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),g[d+s+4]=i.x,g[d+s+5]=i.y,g[d+s+6]=i.z,g[d+s+7]=0),a===!0&&(i.fromBufferAttribute(l,t),g[d+s+8]=i.x,g[d+s+9]=i.y,g[d+s+10]=i.z,g[d+s+11]=l.itemSize===4?i.w:1)}}f={count:d,texture:_,size:new V(m,h)},r.set(o,f);function y(){_.dispose(),r.delete(o),o.removeEventListener(`dispose`,y)}o.addEventListener(`dispose`,y)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,f.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,f.size)}return{update:a}}function Ea(e,t,n,r,i){let a=/* @__PURE__ */ new WeakMap;function o(r){let o=i.render.frame,s=r.geometry,l=t.get(r,s);if(a.get(l)!==o&&(t.update(l),a.set(l,o)),r.isInstancedMesh&&(r.hasEventListener(`dispose`,c)===!1&&r.addEventListener(`dispose`,c),a.get(r)!==o&&(n.update(r.instanceMatrix,e.ARRAY_BUFFER),r.instanceColor!==null&&n.update(r.instanceColor,e.ARRAY_BUFFER),a.set(r,o))),r.isSkinnedMesh){let e=r.skeleton;a.get(e)!==o&&(e.update(),a.set(e,o))}return l}function s(){a=/* @__PURE__ */ new WeakMap}function c(e){let t=e.target;t.removeEventListener(`dispose`,c),r.releaseStatesOfObject(t),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:o,dispose:s}}const Da={1:`LINEAR_TONE_MAPPING`,2:`REINHARD_TONE_MAPPING`,3:`CINEON_TONE_MAPPING`,4:`ACES_FILMIC_TONE_MAPPING`,6:`AGX_TONE_MAPPING`,7:`NEUTRAL_TONE_MAPPING`,5:`CUSTOM_TONE_MAPPING`};function Oa(e,t,n,r,i,a){let o=new Xe(t,n,{type:e,depthBuffer:i,stencilBuffer:a,samples:r?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),s=null,c=null,l=null,d=new On;d.setAttribute(`position`,new gn([-1,3,0,-1,-1,0,3,-1,0],3)),d.setAttribute(`uv`,new gn([0,2,0,0,2,0],2));let f=new Wr({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),m=new Qn(d,f),h=new Fi(-1,1,1,-1,0,1),_=null,v=null,y=!1,b,x=null,S=[],C=!1;this.setSize=function(e,t){o.setSize(e,t),s!==null&&s.setSize(e,t),c!==null&&c.setSize(e,t);for(let n=0;n<S.length;n++){let r=S[n];r.setSize&&r.setSize(e,t)}},this.setEffects=function(e){S=e,C=S.length>0&&S[0].isRenderPass===!0;let t=o.width,n=o.height;S.length>0&&s===null&&(s=new Xe(t,n,{type:u,depthBuffer:!1,stencilBuffer:!1}),c=new Xe(t,n,{type:u,depthBuffer:!1,stencilBuffer:!1}));let r=i===!0&&S.some(e=>e.needsDepthTexture===!0);r!==(o.depthTexture!==null)&&(r===!0&&l===null&&(l=new Tr(t,n),a===!0&&(l.format=g,l.type=p)),o.dispose(),o.depthTexture=r?l:null,o.resolveDepthBuffer=r,o.storeMultisampledDepthBuffer=r);for(let e=0;e<S.length;e++){let i=S[e];i.setSize&&i.setSize(t,n),r&&i.needsDepthTexture===!0&&i.setDepthTexture&&i.setDepthTexture(l)}},this.begin=function(e,t){if(y||e.toneMapping===0&&S.length===0)return!1;if(x=t,t!==null){let e=t.width,n=t.height;(o.width!==e||o.height!==n)&&this.setSize(e,n)}return C===!1&&e.setRenderTarget(o),b=e.toneMapping,e.toneMapping=0,!0},this.hasRenderPass=function(){return C},this.end=function(e,t){e.toneMapping=b,y=!0;let n=o,r=s;for(let i=0;i<S.length;i++){let a=S[i];a.enabled!==!1&&(a.render(e,r,n,t),a.needsSwap!==!1&&(n=r,r=r===s?c:s))}if(_!==e.outputColorSpace||v!==e.toneMapping){_=e.outputColorSpace,v=e.toneMapping,f.defines={},J.getTransfer(_)===`srgb`&&(f.defines.SRGB_TRANSFER=``);let t=Da[v];t&&(f.defines[t]=``),f.needsUpdate=!0}f.uniforms.tDiffuse.value=n.texture,e.setRenderTarget(x),e.render(m,h),x=null,y=!1},this.isCompositing=function(){return y},this.dispose=function(){o.dispose(),s!==null&&s.dispose(),c!==null&&c.dispose(),d.dispose(),f.dispose()}}const ka=/*@__PURE__*/ new qe,Aa=/*@__PURE__*/ new Tr(1,1),ja=/*@__PURE__*/ new Er(1),Ma=/*@__PURE__*/ new Ze,Na=/*@__PURE__*/ new Qe,Pa=/*@__PURE__*/ new wr,Fa=[],Ia=[],La=/* @__PURE__ */ new Float32Array(16),Ra=/* @__PURE__ */ new Float32Array(9),za=/* @__PURE__ */ new Float32Array(4);function Ba(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=Fa[i];if(a===void 0&&(a=new Float32Array(i),Fa[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function Va(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function Ha(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function Ua(e,t){let n=Ia[t];n===void 0&&(n=new Int32Array(t),Ia[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function Wa(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Ga(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Va(n,t))return;e.uniform2fv(this.addr,t),Ha(n,t)}}function Ka(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Va(n,t))return;e.uniform3fv(this.addr,t),Ha(n,t)}}function qa(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Va(n,t))return;e.uniform4fv(this.addr,t),Ha(n,t)}}function Ja(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Va(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),Ha(n,t)}else{if(Va(n,r))return;za.set(r),e.uniformMatrix2fv(this.addr,!1,za),Ha(n,r)}}function Ya(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Va(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),Ha(n,t)}else{if(Va(n,r))return;Ra.set(r),e.uniformMatrix3fv(this.addr,!1,Ra),Ha(n,r)}}function Xa(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Va(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),Ha(n,t)}else{if(Va(n,r))return;La.set(r),e.uniformMatrix4fv(this.addr,!1,La),Ha(n,r)}}function Za(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function Qa(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Va(n,t))return;e.uniform2iv(this.addr,t),Ha(n,t)}}function $a(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Va(n,t))return;e.uniform3iv(this.addr,t),Ha(n,t)}}function eo(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Va(n,t))return;e.uniform4iv(this.addr,t),Ha(n,t)}}function to(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function no(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Va(n,t))return;e.uniform2uiv(this.addr,t),Ha(n,t)}}function ro(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Va(n,t))return;e.uniform3uiv(this.addr,t),Ha(n,t)}}function io(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Va(n,t))return;e.uniform4uiv(this.addr,t),Ha(n,t)}}function ao(e){return e.version===0&&(e.compareFunction=519,e.needsUpdate=!0),e}function oo(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;a=this.type===e.SAMPLER_2D_SHADOW?ao(Aa):ka,n.setTexture2D(t||a,i)}function so(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||Na,i)}function co(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;a=this.type===e.SAMPLER_CUBE_SHADOW?ao(ja):Pa,n.setTextureCube(t||a,i)}function lo(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||Ma,i)}function uo(e){switch(e){case 5126:return Wa;case 35664:return Ga;case 35665:return Ka;case 35666:return qa;case 35674:return Ja;case 35675:return Ya;case 35676:return Xa;case 5124:case 35670:return Za;case 35667:case 35671:return Qa;case 35668:case 35672:return $a;case 35669:case 35673:return eo;case 5125:return to;case 36294:return no;case 36295:return ro;case 36296:return io;case 35678:case 36198:case 36298:case 36306:case 35682:return oo;case 35679:case 36299:case 36307:return so;case 35680:case 36300:case 36308:case 36293:return co;case 36289:case 36303:case 36311:case 36292:return lo}}function fo(e,t){e.uniform1fv(this.addr,t)}function po(e,t){let n=Ba(t,this.size,2);e.uniform2fv(this.addr,n)}function mo(e,t){let n=Ba(t,this.size,3);e.uniform3fv(this.addr,n)}function ho(e,t){let n=Ba(t,this.size,4);e.uniform4fv(this.addr,n)}function go(e,t){let n=Ba(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function _o(e,t){let n=Ba(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function vo(e,t){let n=Ba(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function yo(e,t){e.uniform1iv(this.addr,t)}function bo(e,t){e.uniform2iv(this.addr,t)}function xo(e,t){e.uniform3iv(this.addr,t)}function So(e,t){e.uniform4iv(this.addr,t)}function Co(e,t){e.uniform1uiv(this.addr,t)}function wo(e,t){e.uniform2uiv(this.addr,t)}function To(e,t){e.uniform3uiv(this.addr,t)}function Eo(e,t){e.uniform4uiv(this.addr,t)}function Do(e,t,n){let r=this.cache,i=t.length,a=Ua(n,i);Va(r,a)||(e.uniform1iv(this.addr,a),Ha(r,a));let o;o=this.type===e.SAMPLER_2D_SHADOW?ao(Aa):ka;for(let e=0;e!==i;++e)n.setTexture2D(t[e]||o,a[e])}function Oo(e,t,n){let r=this.cache,i=t.length,a=Ua(n,i);Va(r,a)||(e.uniform1iv(this.addr,a),Ha(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||Na,a[e])}function ko(e,t,n){let r=this.cache,i=t.length,a=Ua(n,i);Va(r,a)||(e.uniform1iv(this.addr,a),Ha(r,a));let o;o=this.type===e.SAMPLER_CUBE_SHADOW?ao(ja):Pa;for(let e=0;e!==i;++e)n.setTextureCube(t[e]||o,a[e])}function Ao(e,t,n){let r=this.cache,i=t.length,a=Ua(n,i);Va(r,a)||(e.uniform1iv(this.addr,a),Ha(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||Ma,a[e])}function jo(e){switch(e){case 5126:return fo;case 35664:return po;case 35665:return mo;case 35666:return ho;case 35674:return go;case 35675:return _o;case 35676:return vo;case 5124:case 35670:return yo;case 35667:case 35671:return bo;case 35668:case 35672:return xo;case 35669:case 35673:return So;case 5125:return Co;case 36294:return wo;case 36295:return To;case 36296:return Eo;case 35678:case 36198:case 36298:case 36306:case 35682:return Do;case 35679:case 36299:case 36307:return Oo;case 35680:case 36300:case 36308:case 36293:return ko;case 36289:case 36303:case 36311:case 36292:return Ao}}var Mo=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=uo(t.type)}},No=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=jo(t.type)}},Po=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}};const Fo=/(\w+)(\])?(\[|\.)?/g;function Io(e,t){e.seq.push(t),e.map[t.id]=t}function Lo(e,t,n){let r=e.name,i=r.length;for(Fo.lastIndex=0;;){let a=Fo.exec(r),o=Fo.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){Io(n,l===void 0?new Mo(s,e,t):new No(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new Po(s),Io(n,e)),n=e}}}var Ro=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);Lo(n,e.getUniformLocation(t,n.name),this)}let r=[],i=[];for(let t of this.seq)t.type===e.SAMPLER_2D_SHADOW||t.type===e.SAMPLER_CUBE_SHADOW||t.type===e.SAMPLER_2D_ARRAY_SHADOW?r.push(t):i.push(t);r.length>0&&(this.seq=r.concat(i))}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function zo(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}let Bo=0;function Vo(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}const Ho=/*@__PURE__*/ new W;function Uo(e){J._getMatrix(Ho,J.workingColorSpace,e);let t=`mat3( ${Ho.elements.map(e=>e.toFixed(4))} )`;switch(J.getTransfer(e)){case ee:return[t,`LinearTransferOETF`];case j:return[t,`sRGBTransferOETF`];default:return L(`WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function Wo(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+Vo(e.getShaderSource(t),r)}return i}function Go(e,t){let n=Uo(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( ${n[0]} * value.rgb, value.a ) );`,`}`].join(`
`)}const Ko={1:`Linear`,2:`Reinhard`,3:`Cineon`,4:`ACESFilmic`,6:`AgX`,7:`Neutral`,5:`Custom`};function qo(e,t){let n=Ko[t];return n===void 0?(L(`WebGLProgram: Unsupported toneMapping:`,t),`vec3 `+e+`( vec3 color ) { return LinearToneMapping( color ); }`):`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}const Jo=/*@__PURE__*/ new U;function Yo(){return J.getLuminanceCoefficients(Jo),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${Jo.x.toFixed(4)}, ${Jo.y.toFixed(4)}, ${Jo.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function Xo(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter($o).join(`
`)}function Zo(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function Qo(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function $o(e){return e!==``}function es(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,t.numLightProbeGrids)}function ts(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const ns=/^[ \t]*#include +<([\w\d./]+)>/gm;function rs(e){return e.replace(ns,is)}function is(e,t){let n=Q[t];if(n===void 0)throw Error(`THREE.WebGLProgram: Can not resolve #include <`+t+`>`);return rs(n)}const as=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function os(e){return e.replace(as,ss)}function ss(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function cs(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}const ls={1:`SHADOWMAP_TYPE_PCF`,3:`SHADOWMAP_TYPE_VSM`};function us(e){return ls[e.shadowMapType]||`SHADOWMAP_TYPE_BASIC`}const ds={302:`ENVMAP_MODE_REFRACTION`};function fs(e){return e.envMap===!1?`ENVMAP_MODE_REFLECTION`:ds[e.envMapMode]||`ENVMAP_MODE_REFLECTION`}const ps={0:`ENVMAP_BLENDING_MULTIPLY`,1:`ENVMAP_BLENDING_MIX`,2:`ENVMAP_BLENDING_ADD`};function ms(e){return e.envMap===!1?`ENVMAP_BLENDING_NONE`:ps[e.combine]||`ENVMAP_BLENDING_NONE`}function hs(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=us(n),l=n.envMapPMREM===!0?`ENVMAP_TYPE_PMREM`:`ENVMAP_TYPE_CUBE`,u=fs(n),d=ms(n),f=Xo(n),p=Zo(a),m=i.createProgram(),h,g,_=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(h=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p].filter($o).join(`
`),h.length>0&&(h+=`
`),g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p].filter($o).join(`
`),g.length>0&&(g+=`
`)):(h=[cs(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.diffuseRoughnessMap?`#define USE_DIFFUSE_ROUGHNESSMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.diffuseRoughnessMapUv?`#define DIFFUSE_ROUGHNESSMAP_UV `+n.diffuseRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexNormals?`#define HAS_NORMAL`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter($o).join(`
`),g=[cs(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,p,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,n.envMapPMREM?`#define ENVMAP_MAX_LOD `+n.envMapMaxLod+`.0`:``,n.envMapPMREM?`#define ENVMAP_SIZE `+n.envMapSize+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.packedNormalMap?`#define USE_PACKED_NORMALMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.diffuseRoughness?`#define USE_DIFFUSE_ROUGHNESS`:``,n.diffuseRoughnessMap?`#define USE_DIFFUSE_ROUGHNESSMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.retroreflection?`#define USE_RETROREFLECTION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor?`#define USE_COLOR`:``,n.vertexAlphas||n.batchingColor?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:Q.tonemapping_pars_fragment,n.toneMapping===0?``:qo(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,Q.colorspace_pars_fragment,Go(`linearToOutputTexel`,n.outputColorSpace),Yo(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter($o).join(`
`)),o=rs(o),o=es(o,n),o=ts(o,n),s=rs(s),s=es(s,n),s=ts(s,n),o=os(o),s=os(s),n.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,h=[f,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+h,g=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+g);let v=_+h+o,y=_+g+s,b=zo(i,i.VERTEX_SHADER,v),x=zo(i,i.FRAGMENT_SHADER,y);i.attachShader(m,b),i.attachShader(m,x),n.index0AttributeName===void 0?n.hasPositionAttribute===!0&&i.bindAttribLocation(m,0,`position`):i.bindAttribLocation(m,0,n.index0AttributeName),i.linkProgram(m);function S(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(m)||``,r=i.getShaderInfoLog(b)||``,a=i.getShaderInfoLog(x)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(m,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,m,b,x);else{let e=Wo(i,b,`vertex`),n=Wo(i,x,`fragment`);R(`WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(m,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):L(`WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:h},fragmentShader:{log:c,prefix:g}})}i.deleteShader(b),i.deleteShader(x),C=new Ro(i,m),w=Qo(i,m)}let C;this.getUniforms=function(){return C===void 0&&S(this),C};let w;this.getAttributes=function(){return w===void 0&&S(this),w};let T=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return T===!1&&(T=i.getProgramParameter(m,37297)),T},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(m),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Bo++,this.cacheKey=t,this.usedTimes=1,this.program=m,this.vertexShader=b,this.fragmentShader=x,this}let gs=0;var _s=class{constructor(){this.shaderCache=/* @__PURE__ */ new Map,this.materialCache=/* @__PURE__ */ new Map}update(e,t,n){let r=this._getShaderCacheForMaterial(e);return r.has(t)===!1&&(r.add(t),t.usedTimes++),r.has(n)===!1&&(r.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=/* @__PURE__ */ new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new vs(e),t.set(e,n)),n}},vs=class{constructor(e){this.id=gs++,this.code=e,this.usedTimes=0}};function ys(e){return e===1030||e===37490||e===36285}function bs(e,t,n,r,i,a){let o=new ct,s=new _s,c=/* @__PURE__ */ new Set,l=[],u=/* @__PURE__ */ new Map,d=r.logarithmicDepthBuffer,f={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distance`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function p(e){return c.add(e),e===0?`uv`:`uv${e}`}function m(i,o,l,u,m,h){let g=u.fog,_=m.geometry,v=i.isMeshStandardMaterial||i.isMeshLambertMaterial||i.isMeshPhongMaterial?u.environment:null,y=i.isMeshStandardMaterial||i.isMeshLambertMaterial&&!i.envMap||i.isMeshPhongMaterial&&!i.envMap,b=t.get(i.envMap||v,y),x=f[i.type],S=r.precision;i.precision!==null&&(S=r.getMaxPrecision(i.precision),S!==i.precision&&L(`WebGLProgram.getParameters:`,i.precision,`not supported, using`,S,`instead.`));let C=_.morphAttributes.position||_.morphAttributes.normal||_.morphAttributes.color,w=C===void 0?0:C.length,T=0;_.morphAttributes.position!==void 0&&(T=1),_.morphAttributes.normal!==void 0&&(T=2),_.morphAttributes.color!==void 0&&(T=3);let E,D,O,k;if(x){let e=ea[x];E=e.vertexShader,D=e.fragmentShader}else{E=i.vertexShader,D=i.fragmentShader;let e=s.getVertexShaderStage(i),t=s.getFragmentShaderStage(i);s.update(i,e,t),O=e.id,k=t.id}let A=e.getRenderTarget(),ee=e.state.buffers.depth.getReversed(),j=m.isInstancedMesh===!0,M=m.isBatchedMesh===!0,N=!!i.map,te=!!i.matcap,ne=!!b,P=ne&&b.isPMREMTexture===!0,re=!!i.aoMap,F=!!i.lightMap,ie=!!i.bumpMap&&i.wireframe===!1,I=!!i.normalMap,R=!!i.displacementMap,z=!!i.emissiveMap,ae=!!i.metalnessMap,oe=!!i.roughnessMap,se=i.anisotropy>0,ce=i.clearcoat>0,le=i.diffuseRoughness>0,ue=i.dispersion>0,de=i.retroreflectivity>0,fe=i.iridescence>0,B=i.sheen>0,pe=i.transmission>0,me=se&&!!i.anisotropyMap,he=ce&&!!i.clearcoatMap,ge=ce&&!!i.clearcoatNormalMap,_e=ce&&!!i.clearcoatRoughnessMap,ve=le&&!!i.diffuseRoughnessMap,ye=fe&&!!i.iridescenceMap,be=fe&&!!i.iridescenceThicknessMap,xe=B&&!!i.sheenColorMap,Se=B&&!!i.sheenRoughnessMap,Ce=!!i.specularMap,we=!!i.specularColorMap,Te=!!i.specularIntensityMap,Ee=pe&&!!i.transmissionMap,De=pe&&!!i.thicknessMap,Oe=!!i.gradientMap,ke=!!i.alphaMap,Ae=i.alphaTest>0,je=!!i.alphaHash,Me=!!i.extensions,Ne=0;i.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(Ne=e.toneMapping);let Pe=P?b.isCompressedCubeTexture?b.image[0].mipmaps:b.mipmaps:null,V={shaderID:x,shaderType:i.type,shaderName:i.name,vertexShader:E,fragmentShader:D,defines:i.defines,customVertexShaderID:O,customFragmentShaderID:k,isRawShaderMaterial:i.isRawShaderMaterial===!0,glslVersion:i.glslVersion,precision:S,batching:M,batchingColor:M&&m._colorsTexture!==null,instancing:j,instancingColor:j&&m.instanceColor!==null,instancingMorph:j&&m.morphTexture!==null,outputColorSpace:A===null?e.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:J.workingColorSpace,alphaToCoverage:!!i.alphaToCoverage,map:N,matcap:te,envMap:ne,envMapMode:ne&&b.mapping,envMapPMREM:P,envMapMaxLod:P?Pe.length-1:null,envMapSize:P?Pe[0].width:null,aoMap:re,lightMap:F,bumpMap:ie,normalMap:I,displacementMap:R,emissiveMap:z,normalMapObjectSpace:I&&i.normalMapType===1,normalMapTangentSpace:I&&i.normalMapType===0,packedNormalMap:I&&i.normalMapType===0&&ys(i.normalMap.format),metalnessMap:ae,roughnessMap:oe,anisotropy:se,anisotropyMap:me,clearcoat:ce,clearcoatMap:he,clearcoatNormalMap:ge,clearcoatRoughnessMap:_e,diffuseRoughness:le,diffuseRoughnessMap:ve,dispersion:ue,retroreflection:de,iridescence:fe,iridescenceMap:ye,iridescenceThicknessMap:be,sheen:B,sheenColorMap:xe,sheenRoughnessMap:Se,specularMap:Ce,specularColorMap:we,specularIntensityMap:Te,transmission:pe,transmissionMap:Ee,thicknessMap:De,gradientMap:Oe,opaque:i.transparent===!1&&i.blending===1&&i.alphaToCoverage===!1,alphaMap:ke,alphaTest:Ae,alphaHash:je,combine:i.combine,mapUv:N&&p(i.map.channel),aoMapUv:re&&p(i.aoMap.channel),lightMapUv:F&&p(i.lightMap.channel),bumpMapUv:ie&&p(i.bumpMap.channel),normalMapUv:I&&p(i.normalMap.channel),displacementMapUv:R&&p(i.displacementMap.channel),emissiveMapUv:z&&p(i.emissiveMap.channel),metalnessMapUv:ae&&p(i.metalnessMap.channel),roughnessMapUv:oe&&p(i.roughnessMap.channel),anisotropyMapUv:me&&p(i.anisotropyMap.channel),clearcoatMapUv:he&&p(i.clearcoatMap.channel),clearcoatNormalMapUv:ge&&p(i.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:_e&&p(i.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:ve&&p(i.diffuseRoughnessMap.channel),iridescenceMapUv:ye&&p(i.iridescenceMap.channel),iridescenceThicknessMapUv:be&&p(i.iridescenceThicknessMap.channel),sheenColorMapUv:xe&&p(i.sheenColorMap.channel),sheenRoughnessMapUv:Se&&p(i.sheenRoughnessMap.channel),specularMapUv:Ce&&p(i.specularMap.channel),specularColorMapUv:we&&p(i.specularColorMap.channel),specularIntensityMapUv:Te&&p(i.specularIntensityMap.channel),transmissionMapUv:Ee&&p(i.transmissionMap.channel),thicknessMapUv:De&&p(i.thicknessMap.channel),alphaMapUv:ke&&p(i.alphaMap.channel),vertexTangents:!!_.attributes.tangent&&(I||se),vertexNormals:!!_.attributes.normal,vertexColors:i.vertexColors,vertexAlphas:i.vertexColors===!0&&!!_.attributes.color&&_.attributes.color.itemSize===4,pointsUvs:m.isPoints===!0&&!!_.attributes.uv&&(N||ke),fog:!!g,useFog:i.fog===!0,fogExp2:!!g&&g.isFogExp2,flatShading:i.wireframe===!1&&(i.flatShading===!0||_.attributes.normal===void 0&&I===!1&&(i.isMeshLambertMaterial||i.isMeshPhongMaterial||i.isMeshStandardMaterial||i.isMeshPhysicalMaterial)),sizeAttenuation:i.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:ee,skinning:m.isSkinnedMesh===!0,hasPositionAttribute:_.attributes.position!==void 0,morphTargets:_.morphAttributes.position!==void 0,morphNormals:_.morphAttributes.normal!==void 0,morphColors:_.morphAttributes.color!==void 0,morphTargetsCount:w,morphTextureStride:T,numSunLights:o.sun.length,numDirLights:o.directional.length,numPointLights:o.point.length,numSpotLights:o.spot.length,numSpotLightMaps:o.spotLightMap.length,numRectAreaLights:o.rectArea.length,numHemiLights:o.hemi.length,numSunLightShadows:o.sunShadowMap.length,numDirLightShadows:o.directionalShadowMap.length,numPointLightShadows:o.pointShadowMap.length,numSpotLightShadows:o.spotShadowMap.length,numSpotLightShadowsWithMaps:o.numSpotLightShadowsWithMaps,numLightProbes:o.numLightProbes,numLightProbeGrids:h.filter(e=>e.texture!==null).length,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:i.dithering,shadowMapEnabled:e.shadowMap.enabled&&l.length>0,shadowMapType:e.shadowMap.type,toneMapping:Ne,decodeVideoTexture:N&&i.map.isVideoTexture===!0&&J.getTransfer(i.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:z&&i.emissiveMap.isVideoTexture===!0&&J.getTransfer(i.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:i.premultipliedAlpha,doubleSided:i.side===2,flipSided:i.side===1,useDepthPacking:i.depthPacking>=0,depthPacking:i.depthPacking||0,index0AttributeName:i.index0AttributeName,extensionClipCullDistance:Me&&i.extensions.clipCullDistance===!0&&n.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Me&&i.extensions.multiDraw===!0||M)&&n.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:n.has(`KHR_parallel_shader_compile`),customProgramCacheKey:i.customProgramCacheKey()};return V.vertexUv1s=c.has(1),V.vertexUv2s=c.has(2),V.vertexUv3s=c.has(3),c.clear(),V}function h(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(g(n,t),_(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function g(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapPMREM),e.push(t.envMapMaxLod),e.push(t.envMapSize),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.diffuseRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.numSunLights),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numSunLightShadows),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.numLightProbeGrids),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function _(e,t){o.disableAll(),t.instancing&&o.enable(0),t.instancingColor&&o.enable(1),t.instancingMorph&&o.enable(2),t.matcap&&o.enable(3),t.envMap&&o.enable(4),t.normalMapObjectSpace&&o.enable(5),t.normalMapTangentSpace&&o.enable(6),t.clearcoat&&o.enable(7),t.iridescence&&o.enable(8),t.alphaTest&&o.enable(9),t.vertexColors&&o.enable(10),t.vertexAlphas&&o.enable(11),t.vertexUv1s&&o.enable(12),t.vertexUv2s&&o.enable(13),t.vertexUv3s&&o.enable(14),t.vertexTangents&&o.enable(15),t.anisotropy&&o.enable(16),t.alphaHash&&o.enable(17),t.batching&&o.enable(18),t.dispersion&&o.enable(19),t.retroreflection&&o.enable(24),t.diffuseRoughness&&o.enable(25),t.batchingColor&&o.enable(20),t.gradientMap&&o.enable(21),t.packedNormalMap&&o.enable(22),t.vertexNormals&&o.enable(23),e.push(o.mask),o.disableAll(),t.fog&&o.enable(0),t.useFog&&o.enable(1),t.flatShading&&o.enable(2),t.logarithmicDepthBuffer&&o.enable(3),t.reversedDepthBuffer&&o.enable(4),t.skinning&&o.enable(5),t.morphTargets&&o.enable(6),t.morphNormals&&o.enable(7),t.morphColors&&o.enable(8),t.premultipliedAlpha&&o.enable(9),t.shadowMapEnabled&&o.enable(10),t.doubleSided&&o.enable(11),t.flipSided&&o.enable(12),t.useDepthPacking&&o.enable(13),t.dithering&&o.enable(14),t.transmission&&o.enable(15),t.sheen&&o.enable(16),t.opaque&&o.enable(17),t.pointsUvs&&o.enable(18),t.decodeVideoTexture&&o.enable(19),t.decodeVideoTextureEmissive&&o.enable(20),t.alphaToCoverage&&o.enable(21),t.numLightProbeGrids>0&&o.enable(22),t.hasPositionAttribute&&o.enable(23),e.push(o.mask)}function v(e){let t=f[e.type],n;if(t){let e=ea[t];n=Br.clone(e.uniforms)}else n=e.uniforms;return n}function y(t,n){let r=u.get(n);return r===void 0?(r=new hs(e,n,t,i),l.push(r),u.set(n,r)):++r.usedTimes,r}function b(e){if(--e.usedTimes===0){let t=l.indexOf(e);l[t]=l[l.length-1],l.pop(),u.delete(e.cacheKey),e.destroy()}}function x(e){s.remove(e)}function S(){s.dispose()}return{getParameters:m,getProgramCacheKey:h,getUniforms:v,acquireProgram:y,releaseProgram:b,releaseShaderCache:x,programs:l,dispose:S}}function xs(){let e=/* @__PURE__ */ new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=/* @__PURE__ */ new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function Ss(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.materialVariant===t.materialVariant?e.z===t.z?e.id-t.id:e.z-t.z:e.materialVariant-t.materialVariant:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Cs(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function ws(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(e){let t=0;return e.isInstancedMesh&&(t+=2),e.isSkinnedMesh&&(t+=1),t}function s(n,r,i,a,s,c){let l=e[t];return l===void 0?(l={id:n.id,object:n,geometry:r,material:i,materialVariant:o(n),groupOrder:a,renderOrder:n.renderOrder,z:s,group:c},e[t]=l):(l.id=n.id,l.object=n,l.geometry=r,l.material=i,l.materialVariant=o(n),l.groupOrder=a,l.renderOrder=n.renderOrder,l.z=s,l.group=c),t++,l}function c(e,t,a,o,c,l,u){u.reversedDepth===!0&&(c=-c);let d=s(e,t,a,o,c,l);a.transmission>0?r.push(d):a.transparent===!0?i.push(d):n.push(d)}function l(e,t,a,o,c,l){let u=s(e,t,a,o,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function u(e,t){n.length>1&&n.sort(e||Ss),r.length>1&&r.sort(t||Cs),i.length>1&&i.sort(t||Cs)}function d(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:c,unshift:l,finish:d,sort:u}}function Ts(){let e=/* @__PURE__ */ new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new ws,e.set(t,[i])):n>=r.length?(i=new ws,r.push(i)):i=r[n],i}function n(){e=/* @__PURE__ */ new WeakMap}return{get:t,dispose:n}}function Es(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={direction:new U,color:new Z};break;case`SpotLight`:n={position:new U,direction:new U,color:new Z,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new U,color:new Z,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new U,skyColor:new Z,groundColor:new Z};break;case`RectAreaLight`:n={color:new Z,position:new U,halfWidth:new U,halfHeight:new U}}return e[t.id]=n,n}}}function Ds(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`SunLight`:case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new V};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new V};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new V,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}let Os=0;function ks(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function As(e){let t=new Es,n=Ds(),r={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new U);let i=new U,a=new Y,o=new Y;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0,y=0,b=0,x=0;i.sort(ks);for(let e=0,S=i.length;e<S;e++){let S=i[e],C=S.color,w=S.intensity,T=S.distance,E=null;if(S.shadow&&S.shadow.map&&(E=S.shadow.map.texture.format===1030?S.shadow.map.texture:S.shadow.map.depthTexture||S.shadow.map.texture),S.isAmbientLight)a+=C.r*w,o+=C.g*w,s+=C.b*w;else if(S.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(S.sh.coefficients[e],w);x++}else if(S.isSunLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize.copy(e.mapSize).multiply(e.getFrameExtents()),r.sunShadow[l]=t,r.sunShadowMap[l]=E;let i=e.getViewportCount();for(let t=0;t<i;t++)r.sunShadowMatrix[u+t]=e.getMatrix(t),r.sunShadowCascade[u+t]=e._cascadeData[t];u+=i,l++}r.sun[c]=e,c++}else if(S.isDirectionalLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[d]=t,r.directionalShadowMap[d]=E,r.directionalShadowMatrix[d]=S.shadow.matrix,g++}r.directional[d]=e,d++}else if(S.isSpotLight){let e=t.get(S);e.position.setFromMatrixPosition(S.matrixWorld),e.color.copy(C).multiplyScalar(w),e.distance=T,e.coneCos=Math.cos(S.angle),e.penumbraCos=Math.cos(S.angle*(1-S.penumbra)),e.decay=S.decay,r.spot[p]=e;let i=S.shadow;if(S.map&&(r.spotLightMap[y]=S.map,y++,i.updateMatrices(S),S.castShadow&&b++),r.spotLightMatrix[p]=i.matrix,S.castShadow){let e=n.get(S);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[p]=e,r.spotShadowMap[p]=E,v++}p++}else if(S.isRectAreaLight){let e=t.get(S);e.color.copy(C).multiplyScalar(w),e.halfWidth.set(S.width*.5,0,0),e.halfHeight.set(0,S.height*.5,0),r.rectArea[m]=e,m++}else if(S.isPointLight){let e=t.get(S);if(e.color.copy(S.color).multiplyScalar(S.intensity),e.distance=S.distance,e.decay=S.decay,S.castShadow){let e=S.shadow,t=n.get(S);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[f]=t,r.pointShadowMap[f]=E,r.pointShadowMatrix[f]=S.shadow.matrix,_++}r.point[f]=e,f++}else if(S.isHemisphereLight){let e=t.get(S);e.skyColor.copy(S.color).multiplyScalar(w),e.groundColor.copy(S.groundColor).multiplyScalar(w),r.hemi[h]=e,h++}}m>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=$.LTC_FLOAT_1,r.rectAreaLTC2=$.LTC_FLOAT_2):(r.rectAreaLTC1=$.LTC_HALF_1,r.rectAreaLTC2=$.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let S=r.hash;(S.sunLength!==c||S.directionalLength!==d||S.pointLength!==f||S.spotLength!==p||S.rectAreaLength!==m||S.hemiLength!==h||S.numSunShadows!==l||S.numDirectionalShadows!==g||S.numPointShadows!==_||S.numSpotShadows!==v||S.numSpotMaps!==y||S.numLightProbes!==x)&&(r.sun.length=c,r.directional.length=d,r.spot.length=p,r.rectArea.length=m,r.point.length=f,r.hemi.length=h,r.sunShadow.length=l,r.sunShadowMap.length=l,r.sunShadowMatrix.length=u,r.sunShadowCascade.length=u,r.directionalShadow.length=g,r.directionalShadowMap.length=g,r.directionalShadowMatrix.length=g,r.pointShadow.length=_,r.pointShadowMap.length=_,r.pointShadowMatrix.length=_,r.spotShadow.length=v,r.spotShadowMap.length=v,r.spotLightMatrix.length=v+y-b,r.spotLightMap.length=y,r.numSpotLightShadowsWithMaps=b,r.numLightProbes=x,S.sunLength=c,S.directionalLength=d,S.pointLength=f,S.spotLength=p,S.rectAreaLength=m,S.hemiLength=h,S.numSunShadows=l,S.numDirectionalShadows=g,S.numPointShadows=_,S.numSpotShadows=v,S.numSpotMaps=y,S.numLightProbes=x,r.version=Os++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=0,f=t.matrixWorldInverse;for(let t=0,p=e.length;t<p;t++){let p=e[t];if(p.isSunLight){let e=r.sun[n];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),n++}else if(p.isDirectionalLight){let e=r.directional[s];e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),s++}else if(p.isSpotLight){let e=r.spot[l];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),e.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(f),l++}else if(p.isRectAreaLight){let e=r.rectArea[u];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),o.identity(),a.copy(p.matrixWorld),a.premultiply(f),o.extractRotation(a),e.halfWidth.set(p.width*.5,0,0),e.halfHeight.set(0,p.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),u++}else if(p.isPointLight){let e=r.point[c];e.position.setFromMatrixPosition(p.matrixWorld),e.position.applyMatrix4(f),c++}else if(p.isHemisphereLight){let e=r.hemi[d];e.direction.setFromMatrixPosition(p.matrixWorld),e.direction.transformDirection(f),d++}}}return{setup:s,setupView:c,state:r}}function js(e){let t=new As(e),n=[],r=[],i=[];function a(e){u.camera=e,n.length=0,r.length=0,i.length=0}function o(e){e.isLightProbeGrid?i.push(e):n.push(e)}function s(e){r.push(e)}function c(){t.setup(n),i.sort((e,t)=>e.priority-t.priority||e.id-t.id)}function l(e){t.setupView(n,e)}let u={lightsArray:n,shadowsArray:r,lightProbeGridArray:i,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:a,state:u,setupLights:c,setupLightsView:l,pushLight:o,pushShadow:s}}function Ms(e){let t=/* @__PURE__ */ new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new js(e),t.set(n,[a])):r>=i.length?(a=new js(e),i.push(a)):a=i[r],a}function r(){t=/* @__PURE__ */ new WeakMap}return{get:n,dispose:r}}const Ns=[/*@__PURE__*/ new U(1,0,0),/*@__PURE__*/ new U(-1,0,0),/*@__PURE__*/ new U(0,1,0),/*@__PURE__*/ new U(0,-1,0),/*@__PURE__*/ new U(0,0,1),/*@__PURE__*/ new U(0,0,-1)],Ps=[/*@__PURE__*/ new U(0,-1,0),/*@__PURE__*/ new U(0,-1,0),/*@__PURE__*/ new U(0,0,1),/*@__PURE__*/ new U(0,0,-1),/*@__PURE__*/ new U(0,-1,0),/*@__PURE__*/ new U(0,-1,0)],Fs=/*@__PURE__*/ new Y,Is=/*@__PURE__*/ new U,Ls=/*@__PURE__*/ new U;function Rs(e,t,n){let a=new mr,o=new V,s=new V,d=new Je,f=new Kr,p=new qr,m={},g=n.maxTextureSize,_={0:1,1:0,2:2},v=new Ur({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new V},radius:{value:4}},vertexShader:`void main() {
	gl_Position = vec4( position, 1.0 );
}`,fragmentShader:`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`}),b=v.clone();b.defines.HORIZONTAL_PASS=1;let x=new On;x.setAttribute(`position`,new pn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let S=new Qn(x,v),C=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let w=this.type;this.render=function(t,n,f){if(C.enabled===!1||C.autoUpdate===!1&&C.needsUpdate===!1||t.length===0)return;this.type===2&&(L(`WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead.`),this.type=1);let p=e.getRenderTarget(),m=e.getActiveCubeFace(),_=e.getActiveMipmapLevel(),v=e.state;v.setBlending(0),v.buffers.depth.getReversed()===!0?v.buffers.color.setClear(0,0,0,0):v.buffers.color.setClear(1,1,1,1),v.buffers.depth.setTest(!0),v.setScissorTest(!1);let b=w!==this.type;b&&n.traverse(function(e){e.material&&(Array.isArray(e.material)?e.material.forEach(e=>e.needsUpdate=!0):e.material.needsUpdate=!0)});for(let p=0,m=t.length;p<m;p++){let m=t[p],_=m.shadow;if(_===void 0){L(`WebGLShadowMap:`,m,`has no shadow.`);continue}if(_.autoUpdate===!1&&_.needsUpdate===!1)continue;o.copy(_.mapSize);let x=_.getFrameExtents();o.multiply(x),s.copy(_.mapSize),(o.x>g||o.y>g)&&(o.x>g&&(s.x=Math.floor(g/x.x),o.x=s.x*x.x,_.mapSize.x=s.x),o.y>g&&(s.y=Math.floor(g/x.y),o.y=s.y*x.y,_.mapSize.y=s.y));let S=e.state.buffers.depth.getReversed();if(_.camera._reversedDepth=S,_.map===null||b===!0){if(_.map!==null&&(_.map.depthTexture!==null&&(_.map.depthTexture.dispose(),_.map.depthTexture=null),_.map.dispose()),this.type===3){if(m.isPointLight){L(`WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.`);continue}_.map=new Xe(o.x,o.y,{format:y,type:u,minFilter:i,magFilter:i,generateMipmaps:!1}),_.map.texture.name=m.name+`.shadowMap`,_.map.depthTexture=new Tr(o.x,o.y,l),_.map.depthTexture.name=m.name+`.shadowMapDepth`,_.map.depthTexture.format=h,_.map.depthTexture.compareFunction=null,_.map.depthTexture.minFilter=r,_.map.depthTexture.magFilter=r}else m.isPointLight?(_.map=new la(o.x),_.map.depthTexture=new Er(o.x,c)):(_.map=new Xe(o.x,o.y),_.map.depthTexture=new Tr(o.x,o.y,c)),_.map.depthTexture.name=m.name+`.shadowMap`,_.map.depthTexture.format=h,this.type===1?(_.map.depthTexture.compareFunction=S?518:515,_.map.depthTexture.minFilter=i,_.map.depthTexture.magFilter=i):(_.map.depthTexture.compareFunction=null,_.map.depthTexture.minFilter=r,_.map.depthTexture.magFilter=r);_.camera.updateProjectionMatrix()}_.map.isWebGLCubeRenderTarget!==!0&&(_.map.width!==o.x||_.map.height!==o.y)&&_.map.setSize(o.x,o.y);let C=_.map.isWebGLCubeRenderTarget?6:_.getViewportCount();m.isPointLight!==!0&&_.updateMatrices(m,f);let w=_.camera.layers.mask&4294967294?_.camera.layers:f.layers;for(let t=0;t<C;t++){let r=_.getCamera(t);if(m.isPointLight){let e=_.camera,n=_.matrix,r=m.distance||e.far;r!==e.far&&(e.far=r,e.updateProjectionMatrix()),Is.setFromMatrixPosition(m.matrixWorld),e.position.copy(Is),Ls.copy(e.position),Ls.add(Ns[t]),e.up.copy(Ps[t]),e.lookAt(Ls),e.updateMatrixWorld(),n.makeTranslation(-Is.x,-Is.y,-Is.z),Fs.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),_._frustum.setFromProjectionMatrix(Fs,e.coordinateSystem,e.reversedDepth)}if(_.map.isWebGLCubeRenderTarget)e.setRenderTarget(_.map,t),e.clear();else{t===0&&(e.setRenderTarget(_.map),e.clear());let n=_.getViewport(t);d.set(s.x*n.x,s.y*n.y,s.x*n.z,s.y*n.w),v.viewport(d)}a=_.getFrustum(t),D(n,f,r,m,w,this.type)}_.isPointLightShadow!==!0&&this.type===3&&T(_,f),_.needsUpdate=!1}w=this.type,C.needsUpdate=!1,e.setRenderTarget(p,m,_)};function T(n,r){let i=t.update(S);v.defines.VSM_SAMPLES!==n.blurSamples&&(v.defines.VSM_SAMPLES=n.blurSamples,b.defines.VSM_SAMPLES=n.blurSamples,v.needsUpdate=!0,b.needsUpdate=!0),n.mapPass===null?n.mapPass=new Xe(o.x,o.y,{format:y,type:u}):(n.mapPass.width!==n.map.width||n.mapPass.height!==n.map.height)&&n.mapPass.setSize(n.map.width,n.map.height),v.uniforms.shadow_pass.value=n.map.depthTexture,v.uniforms.resolution.value.set(n.map.width,n.map.height),v.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,i,v,S,null),b.uniforms.shadow_pass.value=n.mapPass.texture,b.uniforms.resolution.value.set(n.map.width,n.map.height),b.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,i,b,S,null)}function E(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?p:f,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=m[e];r===void 0&&(r={},m[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,O)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?_[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function D(n,r,i,o,s,c){if(n.visible===!1)return;if(n.layers.test(s)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&c===3)&&(!n.frustumCulled||n.intersectsFrustum(a))){n.modelViewMatrix.multiplyMatrices(i.matrixWorldInverse,n.matrixWorld);let a=t.update(n),s=n.material;if(Array.isArray(s)){let t=a.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=s[u.materialIndex];if(d&&d.visible){let t=E(n,d,o,c);n.onBeforeShadow(e,n,r,i,a,t,u),e.renderBufferDirect(i,null,a,t,n,u),n.onAfterShadow(e,n,r,i,a,t,u)}}}else if(s.visible){let t=E(n,s,o,c);n.onBeforeShadow(e,n,r,i,a,t,null),e.renderBufferDirect(i,null,a,t,n,null),n.onAfterShadow(e,n,r,i,a,t,null)}}let l=n.children;for(let e=0,t=l.length;e<t;e++)D(l[e],r,i,o,s,c)}function O(e){e.target.removeEventListener(`dispose`,O);for(let t in m){let n=m[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}function zs(e,t){function n(){let t=!1,n=new Je,r=null,i=new Je(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?ae(e.DEPTH_TEST):se(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=oe[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(o=t,r&&(t=1-t),e.clearDepth(t))},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?ae(e.STENCIL_TEST):se(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c={},l=/* @__PURE__ */ new WeakMap,u={},d={},f={},p=/* @__PURE__ */ new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new Z(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,ee=null,j=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),M=!1,N=0,te=e.getParameter(e.VERSION);te.indexOf(`WebGL`)===-1?te.indexOf(`OpenGL ES`)!==-1&&(N=parseFloat(/^OpenGL ES (\d)/.exec(te)[1]),M=N>=2):(N=parseFloat(/^WebGL (\d)/.exec(te)[1]),M=N>=1);let ne=null,P={},re=e.getParameter(e.SCISSOR_BOX),F=e.getParameter(e.VIEWPORT),ie=new Je().fromArray(re),I=new Je().fromArray(F);function L(t,n,r,i){let a=/* @__PURE__ */ new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let z={};z[e.TEXTURE_2D]=L(e.TEXTURE_2D,e.TEXTURE_2D,1),z[e.TEXTURE_CUBE_MAP]=L(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),z[e.TEXTURE_2D_ARRAY]=L(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),z[e.TEXTURE_3D]=L(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),ae(e.DEPTH_TEST),o.setFunc(3),me(!1),he(1),ae(e.CULL_FACE),B(0);function ae(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function se(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function ce(t,n){return f[t]!==n&&(e.bindFramebuffer(t,n),f[t]=n,t===e.DRAW_FRAMEBUFFER&&(f[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(f[e.DRAW_FRAMEBUFFER]=n),!0)}function le(t,n){let r=m,i=!1;if(t){r=p.get(n),r===void 0&&(r=[],p.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function ue(t){return h!==t&&(e.useProgram(t),h=t,!0)}let de={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};de[103]=e.MIN,de[104]=e.MAX;let fe={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function B(t,n,r,i,a,o,s,c,l,u){if(t===0)g===!0&&(se(e.BLEND),g=!1);else if(g===!1&&(ae(e.BLEND),g=!0),t!==5){if(t!==_||u!==E){if((v!==100||x!==100)&&(e.blendEquation(e.FUNC_ADD),v=100,x=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:R(`WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:R(`WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:R(`WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:R(`WebGLState: Invalid blending: `,t)}y=null,b=null,S=null,C=null,w.set(0,0,0),T=0,_=t,E=u}}else a||=n,o||=r,s||=i,(n!==v||a!==x)&&(e.blendEquationSeparate(de[n],de[a]),v=n,x=a),(r!==y||i!==b||o!==S||s!==C)&&(e.blendFuncSeparate(fe[r],fe[i],fe[o],fe[s]),y=r,b=i,S=o,C=s),(c.equals(w)===!1||l!==T)&&(e.blendColor(c.r,c.g,c.b,l),w.copy(c),T=l),_=t,E=!1}function pe(t,n){t.side===2?se(e.CULL_FACE):ae(e.CULL_FACE);let r=t.side===1;n&&(r=!r),me(r),t.blending===1&&t.transparent===!1?B(0):B(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),_e(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?ae(e.SAMPLE_ALPHA_TO_COVERAGE):se(e.SAMPLE_ALPHA_TO_COVERAGE)}function me(t){D!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),D=t)}function he(t){t===0?se(e.CULL_FACE):(ae(e.CULL_FACE),t!==O&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),O=t}function ge(t){t!==k&&(M&&e.lineWidth(t),k=t)}function _e(t,n,r){t?(ae(e.POLYGON_OFFSET_FILL),(A!==n||ee!==r)&&(A=n,ee=r,o.getReversed()&&(n=-n,r=-r),e.polygonOffset(n,r))):se(e.POLYGON_OFFSET_FILL)}function ve(t){t?ae(e.SCISSOR_TEST):se(e.SCISSOR_TEST)}function ye(t){t===void 0&&(t=e.TEXTURE0+j-1),ne!==t&&(e.activeTexture(t),ne=t)}function be(t,n,r){r===void 0&&(r=ne===null?e.TEXTURE0+j-1:ne);let i=P[r];i===void 0&&(i={type:void 0,texture:void 0},P[r]=i),(i.type!==t||i.texture!==n)&&(ne!==r&&(e.activeTexture(r),ne=r),e.bindTexture(t,n||z[t]),i.type=t,i.texture=n)}function xe(){let t=P[ne];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function Se(){try{e.compressedTexImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Ce(){try{e.compressedTexImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function we(){try{e.texSubImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Te(){try{e.texSubImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Ee(){try{e.compressedTexSubImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function De(){try{e.compressedTexSubImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Oe(){try{e.texStorage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function ke(){try{e.texStorage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Ae(){try{e.texImage2D(...arguments)}catch(e){R(`WebGLState:`,e)}}function je(){try{e.texImage3D(...arguments)}catch(e){R(`WebGLState:`,e)}}function Me(t){return d[t]===void 0?e.getParameter(t):d[t]}function Ne(t,n){d[t]!==n&&(e.pixelStorei(t,n),d[t]=n)}function Pe(t){ie.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),ie.copy(t))}function V(t){I.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),I.copy(t))}function H(t,n){let r=l.get(n);r===void 0&&(r=/* @__PURE__ */ new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),e.uniformBlockBinding(n,i,i),r.set(t,i))}function U(t,n,r){let i=l.get(n).get(t);c[i]!==r&&(e.bindBufferBase(e.UNIFORM_BUFFER,i,r),c[i]=r)}function Fe(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),e.pixelStorei(e.PACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_ALIGNMENT,4),e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,!1),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,e.BROWSER_DEFAULT_WEBGL),e.pixelStorei(e.PACK_ROW_LENGTH,0),e.pixelStorei(e.PACK_SKIP_PIXELS,0),e.pixelStorei(e.PACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_ROW_LENGTH,0),e.pixelStorei(e.UNPACK_IMAGE_HEIGHT,0),e.pixelStorei(e.UNPACK_SKIP_PIXELS,0),e.pixelStorei(e.UNPACK_SKIP_ROWS,0),e.pixelStorei(e.UNPACK_SKIP_IMAGES,0),u={},d={},ne=null,P={},f={},c={},p=/* @__PURE__ */ new WeakMap,m=[],h=null,g=!1,_=null,v=null,y=null,b=null,x=null,S=null,C=null,w=new Z(0,0,0),T=0,E=!1,D=null,O=null,k=null,A=null,ee=null,ie.set(0,0,e.canvas.width,e.canvas.height),I.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:ae,disable:se,bindFramebuffer:ce,drawBuffers:le,useProgram:ue,setBlending:B,setMaterial:pe,setFlipSided:me,setCullFace:he,setLineWidth:ge,setPolygonOffset:_e,setScissorTest:ve,activeTexture:ye,bindTexture:be,unbindTexture:xe,compressedTexImage2D:Se,compressedTexImage3D:Ce,texImage2D:Ae,texImage3D:je,pixelStorei:Ne,getParameter:Me,updateUBOMapping:H,uniformBlockBinding:U,texStorage2D:Oe,texStorage3D:ke,texSubImage2D:we,texSubImage3D:Te,compressedTexSubImage2D:Ee,compressedTexSubImage3D:De,scissor:Pe,viewport:V,reset:Fe}}function Bs(o,s,c,l,u,d,f){let p=s.has(`WEBGL_multisampled_render_to_texture`)?s.get(`WEBGL_multisampled_render_to_texture`):null,m=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),h=new V,_=/* @__PURE__ */ new WeakMap,v=/* @__PURE__ */ new Set,y,b=/* @__PURE__ */ new WeakMap,x=/* @__PURE__ */ new Set,S=new FinalizationRegistry(e=>x.delete(e)),C=!1;try{C=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function w(e,t){return C?new OffscreenCanvas(e,t):P(`canvas`)}function T(e,t,n){let r=1,i=Fe(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);y===void 0&&(y=w(n,a));let o=t?w(n,a):y;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),L(`WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&L(`WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function E(e){return e.generateMipmaps}function D(e){o.generateMipmap(e)}function O(e){return e.isWebGLCubeRenderTarget?o.TEXTURE_CUBE_MAP:e.isWebGL3DRenderTarget?o.TEXTURE_3D:e.isWebGLArrayRenderTarget||e.isCompressedArrayTexture?o.TEXTURE_2D_ARRAY:o.TEXTURE_2D}function k(e,t,n,r,i,a=!1){if(e!==null){if(o[e]!==void 0)return o[e];L(`WebGLRenderer: Attempt to use non-existing WebGL internal format '`+e+`'`)}let c;r&&(c=s.get(`EXT_texture_norm16`),c||L(`WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension`));let l=t;if(t===o.RED&&(n===o.FLOAT&&(l=o.R32F),n===o.HALF_FLOAT&&(l=o.R16F),n===o.UNSIGNED_BYTE&&(l=o.R8),n===o.UNSIGNED_SHORT&&c&&(l=c.R16_EXT),n===o.SHORT&&c&&(l=c.R16_SNORM_EXT)),t===o.RED_INTEGER&&(n===o.UNSIGNED_BYTE&&(l=o.R8UI),n===o.UNSIGNED_SHORT&&(l=o.R16UI),n===o.UNSIGNED_INT&&(l=o.R32UI),n===o.BYTE&&(l=o.R8I),n===o.SHORT&&(l=o.R16I),n===o.INT&&(l=o.R32I)),t===o.RG&&(n===o.FLOAT&&(l=o.RG32F),n===o.HALF_FLOAT&&(l=o.RG16F),n===o.UNSIGNED_BYTE&&(l=o.RG8),n===o.UNSIGNED_SHORT&&c&&(l=c.RG16_EXT),n===o.SHORT&&c&&(l=c.RG16_SNORM_EXT)),t===o.RG_INTEGER&&(n===o.UNSIGNED_BYTE&&(l=o.RG8UI),n===o.UNSIGNED_SHORT&&(l=o.RG16UI),n===o.UNSIGNED_INT&&(l=o.RG32UI),n===o.BYTE&&(l=o.RG8I),n===o.SHORT&&(l=o.RG16I),n===o.INT&&(l=o.RG32I)),t===o.RGB_INTEGER&&(n===o.UNSIGNED_BYTE&&(l=o.RGB8UI),n===o.UNSIGNED_SHORT&&(l=o.RGB16UI),n===o.UNSIGNED_INT&&(l=o.RGB32UI),n===o.BYTE&&(l=o.RGB8I),n===o.SHORT&&(l=o.RGB16I),n===o.INT&&(l=o.RGB32I)),t===o.RGBA_INTEGER&&(n===o.UNSIGNED_BYTE&&(l=o.RGBA8UI),n===o.UNSIGNED_SHORT&&(l=o.RGBA16UI),n===o.UNSIGNED_INT&&(l=o.RGBA32UI),n===o.BYTE&&(l=o.RGBA8I),n===o.SHORT&&(l=o.RGBA16I),n===o.INT&&(l=o.RGBA32I)),t===o.RGB&&(n===o.UNSIGNED_SHORT&&c&&(l=c.RGB16_EXT),n===o.SHORT&&c&&(l=c.RGB16_SNORM_EXT),n===o.UNSIGNED_INT_5_9_9_9_REV&&(l=o.RGB9_E5),n===o.UNSIGNED_INT_10F_11F_11F_REV&&(l=o.R11F_G11F_B10F)),t===o.RGBA){let e=a?ee:J.getTransfer(i);n===o.FLOAT&&(l=o.RGBA32F),n===o.HALF_FLOAT&&(l=o.RGBA16F),n===o.UNSIGNED_BYTE&&(l=e===`srgb`?o.SRGB8_ALPHA8:o.RGBA8),n===o.UNSIGNED_SHORT&&c&&(l=c.RGBA16_EXT),n===o.SHORT&&c&&(l=c.RGBA16_SNORM_EXT),n===o.UNSIGNED_SHORT_4_4_4_4&&(l=o.RGBA4),n===o.UNSIGNED_SHORT_5_5_5_1&&(l=o.RGB5_A1)}return(l===o.R16F||l===o.R32F||l===o.RG16F||l===o.RG32F||l===o.RGBA16F||l===o.RGBA32F)&&s.get(`EXT_color_buffer_float`),l}function A(e,t){let n;return e?t===null||t===1014||t===1020?n=o.DEPTH24_STENCIL8:t===1015?n=o.DEPTH32F_STENCIL8:t===1012&&(n=o.DEPTH24_STENCIL8,L(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):t===null||t===1014||t===1020?n=o.DEPTH_COMPONENT24:t===1015?n=o.DEPTH_COMPONENT32F:t===1012&&(n=o.DEPTH_COMPONENT16),n}function j(e,t){return E(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function M(e){let t=new WeakRef(e);l.get(e).__ref=t,x.add(t),S.register(e,t,t)}function N(e){let t=l.get(e).__ref;t!==void 0&&(x.delete(t),S.unregister(t))}function te(e){re(e.target)}function ne(e){F(e.target)}function re(e){e.removeEventListener(`dispose`,te),N(e),I(e),e.isVideoTexture&&_.delete(e),e.isHTMLTexture&&v.delete(e)}function F(e){e.removeEventListener(`dispose`,ne),N(e),ae(e)}function ie(){for(let e of x){let t=e.deref();t!==void 0&&(t.isRenderTarget===!0?F(t):re(t))}x.clear(),v.clear()}function I(e){let t=l.get(e);if(t.__webglInit===void 0)return;let n=e.source,r=b.get(n);if(r){let i=r[t.__cacheKey];i.usedTimes--,i.usedTimes===0&&z(e),Object.keys(r).length===0&&b.delete(n)}l.remove(e)}function z(e){let t=l.get(e);o.deleteTexture(t.__webglTexture);let n=e.source,r=b.get(n);delete r[t.__cacheKey],f.memory.textures--}function ae(e){let t=l.get(e);t.__depthDisposeCallback&&t.__depthDisposeCallback();let n=e.depthTexture;if(n&&n.renderTarget===e&&re(n),e.isWebGLCubeRenderTarget)for(let e=0;e<6;e++){if(Array.isArray(t.__webglFramebuffer[e]))for(let n=0;n<t.__webglFramebuffer[e].length;n++)o.deleteFramebuffer(t.__webglFramebuffer[e][n]);else o.deleteFramebuffer(t.__webglFramebuffer[e]);t.__webglDepthbuffer&&o.deleteRenderbuffer(t.__webglDepthbuffer[e])}else{if(Array.isArray(t.__webglFramebuffer))for(let e=0;e<t.__webglFramebuffer.length;e++)o.deleteFramebuffer(t.__webglFramebuffer[e]);else o.deleteFramebuffer(t.__webglFramebuffer);if(t.__webglDepthbuffer&&o.deleteRenderbuffer(t.__webglDepthbuffer),t.__webglMultisampledFramebuffer&&o.deleteFramebuffer(t.__webglMultisampledFramebuffer),t.__webglColorRenderbuffer)for(let e=0;e<t.__webglColorRenderbuffer.length;e++)t.__webglColorRenderbuffer[e]&&o.deleteRenderbuffer(t.__webglColorRenderbuffer[e]);t.__webglDepthRenderbuffer&&o.deleteRenderbuffer(t.__webglDepthRenderbuffer)}let r=e.textures;for(let e=0,t=r.length;e<t;e++){let t=l.get(r[e]);t.__webglTexture&&(o.deleteTexture(t.__webglTexture),f.memory.textures--),l.remove(r[e])}l.remove(e)}let oe=0;function se(){oe=0}function ce(){return oe}function le(e){oe=e}function ue(){let e=oe;return e>=u.maxTextures&&L(`WebGLTextures: Trying to use `+(e+1)+` texture units while this GPU supports only `+u.maxTextures),oe+=1,e}function de(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.mipmapsAutoUpdate),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function fe(e,t){let n=l.get(e);if(e.isVideoTexture&&H(e),e.isRenderTargetTexture===!1&&e.isExternalTexture!==!0&&e.version>0&&n.__version!==e.version){let r=e.image;if(r===null)L(`WebGLRenderer: Texture marked for update but no image data found.`);else if(r.complete===!1)L(`WebGLRenderer: Texture marked for update but image is incomplete`);else{Se(n,e,t);return}}else e.isExternalTexture&&(n.__webglTexture=e.sourceTexture?e.sourceTexture:null);c.bindTexture(o.TEXTURE_2D,n.__webglTexture,o.TEXTURE0+t)}function B(e,t){let n=l.get(e);e.isRenderTargetTexture===!1&&e.version>0&&n.__version!==e.version?Se(n,e,t):(e.isExternalTexture&&(n.__webglTexture=e.sourceTexture?e.sourceTexture:null),c.bindTexture(o.TEXTURE_2D_ARRAY,n.__webglTexture,o.TEXTURE0+t))}function pe(e,t){let n=l.get(e);e.isRenderTargetTexture===!1&&e.version>0&&n.__version!==e.version?Se(n,e,t):c.bindTexture(o.TEXTURE_3D,n.__webglTexture,o.TEXTURE0+t)}function me(e,t){let n=l.get(e);e.version>0&&n.__version!==e.version?Ce(n,e,t):c.bindTexture(o.TEXTURE_CUBE_MAP,n.__webglTexture,o.TEXTURE0+t)}let he={[e]:o.REPEAT,[t]:o.CLAMP_TO_EDGE,[n]:o.MIRRORED_REPEAT},ge={[r]:o.NEAREST,1004:o.NEAREST_MIPMAP_NEAREST,1005:o.NEAREST_MIPMAP_LINEAR,[i]:o.LINEAR,1007:o.LINEAR_MIPMAP_NEAREST,[a]:o.LINEAR_MIPMAP_LINEAR},_e={512:o.NEVER,519:o.ALWAYS,513:o.LESS,515:o.LEQUAL,514:o.EQUAL,518:o.GEQUAL,516:o.GREATER,517:o.NOTEQUAL};function ve(e,t){if(t.type===1015&&s.has(`OES_texture_float_linear`)===!1&&(t.magFilter===1006||t.magFilter===1007||t.magFilter===1005||t.magFilter===1008||t.minFilter===1006||t.minFilter===1007||t.minFilter===1005||t.minFilter===1008)&&L(`WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),o.texParameteri(e,o.TEXTURE_WRAP_S,he[t.wrapS]),o.texParameteri(e,o.TEXTURE_WRAP_T,he[t.wrapT]),(e===o.TEXTURE_3D||e===o.TEXTURE_2D_ARRAY)&&o.texParameteri(e,o.TEXTURE_WRAP_R,he[t.wrapR]),o.texParameteri(e,o.TEXTURE_MAG_FILTER,ge[t.magFilter]),o.texParameteri(e,o.TEXTURE_MIN_FILTER,ge[t.minFilter]),t.compareFunction&&(o.texParameteri(e,o.TEXTURE_COMPARE_MODE,o.COMPARE_REF_TO_TEXTURE),o.texParameteri(e,o.TEXTURE_COMPARE_FUNC,_e[t.compareFunction])),s.has(`EXT_texture_filter_anisotropic`)===!0){if(t.magFilter===1003||t.minFilter!==1005&&t.minFilter!==1008||t.type===1015&&s.has(`OES_texture_float_linear`)===!1)return;if(t.anisotropy>1||l.get(t).__currentAnisotropy){let n=s.get(`EXT_texture_filter_anisotropic`);o.texParameterf(e,n.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(t.anisotropy,u.getMaxAnisotropy())),l.get(t).__currentAnisotropy=t.anisotropy}}}function ye(e,t){let n=!1;e.__webglInit===void 0&&(e.__webglInit=!0,t.addEventListener(`dispose`,te),M(t));let r=t.source,i=b.get(r);i===void 0&&(i={},b.set(r,i));let a=de(t);if(a!==e.__cacheKey){i[a]===void 0&&(i[a]={texture:o.createTexture(),usedTimes:0},f.memory.textures++,n=!0),i[a].usedTimes++;let r=i[e.__cacheKey];r!==void 0&&(i[e.__cacheKey].usedTimes--,r.usedTimes===0&&z(t)),e.__cacheKey=a,e.__webglTexture=i[a].texture}return n}function be(e,t,n){return Math.floor(Math.floor(e/n)/t)}function xe(e,t,n,r){let i=e.updateRanges;if(i.length===0)c.texSubImage2D(o.TEXTURE_2D,0,0,0,t.width,t.height,n,r,t.data);else{i.sort((e,t)=>e.start-t.start);let a=0;for(let e=1;e<i.length;e++){let n=i[a],r=i[e],o=n.start+n.count,s=be(r.start,t.width,4),c=be(n.start,t.width,4);r.start<=o+1&&s===c&&be(r.start+r.count-1,t.width,4)===s?n.count=Math.max(n.count,r.start+r.count-n.start):(++a,i[a]=r)}i.length=a+1;let s=c.getParameter(o.UNPACK_ROW_LENGTH),l=c.getParameter(o.UNPACK_SKIP_PIXELS),u=c.getParameter(o.UNPACK_SKIP_ROWS);c.pixelStorei(o.UNPACK_ROW_LENGTH,t.width);for(let e=0,a=i.length;e<a;e++){let a=i[e],s=Math.floor(a.start/4),l=Math.ceil(a.count/4),u=s%t.width,d=Math.floor(s/t.width),f=l;c.pixelStorei(o.UNPACK_SKIP_PIXELS,u),c.pixelStorei(o.UNPACK_SKIP_ROWS,d),c.texSubImage2D(o.TEXTURE_2D,0,u,d,f,1,n,r,t.data)}e.clearUpdateRanges(),c.pixelStorei(o.UNPACK_ROW_LENGTH,s),c.pixelStorei(o.UNPACK_SKIP_PIXELS,l),c.pixelStorei(o.UNPACK_SKIP_ROWS,u)}}function Se(e,t,n){let r=o.TEXTURE_2D;(t.isDataArrayTexture||t.isCompressedArrayTexture)&&(r=o.TEXTURE_2D_ARRAY),t.isData3DTexture&&(r=o.TEXTURE_3D);let i=ye(e,t),a=t.source;c.bindTexture(r,e.__webglTexture,o.TEXTURE0+n);let s=l.get(a);if(a.version!==s.__version||i===!0){if(c.activeTexture(o.TEXTURE0+n),!(typeof ImageBitmap<`u`&&t.image instanceof ImageBitmap)){let e=J.getPrimaries(J.workingColorSpace),n=t.colorSpace===``?null:J.getPrimaries(t.colorSpace),r=t.colorSpace===``||e===n?o.NONE:o.BROWSER_DEFAULT_WEBGL;c.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,t.flipY),c.pixelStorei(o.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),c.pixelStorei(o.UNPACK_COLORSPACE_CONVERSION_WEBGL,r)}c.pixelStorei(o.UNPACK_ALIGNMENT,t.unpackAlignment);let e=T(t.image,!1,u.maxTextureSize);e=U(t,e);let l=d.convert(t.format,t.colorSpace),f=d.convert(t.type),p=k(t.internalFormat,l,f,t.normalized,t.colorSpace,t.isVideoTexture);ve(r,t);let m,h=t.mipmaps,_=t.isVideoTexture!==!0,y=s.__version===void 0||i===!0,b=a.dataReady,x=j(t,e);if(t.isDepthTexture)p=A(t.format===g,t.type),y&&(_?c.texStorage2D(o.TEXTURE_2D,1,p,e.width,e.height):c.texImage2D(o.TEXTURE_2D,0,p,e.width,e.height,0,l,f,null));else if(t.isDataTexture){if(h.length>0){_&&y&&c.texStorage2D(o.TEXTURE_2D,x,p,h[0].width,h[0].height);for(let e=0,t=h.length;e<t;e++)m=h[e],_?b&&c.texSubImage2D(o.TEXTURE_2D,e,0,0,m.width,m.height,l,f,m.data):c.texImage2D(o.TEXTURE_2D,e,p,m.width,m.height,0,l,f,m.data);t.generateMipmaps=!1}else _?(y&&c.texStorage2D(o.TEXTURE_2D,x,p,e.width,e.height),b&&xe(t,e,l,f)):c.texImage2D(o.TEXTURE_2D,0,p,e.width,e.height,0,l,f,e.data)}else if(t.isCompressedTexture){if(t.isCompressedArrayTexture){_&&y&&c.texStorage3D(o.TEXTURE_2D_ARRAY,x,p,h[0].width,h[0].height,e.depth);for(let n=0,r=h.length;n<r;n++)if(m=h[n],t.format!==1023){if(l!==null){if(_){if(b){if(t.layerUpdates.size>0){let e=Xi(m.width,m.height,t.format,t.type);for(let r of t.layerUpdates){let t=m.data.subarray(r*e/m.data.BYTES_PER_ELEMENT,(r+1)*e/m.data.BYTES_PER_ELEMENT);c.compressedTexSubImage3D(o.TEXTURE_2D_ARRAY,n,0,0,r,m.width,m.height,1,l,t)}}else c.compressedTexSubImage3D(o.TEXTURE_2D_ARRAY,n,0,0,0,m.width,m.height,e.depth,l,m.data)}}else c.compressedTexImage3D(o.TEXTURE_2D_ARRAY,n,p,m.width,m.height,e.depth,0,m.data,0,0)}else L(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else _?b&&c.texSubImage3D(o.TEXTURE_2D_ARRAY,n,0,0,0,m.width,m.height,e.depth,l,f,m.data):c.texImage3D(o.TEXTURE_2D_ARRAY,n,p,m.width,m.height,e.depth,0,l,f,m.data);t.layerUpdates.size>0&&t.clearLayerUpdates()}else{_&&y&&c.texStorage2D(o.TEXTURE_2D,x,p,h[0].width,h[0].height);for(let e=0,n=h.length;e<n;e++)m=h[e],t.format===1023?_?b&&c.texSubImage2D(o.TEXTURE_2D,e,0,0,m.width,m.height,l,f,m.data):c.texImage2D(o.TEXTURE_2D,e,p,m.width,m.height,0,l,f,m.data):l===null?L(`WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):_?b&&c.compressedTexSubImage2D(o.TEXTURE_2D,e,0,0,m.width,m.height,l,m.data):c.compressedTexImage2D(o.TEXTURE_2D,e,p,m.width,m.height,0,m.data)}}else if(t.isDataArrayTexture){if(_){if(y&&c.texStorage3D(o.TEXTURE_2D_ARRAY,x,p,e.width,e.height,e.depth),b){if(t.layerUpdates.size>0){let n=Xi(e.width,e.height,t.format,t.type);for(let r of t.layerUpdates){let t=e.data.subarray(r*n/e.data.BYTES_PER_ELEMENT,(r+1)*n/e.data.BYTES_PER_ELEMENT);c.texSubImage3D(o.TEXTURE_2D_ARRAY,0,0,0,r,e.width,e.height,1,l,f,t)}t.clearLayerUpdates()}else c.texSubImage3D(o.TEXTURE_2D_ARRAY,0,0,0,0,e.width,e.height,e.depth,l,f,e.data)}}else c.texImage3D(o.TEXTURE_2D_ARRAY,0,p,e.width,e.height,e.depth,0,l,f,e.data)}else if(t.isData3DTexture)_?(y&&c.texStorage3D(o.TEXTURE_3D,x,p,e.width,e.height,e.depth),b&&c.texSubImage3D(o.TEXTURE_3D,0,0,0,0,e.width,e.height,e.depth,l,f,e.data)):c.texImage3D(o.TEXTURE_3D,0,p,e.width,e.height,e.depth,0,l,f,e.data);else if(t.isFramebufferTexture){if(y){if(_)c.texStorage2D(o.TEXTURE_2D,x,p,e.width,e.height);else{let t=e.width,n=e.height;for(let e=0;e<x;e++)c.texImage2D(o.TEXTURE_2D,e,p,t,n,0,l,f,null),t>>=1,n>>=1}}}else if(t.isHTMLTexture){if(`texElementImage2D`in o){let n=o.canvas;if(n.hasAttribute(`layoutsubtree`)||n.setAttribute(`layoutsubtree`,`true`),e.parentNode!==n){n.appendChild(e),v.add(t),n.onpaint=e=>{let t=e.changedElements;for(let e of v)t.includes(e.image)&&(e.needsUpdate=!0)},n.requestPaint();return}if(o.texElementImage2D.length===3)o.texElementImage2D(o.TEXTURE_2D,o.RGBA8,e);else{let t=o.RGBA,n=o.RGBA,r=o.UNSIGNED_BYTE;o.texElementImage2D(o.TEXTURE_2D,0,t,n,r,e)}o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_S,o.CLAMP_TO_EDGE),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_T,o.CLAMP_TO_EDGE)}}else if(h.length>0){if(_&&y){let e=Fe(h[0]);c.texStorage2D(o.TEXTURE_2D,x,p,e.width,e.height)}for(let e=0,t=h.length;e<t;e++)m=h[e],_?b&&c.texSubImage2D(o.TEXTURE_2D,e,0,0,l,f,m):c.texImage2D(o.TEXTURE_2D,e,p,l,f,m);t.generateMipmaps=!1}else if(_){if(y){let t=Fe(e);c.texStorage2D(o.TEXTURE_2D,x,p,t.width,t.height)}b&&c.texSubImage2D(o.TEXTURE_2D,0,0,0,l,f,e)}else c.texImage2D(o.TEXTURE_2D,0,p,l,f,e);E(t)&&t.mipmapsAutoUpdate===!0&&D(r),s.__version=a.version,t.onUpdate&&t.onUpdate(t)}e.__version=t.version}function Ce(e,t,n){if(t.image.length!==6)return;let r=ye(e,t),i=t.source;c.bindTexture(o.TEXTURE_CUBE_MAP,e.__webglTexture,o.TEXTURE0+n);let a=l.get(i);if(i.version!==a.__version||r===!0){c.activeTexture(o.TEXTURE0+n);let e=J.getPrimaries(J.workingColorSpace),s=t.colorSpace===``?null:J.getPrimaries(t.colorSpace),l=t.colorSpace===``||e===s?o.NONE:o.BROWSER_DEFAULT_WEBGL;c.pixelStorei(o.UNPACK_FLIP_Y_WEBGL,t.flipY),c.pixelStorei(o.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),c.pixelStorei(o.UNPACK_ALIGNMENT,t.unpackAlignment),c.pixelStorei(o.UNPACK_COLORSPACE_CONVERSION_WEBGL,l);let f=t.isCompressedTexture||t.image[0].isCompressedTexture,p=t.image[0]&&t.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=T(t.image[e],!0,u.maxCubemapSize):m[e]=p?t.image[e].image:t.image[e],m[e]=U(t,m[e]);let h=m[0],_=d.convert(t.format,t.colorSpace),v=d.convert(t.type),y=k(t.internalFormat,_,v,t.normalized,t.colorSpace),b=t.isVideoTexture!==!0,x=a.__version===void 0||r===!0,S=i.dataReady,C=j(t,h);ve(o.TEXTURE_CUBE_MAP,t);let w;if(t.isDepthTexture){if(y=A(t.format===g,t.type),x){if(b)c.texStorage2D(o.TEXTURE_CUBE_MAP,1,y,h.width,h.height);else for(let e=0;e<6;e++)c.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,y,h.width,h.height,0,_,v,null)}}else if(f){b&&x&&c.texStorage2D(o.TEXTURE_CUBE_MAP,C,y,h.width,h.height);for(let e=0;e<6;e++){w=m[e].mipmaps;for(let n=0;n<w.length;n++){let r=w[n];t.format===1023?b?S&&c.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,0,0,r.width,r.height,_,v,r.data):c.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,y,r.width,r.height,0,_,v,r.data):_===null?L(`WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):b?S&&c.compressedTexSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,0,0,r.width,r.height,_,r.data):c.compressedTexImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+e,n,y,r.width,r.height,0,r.data)}}}else{if(w=t.mipmaps,b&&x){w.length>0&&C++;let e=Fe(m[0]);c.texStorage2D(o.TEXTURE_CUBE_MAP,C,y,e.width,e.height)}for(let e=0;e<6;e++)if(p){b?S&&c.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,0,0,m[e].width,m[e].height,_,v,m[e].data):c.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,y,m[e].width,m[e].height,0,_,v,m[e].data);for(let t=0;t<w.length;t++){let n=w[t].image[e].image;b?S&&c.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,0,0,n.width,n.height,_,v,n.data):c.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,y,n.width,n.height,0,_,v,n.data)}}else{b?S&&c.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,0,0,_,v,m[e]):c.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+e,0,y,_,v,m[e]);for(let t=0;t<w.length;t++){let n=w[t];b?S&&c.texSubImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,0,0,_,v,n.image[e]):c.texImage2D(o.TEXTURE_CUBE_MAP_POSITIVE_X+e,t+1,y,_,v,n.image[e])}}}E(t)&&t.mipmapsAutoUpdate===!0&&D(o.TEXTURE_CUBE_MAP),a.__version=i.version,t.onUpdate&&t.onUpdate(t)}e.__version=t.version}function we(e,t,n,r,i,a){let s=d.convert(n.format,n.colorSpace),u=d.convert(n.type),f=k(n.internalFormat,s,u,n.normalized,n.colorSpace),m=l.get(t),h=l.get(n);if(h.__renderTarget=t,!m.__hasExternalTextures){let e=Math.max(1,t.width>>a),n=Math.max(1,t.height>>a);i===o.TEXTURE_3D||i===o.TEXTURE_2D_ARRAY?c.texImage3D(i,a,f,e,n,t.depth,0,s,u,null):c.texImage2D(i,a,f,e,n,0,s,u,null)}c.bindFramebuffer(o.FRAMEBUFFER,e),Pe(t)?p.framebufferTexture2DMultisampleEXT(o.FRAMEBUFFER,r,i,h.__webglTexture,0,Ne(t)):(i===o.TEXTURE_2D||i>=o.TEXTURE_CUBE_MAP_POSITIVE_X&&i<=o.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&o.framebufferTexture2D(o.FRAMEBUFFER,r,i,h.__webglTexture,a),c.bindFramebuffer(o.FRAMEBUFFER,null)}function Te(e,t,n){if(o.bindRenderbuffer(o.RENDERBUFFER,e),t.depthBuffer){let r=t.depthTexture,i=r&&r.isDepthTexture?r.type:null,a=A(t.stencilBuffer,i),s=t.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT;Pe(t)?p.renderbufferStorageMultisampleEXT(o.RENDERBUFFER,Ne(t),a,t.width,t.height):n?o.renderbufferStorageMultisample(o.RENDERBUFFER,Ne(t),a,t.width,t.height):o.renderbufferStorage(o.RENDERBUFFER,a,t.width,t.height),o.framebufferRenderbuffer(o.FRAMEBUFFER,s,o.RENDERBUFFER,e)}else{let e=t.textures;for(let r=0;r<e.length;r++){let i=e[r],a=d.convert(i.format,i.colorSpace),s=d.convert(i.type),c=k(i.internalFormat,a,s,i.normalized,i.colorSpace);Pe(t)?p.renderbufferStorageMultisampleEXT(o.RENDERBUFFER,Ne(t),c,t.width,t.height):n?o.renderbufferStorageMultisample(o.RENDERBUFFER,Ne(t),c,t.width,t.height):o.renderbufferStorage(o.RENDERBUFFER,c,t.width,t.height)}}o.bindRenderbuffer(o.RENDERBUFFER,null)}function Ee(e,t,n){let r=t.isWebGLCubeRenderTarget===!0;if(c.bindFramebuffer(o.FRAMEBUFFER,e),!(t.depthTexture&&t.depthTexture.isDepthTexture))throw Error(`THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.`);let i=l.get(t.depthTexture);i.__renderTarget=t;let a=r?t.depthTexture.image[0]:t.depthTexture.image;i.__webglTexture&&a.width===t.width&&a.height===t.height||(a.width=t.width,a.height=t.height,t.depthTexture.needsUpdate=!0),r?me(t.depthTexture,0):fe(t.depthTexture,0);let s=i.__webglTexture,u=Ne(t),d=r?o.TEXTURE_CUBE_MAP_POSITIVE_X+n:o.TEXTURE_2D,f=t.depthTexture.format===1027?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT;if(t.depthTexture.format===1026)Pe(t)?p.framebufferTexture2DMultisampleEXT(o.FRAMEBUFFER,f,d,s,0,u):o.framebufferTexture2D(o.FRAMEBUFFER,f,d,s,0);else if(t.depthTexture.format===1027)Pe(t)?p.framebufferTexture2DMultisampleEXT(o.FRAMEBUFFER,f,d,s,0,u):o.framebufferTexture2D(o.FRAMEBUFFER,f,d,s,0);else throw Error(`THREE.WebGLTextures: Unknown depthTexture format.`)}function De(e){let t=l.get(e),n=e.isWebGLCubeRenderTarget===!0;if(t.__boundDepthTexture!==e.depthTexture){let n=e.depthTexture;if(t.__depthDisposeCallback&&t.__depthDisposeCallback(),n){let e=()=>{delete t.__boundDepthTexture,delete t.__depthDisposeCallback,n.removeEventListener(`dispose`,e)};n.addEventListener(`dispose`,e),t.__depthDisposeCallback=e}t.__boundDepthTexture=n}if(e.depthTexture&&!t.__autoAllocateDepthBuffer){if(n)for(let n=0;n<6;n++)Ee(t.__webglFramebuffer[n],e,n);else e.texture.mipmaps.length>0?Ee(t.__webglFramebuffer[0],e,0):Ee(t.__webglFramebuffer,e,0)}else if(n){t.__webglDepthbuffer=[];for(let n=0;n<6;n++)if(c.bindFramebuffer(o.FRAMEBUFFER,t.__webglFramebuffer[n]),t.__webglDepthbuffer[n]===void 0)t.__webglDepthbuffer[n]=o.createRenderbuffer(),Te(t.__webglDepthbuffer[n],e,!1);else{let r=e.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT,i=t.__webglDepthbuffer[n];o.bindRenderbuffer(o.RENDERBUFFER,i),o.framebufferRenderbuffer(o.FRAMEBUFFER,r,o.RENDERBUFFER,i)}}else if(e.texture.mipmaps.length>0?c.bindFramebuffer(o.FRAMEBUFFER,t.__webglFramebuffer[0]):c.bindFramebuffer(o.FRAMEBUFFER,t.__webglFramebuffer),t.__webglDepthbuffer===void 0)t.__webglDepthbuffer=o.createRenderbuffer(),Te(t.__webglDepthbuffer,e,!1);else{let n=e.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT,r=t.__webglDepthbuffer;o.bindRenderbuffer(o.RENDERBUFFER,r),o.framebufferRenderbuffer(o.FRAMEBUFFER,n,o.RENDERBUFFER,r)}c.bindFramebuffer(o.FRAMEBUFFER,null)}function Oe(e,t,n){let r=l.get(e);t!==void 0&&we(r.__webglFramebuffer,e,e.texture,o.COLOR_ATTACHMENT0,o.TEXTURE_2D,0),n!==void 0&&De(e)}function ke(e){let t=e.texture,n=l.get(e),r=l.get(t);e.addEventListener(`dispose`,ne),M(e);let i=e.textures,a=e.isWebGLCubeRenderTarget===!0,s=i.length>1;if(s||(r.__webglTexture===void 0&&(r.__webglTexture=o.createTexture()),r.__version=t.version,f.memory.textures++),a){n.__webglFramebuffer=[];for(let e=0;e<6;e++)if(t.mipmaps.length>0){n.__webglFramebuffer[e]=[];for(let r=0;r<t.mipmaps.length;r++)n.__webglFramebuffer[e][r]=o.createFramebuffer()}else n.__webglFramebuffer[e]=o.createFramebuffer()}else{if(t.mipmaps.length>0){n.__webglFramebuffer=[];for(let e=0;e<t.mipmaps.length;e++)n.__webglFramebuffer[e]=o.createFramebuffer()}else n.__webglFramebuffer=o.createFramebuffer();if(s)for(let e=0,t=i.length;e<t;e++){let t=l.get(i[e]);t.__webglTexture===void 0&&(t.__webglTexture=o.createTexture(),f.memory.textures++)}if(e.samples>0&&Pe(e)===!1){n.__webglMultisampledFramebuffer=o.createFramebuffer(),n.__webglColorRenderbuffer=[],c.bindFramebuffer(o.FRAMEBUFFER,n.__webglMultisampledFramebuffer);for(let t=0;t<i.length;t++){let r=i[t];n.__webglColorRenderbuffer[t]=o.createRenderbuffer(),o.bindRenderbuffer(o.RENDERBUFFER,n.__webglColorRenderbuffer[t]);let a=d.convert(r.format,r.colorSpace),s=d.convert(r.type),c=k(r.internalFormat,a,s,r.normalized,r.colorSpace,e.isXRRenderTarget===!0),l=Ne(e);o.renderbufferStorageMultisample(o.RENDERBUFFER,l,c,e.width,e.height),o.framebufferRenderbuffer(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0+t,o.RENDERBUFFER,n.__webglColorRenderbuffer[t])}o.bindRenderbuffer(o.RENDERBUFFER,null),e.depthBuffer&&(n.__webglDepthRenderbuffer=o.createRenderbuffer(),Te(n.__webglDepthRenderbuffer,e,!0)),c.bindFramebuffer(o.FRAMEBUFFER,null)}}if(a){c.bindTexture(o.TEXTURE_CUBE_MAP,r.__webglTexture),ve(o.TEXTURE_CUBE_MAP,t);for(let r=0;r<6;r++)if(t.mipmaps.length>0)for(let i=0;i<t.mipmaps.length;i++)we(n.__webglFramebuffer[r][i],e,t,o.COLOR_ATTACHMENT0,o.TEXTURE_CUBE_MAP_POSITIVE_X+r,i);else we(n.__webglFramebuffer[r],e,t,o.COLOR_ATTACHMENT0,o.TEXTURE_CUBE_MAP_POSITIVE_X+r,0);E(t)?D(o.TEXTURE_CUBE_MAP):t.mipmaps.length>0&&o.texParameteri(o.TEXTURE_CUBE_MAP,o.TEXTURE_MAX_LEVEL,t.mipmaps.length-1),c.unbindTexture()}else if(s){for(let t=0,r=i.length;t<r;t++){let r=i[t],a=l.get(r),s=o.TEXTURE_2D;(e.isWebGL3DRenderTarget||e.isWebGLArrayRenderTarget)&&(s=e.isWebGL3DRenderTarget?o.TEXTURE_3D:o.TEXTURE_2D_ARRAY),c.bindTexture(s,a.__webglTexture),ve(s,r),we(n.__webglFramebuffer,e,r,o.COLOR_ATTACHMENT0+t,s,0),E(r)&&D(s)}c.unbindTexture()}else{let i=o.TEXTURE_2D;if((e.isWebGL3DRenderTarget||e.isWebGLArrayRenderTarget)&&(i=e.isWebGL3DRenderTarget?o.TEXTURE_3D:o.TEXTURE_2D_ARRAY),c.bindTexture(i,r.__webglTexture),ve(i,t),t.mipmaps.length>0)for(let r=0;r<t.mipmaps.length;r++)we(n.__webglFramebuffer[r],e,t,o.COLOR_ATTACHMENT0,i,r);else we(n.__webglFramebuffer,e,t,o.COLOR_ATTACHMENT0,i,0);E(t)?D(i):t.mipmaps.length>0&&o.texParameteri(i,o.TEXTURE_MAX_LEVEL,t.mipmaps.length-1),c.unbindTexture()}e.depthBuffer&&De(e)}function Ae(e){let t=e.textures;for(let n=0,r=t.length;n<r;n++){let r=t[n];if(E(r)&&r.mipmapsAutoUpdate===!0){let t=O(e),n=l.get(r).__webglTexture;c.bindTexture(t,n),D(t),c.unbindTexture()}}}let je=[];function Me(e){if(e.samples>0){if(Pe(e)===!1){let t=e.textures,n=e.width,r=e.height,i=o.COLOR_BUFFER_BIT,a=e.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT,s=l.get(e),u=t.length>1;if(u)for(let e=0;e<t.length;e++)c.bindFramebuffer(o.FRAMEBUFFER,s.__webglMultisampledFramebuffer),o.framebufferRenderbuffer(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0+e,o.RENDERBUFFER,null),c.bindFramebuffer(o.FRAMEBUFFER,s.__webglFramebuffer),o.framebufferTexture2D(o.DRAW_FRAMEBUFFER,o.COLOR_ATTACHMENT0+e,o.TEXTURE_2D,null,0);c.bindFramebuffer(o.READ_FRAMEBUFFER,s.__webglMultisampledFramebuffer),e.texture.mipmaps.length>0?c.bindFramebuffer(o.DRAW_FRAMEBUFFER,s.__webglFramebuffer[0]):c.bindFramebuffer(o.DRAW_FRAMEBUFFER,s.__webglFramebuffer);for(let c=0;c<t.length;c++){if(e.resolveDepthBuffer&&(e.depthBuffer&&(i|=o.DEPTH_BUFFER_BIT),e.stencilBuffer&&e.resolveStencilBuffer&&(i|=o.STENCIL_BUFFER_BIT)),u){o.framebufferRenderbuffer(o.READ_FRAMEBUFFER,o.COLOR_ATTACHMENT0,o.RENDERBUFFER,s.__webglColorRenderbuffer[c]);let e=l.get(t[c]).__webglTexture;o.framebufferTexture2D(o.DRAW_FRAMEBUFFER,o.COLOR_ATTACHMENT0,o.TEXTURE_2D,e,0)}o.blitFramebuffer(0,0,n,r,0,0,n,r,i,o.NEAREST),m===!0&&(je.length=0,je.push(o.COLOR_ATTACHMENT0+c),e.depthBuffer&&e.storeMultisampledDepthBuffer===!1&&je.push(a),o.invalidateFramebuffer(o.READ_FRAMEBUFFER,je))}if(c.bindFramebuffer(o.READ_FRAMEBUFFER,null),c.bindFramebuffer(o.DRAW_FRAMEBUFFER,null),u)for(let e=0;e<t.length;e++){c.bindFramebuffer(o.FRAMEBUFFER,s.__webglMultisampledFramebuffer),o.framebufferRenderbuffer(o.FRAMEBUFFER,o.COLOR_ATTACHMENT0+e,o.RENDERBUFFER,s.__webglColorRenderbuffer[e]);let n=l.get(t[e]).__webglTexture;c.bindFramebuffer(o.FRAMEBUFFER,s.__webglFramebuffer),o.framebufferTexture2D(o.DRAW_FRAMEBUFFER,o.COLOR_ATTACHMENT0+e,o.TEXTURE_2D,n,0)}c.bindFramebuffer(o.DRAW_FRAMEBUFFER,s.__webglMultisampledFramebuffer)}else if(e.depthBuffer&&e.storeMultisampledDepthBuffer===!1&&m){let t=e.stencilBuffer?o.DEPTH_STENCIL_ATTACHMENT:o.DEPTH_ATTACHMENT;o.invalidateFramebuffer(o.DRAW_FRAMEBUFFER,[t])}}}function Ne(e){return Math.min(u.maxSamples,e.samples)}function Pe(e){let t=l.get(e);return e.samples>0&&s.has(`WEBGL_multisampled_render_to_texture`)===!0&&t.__useRenderToTexture!==!1}function H(e){let t=f.render.frame;_.get(e)!==t&&(_.set(e,t),e.update())}function U(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(J.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&L(`WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):R(`WebGLTextures: Unsupported texture color space:`,n)),t}function Fe(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(h.width=e.naturalWidth||e.width,h.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(h.width=e.displayWidth,h.height=e.displayHeight):(h.width=e.width,h.height=e.height),h}this.allocateTextureUnit=ue,this.resetTextureUnits=se,this.getTextureUnits=ce,this.setTextureUnits=le,this.setTexture2D=fe,this.setTexture2DArray=B,this.setTexture3D=pe,this.setTextureCube=me,this.rebindTextures=Oe,this.setupRenderTarget=ke,this.updateRenderTargetMipmap=Ae,this.updateMultisampleRenderTarget=Me,this.setupDepthRenderbuffer=De,this.setupFrameBufferTexture=we,this.useMultisampledRTT=Pe,this.dispose=ie}function Vs(e,t){function n(n,r=``){let i,a=J.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496||n===37488||n===37489||n===37490||n===37491){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC;if(n===37488)return i.COMPRESSED_R11_EAC;if(n===37489)return i.COMPRESSED_SIGNED_R11_EAC;if(n===37490)return i.COMPRESSED_RG11_EAC;if(n===37491)return i.COMPRESSED_SIGNED_RG11_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var Hs=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Dr(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new Ur({vertexShader:`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,fragmentShader:`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Qn(new Nr(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Us=class extends se{constructor(e,t){super();let n=this,r=null,i=1,a=null,s=`local-floor`,l=1,u=null,d=null,f=null,_=null,v=null,y=null,b=typeof XRWebGLBinding<`u`,x=new Hs,S={},C=t.getContextAttributes(),w=null,T=null,E=[],D=[],O=new V,k=null,A=null,ee=new Pi;ee.viewport=new Je;let j=new Pi;j.viewport=new Je;let M=[ee,j],N=new Bi,te=null,ne=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=E[e];return t===void 0&&(t=new Dt,E[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=E[e];return t===void 0&&(t=new Dt,E[e]=t),t.getGripSpace()},this.getHand=function(e){let t=E[e];return t===void 0&&(t=new Dt,E[e]=t),t.getHandSpace()};function P(e){let t=D.indexOf(e.inputSource);if(t===-1)return;let n=E[t];n!==void 0&&(n.update(e.inputSource,e.frame,u||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function re(){r.removeEventListener(`select`,P),r.removeEventListener(`selectstart`,P),r.removeEventListener(`selectend`,P),r.removeEventListener(`squeeze`,P),r.removeEventListener(`squeezestart`,P),r.removeEventListener(`squeezeend`,P),r.removeEventListener(`end`,re),r.removeEventListener(`inputsourceschange`,F);for(let e=0;e<E.length;e++){let t=D[e];t!==null&&(D[e]=null,E[e].disconnect(t))}te=null,ne=null,x.reset();for(let e in S)delete S[e];if(e.setRenderTarget(w),v=null,_=null,f=null,r=null,T=null,ae.stop(),n.isPresenting=!1,e.setPixelRatio(k),e.setSize(O.width,O.height,!1),A!==null){let e=A.camera;e.fov=A.fov,e.zoom=A.zoom,e.updateProjectionMatrix(),A=null}n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&L(`WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){s=e,n.isPresenting===!0&&L(`WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return u||a},this.setReferenceSpace=function(e){u=e},this.getBaseLayer=function(){return _===null?v:_},this.getBinding=function(){return f===null&&b&&(f=new XRWebGLBinding(r,t)),f},this.getFrame=function(){return y},this.getSession=function(){return r},this.setSession=async function(d){if(r=d,r!==null){if(w=e.getRenderTarget(),r.addEventListener(`select`,P),r.addEventListener(`selectstart`,P),r.addEventListener(`selectend`,P),r.addEventListener(`squeeze`,P),r.addEventListener(`squeezestart`,P),r.addEventListener(`squeezeend`,P),r.addEventListener(`end`,re),r.addEventListener(`inputsourceschange`,F),C.xrCompatible!==!0&&await t.makeXRCompatible(),k=e.getPixelRatio(),e.getSize(O),b&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,s=null;C.depth&&(s=C.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=C.stencil?g:h,a=C.stencil?p:c);let l={colorFormat:t.RGBA8,depthFormat:s,scaleFactor:i};f=this.getBinding(),_=f.createProjectionLayer(l),r.updateRenderState({layers:[_]}),e.setPixelRatio(1),e.setSize(_.textureWidth,_.textureHeight,!1),T=new Xe(_.textureWidth,_.textureHeight,{format:m,type:o,depthTexture:new Tr(_.textureWidth,_.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:C.stencil,colorSpace:e.outputColorSpace,samples:C.antialias?4:0,resolveDepthBuffer:_.ignoreDepthValues===!1,resolveStencilBuffer:_.ignoreDepthValues===!1,storeMultisampledDepthBuffer:_.ignoreDepthValues===!1,storeMultisampledStencilBuffer:_.ignoreDepthValues===!1})}else{let n={antialias:C.antialias,alpha:!0,depth:C.depth,stencil:C.stencil,framebufferScaleFactor:i};v=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:v}),e.setPixelRatio(1),e.setSize(v.framebufferWidth,v.framebufferHeight,!1),T=new Xe(v.framebufferWidth,v.framebufferHeight,{format:m,type:o,colorSpace:e.outputColorSpace,stencilBuffer:C.stencil,resolveDepthBuffer:v.ignoreDepthValues===!1,resolveStencilBuffer:v.ignoreDepthValues===!1,storeMultisampledDepthBuffer:v.ignoreDepthValues===!1,storeMultisampledStencilBuffer:v.ignoreDepthValues===!1})}T.isXRRenderTarget=!0,this.setFoveation(l),u=null,a=await r.requestReferenceSpace(s),ae.setContext(r),ae.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return x.getDepthTexture()};function F(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=D.indexOf(n);r>=0&&(D[r]=null,E[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=D.indexOf(n);if(r===-1){for(let e=0;e<E.length;e++)if(e>=D.length){D.push(n),r=e;break}else if(D[e]===null){D[e]=n,r=e;break}if(r===-1)break}let i=E[r];i&&i.connect(n)}}function ie(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;x.texture!==null&&(x.depthNear>0&&(t=x.depthNear),x.depthFar>0&&(n=x.depthFar)),N.near=j.near=ee.near=t,N.far=j.far=ee.far=n,(te!==N.near||ne!==N.far)&&(r.updateRenderState({depthNear:N.near,depthFar:N.far}),te=N.near,ne=N.far),N.layers.mask=e.layers.mask|6,ee.layers.mask=N.layers.mask&-5,j.layers.mask=N.layers.mask&-3;let i=e.parent,a=N.cameras;ie(N,i);for(let e=0;e<a.length;e++)ie(a[e],i);N.projectionMatrix.copy(ee.projectionMatrix),N.projectionMatrixInverse.copy(ee.projectionMatrixInverse),A===null&&e.isPerspectiveCamera&&(A={camera:e,fov:e.fov,zoom:e.zoom}),I(e,N,i)};function I(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=de*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return N},this.getFoveation=function(){if(_!==null||v!==null)return l},this.setFoveation=function(e){l=e,_!==null&&(_.fixedFoveation=e),v!==null&&v.fixedFoveation!==void 0&&(v.fixedFoveation=e)},this.hasDepthSensing=function(){return x.texture!==null},this.getDepthSensingMesh=function(){return x.getMesh(N)},this.getCameraTexture=function(e){return S[e]};let R=null;function z(t,i){if(d=i.getViewerPose(u||a),y=i,d!==null){let t=d.views;v!==null&&(e.setRenderTargetFramebuffer(T,v.framebuffer),e.setRenderTarget(T));let i=!1;t.length!==N.cameras.length&&(N.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(v!==null)a=v.getViewport(r);else{let t=f.getViewSubImage(_,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(T,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(T))}let o=M[n];o===void 0&&(o=new Pi,o.layers.enable(n),o.viewport=new Je,M[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(N.matrix.copy(o.matrix),N.matrix.decompose(N.position,N.quaternion,N.scale)),i===!0&&N.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&b){f=n.getBinding();let e=f.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&x.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&b){e.state.unbindTexture(),f=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=S[n];e||(e=new Dr,S[n]=e);let t=f.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<E.length;e++){let t=D[e],n=E[e];t!==null&&n!==void 0&&n.update(t,i,u||a)}R&&R(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),y=null}let ae=new Qi;ae.setAnimationLoop(z),this.setAnimationLoop=function(e){R=e},this.dispose=function(){}}};const Ws=/*@__PURE__*/ new Y,Gs=/*@__PURE__*/ new W;Gs.set(-1,0,0,0,1,0,0,0,1);function Ks(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,zr(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isNodeMaterial?t.uniformsNeedUpdate=!1:t.isMeshBasicMaterial?a(e,t):t.isMeshLambertMaterial?(a(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,e.envMapRotation.value.setFromMatrix4(Ws.makeRotationFromEuler(o)).transpose(),a.isCubeTexture&&a.isRenderTargetTexture===!1&&e.envMapRotation.value.premultiply(Gs),e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.diffuseRoughness>0&&(e.diffuseRoughness.value=t.diffuseRoughness,t.diffuseRoughnessMap&&(e.diffuseRoughnessMap.value=t.diffuseRoughnessMap,n(t.diffuseRoughnessMap,e.diffuseRoughnessMapTransform))),t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.retroreflectivity>0&&(e.retroreflectivity.value=t.retroreflectivity),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessMinimum,e.iridescenceThicknessMaximum.value=t.iridescenceThicknessMaximum,t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function qs(e,t,n,r){let i={},a={};function o(e,t){let n=t.program;r.uniformBlockBinding(e,n,i[e.id])}function s(e,n){let o=i[e.id];o===void 0&&(m(e),o=c(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let u=t.render.frame;a[e.id]!==u&&(l(e),a[e.id]=u)}function c(t){let n=e.createBuffer(),r=t.__size,i=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,n),e.bufferData(e.UNIFORM_BUFFER,r,i),e.bindBuffer(e.UNIFORM_BUFFER,null),n}function l(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let e=0,t=r.length;e<t;e++){let t=r[e];if(Array.isArray(t))for(let n=0,r=t.length;n<r;n++)u(t[n],e,n,a);else u(t,e,0,a)}e.bindBuffer(e.UNIFORM_BUFFER,null)}function u(t,n,r,i){if(f(t,n,r,i)===!0){let n=t.__offset,r=t.value;if(Array.isArray(r)){let e=0;for(let n=0;n<r.length;n++){let i=r[n],a=h(i,!0);d(i,t.__data,e),e+=a.storage/Float32Array.BYTES_PER_ELEMENT}}else d(r,t.__data,0);e.bufferSubData(e.UNIFORM_BUFFER,n,t.__data)}}function d(e,t,n){typeof e==`number`||typeof e==`boolean`?t[n]=e:e.isMatrix3?(t[n]=e.elements[0],t[n+1]=e.elements[1],t[n+2]=e.elements[2],t[n+3]=0,t[n+4]=e.elements[3],t[n+5]=e.elements[4],t[n+6]=e.elements[5],t[n+7]=0,t[n+8]=e.elements[6],t[n+9]=e.elements[7],t[n+10]=e.elements[8],t[n+11]=0):ArrayBuffer.isView(e)?t.set(e.subarray(0,t.length-n),n):e.toArray(t,n)}function f(e,t,n,r){let i=e.value,a=t+`_`+n;if(Array.isArray(i)){r[a]===void 0&&(r[a]=[]);let e=r[a],t=!1;for(let n=0;n<i.length;n++)p(i[n],e,n)===!0&&(t=!0);return t}return p(i,r,a)}function p(e,t,n){if(t[n]===void 0)return t[n]=typeof e==`number`||typeof e==`boolean`?e:ArrayBuffer.isView(e)?e.slice():e.clone(),!0;{let r=t[n];if(typeof e==`number`||typeof e==`boolean`){if(r!==e)return t[n]=e,!0}else if(ArrayBuffer.isView(e))return!0;else if(r.equals(e)===!1)return r.copy(e),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let i=0,a=r.length;i<a;i++){let a=r[i],o=Array.isArray(a.value)?a.value:[a.value],s=Array.isArray(t[e])||Array.isArray(a.value),c=n;for(let e=0,t=o.length;e<t;e++){let t=o[e],r=h(t,s),i=n%16,a=i%r.boundary,l=i+a;n+=a,l!==0&&16-l<r.storage&&(n+=16-l),e===0&&(c=n),n+=r.storage}a.__data=new(a.type===`int`?Int32Array:a.type===`uint`?Uint32Array:Float32Array)((n-c)/Float32Array.BYTES_PER_ELEMENT),a.__offset=c}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e,t){let n={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(n.boundary=4,n.storage=4):e.isVector2?(n.boundary=8,n.storage=8):e.isVector3||e.isColor?(n.boundary=16,n.storage=12):e.isVector4?(n.boundary=16,n.storage=16):e.isMatrix3?(n.boundary=16,n.storage=48):e.isMatrix4?(n.boundary=16,n.storage=64):e.isTexture?L(`WebGLRenderer: Texture samplers can not be part of an uniforms group.`):ArrayBuffer.isView(e)?(n.boundary=16,n.storage=e.byteLength):L(`WebGLRenderer: Unsupported uniform value type.`,e),t===!0&&(n.boundary=16,n.storage=Math.ceil(n.storage/16)*16),n}function g(t){let n=t.target;n.removeEventListener(`dispose`,g),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);i={},a={}}return{bind:o,update:s,dispose:_}}const Js=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let Ys=null;function Xs(){return Ys===null&&(Ys=new tr(Js,16,16,y,u),Ys.name=`DFG_LUT`,Ys.minFilter=i,Ys.magFilter=i,Ys.wrapS=t,Ys.wrapT=t,Ys.generateMipmaps=!1,Ys.needsUpdate=!0),Ys}var Zs=class{constructor(e={}){let{canvas:t=re(),context:n=null,depth:r=!0,stencil:i=!1,alpha:l=!1,antialias:m=!1,premultipliedAlpha:h=!0,preserveDrawingBuffer:g=!1,powerPreference:_=`default`,failIfMajorPerformanceCaveat:y=!1,reversedDepthBuffer:S=!1,outputBufferType:C=o}=e;this.isWebGLRenderer=!0;let w;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);w=n.getContextAttributes().alpha}else w=l;let T=C,E=/* @__PURE__ */ new Set([x,b,v]),D=/* @__PURE__ */ new Set([o,c,s,p,d,f]),O=/* @__PURE__ */ new Uint32Array(4),A=/* @__PURE__ */ new Int32Array(4),ee={textures:[],min:[],max:[],resolution:[]},j=null,M=null,te=[],ne=[],P=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let F=this,I=!1,z=null,oe=null,se=null,ce=null;this._outputColorSpace=k;let le=0,ue=0,de=null,fe=-1,B=null,pe=new Je,me=new Je,he=null,ge=new Z(0),_e=0,ve=t.width,ye=t.height,be=1,xe=null,Se=null,Ce=new Je(0,0,ve,ye),we=new Je(0,0,ve,ye),Te=!1,Ee=new mr,De=new gr,Oe=!1,ke=!1,Ae=new Y,je=new U,Me=new Je,Ne={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Pe=!1;function V(){return de===null?be:1}let H=n;function Fe(e,n){return t.getContext(e,n)}let Ie,W,G,Le,K,q,Re,ze,Be,Ve,He,Ue,We,Ge,Ke,qe,Ye,Ze,Qe,$e,et,tt,nt;try{let e={alpha:!0,depth:r,stencil:i,antialias:m,premultipliedAlpha:h,preserveDrawingBuffer:g,powerPreference:_,failIfMajorPerformanceCaveat:y};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r187`),t.addEventListener(`webglcontextlost`,at,!1),t.addEventListener(`webglcontextrestored`,ot,!1),t.addEventListener(`webglcontextcreationerror`,st,!1),H===null){let t=`webgl2`;if(H=Fe(t,e),H===null)throw Fe(t)?Error(`THREE.WebGLRenderer: Error creating WebGL context with your selected attributes.`):Error(`THREE.WebGLRenderer: Error creating WebGL context.`)}rt()}catch(e){throw t.removeEventListener(`webglcontextlost`,at,!1),t.removeEventListener(`webglcontextrestored`,ot,!1),t.removeEventListener(`webglcontextcreationerror`,st,!1),R(`WebGLRenderer: `+e.message),e}function rt(){Ie=new xa(H),Ie.init(),et=new Vs(H,Ie),W=new sa(H,Ie,e,et),G=new zs(H,Ie),W.reversedDepthBuffer&&S&&G.buffers.depth.setReversed(!0),oe=H.createFramebuffer(),se=H.createFramebuffer(),ce=H.createFramebuffer(),Le=new wa(H),K=new xs,q=new Bs(H,Ie,G,K,W,et,Le),Re=new ba(F),ze=new $i(H),tt=new aa(H,ze),Be=new Sa(H,ze,Le,tt),Ve=new Ea(H,Be,ze,tt,Le),Ze=new Ta(H,W,q),Ke=new ca(K),He=new bs(F,Re,Ie,W,tt,Ke),Ue=new Ks(F,K),We=new Ts,Ge=new Ms(Ie),Ye=new ia(F,Re,G,Ve,w,h),qe=new Rs(F,Ve,W),nt=new qs(H,Le,W,G),Qe=new oa(H,Ie,Le),$e=new Ca(H,Ie,Le),Le.programs=He.programs,F.capabilities=W,F.extensions=Ie,F.properties=K,F.renderLists=We,F.shadowMap=qe,F.state=G,F.info=Le}T!==1009&&(P=new Oa(T,t.width,t.height,m,r,i));let it=new Us(F,H);this.xr=it,this.getContext=function(){return H},this.getContextAttributes=function(){return H.getContextAttributes()},this.forceContextLoss=function(){let e=Ie.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=Ie.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return be},this.setPixelRatio=function(e){e!==void 0&&(be=e,this.setSize(ve,ye,!1))},this.getSize=function(e){return e.set(ve,ye)},this.setSize=function(e,n,r=!0){it.isPresenting?L(`WebGLRenderer: Can't change size while VR device is presenting.`):(ve=e,ye=n,t.width=Math.floor(e*be),t.height=Math.floor(n*be),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),P!==null&&P.setSize(t.width,t.height),this.setViewport(0,0,e,n))},this.getDrawingBufferSize=function(e){return e.set(ve*be,ye*be).floor()},this.setDrawingBufferSize=function(e,n,r){ve=e,ye=n,be=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.setEffects=function(e){if(T===1009)R(`WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.`);else{if(e){for(let t=0;t<e.length;t++)if(e[t].isOutputPass===!0){L(`WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.`);break}}P.setEffects(e||[])}},this.getCurrentViewport=function(e){return e.copy(pe)},this.getViewport=function(e){return e.copy(Ce)},this.setViewport=function(e,t,n,r){e.isVector4?Ce.set(e.x,e.y,e.z,e.w):Ce.set(e,t,n,r),G.viewport(pe.copy(Ce).multiplyScalar(V()).round())},this.getScissor=function(e){return e.copy(we)},this.setScissor=function(e,t,n,r){e.isVector4?we.set(e.x,e.y,e.z,e.w):we.set(e,t,n,r),G.scissor(me.copy(we).multiplyScalar(V()).round())},this.getScissorTest=function(){return Te},this.setScissorTest=function(e){G.setScissorTest(Te=e)},this.setOpaqueSort=function(e){xe=e},this.setTransparentSort=function(e){Se=e},this.getClearColor=function(e){return e.copy(Ye.getClearColor())},this.setClearColor=function(){Ye.setClearColor(...arguments)},this.getClearAlpha=function(){return Ye.getClearAlpha()},this.setClearAlpha=function(){Ye.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(de!==null){let t=de.texture.format;e=E.has(t)}if(e){let e=de.texture.type,t=D.has(e),n=Ye.getClearColor(),r=Ye.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(O[0]=i,O[1]=a,O[2]=o,O[3]=r,H.clearBufferuiv(H.COLOR,0,O)):(A[0]=i,A[1]=a,A[2]=o,A[3]=r,H.clearBufferiv(H.COLOR,0,A))}else r|=H.COLOR_BUFFER_BIT}t&&(r|=H.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),n&&(r|=H.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),r!==0&&H.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(e){e.setRenderer(this),z=e},this.dispose=function(){t.removeEventListener(`webglcontextlost`,at,!1),t.removeEventListener(`webglcontextrestored`,ot,!1),t.removeEventListener(`webglcontextcreationerror`,st,!1),Ye.dispose(),We.dispose(),Ge.dispose(),q.dispose(),K.dispose(),Re.dispose(),Ve.dispose(),Be.dispose(),tt.dispose(),nt.dispose(),He.dispose(),it.dispose(),it.removeEventListener(`sessionstart`,pt),it.removeEventListener(`sessionend`,mt),ht.stop()};function at(e){e.preventDefault(),ie(`WebGLRenderer: Context Lost.`),I=!0}function ot(){ie(`WebGLRenderer: Context Restored.`),I=!1;let e=Le.autoReset,t=qe.enabled,n=qe.autoUpdate,r=qe.needsUpdate,i=qe.type;rt(),Le.autoReset=e,qe.enabled=t,qe.autoUpdate=n,qe.needsUpdate=r,qe.type=i}function st(e){R(`WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function X(e){let t=e.target;t.removeEventListener(`dispose`,X),ct(t)}function ct(e){lt(e),K.remove(e)}function lt(e){let t=K.get(e).programs;t!==void 0&&(t.forEach(function(e){He.releaseProgram(e)}),e.isShaderMaterial&&He.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=Ne);let o=i.isMesh&&i.matrixWorld.determinantAffine()<0,s=Et(e,t,n,r,i);G.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Be.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;tt.setup(i,r,s,n,c);let h,g=Qe;if(c!==null&&(h=ze.get(c),g=$e,g.setIndex(h)),i.isMesh)r.wireframe===!0?(G.setLineWidth(r.wireframeLinewidth*V()),g.setMode(H.LINES)):g.setMode(H.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),G.setLineWidth(e*V()),i.isLineSegments?g.setMode(H.LINES):i.isLineLoop?g.setMode(H.LINE_LOOP):g.setMode(H.LINE_STRIP)}else i.isPoints?g.setMode(H.POINTS):i.isSprite&&g.setMode(H.TRIANGLES);if(i.isBatchedMesh){if(Ie.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?ze.get(c).bytesPerElement:1,o=K.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(H,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function ut(e,t,n,r){z!==null&&e.isNodeMaterial&&z.setObject(r,e),Oe===!0&&Ke.setState(e,n,!1),e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,St(e,t,r),e.side=0,e.needsUpdate=!0,St(e,t,r),e.side=2):St(e,t,r)}this.compile=function(e,t,n=null){n===null&&(n=e),z!==null&&z.renderStart(e,t,n),M=Ge.get(n),M.init(t),ne.push(M),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(M.pushLight(e),e.castShadow&&M.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(M.pushLight(e),e.castShadow&&M.pushShadow(e))}),M.setupLights(),z!==null&&z.updateLights(M.state.lightsArray),ke=this.localClippingEnabled,Oe=Ke.init(this.clippingPlanes,ke),Oe===!0&&Ke.setGlobalState(this.clippingPlanes,t),z!==null&&qe.render(M.state.shadowsArray,n,t);let r=/* @__PURE__ */ new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let i=e.material;if(i){if(Array.isArray(i))for(let a=0;a<i.length;a++){let o=i[a];ut(o,n,t,e),r.add(o)}else ut(i,n,t,e),r.add(i)}}),M=ne.pop(),z!==null&&z.renderEnd(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){r.forEach(function(e){let t=K.get(e).currentProgram;(t===void 0||t.isReady())&&r.delete(e)}),r.size===0?t(e):setTimeout(n,10)}Ie.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let dt=null;function ft(e){dt&&dt(e)}function pt(){ht.stop()}function mt(){ht.start()}let ht=new Qi;ht.setAnimationLoop(ft),typeof self<`u`&&ht.setContext(self),this.setAnimationLoop=function(e){dt=e,it.setAnimationLoop(e),e===null?ht.stop():ht.start()},it.addEventListener(`sessionstart`,pt),it.addEventListener(`sessionend`,mt),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){R(`WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(I===!0)return;z!==null&&z.renderStart(e,t);let n=it.enabled===!0&&it.isPresenting===!0,r=P!==null&&(de===null||n)&&P.begin(F,de);if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),it.enabled===!0&&it.isPresenting===!0&&(P===null||P.isCompositing()===!1)&&(it.cameraAutoUpdate===!0&&it.updateCamera(t),t=it.getCamera()),e.isScene===!0&&e.onBeforeRender(F,e,t,de),M=Ge.get(e,ne.length),M.init(t),M.state.textureUnits=q.getTextureUnits(),ne.push(M),Ae.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),t.isArrayCamera?De.setFromArrayCamera(t):Ee.setFromProjectionMatrix(Ae,N,t.reversedDepth),ke=this.localClippingEnabled,Oe=Ke.init(this.clippingPlanes,ke),j=We.get(e,te.length),j.init(),te.push(j),this.info.render.frame++,it.enabled===!0&&it.isPresenting===!0){let e=F.xr.getDepthSensingMesh();e!==null&&gt(e,t,-1/0,F.sortObjects)}gt(e,t,0,F.sortObjects),j.finish(),z!==null&&z.updateLights(M.state.lightsArray),F.sortObjects===!0&&j.sort(xe,Se),Pe=it.enabled===!1||it.isPresenting===!1||it.hasDepthSensing()===!1,Pe&&Ye.addToRenderList(j,e),this.info.autoReset===!0&&this.info.reset(),Oe===!0&&Ke.beginShadows();let i=M.state.shadowsArray;if(qe.render(i,e,t),Oe===!0&&Ke.endShadows(),(r&&P.hasRenderPass())===!1){let n=j.opaque,r=j.transmissive;if(M.setupLights(),t.isArrayCamera){let i=t.cameras;if(r.length>0)for(let t=0,a=i.length;t<a;t++){let a=i[t];vt(n,r,e,a)}Pe&&Ye.render(e);for(let t=0,n=i.length;t<n;t++){let n=i[t];_t(j,e,n,n.viewport)}}else r.length>0&&vt(n,r,e,t),Pe&&Ye.render(e),_t(j,e,t)}de!==null&&ue===0&&(q.updateMultisampleRenderTarget(de),q.updateRenderTargetMipmap(de)),r&&P.end(F),e.isScene===!0&&e.onAfterRender(F,e,t),tt.resetDefaultState(),fe=-1,B=null,ne.pop(),ne.length>0?(M=ne[ne.length-1],q.setTextureUnits(M.state.textureUnits),Oe===!0&&Ke.setGlobalState(F.clippingPlanes,M.state.camera)):M=null,te.pop(),j=te.length>0?te[te.length-1]:null,z!==null&&z.renderEnd()};function gt(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)M.pushLight(e),e.castShadow&&M.pushShadow(e);else if(e.isSprite){let i=t.isArrayCamera?De:Ee;if(!e.frustumCulled||e.intersectsFrustum(i)){r&&Me.setFromMatrixPosition(e.matrixWorld).applyMatrix4(Ae);let i=Ve.update(e),a=e.material;a.visible&&j.push(e,i,a,n,Me.z,null,t)}}else if(e.isMesh||e.isLine||e.isPoints){let i=t.isArrayCamera?De:Ee;if(!e.frustumCulled||e.intersectsFrustum(i)){let i=Ve.update(e),a=e.material;if(r&&(e.boundingSphere===void 0?(i.boundingSphere===null&&i.computeBoundingSphere(),Me.copy(i.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),Me.copy(e.boundingSphere.center)),Me.applyMatrix4(e.matrixWorld).applyMatrix4(Ae)),Array.isArray(a)){let r=i.groups;for(let o=0,s=r.length;o<s;o++){let s=r[o],c=a[s.materialIndex];c&&c.visible&&j.push(e,i,c,n,Me.z,s,t)}}else a.visible&&j.push(e,i,a,n,Me.z,null,t)}}}let i=e.children;for(let e=0,a=i.length;e<a;e++)gt(i[e],t,n,r)}function _t(e,t,n,r){let{opaque:i,transmissive:a,transparent:o}=e;M.setupLightsView(n),Oe===!0&&Ke.setGlobalState(F.clippingPlanes,n),r&&G.viewport(pe.copy(r)),i.length>0&&yt(i,t,n),a.length>0&&yt(a,t,n),o.length>0&&yt(o,t,n),G.buffers.depth.setTest(!0),G.buffers.depth.setMask(!0),G.buffers.color.setMask(!0),G.setPolygonOffset(!1)}function vt(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;if(M.state.transmissionRenderTarget[r.id]===void 0){let e=Ie.has(`EXT_color_buffer_half_float`)||Ie.has(`EXT_color_buffer_float`);M.state.transmissionRenderTarget[r.id]=new Xe(1,1,{generateMipmaps:!0,type:e?u:o,minFilter:a,samples:Math.max(4,W.samples),stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:J.workingColorSpace})}let s=M.state.transmissionRenderTarget[r.id],c=r.viewport||pe;s.setSize(c.z*F.transmissionResolutionScale,c.w*F.transmissionResolutionScale);let l=F.getRenderTarget(),d=F.getActiveCubeFace(),f=F.getActiveMipmapLevel();F.setRenderTarget(s),F.getClearColor(ge),_e=F.getClearAlpha(),_e<1&&F.setClearColor(16777215,.5),F.clear(),Pe&&Ye.render(n);let p=F.toneMapping;F.toneMapping=0;let m=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),M.setupLightsView(r),Oe===!0&&Ke.setGlobalState(F.clippingPlanes,r),yt(e,n,r),q.updateMultisampleRenderTarget(s),q.updateRenderTargetMipmap(s),Ie.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let{object:a,geometry:o,material:s,group:c}=t[i];if(s.side===2&&a.layers.test(r.layers)){let t=s.side;s.side=1,s.needsUpdate=!0,bt(a,n,r,o,s,c),s.side=t,s.needsUpdate=!0,e=!0}}e===!0&&(q.updateMultisampleRenderTarget(s),q.updateRenderTargetMipmap(s))}F.setRenderTarget(l,d,f),F.setClearColor(ge,_e),m!==void 0&&(r.viewport=m),F.toneMapping=p}function yt(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],{object:o,geometry:s,group:c}=a,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&bt(o,t,n,s,l,c)}}function bt(e,t,n,r,i,a){z!==null&&i.isNodeMaterial&&z.setObject(e,i),e.onBeforeRender(F,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(F,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,F.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,F.renderBufferDirect(n,t,r,i,e,a),i.side=2):F.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(F,t,n,r,i,a)}function xt(e){let t=0;for(let n of e)n.texture!==null&&t++;return t}function St(e,t,n){t.isScene!==!0&&(t=Ne);let r=K.get(e),i=M.state.lights,a=M.state.shadowsArray,o=i.state.version,s=He.getParameters(e,i.state,a,t,n,M.state.lightProbeGridArray),c=He.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial||e.isMeshLambertMaterial||e.isMeshPhongMaterial?t.environment:null,r.fog=t.fog;let u=e.isMeshStandardMaterial||e.isMeshLambertMaterial&&!e.envMap||e.isMeshPhongMaterial&&!e.envMap;r.envMap=Re.get(e.envMap||r.environment,u),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,X),l=/* @__PURE__ */ new Map,r.programs=l,r.programVariants=/* @__PURE__ */ new Map);let d=l.get(c);if(d!==void 0){if(r.currentProgram===d&&r.lightsStateVersion===o)return Tt(e,s),d}else s.uniforms=He.getUniforms(e),z!==null&&e.isNodeMaterial&&z.build(e,n,s),e.onBeforeCompile(s,F),d=He.acquireProgram(s,c),l.set(c,d),r.uniforms=s.uniforms;let f=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(f.clippingPlanes=Ke.uniform),Tt(e,s),r.needsLights=Ot(e),r.lightsStateVersion=o,r.needsLights&&(f.ambientLightColor.value=i.state.ambient,f.lightProbe.value=i.state.probe,f.sunLights.value=i.state.sun,f.sunLightShadows.value=i.state.sunShadow,f.directionalLights.value=i.state.directional,f.directionalLightShadows.value=i.state.directionalShadow,f.spotLights.value=i.state.spot,f.spotLightShadows.value=i.state.spotShadow,f.rectAreaLights.value=i.state.rectArea,f.ltc_1.value=i.state.rectAreaLTC1,f.ltc_2.value=i.state.rectAreaLTC2,f.pointLights.value=i.state.point,f.pointLightShadows.value=i.state.pointShadow,f.hemisphereLights.value=i.state.hemi,f.sunShadowMatrix.value=i.state.sunShadowMatrix,f.sunShadowCascade.value=i.state.sunShadowCascade,f.directionalShadowMatrix.value=i.state.directionalShadowMatrix,f.spotLightMatrix.value=i.state.spotLightMatrix,f.spotLightMap.value=i.state.spotLightMap,f.pointShadowMatrix.value=i.state.pointShadowMatrix),r.numLightProbeGrids=xt(M.state.lightProbeGridArray),r.currentProgram=d,r.uniformsList=null,d}function Ct(e,t,n,r,i){let a=K.get(e),o=a.currentProgram.id+`,`+r+`,`+i,s=a.programVariants.get(o);return s===void 0?(s=St(e,t,n),a.programVariants.set(o,s)):(a.currentProgram=s,a.uniformsList=null,a.outputColorSpace=r,a.toneMapping=i),s}function wt(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=Ro.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function Tt(e,t){let n=K.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function Et(e,t,n,r,i){t.isScene!==!0&&(t=Ne),q.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial?t.environment:null,s=de===null?F.outputColorSpace:de.isXRRenderTarget===!0?de.texture.colorSpace:J.workingColorSpace,c=r.isMeshStandardMaterial||r.isMeshLambertMaterial&&!r.envMap||r.isMeshPhongMaterial&&!r.envMap,l=Re.get(r.envMap||o,c),u=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,d=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),f=!!n.morphAttributes.position,p=!!n.morphAttributes.normal,m=!!n.morphAttributes.color,h=0;r.toneMapped&&(de===null||de.isXRRenderTarget===!0)&&(h=F.toneMapping);let g=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=g===void 0?0:g.length,v=K.get(r),y=M.state.lights;if(Oe===!0&&(ke===!0||e!==B)){let t=e===B&&r.id===fe;Ke.setState(r,e,t)}let b=!1,x=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==y.state.version||i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i._colorsTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i._colorsTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?b=!0:v.envMap===l?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==Ke.numPlanes||v.numIntersection!==Ke.numIntersection)?b=!0:v.vertexAlphas===u&&v.vertexTangents===d&&v.morphTargets===f&&v.morphNormals===p&&v.morphColors===m&&v.morphTargetsCount===_&&v.numLightProbeGrids===xt(M.state.lightProbeGridArray)?(v.outputColorSpace!==s||v.toneMapping!==h)&&(x=!0):b=!0:b=!0:(b=!0,v.__version=r.version);let S=v.currentProgram;(b===!0||x===!0)&&(S=x===!0?Ct(r,t,i,s,h):St(r,t,i),z&&r.isNodeMaterial&&z.onUpdateProgram(r,S,v));let C=!1,w=!1,T=!1,E=S.getUniforms(),D=v.uniforms;if(G.useProgram(S.program)&&(C=!0,w=!0,T=!0),r.id!==fe&&(fe=r.id,w=!0),C||B!==e){G.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),E.setValue(H,`projectionMatrix`,e.projectionMatrix),E.setValue(H,`viewMatrix`,e.matrixWorldInverse);let t=E.map.cameraPosition;t!==void 0&&t.setValue(H,je.setFromMatrixPosition(e.matrixWorld)),W.logarithmicDepthBuffer&&E.setValue(H,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&E.setValue(H,`isOrthographic`,e.isOrthographicCamera===!0),B!==e&&(B=e,w=!0,T=!0)}if(v.needsLights&&(y.state.sunShadowMap.length>0&&E.setValue(H,`sunShadowMap`,y.state.sunShadowMap,q),y.state.directionalShadowMap.length>0&&E.setValue(H,`directionalShadowMap`,y.state.directionalShadowMap,q),y.state.spotShadowMap.length>0&&E.setValue(H,`spotShadowMap`,y.state.spotShadowMap,q),y.state.pointShadowMap.length>0&&E.setValue(H,`pointShadowMap`,y.state.pointShadowMap,q)),i.isSkinnedMesh){E.setOptional(H,i,`bindMatrix`),E.setOptional(H,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),E.setValue(H,`boneTexture`,e.boneTexture,q))}i.isBatchedMesh&&(E.setOptional(H,i,`batchingTexture`),E.setValue(H,`batchingTexture`,i._matricesTexture,q),E.setOptional(H,i,`batchingIdTexture`),E.setValue(H,`batchingIdTexture`,i._indirectTexture,q),E.setOptional(H,i,`batchingColorTexture`),i._colorsTexture!==null&&E.setValue(H,`batchingColorTexture`,i._colorsTexture,q));let O=n.morphAttributes;if((O.position!==void 0||O.normal!==void 0||O.color!==void 0)&&Ze.update(i,n,S),(w||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,E.setValue(H,`receiveShadow`,i.receiveShadow)),(r.isMeshStandardMaterial||r.isMeshLambertMaterial||r.isMeshPhongMaterial)&&r.envMap===null&&t.environment!==null&&(D.envMapIntensity.value=t.environmentIntensity),D.dfgLUT!==void 0&&(D.dfgLUT.value=Xs()),w){if(E.setValue(H,`toneMappingExposure`,F.toneMappingExposure),v.needsLights&&Dt(D,T),a&&r.fog===!0&&Ue.refreshFogUniforms(D,a),Ue.refreshMaterialUniforms(D,r,be,ye,M.state.transmissionRenderTarget[e.id]),v.needsLights&&v.numLightProbeGrids>0){let e=ee,t=0;for(let n of M.state.lightProbeGridArray)n.texture!==null&&(e.textures[t]=n.texture,e.min[t]=n.boundingBox.min,e.max[t]=n.boundingBox.max,e.resolution[t]=n.resolution,t++);for(let n in e)e[n].length=t;D.probesSH.value=e.textures,D.probesMin.value=e.min,D.probesMax.value=e.max,D.probesResolution.value=e.resolution}Ro.upload(H,wt(v),D,q)}if(r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(Ro.upload(H,wt(v),D,q),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&E.setValue(H,`center`,i.center),E.setValue(H,`modelViewMatrix`,i.modelViewMatrix),E.setValue(H,`normalMatrix`,i.normalMatrix),E.setValue(H,`modelMatrix`,i.matrixWorld),r.uniformsGroups!==void 0){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];nt.update(n,S),nt.bind(n,S)}}return S}function Dt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.sunLights.needsUpdate=t,e.sunLightShadows.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function Ot(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return le},this.getActiveMipmapLevel=function(){return ue},this.getRenderTarget=function(){return de},this.setRenderTargetTextures=function(e,t,n){let r=K.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),K.get(e.texture).__webglTexture=t,K.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=K.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0},this.setRenderTarget=function(e,t=0,n=0){de=e,le=t,ue=n;let r=null,i=!1,a=!1;if(e){let o=K.get(e);if(o.__useDefaultFramebuffer!==void 0){G.bindFramebuffer(H.FRAMEBUFFER,o.__webglFramebuffer),pe.copy(e.viewport),me.copy(e.scissor),he=e.scissorTest,G.viewport(pe),G.scissor(me),G.setScissorTest(he),fe=-1;return}if(o.__webglFramebuffer===void 0)q.setupRenderTarget(e);else if(o.__hasExternalTextures)q.rebindTextures(e,K.get(e.texture).__webglTexture,K.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(o.__boundDepthTexture!==t){if(t!==null&&K.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.`);q.setupDepthRenderbuffer(e)}}let s=e.texture;(s.isData3DTexture||s.isDataArrayTexture||s.isCompressedArrayTexture)&&(a=!0);let c=K.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(r=Array.isArray(c[t])?c[t][n]:c[t],i=!0):r=e.samples>0&&q.useMultisampledRTT(e)===!1?K.get(e).__webglMultisampledFramebuffer:Array.isArray(c)?c[n]:c,pe.copy(e.viewport),me.copy(e.scissor),he=e.scissorTest}else pe.copy(Ce).multiplyScalar(be).floor(),me.copy(we).multiplyScalar(be).floor(),he=Te;if(n!==0&&(r=oe),G.bindFramebuffer(H.FRAMEBUFFER,r)&&G.drawBuffers(e,r),G.viewport(pe),G.scissor(me),G.setScissorTest(he),i){let r=K.get(e.texture);H.framebufferTexture2D(H.FRAMEBUFFER,H.COLOR_ATTACHMENT0,H.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(a){let r=t;for(let t=0;t<e.textures.length;t++){let i=K.get(e.textures[t]);H.framebufferTextureLayer(H.FRAMEBUFFER,H.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=K.get(e.texture);H.framebufferTexture2D(H.FRAMEBUFFER,H.COLOR_ATTACHMENT0,H.TEXTURE_2D,t.__webglTexture,n)}fe=-1};function kt(e){let t=K.get(e);return(t.__readFormat!==e.format||t.__readType!==e.type)&&(t.__readFormat=e.format,t.__readType=e.type,t.__formatReadable=W.textureFormatReadable(e.format),t.__typeReadable=W.textureTypeReadable(e.type)),t}this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){R(`WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=K.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o],Array.isArray(c)&&(c=c[0])),c){G.bindFramebuffer(H.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;e.textures.length>1&&H.readBuffer(H.COLOR_ATTACHMENT0+s);let u=kt(o);if(u.__formatReadable===!1){R(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(u.__typeReadable===!1){R(`WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&H.readPixels(t,n,r,i,et.convert(c),et.convert(l),a)}finally{let e=de===null?null:K.get(de).__webglFramebuffer;G.bindFramebuffer(H.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=K.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o],Array.isArray(c)&&(c=c[0])),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){G.bindFramebuffer(H.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;e.textures.length>1&&H.readBuffer(H.COLOR_ATTACHMENT0+s);let d=kt(o);if(d.__formatReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(d.__typeReadable===!1)throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let f=H.createBuffer();H.bindBuffer(H.PIXEL_PACK_BUFFER,f),H.bufferData(H.PIXEL_PACK_BUFFER,a.byteLength,H.STREAM_READ),H.readPixels(t,n,r,i,et.convert(l),et.convert(u),0),H.bindBuffer(H.PIXEL_PACK_BUFFER,null);let p=de===null?null:K.get(de).__webglFramebuffer;G.bindFramebuffer(H.FRAMEBUFFER,p);let m=H.fenceSync(H.SYNC_GPU_COMMANDS_COMPLETE,0);return H.flush(),await ae(H,m,4),H.bindBuffer(H.PIXEL_PACK_BUFFER,f),H.getBufferSubData(H.PIXEL_PACK_BUFFER,0,a),H.bindBuffer(H.PIXEL_PACK_BUFFER,null),H.deleteBuffer(f),H.deleteSync(m),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;q.setTexture2D(e,0),H.copyTexSubImage2D(H.TEXTURE_2D,n,0,0,o,s,i,a),G.unbindTexture()},this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=0){let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=et.convert(t.format),_=et.convert(t.type),v;t.isData3DTexture?(q.setTexture3D(t,0),v=H.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(q.setTexture2DArray(t,0),v=H.TEXTURE_2D_ARRAY):(q.setTexture2D(t,0),v=H.TEXTURE_2D),G.activeTexture(H.TEXTURE0),G.pixelStorei(H.UNPACK_FLIP_Y_WEBGL,t.flipY),G.pixelStorei(H.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),G.pixelStorei(H.UNPACK_ALIGNMENT,t.unpackAlignment);let y=G.getParameter(H.UNPACK_ROW_LENGTH),b=G.getParameter(H.UNPACK_IMAGE_HEIGHT),x=G.getParameter(H.UNPACK_SKIP_PIXELS),S=G.getParameter(H.UNPACK_SKIP_ROWS),C=G.getParameter(H.UNPACK_SKIP_IMAGES);G.pixelStorei(H.UNPACK_ROW_LENGTH,h.width),G.pixelStorei(H.UNPACK_IMAGE_HEIGHT,h.height),G.pixelStorei(H.UNPACK_SKIP_PIXELS,l),G.pixelStorei(H.UNPACK_SKIP_ROWS,u),G.pixelStorei(H.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=K.get(e),r=K.get(t),h=K.get(n.__renderTarget),g=K.get(r.__renderTarget);G.bindFramebuffer(H.READ_FRAMEBUFFER,h.__webglFramebuffer),G.bindFramebuffer(H.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(H.framebufferTextureLayer(H.READ_FRAMEBUFFER,H.COLOR_ATTACHMENT0,K.get(e).__webglTexture,i,d+n),H.framebufferTextureLayer(H.DRAW_FRAMEBUFFER,H.COLOR_ATTACHMENT0,K.get(t).__webglTexture,a,m+n)),H.blitFramebuffer(l,u,l+o,u+s,f,p,f+o,p+s,H.DEPTH_BUFFER_BIT,H.NEAREST);G.bindFramebuffer(H.READ_FRAMEBUFFER,null),G.bindFramebuffer(H.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||K.has(e)){let n=K.get(e),r=K.get(t);G.bindFramebuffer(H.READ_FRAMEBUFFER,se),G.bindFramebuffer(H.DRAW_FRAMEBUFFER,ce);for(let e=0;e<c;e++)w?H.framebufferTextureLayer(H.READ_FRAMEBUFFER,H.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):H.framebufferTexture2D(H.READ_FRAMEBUFFER,H.COLOR_ATTACHMENT0,H.TEXTURE_2D,n.__webglTexture,i),T?H.framebufferTextureLayer(H.DRAW_FRAMEBUFFER,H.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):H.framebufferTexture2D(H.DRAW_FRAMEBUFFER,H.COLOR_ATTACHMENT0,H.TEXTURE_2D,r.__webglTexture,a),i===0?T?H.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):H.copyTexSubImage2D(v,a,f,p,l,u,o,s):H.blitFramebuffer(l,u,l+o,u+s,f,p,f+o,p+s,H.COLOR_BUFFER_BIT,H.NEAREST);G.bindFramebuffer(H.READ_FRAMEBUFFER,null),G.bindFramebuffer(H.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?H.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?H.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):H.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?H.texSubImage2D(H.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?H.compressedTexSubImage2D(H.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):H.texSubImage2D(H.TEXTURE_2D,a,f,p,o,s,g,_,h);G.pixelStorei(H.UNPACK_ROW_LENGTH,y),G.pixelStorei(H.UNPACK_IMAGE_HEIGHT,b),G.pixelStorei(H.UNPACK_SKIP_PIXELS,x),G.pixelStorei(H.UNPACK_SKIP_ROWS,S),G.pixelStorei(H.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps===!0&&t.mipmapsAutoUpdate===!0&&H.generateMipmap(v),G.unbindTexture()},this.initRenderTarget=function(e){K.get(e).__webglFramebuffer===void 0&&q.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?q.setTextureCube(e,0):e.isData3DTexture?q.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?q.setTexture2DArray(e,0):q.setTexture2D(e,0),G.unbindTexture()},this.resetState=function(){le=0,ue=0,de=null,G.reset(),tt.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return N}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=J._getDrawingBufferColorSpace(e),t.unpackColorSpace=J._getUnpackColorSpace()}};const Qs={scale:32.5,count:3687,pos:`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`,nor:`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`,col:`j7Jmi69jjLBjkbVolbRpjLBj5s+X6dKa59CY8Nmh48yU59CY5M2U5M2V7tef6tOb6dKa5M2V48yU5s+X6tSb69Wc69Sc6dKa6dKa6tOb6NGZ5s+X5c6W6NGZ6NGZ6NGZ48yU6tOb6NKZ6tOb5s+X59CY5c6W6tOb7dae5M2V5c6W5s+X5s+X7tef59CY5c6V5c6W5M2V5M2V6NGZ6tOb6NGZ5M2V6NGZ7dae7NWd6dKa6dKa6tOb5c6W59CY5s+X6tSb6NGZ59CY7NWd6tOb59CY6NGZ5s+X69Sc5c6V48yU59CY59CY5c6W4cqS6NGZ6NGZ6dKa5s+X6dKa6NGZ7NWd6tSb48yU5s+X5c6W59CY6NGZ4suT5s+X7dae6dKa6NGZ6dKa4suT5c6W5s+XrKiR5s+X6NGZ4cqS6dKa5M2V6NGZ5c6W7tef6tOb6NGZ5c6W5s+X6NGZjJGM6tOb6NGZ59CY6NKZ5M2V5M2V6dKa48yU5c6W5M2V5M2V59CY5s+X6NGZ6NGZ69Sc59CY6NGY6tOb7tef7NWd69Sc6NGZio+K6NGZ6dKa6tOb6dKa6dKa6NGZ5s+X5s+W5c6W48yU6tOb7dae5s+W48yU6NGZ48yU59CY6dKZ6dKa6dKa6tOb5s+X59CY5s+X5c6W5M2V7dad69Sc6tOb6dKa6dKa5c6W48yU4cqS6dKa69Sc7NWd59CY59CYjpOO69Sc69Sc6tOb59CY6tOb6dKa0MCV5s+X59CY59CY6NGY5s+X59GY69Sc5s+X6NGZ6dKa59CY5c6W6tOb6NGZ6tOb69Sc6NGZj5KK5M2V5s+X5c6W5c6W5s+X5s+WwbWR7NWd7NWd59CY59CY5s+X7NWd7tef79ig59CY5c6W4suT6tOb5c6W5s+XiI2Ii65i5s+X6tOb59CY5c6W59CY6NGZ6dKa6dKa5s+X59GY59CY48yU59CY59CY6dKa5s+X5s+X59GY6dKZ6NGZ6dKa6NGZ5tCX5s+X6dKa5s+X6NGZ6dKa59GY5s+X6NGY6dKa48yU59CY6NGZ5M2U5M2V5c6W5s+X6NGZ6dKa7NWd48yU4cqS59CY5s+X59CY5s+X5s+X7dae69Sc7dae79ig48yU6NGZ7dae6tOb69Sc59CY6dKa6NGZ6NGZ6NGZ6tOb7NWc6NGZ6tOb5M2V4suT6NGZ5M2V5s+X5s+X5M2V6NGZ5s+X5M2V59CX5M2V59CY69Sc6dOa6dKa59CX6NGZ59CY6dKa5c6W6NGZ5s+X6NGZ59CY69Sc6NKZ6NGZ6NGZ59CY79ig79ig7tef79ig5c6V6NGZ7NWd5M2V5s+X6NGZ5c6W5s+X6tOb5s+X6NGZ4suT5s+X6NKZ5s+X5M2V59CY4suT4cqS4suT5c6W6NGZ48yU5M2V5s+X6dKa7tef5tCX69Sc7NWd6dKa6dKa6dKZ8Nmh59CY6tOb6NGZ7NWd69Sc6dKa6NGZ6dKa59CY6tOb7tef6tOb5s+X7dae7tef79ig7dae6NGZ7dae7dae5M2V69Sc7NWd59CY7dae6dKZ5s+X7dae5s+X6dKa7NWd7NWd7dae69Sc69Sc5M2V6NGZ7NWd6tOb6dKa6tOb7dad6dKa69Sc7NWd6tOb69Wc6NGZ59CY6dKa6dKa6NGZ59CY69Sc6tOb6tOb7NWd7NWd69Sc6tOb59GY6dKZ6NGZ6dKa59CY6NGZ5s+X5c6W59CY5s+X59CY5s+X5c6W6dKa59CY6NGZ6NGZ59CY6tOb59GY69Sc5s+X6NGZ5c6W5c6W6NGZ6NGZ6dKa69Sc5s+X6tOb7dae7NWd59CY7NWd6NGZ6tOb5s+X5s+X7NWd7NWd7NWd5c+W48yU48yU6dKa6dKa5c6W7NWd6NGZ7dae7dae5c6W59CX6dKa79ig69Sc6dKZ6NGZ6tOb5c6W6NGZ7dae69Sc5s+X59CY59CY6NGZ59CY6tOb6dKa6tOb5s+X6NGZ48yU5s+X5c+W69Sc5c6W6dKa59CY5M2V5s+X7NWd5c6W59CY6tOb6dKa59CY69Sc6dKa6tOb7NWd69Sc6tOb7NWc59CY59GY6NGZ5s+X6dKa5c6W59CY5M2V5s+X48yT5M2V59CY6NGZ6dKa6NGZ6NGZ5c6W59CY6NGZ59CY5s+X59CY6NGZ59CY6NGZ69Sc5M2V4suT59CY6dKa6dKa69Sc59CY6tOb69Sc6NGZ5c6W6tOb7dae5s+X5s+X6tOb5c+W48yU7NWd69Sc5s+X6NGZ59CY7dad5s+X5M2V59CY482U59CY59CX5s+X5M2V6dOa6NGZ6tSb6NGZ69Sc6tOb69Sc6dKa5c6W6NGZ6NGZ5c6W6dKZ6dKa59CY69Sc6dKZ6tOb6NGZ7tef6tOb6tOb5s+W5c6W5c6W7tef69Sc6NGZ5M2V7dae6NGY59CY6dKa5M2V5c6W6NGZ59CY59CY59CY7NWd69Sc4cqS69Sc5s+X5M2V6NGZ69Sc7NWd6dKa6NGZ59CY6NGZ6dKa4cqS6NGZ7NWd5c6W69Sc59CY48yU6dKa6tOb6NGY59CY4MmR59CY5s+X5M2V59CY5M2V59CY5s+X59CY6dKa5M2V59CX5s+X59CY48yU6tOa59CY5s+X6tOb59CX7dae5c6W59CY7NWd7dae7tef59CY59CY59CY59CY6NGZ59CX6NGZ5M6V6NGZ5s+X7tef5s+X59CY5s+X5tCX5s+X5s+X69Sc6dKa6NGZ59CY59CY69Sc69Wc59CY5s+X6tOb59CY69Sc5tCX6tOb6tOb69Sc6NGZ69Sc5s+X7dae7dae4suT6NGZ7dae6NGY7dae59CY6tOb69Sc6dKa59CY6dKa59CY6NGZ59CY6tOb6NGZ6tOb4suT4suT59GY6tOb5s+X5c6W6NGZ6dKa5c6V59CY6tOb4suT6tOb48yU5s+X69Sc7tef5s+X5c6W5M2V5s+W5c6W6tOb5tCX7NWd6NGZ6dKa6NGZ6dKa7NWd6dKa6dKa5M6V6dKa7dae59CY69Wc7dae69Sc5s+X59CY4suT7NWd59CY5c6W6dKa5c6W59CY59CY5s+X4suT6dOa6NGZ6NGZ5M2V59CY5M2V5s+X6tOb7NWd5s+X5s+X5s+X7NWd59CY7NWd6tSb5c6W48yU6dKa7tef69Sc6dKa69Sc6NGZ6dOa6dKa69Sc6dKarr14kLNnxcOE5c6WxcKD0MmL5s+X7NWd5s+Xiq5hpbpyia1grLh06NGZ5s+X79ig4suT6tOb6dKa5s+X59CY5c6W6dKa5M6V69Sc4suT5s+X7dae5s+X6dKaw7+B69Sc5c6V1siN5M2U59CY6NKZ482U48yU6NGZ6dKa5M2V6tOb5s+X6tOb6tOb69Sb59CY6NGZ4suT79ig6NGZ6NGZ5c6W6tOb5s+X6tOb69Sb6tOb6dKa6NGZ59CY6dKa6tOb5M2V6tOb6dKa5c6V2MyQ6NGZ6NOa7tef59CY59CY59CY69Sc7NWd6dKa4suT6dKa6NGZ6NGZ6NGZ6NGZ7NWd6tOb5s+X59CY6NGZ6NGZ5s+X7NWd5c6W5tCX7dae5s+X7NWd5c6W6dKa5s+X6tOb6tOb6NGZ69Sb6tOb5s+X5M2U5c6V6dKa5tCX59CY59CY5c6V6NGZ6dKa5c6W7tef5M2V69Sc6tOb7dad6dKa6dKa5s+X6dKa4suT59CY6dKa59CY6dKZ6NGZ5c6W6NGZ59CY59CY6NGZ6dKa7NWd6NGZ59CY5c6W6tOa79ig59CY6tOb5c6W5c6V69Sc6tOb59CY5c6W59CY7dae6NGZ69Sc5s+X48yU59CY5c6W59CY5c6W6dKa6NGZ5M2V6dKa69Sc59CY6dKa48yU5s+X6tOb5s+X6tOb6tOb5s+X5s+X6tOb6tOb59CY59CY7NWd5tCX59CY5c6W5s+X69Sc59CY59CY6dKa69Sc5s+X6tOb5M2V6dKa59CY59CY5s+X59GY6NGZ5c6W6NGZ7NWc6NGZ6dKa7tef7dae5c6W6dKa79ig69Sc6NGZ6dKa59CY6dKa59CY4suT59CY6tOb69Sc6tOb6NGZ5s+X6tSb5M6V5M2V48yU59CY6dKa59CY48yU5s+X7NWd5s+X6NGZ6dKZ6NGZ6dKa6NGZ6dKa6NGZ59CY5s+X5c6W6NGZ6NGZ5M2V5c6W7NWd6dKa59CY6dKa6NGZ7NWd59CY59CY6tOb5c6V482U5M2V6NGY59CY6NGZ6tOb59CY69Sc6NGZ7NWd5s+X4suT69Sc6tOb6tOb6dKa69Sc59CY59CY5c6W69Sc6dKa69Sc59CY6tOb6NGZ5c6W59CY7NWc69Sc59CY69Sc6NGZ5s+X7dad6dKa59CY6NGZ5c6W5M2V5s+X6dKa6tOb5c6W6dOa48yU6dKa5c6W5s+X5c6W5M2V6dKa6tOb5M2V5c6W7NWd69Sc5M2V5c6W6dKa6NGZ6tOa6tOb48yU48yU7tif7NWc7NWd5s+W6dKZ6NGY7dae6NKZ7tef5s+X6tOb5s+X59CY6NGZ5c+W6NGZ6dKa69Sc6NGZ5s+X69Sc6NGY7NWd69Sc5c6V6dKa59CY5s+X5c6W6tOb5M2V59CY7dee6tOb5s+X69Sc48yU7dae69Sc59CX5M2V6NGZ7NWd5c6W69Sc6NGZ5s+X6NKZ48yU5c6W7dae5s+X6NGZ69Sc7NWc69Sc5c6W6tOb6NGZ6dKa59CY6dKa69Sc59CY6NGZ5M2V6NGZ6NGZ59CY59CY6NGZ5M2V6NGZ6dOa5s+X6NGZ59CY6dKa69Sc59CY5s+X5M6V6tOb6tSb6dKa7NWc6dKa59CY7dae6tOb6dKa7NWc6dKZ6tOb6tOb6dKa5s+X69Sc7dae6NGZ5s+X59CY7NWd48yU5s+X7NWd69Sc5s+X5c6W6dKa6dKZ5s+X6tOb5c+W59CY6dKa6tOb7dee5s+X59CY6NGZ69Sc69Sc6tOb7NWd6dKa6NGZ5c6W7NWd6dKa482U6tOb5M2V48yU5s+X5M2V69Sc5M2V6NGZ5M2V5s+X6NGZ59CY5c6W5s+X6NGZ6dKa59CY59CY5s+X5c6W6NGZ59CY6tOa6NGZ6tOb5s+X6dKa6tOb6NGZ7dae5c6W59CX59CY59CY6dKa5c6W7tef7dae59CY5s+W5M2V59CY6tOb6tOb59GY7dae69Sc48yU5s+X4suT59CY59CY6NGZ6dKa6tOb59CY6NGZ5c6W6NGZ6dKa69Sc59CY69Sc6NGZ48yU7NWd59CY6NGZ69Sc6NGZ6dKa6NGY6tOb59CY5s+X5s+X6dKa5s+X5M2V6dKa5M2V6dKa7NWd7dae6dKa5c6V7NWd5c6W69Sc69Sc6NKZ6NGZ7NWd5s+W6tOb7NWd4suT5M2V6NGZ5s+X48yU5s+X5M2V7NWd4suT69Sc5c6W6dKa69Sc6tOb6tOa5c6W6dKa7Nad6dKa4suT7dae5M2V6NGZ59CY6tOb69Sc5M6V5s+X5c6W6dKa48yU6tOb5c6W5s+X5s+X6tOb5M2V4suT59CY6NGZ6tOb6NGZ69Sc69Sc6tOb6NGZ7dae59CY5s+X7tef7NWd6dKa4suT59CY5s+X69Sc6dKa7tee6tOb59CY7dae6dKa59CY59CY6tOb59CY6NGZ69Sc7dae6dKa5s+X5M2V6NGZ5M2V6NGZ7NWd5M2V6dKa7dae6NGZ6dKZ59CY5M2V69Sc59CY48yU6dKa59CY6tOb69Sc48yU59CY6NGZ69Sc59CY59CY6dKa6tOb6NGZiY6J6NGZ6tOb59CY6NGZ6dKa4cqS5c6W4cqS59CY6dKa6NGZ59CY59CY5c6W7NWd4cqS5s+X59CY5c+W59CY5M2V59CY5c6W59CY69Wc6NGZ6tOa6dKa6NGZ48yU6tOb5s+X4cqS6NGZ5s+X6dKa6NGZ7dae69Sb48yU6dKa6dKa5c6W5c6W69Sc6NGZ5M2V7NWd5s+X6NGZ5M2U6tOa5c6W6NGZ5c6W6NGZ59CY59CY6dKa5M2V5tCX5c6V59CY6dKa59CY69Sc59CY59CY6NGZ5M2V5s+X5M2V69Sc5s+X5c6W5c6W7tee7NWd7dae7NWd5c6W7tef5c6W6NGZ5c6W7dee5c6V7NWd6dKa5s+X6dKa59GY6dKa6dKa6tOb6dKa7dae5s+X7NWd6tOb6NGZ6tOb6dKZ6dKa5c6W6tOb7dae6dKa6dKa6NGZ6dKa6NGZ5c6V59CY7NWd5s+X6dKa5c6V6NGZ69Sc6NKZ6tOb6NGZ6NGZ7dae69Sc5c6W6tOb59CX6dKa7NWd5c6W7dae6dKa6tOb59CY6tOb6tOb5c6W6NGZ69Sc5M2V6dKa6tOb5s+X7NWd5M2V6dKa69Sc4s2Y6NGZ5M2V69Sc59CY6tOb5M2V7NWd6tOb59CY5s+X6dKa7NWd5s+X482U5s+X59CY6NGZ6dKa5s+X48yU6dKa5c6W69Sc5s+X59CY48yU5s+X7NWd6dKa48yU6dKa48yU6tOb5s+X5c6W5c6W5c6W4suT5s+X6tOb6NGZ5M2V5s+X6tOb5M2V69Sc5c6W6tOb7NWd6dKa69Sc6dKa5M2V6NGZ5M2V6NGZ6NGZ69Sc59CY6tOb5M2V7NWd5M2V69Sc6dKa59CY6NGZ69Sc6dKa69Sc5c6W5s+X6tOb59CY5c6W48yU6NGZ5s+X6tOb6NGZ6dKa6NGZ6NGZ6tOb59CY6tOb6tOb7dae7dae6NGZ69Sc6NGZ6NKZ6dKa5c6W6dKa5M2V6dKa7tef6NGZ7dae6NGZ5c6W5c6W6tOb6tOb59CY6tOb6dKa69Sc69Sc59CY6tOb59CY6dKa6dKZ59CY6dKa59CY5s+X59CY59CY59CY48yU5s+X6NGZ5s+X6NGZ48yU59CY5M2V5s+X5s+X48yU5s+X6dKa48yU6dKa69Sc5s+X7NWc6dKa7dae5s+X6dKa6tOb7NWd6dKa6NKZ69Sc5s+X69Sc7NWd6dKa7NWd59CY7NWd5c6W7tef59CY7dae59CY6dKa6NGZ6dKa69Sc69Sc6NGZ6NGZ7tef6dKa6NGZ6NGZ5s+X5M2V5c6W5c6W7NWd5c6W6NGZ5M2V5s+X7NWd5s+X59CY5c6V6tOb6dKa5c6W6dKa59CY59CY6dKa5c6W5tCX5s+X6tOb59CY6dKa5s+X5s+X5s+X6tOb5M2V59CY6dKa69Sc5M2V5M2V59GY6tOb48yU6NGZ59CY6dKa6NGZ6NGZ6NGZ59CY6tOa59CY5s+X6NGZ6NGZ5s+X6dKa6NGZ5s+X6tOb5c6W59CY7dae69Sc5s+X69Sc5s+W7dae59CY6dKZ5c6W59CY5tCX69Sc59CY6NKZ5c6W59CY6dKa7tif6tOb69Sc6tOb59CY79ig6dKa6NGZ59CY6tOb6NGZ6tOb5M2V6NGZ5c6W48yU6NGZ5s+X6tOb6NGZ6NGZ5s+X5s+X6dKa69Sc7NWd5M2V5s+X5M2V7Nad6dKa69Sc6dOa5M2V6dKa7dae5s+X59CY48yU6dKa48yU6dKa5c6W5c6W6tOb5s+W7dae69Sc5s+X5s+X6tOb59CY59CY7NWd6NGZ69Sc7NWd69Sc59CY6NGZ7NWd5s+X59CY7NWd5s+X6tSb69Sc5M2V5s+X69Sc6NGZ6NGZ6tOb5s+X7NWd5s+X59GY69Sc6dKZ7NWd6NGZ7NWd7Nad5s+X5s+X4suT6NGY7NWd5s+W6dKZ5s+X7NWd48yU6tOb6NGZ59CY69Sc6NGZ5s+X5s+X48yU69Sc6NGZ69Sc7dae4suT6dKa6dKa5c6W59CY5M2V6dKa6NGZ69Sc7dae59CY6NGZ5c6W7dad69Sc7Nad6dKa6tOb6tOb6tOb6NGZ5c6W5M2V59CY5s+X59CX59CY5c6V5s+X5c6W6NGZ59CY59CY59CY5s+X6dKa7NWd5c6W5s+X69Wc6tOb59CY6dKa59CY6dKa7NWd59CY6tOb59CY69Sc59CY6dKa6dKa6dKa59CY6NGZ69Sc7dad69Sc59GY7NWd69Sc6dKa59CY69Sc6dKa6tOb6tOb7tef7NWd69Sb69Sc5M2V6tOb6NGZ6tOb6tOb5s+X59CY6NGZ6tOb6NGZ6tOb59CY6NGZ6NGZ5c6W6tOa59CY6dKa6tOb7NWd6tOb6tOa6NKZ6tOb7dae7NWd7dae6dOa6tOb6dKa6dKa6tOb7NWd69Sb7dae6NGY5s+X6dKa6NGZ7NWd7tef69Sc69Sb7NWd6tOb7NWd69Sc7dae6dKa7NWd7NWd6NGZ69Sc6NGZ6tOb7NWd6dKa6NGZ7tef6dKa59CY7tef7NWd7tef7tef59CY6dKa59CY7dae7NWd6dKa7dae6NGZ59CY59CY6NGZ7dae7dae5M2V59CX5M2V6NGZ7dae7dae6NGZ6NGZ59CY7NWd5M2V6NGZ6NGZ59CY7tef6tOb5s+X7dae7dae7dae79if5s+X6tOb6NGZ7tef7dae79ig7dae59CY6NGZ6NGZ6NGZ59CY6dKa6tOb6tObkpeS6tOb6NGZ6tSb5s+X7NWc6NGZ6dKa6dKa6NKZ6NGZ6NGZ7tee79ig6NGZ69Sc6NGZ5c6W6tOb6dKa59CY7tef69Sc8Nmg7NWd6dKZ69Sc59CY69Sc7NWd59CY5s+X5c6W6dKa7tef5s+X6dKZ5s+X5c6W7tef6dKa79ig5c+W6dKa7NWd5s+X7NWd6tOb79mg7NWd4suT4cqS4suT5c6W5M2V5c6W4suT4suT4cqS4suT4suT5M2V48yT5c6W5s+X6dOa6NGZ4syT5s+X6NGZ6tSb4suT5s+X59CY6NGZ59CY5M2V6NGZ5c6W69Sc5c+W5s+X5s+X48yU48yU6dKa4suT4cqS59CY5M2V5c6V59CY6NGZ6NKZ7dae6dKa5c6W7NWd5s+X7NWd6NGZ69Sc4suT48yU5c6W79ig79ig7tef79ig7NWd79ig79ig7tef79ig69Sc79ig7NWd6NGZ79ig7dae69Sc69Sc6NGY59CY69Sc6NGZ59CY6NGZ59CY69Sc59CY6tSb6NGZ59CY6NGY6NGZ7NWd69Sb6dKa6dKa59CX6NGZ4suT6dKa6NGZ48yU6tOb6NGZ6tOb6dKa69Sc59CY69Sc5M2V5M2V5s+X59CY59CY6dKa6tOa6tOb6dKa6NGZ59CY69Sc59CY6NKZ59CY59CY69Sc6tOb6tOb59CY5c6W5M2V5c6V5M2V5s+X5s+X5M2V5c6V5M2V5M2V5s+X5s+X59GY5M2V5M2V5c6W5M2V6NGZ6dKa59CY6NGZ6tOb69Sc6NGZ6tOb59CY6tOb6tOb6NGZ69Sc5s+X6tOb6NGZ48yU6tOb7NWd79ig7dae5s+X7NWd69Sb69Sc59GY6NGZ6NGZ6NGZ69Sc59CY69Sc48yU6tOb6dKa6dKa6NKZ6NGZ48yU48yU7NWd69Sb7dae79ig7dae7tif7NWd7dae69Sc7tef7NWd7tef6NGZ79ig7dae7tef7dae48yU4suT59CX59CY5s+X59CY48yU5s+X4cuS7NWd48yU5s+X5c+W59CX69Sc7NWd7dae6dKa6dKa6NGZ6tOb59CY6dKa5s+X6tOb69Sc6dKa6NGZ48yU7NWd5s+X6NGZ59CY69Sc6dKa6dKa5s+X59CY6tOb5s+X6tOb6NGZ48yU6dKa5c6W6dKa5M2V69Sc5s+X69Sc59CY6dKa5s+X5s+X59CY5s+X6dKa5s+X59CY5s+X59CY6dKa5s+X6dKa59CY6NGY6dKa5s+X5M2V5s+X6dKa5c6V5s+X5s+X59CY6dKa6NGZ6dKa5s+X6NGY5s+X5s+X5s+X6NGZ6dKa6dKa6NGZ5s+X5M2V5s+X6NGZ48yU48yU6NGZ59CY6dOa6dKa5c6W59CY59CY6NGZ48yU6NGZ6tOb5c6W6NGY5s+X5s+X5s+X5s+X5s+X59CY6dKa5M2V6tOb7NWd5M2V5M2V6tOb48yU6tOb48yU69Sc5c6W59CX5s+X5s+Xi65i6dOb5s+XmbZsjbFk6tOb1cyPj7Jmh6tijLBjjLBk6dKa5M2V5s+X59CY6dKa69Sc6dKa6tOb6tOb5s+X5s+X5s+W59CY59CY59CY6dKa6NGZ48yU4suT48yU59GY6dKa69Wc79ig7NWd59CY5s+X7NWd59CY5c6W59CY6dKa59CY69Sb6tOa6dKa5s+X6dKa59CY5c6W5M6V69Sc6NGZ69Sc59CY482U6NGZ7tef482U5tCX48yU5M2V6NGZ6dKa6dKa59CY59CY59CY6NGZ5M2V48yU6NGZ59CY5c6W59CY5M2V5c6W59CY5M2V59CY6NGZ6dKa6tOb6tOb6tOb6dKa6dKa6dKa6tOb6NGZ4suT4suT5s+X6NGY59CY59CY48yU48yU48yU6NGZ5c6W6NGZ7NWd59CY6NGZ59CY5M6V5tCX59CY59CY6dKa5s+X48yU6NGY5s+X5s+X5s+X5s+X7dae69Sc5M2V6NGZ4suT5M2U6tOb59CY6dOa6NGZ7NWd6NGY5s+X59CY69Sc69Sc59CY6NGY5M2V59CY6dKa5s+X59CY6dKa69Sc69Sc6NGZ7tee79ig7dae69ScybyV69Sc7tef69Sc7NWd5tCX59CY6dKa59CY69Sc5s+X6NGZ69Sc59CY59CY59CY5s+X5M6V6NGZ7NWd6NGZ7NWd6NGZ5M2V6tOb5M2V4cuS5c6W6dKa5s+X5s+X6NGZ5s+X6dKa6dKa6dKZ6NGZ6tOb59CX59CY69Sc6NGZ6dKa59CY5c6W48yU5c6W6NGZ5s+X59CY59CY5s+X5c6W5s+X5s+X6tOa6dKa5s+X59CX6NGZ6tOb6dKa7NWd6NGZ6NGZ5c6W7dae69Sc5s+X6dKa7NWd69Wc5s+X6NGZ59CY6dKa5s+X69Sc6NGZ69Sc5s+X5M6V69Sc6dKa6NGZ6dKa6dKa59CY69Sc48yU6NGZ5c6W6dKa6NGZ6dKZ6tOb5s+X69Sc5s+X6dKZ5s+X5s+X6NGZ6dKa59CY6NKZ5s+X69Sc5s+X6NGZ48yU59CY48yU69Sb5c6W6dKa6NGZ7NWd6tOb7NWd5c6W6dKa69Sc6NGZ6tOb59CY6dKZ6NGZ69Sc6dKa6NGZ69Sc79ig6tOb59CY6NGZ7dae6dKa5c6W4suT5M2V59CY59CY59CY5M2V5s+X59CY6dKa59CY6dKa5s+X5c6W7NWd7tef59CY6NGZ6NGZ59CY59CY7NWd6tOb6NGZ6dKa5c6W5s+X6tOb7dae6tOb48yU59CY48yU5c6W7NWd6dKa59CY48yU59CY7NWd48yU6NGZ5s+X5s+X5s+X6NGZ6NGZ5M2V6NGZ59CY6NKZ6NGY69Sc59CY5c6W6NGZ69Sc6dKa69Sc59CY6NGZ6NGZ59CY5M2U59CY6NGZ6tOb6tOb5M2V5s+X6NKZ5s+X6tOb59CY5c6W7tef5c6W5c6W5M6V6NGZ6NGZ6dKZ7tef6NGZ5c6W5M2V6dOa69Sc6tOa6tOb6tOb6NGZ6dKa5c+W59CY5c6W5c6W6NKZ7NWd5c6W5M2V5M2V5M2V6NGZ6dKa59CY5s+X6NGZ5s+X6NGZ6tOa6tOb6tOb6tOb5s+X6dKa6tOb5s+X6NGZ7tef69Sc6dKa59CY4suT69Sc6dOa6NGZ5M2V6tOb69Sc69Sc6NGZ59CY69Sc6dKa6NGZ7NWd6NGZ7tef6tOb5s+X6tOb5s+X69Sc6tOb4syT5s+X6tOb69Sc6dKa6dKa6tOb6NGZ6tOb69Sc6dKa48yU69Sc6NGZ6NKZ6NGZ69Sc7NWd6NGZ69Wc7NWd5s+X6dKa6tOb59GY5s+X7dae5s+W6dKa7NWd59CY59CY5s+X69Sc5M2V59CY5s+X48yU59CY6dKa5s+X6dKa59CY5c6W7NWd48yU6NGY59CY6dKa5c6W5c6W59CY59CY5s+X59CY5M2V5c6W5s+X5c6W59CY48yT5c+W5M2V59CY6dKa6dKa5M2V6NGZ7dae5s+X6NGZ5s+X48yU5s+X7NWd5c6W69Sc59CY69Sc6NGZ6NGZ4suT69Sc69Sc5s+X59CY6NGZ7NWd5s+X69Sc6dKa59CY59CY6dKa79ig5s+X59CY6tOb69Sc6dKa6NGZ5s+X7dae59CY5s+X5s+X6dKa6NGZ6dKa5M2V7NWd6dKa59CY5c6W5s+X6NGZ6dKa69Sc7NWd5c6W6NGZ69Sc48yU6NGZ48yU69Sc6tOb5s+X6NGZ5M2Vi69i59CY5c6W59CY6tObj7Nmh6tei69jia1g59CYgqdhfKNgiKxhi69ig6hg5s+X5M2V6NGZ6dKa5c+W59CY5s+X5s+X59CY7NWd5c6W7NWd5s+X6dKa59CY6dKa7NWc6tOb7daeqqWO4suT59CY5M2V7NWd7dae7NWd7dae6dKa6tOb7dae7NWd7tef6NGZ6tOb48yU59CY69Sc6NGZ69Sc48yU79ig7tef7NWdjpOO69Sc6NGZ6tOb5s+X6tOb69Sc6dKa6tOb5s+X5s+X5M2V6NGZ7NWd6tOb6dKa6NGZ59CY69Sc59CY6tSb7NWd6tOb6tSb59CY79ig7tef79ig6tOb6tOb6dKa5s+X6NGZ4cqS4suT4suT4suT6tOb6dKZ7NWd59CY6NKZ7tef5c6W79ig59CY6NGZ6NGZ5M2V6tOb59CY79ig6NGZ6NGZ59CY59CY59CY7dae7dae6NGZ6NGY6NGZ59CY59CY5c+W6dKa6NGZ7tef6NGY6tOb7NWd6NGZ6dKa7tef69Sc7NWd6dKa5s+X5c6W6NGZ5s+X6NGZ6tOb6dOa6dKa6dKa59CY6NGZ5s+X6tOb5s+X7NWd59CY6tOb7NWd5s+XkJWP5c6W5M2V59CY5c6W4suT59CY5c6W69Sc6NGZ6tOb59CY7NWd5M2V5s+X69Sc69Sc7NWd6NGZ59CY5s+X5M2V7NWd5c6WkZSM6dKa7tef59CY59CY59CY6dKa5s+W5c6W59CY7dad5s+X6dKa6dKa6NGZ6tOb48yU59CY6dKa59CY5c+W48yUvLOT4syTjJGM59CY59CY5tCX69Sc5s+X6NGZ6tOb5s+X5s+W7NWc59CY5s+X6NGZ48yU6dKa5M2V59CY4suT6dKa5c6V6dKa6tOb6dKa6tOb6dKa6NGZ69Sc6NGZ6dOa59CY6tOb6tOb69Sc6tOb59CY59CY59CY5M2U7dae6NGZ6NGZ59CY4suT5s+X5c6W5s+X6tOb6NGZ5s+X6NGZ6NGZ6tOb7dad6dKa5c6W69Sc6NKZ5c6W6dKa69Sc6dKa6dKa59CY5M2V6tOb6dKa6tOb6NGZ5s+X6dKa6dKa59CY5c6W7dae5c6W6NGZ5M2V59CY5s+X6dKa59CY6dKa59CY69Sc5s+X6dKa5s+X5M2V6NGZ6dKa59CY59CY6NGZ5s+W6tObiY6J5s+X48yU69Sc6NGZ6NGZ69Sc482U59CY59CY6tOb59CX59CY6tOb6dOa6dOa6NGZ59CY5M2VjpOOkJWQjZKNio+KjJGMjZKNkJaQkZeRj5SPjJGMj5SPj5SPh4yHkJWQkpeSjZKNjpOOjpOOjJKMhouGj5SPjpOOj5SPi5CLiY6Jio+K0smMzcaJtLt5182Rz8qLusOA08mMz8qMu8OA08mMycSFt7571suPzsWIv8WDsL15j5SPiI2Ii5CLjZKNiY6JiY6JjZKNi5CLi5CLjJGMio+KjZKNjpOOio+Ki5CLjpOOi5GLi5CLj5SPj5SPjpOOjpOOkJWQiI2IiY6JjZKN08SX3s2TwMSC3cuY28uQvcOB59KZ4M6UxMaG5c+X38+UwMOC7dae5dGYwcKCs797i5CLi5CLjpOOio+KjpOOj5SPi5CLkpiSiY6Ji5CLkZaRjJGMi5CLj5SPjJGMiY6Jio+KjZONjJGMj5SPi5CLjZKNjZKNjJGMio+Ki5CL6tSb6NGZ18mO69Sc69Wc3M+T6NGY5c+W18qP7NWd5s+X2cuQ6NGY5s+X3s+U1MqOj5SPio+Kj5SPjpOOkZaRipCKjZKNiI2Ii5CLiI2Iio+KkZaRjpOOkZaRiI2IhouGjpOOjZONhoyGkJWQj5SPjpOOjpOOj5SPk5iTio+KiKxgjbFkiKtfkLNnjrJlia1gj7Nmi69ijrJliq1hjLBjiq5hjbFljbFlj7Nmi69ji5CLkZaRi5GLj5SPkJWQi5CLiI2IjZKNjZKNh42HjJGMjZKNhouGjJGMiI2IjJGMjpOOio+KiY6JjZKNiY6JkpiSiI2IjpOOi5CLjJGMiqZsj7JmjbFki6tnjLBjkLRnjrJljbFkia1giKtfj7JmjrJmiq5hiaxgkLNnjbFkiY6JiI6Ih4yHjJGMiY6JjJGMjZKNiY6JiY6Ji5GLjZKNj5SPiY+JjJGMjJGMio+KkZeRj5SPiY6JkJWQkJWQjZKNj5SPjpOOjJGMjJGM4suT6NGZwcOC5s+X4suTvMJ/79if5tCYwsSD5M2V5tCYxMWF59CY7dadvb5+rbt2kJWQi5CLjZKNiY6JjJGMjZKNio+Kio+KipCKkJWQj5SPjpOOh4yHjZKNiY6Jj5SPhouGiI2Iio+KjZKNi5CLjZONjJGMj5SPiY6JjJGMkLNnkrVpkLRnia1gjbFkiq1hia1gkLNniaxgj7Nnj7NmjLBjjrJmjbFkiKxfjbFk`,idx:`AAABAAIAAwAEAAUABgAHAAgACQAKAAsADAANAA4ADwAQABEAEgATABQAFQAWABcAGAAZABoAGwAcAB0AHgAfACAAIQAiACMAJAAlACYAJwAoACkAKgArACwALQAuAC8ADAAwAA0ADwAxABAAMgAzADQANQA2ADcAOAA5ADoAOwA8AD0APgA/AEAAQQBCAEMARABFAEYARwBIAEkAIQBKACIASwBMAE0ATgBPAFAACQBRAFIAUwBUAFUAVgBXAFgAWQBaAFsAXABdAF4AXwBgAGEAYgBjAGQADwBlADEAZgBnAGgAaQBqAGsAEgBsAG0AbgBvAHAAMgBxADMANQByADYAOABzADkAdAB1AHYAdwB4AHkAFQB6AHsAfAB9AH4AfwCAAIEAGACCABkAOwCDADwAPgCEAD8AhQCGAIcAiACJAIoABgCLAIwAjQCOAI8AQQCQAEIARACRAEUARwCSAEgAkwCUAJUAlgCXAJgAGwCZAJoAmwCcAJ0AngCfAKAAHgChAB8AogCjAKQAIQClAEoApgCnAKgAqQCqAKsAJACsAK0ArgCvALAASwCxAEwATgCyAE8ACQCzAFEAtAC1ALYAtwC4ALkAJwC6ALsAvAC9AL4AvwDAAMEAKgDCACsAUwDDAFQAVgDEAFcAxQDGAMcAyADJAMoAywDMAM0AzgDPANAAWQDRAFoAXADSAF0AXwDTAGAA1ADVANYA1wDYANkALQDaANsA3ADdAN4A3wDgAOEADADiADAAAAACAOMACQALAOQA5QDmAOcA5QDoAOYA6QDqAOsA7ADtAO4A7ADvAO0A8ADxAPIA8wD0APUA8wD2APQA9wD4APkA+gD7APwA+gD9APsA/gD/AAAB+gABAQIB+gADAQEBBAEFAQYBBwEIAQkBBwEKAQgBCwEMAQ0BDgEPARABDgERAQ8BEgETARQBFQEWARcBFQEYARYBGQEaARsBHAEdAR4BHAEfAR0BIAEhASIBIwEkASUBIwEmASQBJwEoASkBKgErASwBKgEtASsBLgEvATABKgExATIBKgEzATEBNAE1ATYBNwE4ATkBNwE6ATgBOwE8AT0BPgE/AUABPgFBAT8BQgFDAUQBRQFGAUcBRQFIAUYBSQFKAUsBTAFNAU4BTAFPAU0BUAFRAVIBUwFUAVUBUwFWAVQBVwFYAVkBWgFbAVwBWgFdAVsBXgFfAWABYQFiAWMBYQFkAWIBZQFmAWcBYQFoAWkBYQFqAWgBawFsAW0BbgFvAXABbgFxAW8BcgFzAXQBdQF2AXcBdQF4AXYBeQF6AXsBfAF9AX4BfAF/AX0BgAGBAYIBgwGEAYUBgwGGAYQBhwGIAYkBigGLAYwBigGNAYsBjgGPAZABkQGSAZMBkQGUAZIBlQGWAZcBkQGYAZkBkQGaAZgBmwGcAZ0BngGfAaABngGhAZ8BogGjAaQBpQGmAacBpQGoAaYBqQGqAasBrAGtAa4BrAGvAa0BsAGxAbIBswG0AbUBswG2AbQBtwG4AbkBugG7AbwBugG9AbsBvgG/AcABwQHCAcMBwQHEAcIBxQHGAccByAHJAcoByAHLAckBzAHNAc4ByAHPAdAByAHRAc8B0gHTAdQB1QHWAdcB1QHYAdYB2QHaAdsB3AHdAd4B3AHfAd0B4AHhAeIB4wHkAeUB4wHmAeQB5wHoAekB6gHrAewB6gHtAesB7gHvAfAB8QHyAfMB8QH0AfIB9QH2AfcB+AH5AfoB+AH7AfkB/AH9Af4B+AH/AQAC+AEBAv8BAgIDAgQCBQIGAgcCBQIIAgYCCQIKAgsCDAINAg4CDAIPAg0CEAIRAhICEwIUAhUCEwIWAhQCFwIYAhkCGgIbAhwCGgIdAhsCHgIfAiACIQIiAiMCIQIkAiICJQImAicCKAIpAioCKAIrAikCLAItAi4CLwIwAjECLwIyAjACMwI0AjUCLwI2AjcCLwI4AjYCOQI6AjsCPAI9Aj4CPAI/Aj0CQAJBAkICQwJEAkUCQwJGAkQCRwJIAkkCSgJLAkwCSgJNAksCTgJPAlACUQJSAlMCUQJUAlICVQJWAlcCWAJZAloCWAJbAlkCXAJdAl4CXwJgAmECXwJiAmACYwJkAmUCXwJmAmcCXwJoAmYCaQJqAmsCbAJtAm4CbAJvAm0CcAJxAnICcwJ0AnUCcwJ2AnQCdwJ4AnkCegJ7AnwCegJ9AnsCfgJ/AoACgQKCAoMCgQKEAoICDgEQAYUChgKHAogChgKJAocCFQEXAYoCiwKMAo0CiwKOAowCHAEeAY8CkAKRApICkAKTApECPgFAAZQClQKWApcClQKYApYCRQFHAZkCmgKbApwCmgKdApsCdQF3AZ4CnwKgAqECnwKiAqACfAF+AaMCpAKlAqYCpAKnAqUCgwGFAagCqQKqAqsCqQKsAqoCpQGnAa0CrgKvArACrgKxAq8C3AHeAbICswK0ArUCswK2ArQC4wHlAbcCuAK5AroCuAK7ArkC6gHsAbwCvQK+Ar8CvQLAAr4CDAIOAsECwgLDAsQCwgLFAsMCEwIVAsYCxwLIAskCxwLKAsgCQwJFAssCzALNAs4CzALPAs0CSgJMAtAC0QLSAtMC0QLUAtICUQJTAtUC1gLXAtgC1gLZAtcCcwJ1AtoC2wLcAt0C2wLeAtwC5QDnAN8C4ALhAuIC4ALjAuEC5ALlAuYC5wLoAukC5wLqAugCTAFOAesC7ALtAu4C7ALvAu0C8ALxAvICmgLzAvQCmgL1AvMC9gL3AvgC+QL6AvsC+QL8AvoCqQKrAv0C/gL/AgAD/gIBA/8CswG1AQIDAwMEAwUDAwMGAwQDBwMIAwkDCgMLAwwDCgMNAwsDGgIcAg4DDwMQAxEDDwMSAxADEwMUAxUDxwIWAxcDxwIYAxYDGQMaAxsDHAMdAx4DHAMfAx0D1gLYAiADAAAhAyIDAAAjAyED2wLdAiQDAwAlAwQAAwAmAyUDJwMoAykDKgMrAywDKgMtAysDLgMvAzADMQMyAzMDMQM0AzIDNQM2AzcDOAM5AzoDOAM7AzkDPAM9Az4DPwNAA0EDPwNCA0ADOAM6A0MDRANFA0YDRANHA0UDSANJA0oDSwNMA00DSwNOA0wDTwNQA1EDUgNTA1QDUgNVA1MDSwNNA1YDVwNYA1kDVwNaA1gDWwNcA10DXgNfA2ADXgNhA18DYgNjA2QDZQNmA+QAZQNnA2YDXgNgA2gDaQNqA2sDaQNsA2oDbQNuA28DcANxA3IDcANzA3EDdAN1A3YDdwN4A3kDdwN6A3gDcANyA3sDfAN9A34DfAN/A30DgAOBA4IDgwOEA4UDgwOGA4QDhwOIA4kDigOLAzoAigOMA4sDgwOFA40DjgOPA5ADjgORA48DkgOTA5QDlQOWA5cDlQOYA5YDmQOaA5sDnAOdA54DnAOfA50DlQOXA6ADoQOiA6MDoQOkA6IDpQOmA6cDqAOpA6oDqAOrA6kDrAOtA64DrwOwA7EDrwOyA7ADqAOqA7MDtAO1A7YDtAO3A7UDuAO5A7oDuwO8A70DuwO+A7wDvwPAA8EDwgPDA8QDwgPFA8MDuwO9A8YDxwPIA8kDxwPKA8gDywPMA80DzgPPA9ADzgPRA88D0gPTA9QD1QPWA9cD1QPYA9YDzgPQA9kD2gPbA9wD2gPdA9sD3gPfA+AD4QPiA+MD4QPkA+ID5QPmA+cD6APpA+oD6APrA+kD4QPjA+wD7QPuA+8D7QPwA+4D8QPyA/MD9AP1A/YD9AP3A/UD+AP5A/oD+wP8A1IA+wP9A/wD9AP2A/4D/wMABAEE/wMCBAAEAwQEBAUEBgQHBAgEBgQJBAcECgQLBAwEDQQOBA8EDQQQBA4EBgQIBBEEEgQTBBQEEgQVBBMEFgQXBBgEGQQaBBsEGQQcBBoEHQQeBB8EIAQhBCIEIAQjBCEEGQQbBCQEJQQmBCcEJQQoBCYEKQQqBCsELAQtBC4ELAQvBC0EMAQxBDIEMwQ0BDUEMwQ2BDQELAQuBDcEOAQ5BDoEOAQ7BDkEPAQ9BD4EPwRABEEEPwRCBEAEQwREBEUEWwNGBFwDWwNHBEYEPwRBBEgESQRKBEsESQRMBEoETQROBE8EUARRBFIEUARTBFEEVARVBFYEbQNXBG4DbQNYBFcEUARSBFkEWgRbBFwEWgRdBFsEXgRfBGAEYQRiBGMEYQRkBGIEZQRmBGcEaARpBGoEaARrBGkEYQRjBGwEbQRuBG8EbQRwBG4EcQRyBHMEdAR1BHYEdAR3BHUEeAR5BHoEewR8BH0EewR+BHwEdAR2BH8EgASBBIIEgASDBIEEhASFBIYEhwSIBIkEhwSKBIgEiwSMBI0EjgSPBBQAjgSQBI8EhwSJBJEEkgSTBJQEkgSVBJMElgSXBJgEmQSaBJsEmQScBJoEnQSeBJ8EoAShBKIEoASjBKEEmQSbBKQEpQSmBKcEpQSoBKYEqQSqBKsErAStBK4ErASvBK0EsASxBLIEswS0BLUEswS2BLQErASuBLcEuAS5BLoEuAS7BLkEvAS9BL4EvwTABMEEvwTCBMAEwwTEBMUExgTHBMgExgTJBMcEvwTBBMoEywTMBM0EywTOBMwEzwTQBNEE0gTTBNQE0gTVBNME1gTXBNgE2QTaBNsE2QTcBNoE0gTUBN0E3gTfBOAE3gThBN8E4gTjBOQE5QTmBOcE5QToBOYE6QTqBOsE7ATtBO4E7ATvBO0E5QTnBPAE8QTyBPME8QT0BPIE9QT2BPcE+AT5BPoE+AT7BPkE/AT9BP4E3gP/BN8D3gMABf8E+AT6BAEFAgUDBQQFAgUFBQMFBgUHBQgFCQUKBQsFCQUMBQoFDQUOBQ8FEAURBRIFEAUTBREFCQULBRQFFQUWBRcFFQUYBRYFGQUaBRsFHAUdBR4FHAUfBR0FIAUhBSIFIwUkBSUFIwUmBSQFHAUeBScFKAUpBSoFKAUrBSkFLAUtBS4FLwUwBTEFLwUyBTAFMwU0BTUFNgU3BSYANgU4BTcFLwUxBTkFOgU7BTwFOgU9BTsFPgU/BUAFQQVCBUMFQQVEBUIFRQVGBUcFSAVJBUoFSAVLBUkFQQVDBUwFTQVOBU8FTQVQBU4FUQVSBVMFVAVVBVYFVAVXBVUFWAVZBVoFWwVcBV0FWwVeBVwFVAVWBV8FYAVhBWIFYAVjBWEFZAVlBWYFZwVoBWkFZwVqBWgFawVsBW0FbgVvBXAFbgVxBW8FZwVpBXIFcwV0BXUFcwV2BXQFdwV4BXkFegV7BXwFegV9BXsFfgV/BYAFgQWCBYMFgQWEBYIFegV8BYUFhgWHBYgFhgWJBYcFigWLBYwFjQWOBY8FjQWQBY4FkQWSBZMFlAWVBZYFlAWXBZUFjQWPBZgFmQWaBZsFmQWcBZoFnQWeBZ8FoAWhBaIFoAWjBaEFpAWlBaYFpwWoBakFpwWqBagFoAWiBasFrAWtBa4FrAWvBa0FsAWxBbIFswW0BbUFswW2BbQFtwW4BbkFTQS6BU4ETQS7BboFswW1BbwFvQW+Bb8FvQXABb4FwQXCBcMFxAXFBcYFxAXHBcUFyAXJBcoFywXMBc0FywXOBcwFxAXGBc8F0AXRBdIF0AXTBdEF1AXVBdYF1wXYBdkF1wXaBdgF2wXcBd0F3gXfBW0A3gXgBd8F1wXZBeEF4gXjBeQF4gXlBeMF5gXnBegF6QXqBesF6QXsBeoF7QXuBe8F8AXxBWsA8AXyBfEF6QXrBfMF9AX1BfYF9AX3BfUF+AX5BfoF+wX8Bf0F+wX+BfwF/wUABgEGAgYDBgQGAgYFBgMG+wX9BQYGBwYIBgkGBwYKBggGCwYMBg0GDgYPBhAGDgYRBg8GEgYTBhQGXgQVBl8EXgQWBhUGDgYQBhcGGAYZBhoGGAYbBhkGHAYdBh4GHwYgBiEGHwYiBiAGIwYkBiUGcQQmBnIEcQQnBiYGHwYhBigGKQYqBisGKQYsBioGLQYuBi8GMAYxBjIGMAYzBjEGNAY1BjYGhAQ3BoUEhAQ4BjcGMAYyBjkGOgY7BjwGOgY9BjsGPgY/BkAGQQZCBkMGQQZEBkIGRQZGBkcGSAZJBkoGSAZLBkkGQQZDBkwGTQZOBk8GTQZQBk4GUQZSBlMGVAZVBlYGVAZXBlUGWAZZBloGWwZcBnsAWwZdBlwGVAZWBl4GXwZgBmEGXwZiBmAGYwZkBmUGZgZnBmgGZgZpBmcGagZrBmwGbQZuBnkAbQZvBm4GZgZoBnAGcQZyBnMGcQZ0BnIGdQZ2BncGeAZ5BnoGeAZ7BnkGfAZ9Bn4GfwaABoEGfwaCBoAGeAZ6BoMGhAaFBoYGhAaHBoUGiAaJBooGiwaMBo0GiwaOBowGjwaQBpEGkgaTBpQGkgaVBpMGiwaNBpYGlwaYBpkGlwaaBpgGmwacBp0GngafBqAGngahBp8GogajBqQGpQOlBqYDpQOmBqUGngagBqcGqAapBqoGqAarBqkGrAatBq4GrwawBrEGrwayBrAGswa0BrUGlgS2BpcElgS3BrYGrwaxBrgGuQa6BrsGuQa8BroGvQa+Br8GwAbBBsIGwAbDBsEGxAbFBsYGqQTHBqoEqQTIBscGwAbCBskGygbLBswGygbNBssGzgbPBtAG0QbSBtMG0QbUBtIG1QbWBtcG2AbZBtoG2AbbBtkG0QbTBtwG3QbeBt8G3QbgBt4G4QbiBuMG5AblBuYG5AbnBuUG6AbpBuoG6wbsBowA6wbtBuwG5AbmBu4G7wbwBvEG7wbyBvAG8wb0BvUG9gb3BvgG9gb5BvcG+gb7BvwG/Qb+BooA/Qb/Bv4G9gb4BgAHAQcCBwMHAQcEBwIHBQcGBwcHCAcJBwoHCAcLBwkHDAcNBw4HDwcQBxEHDwcSBxAHCAcKBxMHFAcVBxYHFAcXBxUHGAcZBxoHGwccBx0HGwceBxwHHwcgByEHvAQiB70EvAQjByIHGwcdByQHJQcmBycHJQcoByYHKQcqBysHLActBy4HLAcvBy0HMAcxBzIHzwQzB9AEzwQ0BzMHLAcuBzUHNgc3BzgHNgc5BzcHOgc7BzwHPQc+Bz8HPQdABz4HQQdCB0MH4gREB+ME4gRFB0QHPQc/B0YHRwdIB0kHRwdKB0gHSwdMB00HTgdPB1AHTgdRB08HUgdTB1QHVQdWB1cHVQdYB1YHTgdQB1kHWgdbB1wHWgddB1sHXgdfB2AHYQdiB2MHYQdkB2IHZQdmB2cHaAdpB5oAaAdqB2kHYQdjB2sHbAdtB24HbAdvB20HcAdxB3IHcwd0B3UHcwd2B3QHdwd4B3kHegd7B5gAegd8B3sHcwd1B30Hfgd/B4AHfgeBB38HggeDB4QHhQeGB4cHhQeIB4YHiQeKB4sHjAeNB44HjAePB40HhQeHB5AHkQeSB5MHkQeUB5IHlQeWB5cHmAeZB5oHmAebB5kHnAedB54HnwegB6EHnweiB6AHmAeaB6MHpAelB6YHpAenB6UHqAepB6oHqwesB60HqweuB6wHrwewB7EHywOyB8wDywOzB7IHqwetB7QHtQe2B7cHtQe4B7YHuQe6B7sHvAe9B74HvAe/B70HwAfBB8IHwwfEB8UHwwfGB8QHvAe+B8cHyAfJB8oHyAfLB8kHzAfNB84HzwfQB9EHzwfSB9AH0wfUB9UH9QTWB/YE9QTXB9YHzwfRB9gH2QfaB9sH2QfcB9oH3QfeB98H4AfhB+IH4AfjB+EH5AflB+YH5wfoB+kH5wfqB+gH4AfiB+sH7AftB+4H7AfvB+0H8AfxB/IH8wf0B/UH8wf2B/QH9wf4B/kH+gf7B60A+gf8B/sH8wf1B/0H/gf/BwAI/gcBCP8HAggDCAQIBQgGCAcIBQgICAYICQgKCAsIDAgNCKsADAgOCA0IBQgHCA8IEAgRCBIIEAgTCBEIFAgVCBYIFwgYCBkIFwgaCBgIGwgcCB0IHggfCCAIHgghCB8IFwgZCCIIIwgkCCUIIwgmCCQIJwgoCCkIKggrCCwIKggtCCsILggvCDAIBgUxCAcFBgUyCDEIKggsCDMINAg1CDYINAg3CDUIOAg5CDoIOwg8CD0IOwg+CDwIPwhACEEIGQVCCBoFGQVDCEIIOwg9CEQIRQhGCEcIRQhICEYISQhKCEsITAhNCE4ITAhPCE0IUAhRCFIILAVTCC0FLAVUCFMITAhOCFUIVghXCFgIVghZCFcIWghbCFwIXQheCF8IXQhgCF4IYQhiCGMIZAhlCGYIZAhnCGUIXQhfCGgIaQhqCGsIaQhsCGoIbQhuCG8IcAhxCHIIcAhzCHEIdAh1CHYIdwh4CLsAdwh5CHgIcAhyCHoIewh8CH0Iewh+CHwIfwiACIEIggiDCIQIggiFCIMIhgiHCIgIiQiKCLkAiQiLCIoIggiECIwIjQiOCI8IjQiQCI4IkQiSCJMIlAiVCJYIlAiXCJUImAiZCJoImwicCJ0ImwieCJwIlAiWCJ8IoAihCKIIoAijCKEIpAilCKYIpwioCKkIpwiqCKgIqwisCK0IrgivCLAIrgixCK8IpwipCLIIswi0CLUIswi2CLQItwi4CLkIugi7CLwIugi9CLsIvgi/CMAIFgTBCBcEFgTCCMEIugi8CMMIxAjFCMYIxAjHCMUIyAjJCMoIywjMCM0IywjOCMwIzwjQCNEIPgXSCD8FPgXTCNIIywjNCNQI1QjWCNcI1QjYCNYI2QjaCNsI3AjdCN4I3AjfCN0I4AjhCOIIUQXjCFIFUQXkCOMI3AjeCOUI5gjnCOgI5gjpCOcI6gjrCOwI7QjuCO8I7QjwCO4I8QjyCPMI9Aj1CPYI9Aj3CPUI7QjvCPgI+Qj6CPsI+Qj8CPoI/Qj+CP8IAAkBCQIJAAkDCQEJBAkFCQYJBwkICc0ABwkJCQgJAAkCCQoJCwkMCQ0JCwkOCQwJDwkQCREJEgkTCRQJEgkVCRMJFgkXCRgJGQkaCcoAGQkbCRoJEgkUCRwJHQkeCR8JHQkgCR4JIQkiCSMJJAklCSYJJAknCSUJKAkpCSoJKwksCS0JKwkuCSwJJAkmCS8JMAkxCTIJMAkzCTEJNAk1CTYJNwk4CTkJNwk6CTgJOwk8CT0JZAU+CWUFZAU/CT4JNwk5CUAJQQlCCUMJQQlECUIJRQlGCUcJSAlJCUoJSAlLCUkJTAlNCU4JdwVPCXgFdwVQCU8JSAlKCVEJUglTCVQJUglVCVMJVglXCVgJWQlaCVsJWQlcCVoJXQleCV8JigVgCYsFigVhCWAJWQlbCWIJYwlkCWUJYwlmCWQJZwloCWkJaglrCWwJagltCWsJbglvCXAJcQlyCXMJcQl0CXIJaglsCXUJdgl3CXgJdgl5CXcJegl7CXwJfQl+CX8JfQmACX4JgQmCCYMJhAmFCdsAhAmGCYUJfQl/CYcJiAmJCYoJiAmLCYkJjAmNCY4JjwmQCZEJjwmSCZAJkwmUCZUJlgmXCdkAlgmYCZcJjwmRCZkJmgmbCZwJmgmdCZsJngmfCaAJoQmiCaMJoQmkCaIJpQmmCacJqAmpCaoJqAmrCakJoQmjCawJrQmuCa8JrQmwCa4JsQmyCbMJtAm1CbYJtAm3CbUJuAm5CboJuwm8Cb0Juwm+CbwJtAm2Cb8JwAnBCcIJwAnDCcEJxAnFCcYJxwnICckJxwnKCcgJywnMCc0JPATOCT0EPATPCc4JxwnJCdAJZQPRCSIDZQPSCdEJ0wnUCdUJ1gnXCQ4A1gnYCdcJ2QnaCdsJ3AndCd4J3AnfCd0J4AnhCeIJ4wnkCeUJ4wnmCeQJ5wnoCekJ6gnrCewJ6gntCesJ7gnvCfAJhAnxCQIBhAnyCfEJ8wn0CfUJlgn2CfwAlgn3CfYJ+An5CfoJ+wn8Cf0J+wn+CfwJ/wkACgEKAgoDCgQKAgoFCgMKBgoHCggKCQoKCgsKCQoMCgoKDQoOCg8KEAoRChIKEAoTChEKFAoVChYKFwoYChkKFwoaChgKGwocCh0KBwkeCjIBBwkfCh4KIAohCiIKGQkjCiwBGQkkCiMKJQomCicKKAopCioKKAorCikKLAotCi4KLwowCjEKLwoyCjAKMwo0CjUKNgo3CjgKNgo5CjcKOgo7CjwKPQo+Cj8KPQpACj4KQQpCCkMKRApFCkYKRApHCkUKSApJCkoKSwpMCk0KSwpOCkwKTwpQClEKdwhSCmkBdwhTClIKVApVClYKiQhXCmMBiQhYClcKWQpaClsKXApdCl4KXApfCl0KYAphCmIKYwpkCmUKYwpmCmQKZwpoCmkKagprCmwKagptCmsKbgpvCnAKcQpyCnMKcQp0CnIKdQp2CncKeAp5CnoKeAp7CnkKfAp9Cn4K+gd/CpkB+geACn8KgQqCCoMKDAiECpMBDAiFCoQKhgqHCogKiQqKCosKiQqMCooKjQqOCo8KkAqRCpIKkAqTCpEKlAqVCpYKlwqYCpkKlwqaCpgKmwqcCp0KngqfCqAKngqhCp8KogqjCqQKpQqmCqcKpQqoCqYKqQqqCqsKrAqtCq4KrAqvCq0KsAqxCrIKaAezCtABaAe0CrMKtQq2CrcKege4CsoBege5CrgKugq7CrwKvQq+Cr8KvQrACr4KwQrCCsMKxArFCsYKxArHCsUKyArJCsoKywrMCs0KywrOCswKzwrQCtEK0grTCtQK0grVCtMK1grXCtgK2QraCtsK2QrcCtoK3QreCt8K6wbgCgAC6wbhCuAK4grjCuQK/QblCvoB/QbmCuUK5wroCukK6grrCuwK6grtCusK7grvCvAK8QryCvMK8Qr0CvIK9Qr2CvcK+Ar5CvoK+Ar7CvkK/Ar9Cv4K/woACwEL/woCCwALAwsECwULBgsHCwgLBgsJCwcLCgsLCwwLDQsOCw8LDQsQCw4LEQsSCxMLWwYUCzcCWwYVCxQLFgsXCxgLbQYZCzECbQYaCxkLGwscCx0LHgsfCyALHgshCx8LIgsjCyQLJQsmCycLJQsoCyYLKQsqCysLLAstCy4LLAsvCy0LMAsxCzILMws0CzULMws2CzQLNws4CzkLOgs7CzwLOgs9CzsLPgs/C0AL3gVBC2cC3gVCC0ELQwtEC0UL8AVGC2EC8AVHC0YLSAtJC0oLSwtMC00LSwtOC0wLTwtQC1ELUgtTC1QLUgtVC1MLVgtXC1gLWQtaC1sLWQtcC1oLXQteC18LYAthC2ILYAtjC2ELAgoECmQLZQtmC2cLZQtoC2YLCQoLCmkLagtrC2wLagttC2sLEAoSCm4LbwtwC3ELbwtyC3ALLwoxCnMLdAt1C3YLdAt3C3ULNgo4CngL+wN5C/QC+wN6C3kLYwplCnsLfAt9C34LfAt/C30LagpsCoALgQuCC4MLgQuEC4ILcQpzCoULhguHC4gLhguJC4cLkAqSCooLiwuMC40LiwuOC4wLxArGCo8LkAuRC5ILkAuTC5ELywrNCpQLlQuWC5cLlQuYC5YL0grUCpkLmgubC5wLmgudC5sL8QrzCp4LnwugC6ELnwuiC6AL+Ar6CqMLigOkCxcDigOlC6QLJQsnC6YLpwuoC6kLpwuqC6gLLAsuC6sLrAutC64LrAuvC60LMws1C7ALsQuyC7MLsQu0C7ILUgtUC7ULtgu3C7gLtgu5C7cL3AneCboLuwu8C70Luwu+C7wLvwvAC8ELwgvDC8QLwgvFC8MLPQo/CsYLxwvIC8kLxwvKC8gLywvMC80LNgXOC5wCNgXPC84L0AvRC9IL0wvUC9UL0wvWC9QLhguIC9cL2AvZC9oL2AvbC9kLngqgCtwL3QveC98L3QvgC94L4QviC+ML5AvlC+YL5AvnC+UL/woBC+gL6QvqC+sL6QvsC+oL7QvuC+8LjgTwC8kCjgTxC/AL8gvzC/QL9Qv2C/cL9Qv4C/YLsQuzC/kL1gn6C+MA1gn7C/oLtgu4C/wL0wn9C9QJ0wn+C/0L/wsADAEMAgwDDAQMAgwFDAMMBgwHDAgMCQwKDAsMCQwMDAoMUgNUAw0M2QkODNoJ2QkPDA4MEAwRDBIMEgwFAAkMEgwRDAUAEQwDAAUADgwSDAkMDgwPDBIMDwwQDBIM2gkLDCoD2gkODAsMDgwJDAsMDQwIAAIMDQxUAwgAVAMGAAgACgwNDAIMCgwMDA0MDAxSAw0MCwwEDCoDCwwKDAQMCgwCDAQMCAw9AzwDCAwHDD0DBwwuAz0DAwwIDDwDAwwFDAgMBQwGDAgMBAwtAyoDBAwDDC0DAww8Ay0DAQxQA08DAQwADFADAAwnA1AD/QsBDE8D/Qv+CwEM/gv/CwEM1AkmAwMA1An9CyYD/QtPAyYD/AtjA2ID/Au4C2MDuAvbAmMD+gv8C2ID+gv7C/wL+wu2C/wL4wAjAwAA4wD6CyMD+gtiAyMD+Qt1A3QD+QuzC3UDswvWAnUD9gv5C3QD9gv4C/kL+AuxC/kL9wsfAxwD9wv2Cx8D9gt0Ax8D9AuIA4cD9AvzC4gD8wsZA4gD8Av0C4cD8AvxC/QL8QvyC/QLyQIYA8cCyQLwCxgD8AuHAxgD7wuaA5kD7wvuC5oD7gsTA5oD6gvvC5kD6gvsC+8L7AvtC+8L6wsSAw8D6wvqCxID6guZAxID6AutA6wD6AsBC60DAQsaAq0D5QvoC6wD5QvnC+gL5wv/CugL5gsNAwoD5gvlCw0D5QusAw0D4wvAA78D4wviC8AD4gsHA8AD3gvjC78D3gvgC+ML4AvhC+ML3wsGAwMD3wveCwYD3gu/AwYD3AvTA9ID3AugCtMDoAqzAdMD2QvcC9ID2QvbC9wL2wueCtwL2gsBA/4C2gvZCwED2QvSAwED1wvmA+UD1wuIC+YDiAupAuYD1AvXC+UD1AvWC9cL1guGC9cL1Qv8AvkC1QvUC/wC1AvlA/wC0gv5A/gD0gvRC/kD0Qv2AvkDzgvSC/gDzgvPC9ILzwvQC9ILnAL1ApoCnALOC/UCzgv4A/UCzQsLBAoEzQvMCwsEzAvwAgsEyAvNCwoEyAvKC80LygvLC80LyQvvAuwCyQvIC+8CyAsKBO8CxgseBB0Exgs/Ch4EPwpMAR4EwwvGCx0EwwvFC8YLxQs9CsYLxAvqAucCxAvDC+oCwwsdBOoCwQsxBDAEwQvACzEEwAvkAjEEvAvBCzAEvAu+C8ELvgu/C8ELvQvjAuACvQu8C+MCvAswBOMCugtEBEMEugveCUQE3gnlAEQEtwu6C0MEtwu5C7oLuQvcCboLuAveAtsCuAu3C94CtwtDBN4CtQtVBFQEtQtUC1UEVAtzAlUEsgu1C1QEsgu0C7ULtAtSC7ULswvZAtYCswuyC9kCsgtUBNkCsAtmBGUEsAs1C2YENQtRAmYErQuwC2UErQuvC7ALrwszC7ALrgvUAtECrgutC9QCrQtlBNQCqwt5BHgEqwsuC3kELgtKAnkEqAurC3gEqAuqC6sLqgssC6sLqQvPAswCqQuoC88CqAt4BM8CpguMBIsEpgsnC4wEJwtDAowEpAumC4sEpAulC6YLpQslC6YLFwPKAscCFwOkC8oCpAuLBMoCowueBJ0Eowv6Cp4E+goTAp4EoAujC50EoAuiC6MLogv4CqMLoQvFAsICoQugC8UCoAudBMUCnguxBLAEngvzCrEE8woMArEEmwueC7AEmwudC54LnQvxCp4LnAvAAr0CnAubC8ACmwuwBMACmQvEBMMEmQvUCsQE1ArqAcQElguZC8MElguYC5kLmAvSCpkLlwu7ArgClwuWC7sClgvDBLsClAvXBNYElAvNCtcEzQrjAdcEkQuUC9YEkQuTC5QLkwvLCpQLkgu2ArMCkguRC7YCkQvWBLYCjwvqBOkEjwvGCuoExgrcAeoEjAuPC+kEjAuOC48LjgvECo8LjQuxAq4CjQuMC7ECjAvpBLECigv9BPwEiguSCv0EkgqlAf0EhwuKC/wEhwuJC4oLiQuQCooLiAusAqkCiAuHC6wChwv8BKwChQsOBQ0FhQtzCg4FcwqDAQ4FgguFCw0FgguEC4ULhAtxCoULgwunAqQCgwuCC6cCggsNBacCgAshBSAFgAtsCiEFbAp8ASEFfQuACyAFfQt/C4ALfwtqCoALfguiAp8Cfgt9C6ICfQsgBaICews0BTMFewtlCjQFZQp1ATQFeQt7CzMFeQt6C3sLegtjCnsL9AKdApoC9AJ5C50CeQszBZ0CeAtGBUUFeAs4CkYFOApFAUYFdQt4C0UFdQt3C3gLdws2CngLdguYApUCdgt1C5gCdQtFBZgCcwtZBVgFcwsxClkFMQo+AVkFcAtzC1gFcAtyC3MLcgsvCnMLcQuTApACcQtwC5MCcAtYBZMCbgtsBWsFbgsSCmwFEgocAWwFawtuC2sFawttC24LbQsQCm4LbAuOAosCbAtrC44CawtrBY4CaQt/BX4FaQsLCn8FCwoVAX8FZgtpC34FZgtoC2kLaAsJCmkLZwuJAoYCZwtmC4kCZgt+BYkCZAuSBZEFZAsECpIFBAoOAZIFYQtkC5EFYQtjC2QLYwsCCmQLYguEAoECYgthC4QCYQuRBYQCXwulBaQFXwteC6UFXgt+AqUFWgtfC6QFWgtcC18LXAtdC18LWwt9AnoCWwtaC30CWgukBX0CWAu4BbcFWAtXC7gFVwt3ArgFUwtYC7cFUwtVC1gLVQtWC1gLVAt2AnMCVAtTC3YCUwu3BXYCUQvJBcgFUQtQC8kFUAtwAskFTAtRC8gFTAtOC1ELTgtPC1ELTQtvAmwCTQtMC28CTAvIBW8CSgvcBdsFSgtJC9wFSQtpAtwFRgtKC9sFRgtHC0oLRwtIC0oLYQJoAl8CYQJGC2gCRgvbBWgCRQvuBe0FRQtEC+4FRAtjAu4FQQtFC+0FQQtCC0ULQgtDC0ULZwJiAl8CZwJBC2ICQQvtBWICQAsABv8FQAs/CwAGPwtcAgAGOwtAC/8FOws9C0ALPQs+C0ALPAtbAlgCPAs7C1sCOwv/BVsCOQsTBhIGOQs4CxMGOAtVAhMGNAs5CxIGNAs2CzkLNgs3CzkLNQtUAlECNQs0C1QCNAsSBlQCMgskBiMGMgsxCyQGMQtOAiQGLQsyCyMGLQsvCzILLwswCzILLgtNAkoCLgstC00CLQsjBk0CKws1BjQGKwsqCzUGKgtHAjUGJgsrCzQGJgsoCysLKAspCysLJwtGAkMCJwsmC0YCJgs0BkYCJAtGBkUGJAsjC0YGIwtAAkYGHwskC0UGHwshCyQLIQsiCyQLIAs/AjwCIAsfCz8CHwtFBj8CHQtZBlgGHQscC1kGHAs5AlkGGQsdC1gGGQsaCx0LGgsbCx0LMQI4Ai8CMQIZCzgCGQtYBjgCGAtrBmoGGAsXC2sGFwszAmsGFAsYC2oGFAsVCxgLFQsWCxgLNwIyAi8CNwIUCzICFAtqBjICEwt9BnwGEwsSC30GEgssAn0GDgsTC3wGDgsQCxMLEAsRCxMLDwsrAigCDwsOCysCDgt8BisCDAuQBo8GDAsLC5AGCwslApAGBwsMC48GBwsJCwwLCQsKCwwLCAskAiECCAsHCyQCBwuPBiQCBQujBqIGBQsEC6MGBAseAqMGAAsFC6IGAAsCCwULAgsDCwULAQsdAhoCAQsACx0CAAuiBh0C/gq0BrMG/gr9CrQG/QoXArQG+Qr+CrMG+Qr7Cv4K+wr8Cv4K+goWAhMC+gr5ChYC+QqzBhYC9wrFBsQG9wr2CsUG9goQAsUG8gr3CsQG8gr0CvcK9Ar1CvcK8woPAgwC8wryCg8C8grEBg8C8ArWBtUG8ArvCtYG7woJAtYG6wrwCtUG6wrtCvAK7QruCvAK7AoIAgUC7ArrCggC6wrVBggC6QrpBugG6QroCukG6AoCAukG5QrpCugG5QrmCukK5grnCukK+gEBAvgB+gHlCgEC5QroBgEC5Ar7BvoG5ArjCvsG4wr8AfsG4ArkCvoG4ArhCuQK4QriCuQKAAL7AfgBAALgCvsB4Ar6BvsB3woNBwwH3wreCg0H3gr1AQ0H2grfCgwH2grcCt8K3ArdCt8K2wr0AfEB2wraCvQB2goMB/QB2AogBx8H2ArXCiAH1wruASAH0wrYCh8H0wrVCtgK1QrWCtgK1ArtAeoB1ArTCu0B0wofB+0B0QoxBzAH0QrQCjEH0ArnATEHzArRCjAHzArOCtEKzgrPCtEKzQrmAeMBzQrMCuYBzAowB+YBygpCB0EHygrJCkIHyQrgAUIHxQrKCkEHxQrHCsoKxwrICsoKxgrfAdwBxgrFCt8BxQpBB98BwwpTB1IHwwrCClMHwgrZAVMHvgrDClIHvgrACsMKwArBCsMKvwrYAdUBvwq+CtgBvgpSB9gBvApmB2UHvAq7CmYHuwrSAWYHuAq8CmUHuAq5CrwKuQq6CrwKygHRAcgBygG4CtEBuAplB9EBtwp4B3cHtwq2CngHtgrMAXgHswq3CncHswq0CrcKtAq1CrcK0AHLAcgB0AGzCssBswp3B8sBsgqKB4kHsgqxCooHsQrFAYoHrQqyCokHrQqvCrIKrwqwCrIKrgrEAcEBrgqtCsQBrQqJB8QBqwqdB5wHqwqqCp0Hqgq+AZ0HpgqrCpwHpgqoCqsKqAqpCqsKpwq9AboBpwqmCr0BpgqcB70BpAqwB68HpAqjCrAHowq3AbAHnwqkCq8HnwqhCqQKoQqiCqQKoAq2AbMBoAqfCrYBnwqvB7YBnQrBB8AHnQqcCsEHnAqwAcEHmAqdCsAHmAqaCp0KmgqbCp0KmQqvAawBmQqYCq8BmArAB68BlgrUB9MHlgqVCtQHlQqpAdQHkQqWCtMHkQqTCpYKkwqUCpYKkgqoAaUBkgqRCqgBkQrTB6gBjwrlB+QHjwqOCuUHjgqiAeUHigqPCuQHigqMCo8KjAqNCo8KiwqhAZ4BiwqKCqEBigrkB6EBiAr4B/cHiAqHCvgHhwqbAfgHhAqICvcHhAqFCogKhQqGCogKkwGaAZEBkwGECpoBhAr3B5oBgwoKCAkIgwqCCgoIggqVAQoIfwqDCgkIfwqACoMKgAqBCoMKmQGUAZEBmQF/CpQBfwoJCJQBfgocCBsIfgp9ChwIfQqOARwIeQp+ChsIeQp7Cn4Kewp8Cn4KegqNAYoBegp5Co0BeQobCI0BdwovCC4Idwp2Ci8IdgqHAS8Icgp3Ci4Icgp0CncKdAp1CncKcwqGAYMBcwpyCoYBcgouCIYBcApACD8IcApvCkAIbwqAAUAIawpwCj8IawptCnAKbQpuCnAKbAp/AXwBbAprCn8Bawo/CH8BaQpRCFAIaQpoClEIaAp5AVEIZAppClAIZApmCmkKZgpnCmkKZQp4AXUBZQpkCngBZApQCHgBYgpiCGEIYgphCmIIYQpyAWIIXQpiCmEIXQpfCmIKXwpgCmIKXgpxAW4BXgpdCnEBXQphCHEBWwp1CHQIWwpaCnUIWgprAXUIVwpbCnQIVwpYClsKWApZClsKYwFqAWEBYwFXCmoBVwp0CGoBVgqHCIYIVgpVCocIVQplAYcIUgpWCoYIUgpTClYKUwpUClYKaQFkAWEBaQFSCmQBUgqGCGQBUQqZCJgIUQpQCpkIUApeAZkITApRCpgITApOClEKTgpPClEKTQpdAVoBTQpMCl0BTAqYCF0BSgqsCKsISgpJCqwISQpXAawIRQpKCqsIRQpHCkoKRwpICkoKRgpWAVMBRgpFClYBRQqrCFYBQwq/CL4IQwpCCr8IQgpQAb8IPgpDCr4IPgpACkMKQApBCkMKPwpPAUwBPwo+Ck8BPgq+CE8BPArQCM8IPAo7CtAIOwpJAdAINwo8Cs8INwo5CjwKOQo6CjwKOApIAUUBOAo3CkgBNwrPCEgBNQrhCOAINQo0CuEINApCAeEIMAo1CuAIMAoyCjUKMgozCjUKMQpBAT4BMQowCkEBMArgCEEBLgryCPEILgotCvIILQo7AfIIKQouCvEIKQorCi4KKwosCi4KKgo6ATcBKgopCjoBKQrxCDoBJwoFCQQJJwomCgUJJgo0AQUJIwonCgQJIwokCicKJAolCicKLAEzASoBLAEjCjMBIwoECTMBIgoXCRYJIgohChcJIQouARcJHgoiChYJHgofCiIKHwogCiIKMgEtASoBMgEeCi0BHgoWCS0BHQopCSgJHQocCikJHAonASkJGAodCigJGAoaCh0KGgobCh0KGQomASMBGQoYCiYBGAooCSYBFgo8CTsJFgoVCjwJFQogATwJEQoWCjsJEQoTChYKEwoUChYKEgofARwBEgoRCh8BEQo7CR8BDwpNCUwJDwoOCk0JDgoZAU0JCgoPCkwJCgoMCg8KDAoNCg8KCwoYARUBCwoKChgBCgpMCRgBCApeCV0JCAoHCl4JBwoSAV4JAwoICl0JAwoFCggKBQoGCggKBAoRAQ4BBAoDChEBAwpdCREBAQpvCW4JAQoACm8JAAoLAW8J/AkBCm4J/An+CQEK/gn/CQEK/QkKAQcB/Qn8CQoB/AluCQoB+gmCCYEJ+gn5CYIJ+QkEAYIJ9gn6CYEJ9gn3CfoJ9wn4CfoJ/AADAfoA/AD2CQMB9gmBCQMB9QmUCZMJ9Qn0CZQJ9An+AJQJ8Qn1CZMJ8QnyCfUJ8gnzCfUJAgH9APoAAgHxCf0A8QmTCf0A8AmmCaUJ8AnvCaYJ7wn3AKYJ6wnwCaUJ6wntCfAJ7QnuCfAJ7An2APMA7AnrCfYA6wmlCfYA6Qm5CbgJ6QnoCbkJ6AnwALkJ5AnpCbgJ5AnmCekJ5gnnCekJ5QnvAOwA5QnkCe8A5Am4Ce8A4gnMCcsJ4gnhCcwJ4QnpAMwJ3QniCcsJ3QnfCeIJ3wngCeIJ3gnoAOUA3gndCegA3QnLCegA2wksAz8D2wnaCSwD2gkqAywD1wnbCT8D1wnYCdsJ2AnZCdsJDgBBAwwADgDXCUED1wk/A0ED1QkRDBAM1QnUCREM1AkDABEM0QnVCRAM0QnSCdUJ0gnTCdUJIgMBAAAAIgPRCQEA0QkQDAEA0AnuALsJ0AnJCe4AyQnsAO4AzgnQCbsJzgnPCdAJzwnHCdAJPQS9CS0APQTOCb0Jzgm7Cb0JzQnrAMAJzQnMCesAzAnpAOsAyAnNCcAJyAnKCc0JygnLCc0JyQnCCewAyQnICcIJyAnACcIJxgnhAOMJxgnFCeEAxQnfAOEAwQnGCeMJwQnDCcYJwwnECcYJwgnlCewAwgnBCeUJwQnjCeUJvwn1AKgJvwm2CfUAtgnzAPUAvAm/CagJvAm+Cb8Jvgm0Cb8JvQmqCS0AvQm8CaoJvAmoCaoJugnyAK0Jugm5CfIAuQnwAPIAtQm6Ca0JtQm3CboJtwm4CboJtgmvCfMAtgm1Ca8JtQmtCa8JswneAOoJswmyCd4AsgncAN4ArgmzCeoJrgmwCbMJsAmxCbMJrwnsCfMArwmuCewJrgnqCewJrAkTDBQMrAmjCRMMowkVDBMMqQmsCRQMqQmrCawJqwmhCawJqgkWDC0AqgmpCRYMqQkUDBYMpwn5AJoJpwmmCfkApgn3APkAogmnCZoJogmkCacJpAmlCacJowmcCRUMowmiCZwJogmaCZwJoAkXDBgMoAmfCRcMnwkZDBcMmwmgCRgMmwmdCaAJnQmeCaAJnAkaDBUMnAmbCRoMmwkYDBoMmQkbDBwMmQmRCRsMkQkdDBsMlwmZCRwMlwmYCZkJmAmPCZkJ2QAeDNcA2QCXCR4MlwkcDB4MlQkAAYgJlQmUCQABlAn+AAABkAmVCYgJkAmSCZUJkgmTCZUJkQmKCR0MkQmQCYoJkAmICYoJjgkfDCAMjgmNCR8MjQkhDB8MiQmOCSAMiQmLCY4JiwmMCY4JigkiDB0MigmJCSIMiQkgDCIMhwkJAXEJhwl/CQkBfwkHAQkBhQmHCXEJhQmGCYcJhgl9CYcJ2wBzCS0A2wCFCXMJhQlxCXMJgwkGAXYJgwmCCQYBggkEAQYBfgmDCXYJfgmACYMJgAmBCYMJfwl4CQcBfwl+CXgJfgl2CXgJfAnWAPsJfAl7CdYAewnUANYAdwl8CfsJdwl5CXwJeQl6CXwJeAn9CQcBeAl3Cf0Jdwn7Cf0JdQnAC78LdQlsCcALbAnkAsALcgl1Cb8Lcgl0CXUJdAlqCXUJcwkuAC0AcwlyCS4Acgm/Cy4AcAkNAWMJcAlvCQ0BbwkLAQ0BawlwCWMJawltCXAJbQluCXAJbAllCeQCbAlrCWUJawljCWUJaQkqBCkEaQloCSoEaAlfACoEZAlpCSkEZAlmCWkJZglnCWkJZQnlAuQCZQlkCeUCZAkpBOUCYgkjDCQMYglbCSMMWwklDCMMYAliCSQMYAlhCWIJYQlZCWIJiwUmDFwAiwVgCSYMYAkkDCYMXwkUAVIJXwleCRQBXgkSARQBWglfCVIJWglcCV8JXAldCV8JWwlUCSUMWwlaCVQJWglSCVQJWAknDCgMWAlXCScMVwkpDCcMUwlYCSgMUwlVCVgJVQlWCVgJVAkqDCUMVAlTCSoMUwkoDCoMUQkrDCwMUQlKCSsMSgktDCsMTwlRCSwMTwlQCVEJUAlICVEJeAUuDFkAeAVPCS4MTwksDC4MTgkbAUEJTglNCRsBTQkZARsBSQlOCUEJSQlLCU4JSwlMCU4JSglDCS0MSglJCUMJSQlBCUMJRwkvDDAMRwlGCS8MRgkxDC8MQglHCTAMQglECUcJRAlFCUcJQwkyDC0MQwlCCTIMQgkwDDIMQAkzDDQMQAk5CTMMOQk1DDMMPglACTQMPgk/CUAJPwk3CUAJZQU2DM4AZQU+CTYMPgk0DDYMPQkiATAJPQk8CSIBPAkgASIBOAk9CTAJOAk6CT0JOgk7CT0JOQkyCTUMOQk4CTIJOAkwCTIJNgk3DDgMNgk1CTcMNQk5DDcMMQk2CTgMMQkzCTYJMwk0CTYJMgk6DDUMMgkxCToMMQk4DDoMLwk7DDwMLwkmCTsMJgk9DDsMLAkvCTwMLAkuCS8JLgkkCS8JLQk+DMsALQksCT4MLAk8DD4MKgkpAR0JKgkpCSkBKQknASkBJQkqCR0JJQknCSoJJwkoCSoJJgkfCT0MJgklCR8JJQkdCR8JIwk/DEAMIwkiCT8MIglBDD8MHgkjCUAMHgkgCSMJIAkhCSMJHwlCDD0MHwkeCUIMHglADEIMHAlDDEQMHAkUCUMMFAlFDEMMGgkcCUQMGgkbCRwJGwkSCRwJygBGDMgAygAaCUYMGglEDEYMGAkwAQsJGAkXCTABFwkuATABEwkYCQsJEwkVCRgJFQkWCRgJFAkNCUUMFAkTCQ0JEwkLCQ0JEQlHDEgMEQkQCUcMEAlJDEcMDAkRCUgMDAkOCREJDgkPCREJDQlKDEUMDQkMCUoMDAlIDEoMCgk5AfQICgkCCTkBAgk3ATkBCAkKCfQICAkJCQoJCQkACQoJzQD2CMsAzQAICfYICAn0CPYIBgk2AfkIBgkFCTYBBQk0ATYBAQkGCfkIAQkDCQYJAwkECQYJAgn7CDcBAgkBCfsIAQn5CPsI/wjHACgK/wj+CMcA/gjFAMcA+gj/CCgK+gj8CP8I/Aj9CP8I+wgqCjcB+wj6CCoK+ggoCioK+AiSAlsF+AjvCJIC7wiQApIC9Qj4CFsF9Qj3CPgI9wjtCPgI9ghdBcsA9gj1CF0F9QhbBV0F8wg9AeYI8wjyCD0B8gg7AT0B7gjzCOYI7gjwCPMI8AjxCPMI7wjoCJAC7wjuCOgI7gjmCOgI7AhYAG8L7AjrCFgA6whWAFgA5wjsCG8L5wjpCOwI6QjqCOwI6AhxC5AC6AjnCHEL5whvC3EL5QhLDEwM5QjeCEsM3ghNDEsM4wjlCEwM4wjkCOUI5AjcCOUIUgVODFMAUgXjCE4M4whMDE4M4ghEAdUI4gjhCEQB4QhCAUQB3QjiCNUI3QjfCOII3wjgCOII3gjXCE0M3gjdCNcI3QjVCNcI2whPDFAM2wjaCE8M2ghRDE8M1gjbCFAM1gjYCNsI2AjZCNsI1whSDE0M1wjWCFIM1ghQDFIM1AhTDFQM1AjNCFMMzQhVDFMM0gjUCFQM0gjTCNQI0wjLCNQIPwVWDCoAPwXSCFYM0ghUDFYM0QhLAcQI0QjQCEsB0AhJAUsBzAjRCMQIzAjOCNEIzgjPCNEIzQjGCFUMzQjMCMYIzAjECMYIyghXDFgMygjJCFcMyQhZDFcMxQjKCFgMxQjHCMoIxwjICMoIxghaDFUMxgjFCFoMxQhYDFoMwwhVAa4Iwwi8CFUBvAhTAVUBwQjDCK4IwQjCCMMIwgi6CMMIFwSwCCcAFwTBCLAIwQiuCLAIwAhSAbMIwAi/CFIBvwhQAVIBuwjACLMIuwi9CMAIvQi+CMAIvAi1CFMBvAi7CLUIuwizCLUIuQjBAEQKuQi4CMEAuAi/AMEAtAi5CEQKtAi2CLkItgi3CLkItQhGClMBtQi0CEYKtAhECkYKsghcAZsIsgipCFwBqQhaAVwBrwiyCJsIrwixCLIIsQinCLIIsAidCCcAsAivCJ0IrwibCJ0IrQhZAaAIrQisCFkBrAhXAVkBqAitCKAIqAiqCK0IqgirCK0IqQiiCFoBqQioCKIIqAigCKIIpgi+AEsKpgilCL4ApQi8AL4AoQimCEsKoQijCKYIowikCKYIoghNCloBogihCE0KoQhLCk0KnwhbDFwMnwiWCFsMlghdDFsMnAifCFwMnAieCJ8IngiUCJ8InQheDCcAnQicCF4MnAhcDF4MmghgAY0ImgiZCGABmQheAWABlQiaCI0IlQiXCJoIlwiYCJoIlgiPCF0MlgiVCI8IlQiNCI8IkwhfDGAMkwiSCF8MkghhDF8MjgiTCGAMjgiQCJMIkAiRCJMIjwhiDF0MjwiOCGIMjghgDGIMjAhjDGQMjAiECGMMhAhlDGMMigiMCGQMigiLCIwIiwiCCIwIuQBmDLcAuQCKCGYMighkDGYMiAhnAXsIiAiHCGcBhwhlAWcBgwiICHsIgwiFCIgIhQiGCIgIhAh9CGUMhAiDCH0Igwh7CH0IgQhnDGgMgQiACGcMgAhpDGcMfAiBCGgMfAh+CIEIfgh/CIEIfQhqDGUMfQh8CGoMfAhoDGoMeghwAWQIeghyCHABcghuAXABeAh6CGQIeAh5CHoIeQhwCHoIuwBmCCcAuwB4CGYIeAhkCGYIdghtAWkIdgh1CG0BdQhrAW0BcQh2CGkIcQhzCHYIcwh0CHYIcghrCG4BcghxCGsIcQhpCGsIbwi2AFwKbwhuCLYAbgi0ALYAaghvCFwKaghsCG8IbAhtCG8IawheCm4BawhqCF4KaghcCl4KaAjMC8sLaAhfCMwLXwjwAswLZQhoCMsLZQhnCGgIZwhdCGgIZggoACcAZghlCCgAZQjLCygAYwh0AVYIYwhiCHQBYghyAXQBXghjCFYIXghgCGMIYAhhCGMIXwhYCPACXwheCFgIXghWCFgIXAgEBAMEXAhbCAQEWwgJAAQEVwhcCAMEVwhZCFwIWQhaCFwIWAjxAvACWAhXCPECVwgDBPECVQhrDGwMVQhOCGsMTghtDGsMUwhVCGwMUwhUCFUIVAhMCFUILQVuDE4ALQVTCG4MUwhsDG4MUgh7AUUIUghRCHsBUQh5AXsBTQhSCEUITQhPCFIITwhQCFIITghHCG0MTghNCEcITQhFCEcISwhvDHAMSwhKCG8MSghxDG8MRghLCHAMRghICEsISAhJCEsIRwhyDG0MRwhGCHIMRghwDHIMRAhzDHQMRAg9CHMMPQh1DHMMQghECHQMQghDCEQIQwg7CEQIGgV2DEsAGgVCCHYMQgh0DHYMQQiCATQIQQhACIIBQAiAAYIBPAhBCDQIPAg+CEEIPgg/CEEIPQg2CHUMPQg8CDYIPAg0CDYIOgh3DHgMOgg5CHcMOQh5DHcMNQg6CHgMNQg3CDoINwg4CDoINgh6DHUMNgg1CHoMNQh4DHoMMwh7DHwMMwgsCHsMLAh9DHsMMQgzCHwMMQgyCDMIMggqCDMIBwV+DK4ABwUxCH4MMQh8DH4MMAiJASMIMAgvCIkBLwiHAYkBKwgwCCMIKwgtCDAILQguCDAILAglCH0MLAgrCCUIKwgjCCUIKQh/DIAMKQgoCH8MKAiBDH8MJAgpCIAMJAgmCCkIJggnCCkIJQiCDH0MJQgkCIIMJAiADIIMIgiDDIQMIggZCIMMGQiFDIMMHwgiCIQMHwghCCIIIQgXCCIIIAiGDCQAIAgfCIYMHwiEDIYMHQiQARAIHQgcCJABHAiOAZABGAgdCBAIGAgaCB0IGggbCB0IGQgSCIUMGQgYCBIIGAgQCBIIFgiHDIgMFggVCIcMFQiJDIcMEQgWCIgMEQgTCBYIEwgUCBYIEgiKDIUMEggRCIoMEQiIDIoMDwiLDIwMDwgHCIsMBwiNDIsMDQgPCIwMDQgOCA8IDggFCA8IqwCODKkAqwANCI4MDQiMDI4MCwiXAf4HCwgKCJcBCgiVAZcBBggLCP4HBggICAsICAgJCAsIBwgACI0MBwgGCAAIBgj+BwAIBAiPDJAMBAgDCI8MAwiRDI8M/wcECJAM/wcBCAQIAQgCCAQIAAiSDI0MAAj/B5IM/weQDJIM/QegAecH/Qf1B6AB9QeeAaAB+wf9B+cH+wf8B/0H/AfzB/0HrQDpByQArQD7B+kH+wfnB+kH+QedAewH+Qf4B50B+AebAZ0B9Af5B+wH9Af2B/kH9gf3B/kH9QfuB54B9Qf0B+4H9AfsB+4H8geoAIkK8gfxB6gA8QemAKgA7QfyB4kK7QfvB/IH7wfwB/IH7geLCp4B7gftB4sK7QeJCosK6wfRC9AL6wfiB9EL4gf2AtEL6AfrB9AL6AfqB+sH6gfgB+sH6QclACQA6QfoByUA6AfQCyUA5gekAdkH5gflB6QB5QeiAaQB4QfmB9kH4QfjB+YH4wfkB+YH4gfbB/YC4gfhB9sH4QfZB9sH3wfyA/ED3wfeB/ID3gchAPID2gffB/ED2gfcB98H3AfdB98H2wf3AvYC2wfaB/cC2gfxA/cC2AeTDJQM2AfRB5MM0QeVDJMM1gfYB5QM1gfXB9gH1wfPB9gH9gSWDKIA9gTWB5YM1geUDJYM1QerAcgH1QfUB6sB1AepAasB0AfVB8gH0AfSB9UH0gfTB9UH0QfKB5UM0QfQB8oH0AfIB8oHzgeXDJgMzgfNB5cMzQeZDJcMyQfOB5gMyQfLB84HywfMB84HygeaDJUMygfJB5oMyQeYDJoMxwebDJwMxwe+B5sMvgedDJsMxAfHB5wMxAfGB8cHxge8B8cHxQeeDB4AxQfEB54MxAecDJ4MwgeyAbUHwgfBB7IBwQewAbIBvQfCB7UHvQe/B8IHvwfAB8IHvge3B50Mvge9B7cHvQe1B7cHuwefDKAMuwe6B58MugehDJ8Mtge7B6AMtge4B7sHuAe5B7sHtweiDJ0Mtwe2B6IMtgegDKIMtAe8AZ8HtAetB7wBrQe6AbwBsge0B58HsgezB7QHswerB7QHzAOhBxsAzAOyB6EHsgefB6EHsQe5AaQHsQewB7kBsAe3AbkBrAexB6QHrAeuB7EHrgevB7EHrQemB7oBrQesB6YHrAekB6YHqgegAKUKqgepB6AAqQeeAKAApQeqB6UKpQenB6oHpweoB6oHpgenCroBpgelB6cKpQelCqcKowfDAYwHoweaB8MBmgfBAcMBoAejB4wHoAeiB6MHogeYB6MHoQeOBxsAoQegB44HoAeMB44HngfAAZEHngedB8ABnQe+AcABmQeeB5EHmQebB54HmwecB54HmgeTB8EBmgeZB5MHmQeRB5MHlwedAKwKlweWB50AlgebAJ0AkgeXB6wKkgeUB5cHlAeVB5cHkweuCsEBkweSB64KkgesCq4KkAejDKQMkAeHB6MMhwelDKMMjQeQB6QMjQePB5AHjweFB5AHjgemDBsAjgeNB6YMjQekDKYMiwfHAX4HiweKB8cBigfFAccBhgeLB34HhgeIB4sHiAeJB4sHhweAB6UMhweGB4AHhgd+B4AHhAenDKgMhAeDB6cMgwepDKcMfweEB6gMfweBB4QHgQeCB4QHgAeqDKUMgAd/B6oMfweoDKoMfQerDKwMfQd1B6sMdQetDKsMewd9B6wMewd8B30HfAdzB30HmACuDJYAmAB7B64MewesDK4MeQfOAWwHeQd4B84BeAfMAc4BdAd5B2wHdAd2B3kHdgd3B3kHdQduB60MdQd0B24HdAdsB24HcgevDLAMcgdxB68McQexDK8MbQdyB7AMbQdvB3IHbwdwB3IHbgeyDK0MbgdtB7IMbQewDLIMawfXAVUHawdjB9cBYwfVAdcBaQdrB1UHaQdqB2sHagdhB2sHmgBXBxsAmgBpB1cHaQdVB1cHZwfUAVoHZwdmB9QBZgfSAdQBYgdnB1oHYgdkB2cHZAdlB2cHYwdcB9UBYwdiB1wHYgdaB1wHYAeVAL0KYAdfB5UAXweTAJUAWwdgB70KWwddB2AHXQdeB2AHXAe/CtUBXAdbB78KWwe9Cr8KWQfiC+ELWQdQB+ILUAcHA+ILVgdZB+ELVgdYB1kHWAdOB1kHVwccABsAVwdWBxwAVgfhCxwAVAfbAUcHVAdTB9sBUwfZAdsBTwdUB0cHTwdRB1QHUQdSB1QHUAdJBwcDUAdPB0kHTwdHB0kHTQe5A7gDTQdMB7kDTAdHALkDSAdNB7gDSAdKB00HSgdLB00HSQcIAwcDSQdIBwgDSAe4AwgDRgezDLQMRgc/B7MMPwe1DLMMRAdGB7QMRAdFB0YHRQc9B0YH4wS2DEQA4wREB7YMRAe0DLYMQwfiATYHQwdCB+IBQgfgAeIBPgdDBzYHPgdAB0MHQAdBB0MHPwc4B7UMPwc+BzgHPgc2BzgHPAe3DLgMPAc7B7cMOwe5DLcMNwc8B7gMNwc5BzwHOQc6BzwHOAe6DLUMOAc3B7oMNwe4DLoMNQe7DLwMNQcuB7sMLge9DLsMMwc1B7wMMwc0BzUHNAcsBzUH0AS+DEEA0AQzB74MMwe8DL4MMgfpASUHMgcxB+kBMQfnAekBLQcyByUHLQcvBzIHLwcwBzIHLgcnB70MLgctBycHLQclBycHKwe/DMAMKwcqB78MKgfBDL8MJgcrB8AMJgcoBysHKAcpBysHJwfCDL0MJwcmB8IMJgfADMIMJAfDDMQMJAcdB8MMHQfFDMMMIgckB8QMIgcjByQHIwcbByQHvQTGDI0AvQQiB8YMIgfEDMYMIQfwARQHIQcgB/ABIAfuAfABHAchBxQHHAceByEHHgcfByEHHQcWB8UMHQccBxYHHAcUBxYHGgfHDMgMGgcZB8cMGQfJDMcMFQcaB8gMFQcXBxoHFwcYBxoHFgfKDMUMFgcVB8oMFQfIDMoMEwfLDMwMEwcKB8sMCgfNDMsMEAcTB8wMEAcSBxMHEgcIBxMHEQfODAYAEQcQB84MEAfMDM4MDgf3AQEHDgcNB/cBDQf1AfcBCQcOBwEHCQcLBw4HCwcMBw4HCgcDB80MCgcJBwMHCQcBBwMHBwfPDNAMBwcGB88MBgfRDM8MAgcHB9AMAgcEBwcHBAcFBwcHAwfSDM0MAwcCB9IMAgfQDNIMAAfTDNQMAAf4BtMM+AbVDNMM/gYAB9QM/gb/BgAH/wb2BgAHigDWDIgAigD+BtYM/gbUDNYM/Ab+Ae8G/Ab7Bv4B+wb8Af4B9wb8Bu8G9wb5BvwG+Qb6BvwG+AbxBtUM+Ab3BvEG9wbvBvEG9QbXDNgM9Qb0BtcM9AbZDNcM8Ab1BtgM8AbyBvUG8gbzBvUG8QbaDNUM8QbwBtoM8AbYDNoM7gYHAtgG7gbmBgcC5gYFAgcC7AbuBtgG7AbtBu4G7QbkBu4GjADaBgYAjADsBtoG7AbYBtoG6gYEAt0G6gbpBgQC6QYCAgQC5QbqBt0G5QbnBuoG5wboBuoG5gbfBgUC5gblBt8G5QbdBt8G4waHAOoK4wbiBocA4gaFAIcA3gbjBuoK3gbgBuMG4AbhBuMG3wbsCgUC3wbeBuwK3gbqCuwK3Aa/ArME3AbTBr8C0wa9Ar8C2QbcBrME2QbbBtwG2wbRBtwG2ga1BAYA2gbZBrUE2QazBLUE1wYLAsoG1wbWBgsC1gYJAgsC0gbXBsoG0gbUBtcG1AbVBtcG0wbMBr0C0wbSBswG0gbKBswG0AZAAJoL0AbPBkAAzwY+AEAAywbQBpoLywbNBtAGzQbOBtAGzAacC70CzAbLBpwLywaaC5wLyQbbDNwMyQbCBtsMwgbdDNsMxwbJBtwMxwbIBskGyAbABskGqgTeDDsAqgTHBt4MxwbcDN4MxgYSArkGxgbFBhICxQYQAhICwQbGBrkGwQbDBsYGwwbEBsYGwga7Bt0MwgbBBrsGwQa5BrsGvwbfDOAMvwa+Bt8MvgbhDN8Muga/BuAMuga8Br8GvAa9Br8GuwbiDN0Muwa6BuIMugbgDOIMuAbjDOQMuAaxBuMMsQblDOMMtga4BuQMtga3BrgGtwavBrgGlwTmDBgAlwS2BuYMtgbkDOYMtQYZAqgGtQa0BhkCtAYXAhkCsAa1BqgGsAayBrUGsgazBrUGsQaqBuUMsQawBqoGsAaoBqoGrgbnDOgMrgatBucMrQbpDOcMqQauBugMqQarBq4GqwasBq4GqgbqDOUMqgapBuoMqQboDOoMpwYjApIGpwagBiMCoAYhAiMCpQanBpIGpQamBqcGpgaeBqcGpgOUBhUApgOlBpQGpQaSBpQGpAYgApcGpAajBiACowYeAiACnwakBpcGnwahBqQGoQaiBqQGoAaZBiECoAafBpkGnwaXBpkGnQaBAAYLnQacBoEAnAZ/AIEAmAadBgYLmAaaBp0GmgabBp0GmQYICyECmQaYBggLmAYGCwgLlgYqAn8GlgaNBioCjQYoAioCkwaWBn8GkwaVBpYGlQaLBpYGlAaBBhUAlAaTBoEGkwZ/BoEGkQYnAoQGkQaQBicCkAYlAicCjAaRBoQGjAaOBpEGjgaPBpEGjQaGBigCjQaMBoYGjAaEBoYGigZ+AA0LigaJBn4AiQZ8AH4AhQaKBg0LhQaHBooGhwaIBooGhgYPCygChgaFBg8LhQYNCw8LgwbrDOwMgwZ6BusMegbtDOsMgAaDBuwMgAaCBoMGggZ4BoMGgQbuDBUAgQaABu4MgAbsDO4MfgYuAnEGfgZ9Bi4CfQYsAi4CeQZ+BnEGeQZ7Bn4GewZ8Bn4GegZzBu0MegZ5BnMGeQZxBnMGdwbvDPAMdwZ2Bu8MdgbxDO8McgZ3BvAMcgZ0BncGdAZ1BncGcwbyDO0McwZyBvIMcgbwDPIMcAbzDPQMcAZoBvMMaAb1DPMMbgZwBvQMbgZvBnAGbwZmBnAGeQD2DHcAeQBuBvYMbgb0DPYMbAY1Al8GbAZrBjUCawYzAjUCZwZsBl8GZwZpBmwGaQZqBmwGaAZhBvUMaAZnBmEGZwZfBmEGZQb3DPgMZQZkBvcMZAb5DPcMYAZlBvgMYAZiBmUGYgZjBmUGYQb6DPUMYQZgBvoMYAb4DPoMXgY+AkgGXgZWBj4CVgY8Aj4CXAZeBkgGXAZdBl4GXQZUBl4GewBKBhUAewBcBkoGXAZIBkoGWgY7Ak0GWgZZBjsCWQY5AjsCVQZaBk0GVQZXBloGVwZYBloGVgZPBjwCVgZVBk8GVQZNBk8GUwZ2AB4LUwZSBnYAUgZ0AHYATgZTBh4LTgZQBlMGUAZRBlMGTwYgCzwCTwZOBiALTgYeCyALTAbuC+0LTAZDBu4LQwYTA+4LSQZMBu0LSQZLBkwGSwZBBkwGSgYWABUASgZJBhYASQbtCxYARwZCAjoGRwZGBkICRgZAAkICQgZHBjoGQgZEBkcGRAZFBkcGQwY8BhMDQwZCBjwGQgY6BjwGQAaTA5IDQAY/BpMDPwY4AJMDOwZABpIDOwY9BkAGPQY+BkAGPAYUAxMDPAY7BhQDOwaSAxQDOQb7DPwMOQYyBvsMMgb9DPsMNwY5BvwMNwY4BjkGOAYwBjkGhQT+DDUAhQQ3Bv4MNwb8DP4MNgZJAikGNgY1BkkCNQZHAkkCMQY2BikGMQYzBjYGMwY0BjYGMgYrBv0MMgYxBisGMQYpBisGLwb/DAANLwYuBv8MLgYBDf8MKgYvBgANKgYsBi8GLAYtBi8GKwYCDf0MKwYqBgINKgYADQINKAYDDQQNKAYhBgMNIQYFDQMNJgYoBgQNJgYnBigGJwYfBigGcgQGDTIAcgQmBgYNJgYEDQYNJQZQAhgGJQYkBlACJAZOAlACIAYlBhgGIAYiBiUGIgYjBiUGIQYaBgUNIQYgBhoGIAYYBhoGHgYHDQgNHgYdBgcNHQYJDQcNGQYeBggNGQYbBh4GGwYcBh4GGgYKDQUNGgYZBgoNGQYIDQoNFwYLDQwNFwYQBgsNEAYNDQsNFQYXBgwNFQYWBhcGFgYOBhcGXwQODW4AXwQVBg4NFQYMDQ4NFAZXAgcGFAYTBlcCEwZVAlcCDwYUBgcGDwYRBhQGEQYSBhQGEAYJBg0NEAYPBgkGDwYHBgkGDQYPDRANDQYMBg8NDAYRDQ8NCAYNBhANCAYKBg0GCgYLBg0GCQYSDQ0NCQYIBhINCAYQDRINBgYTDRQNBgb9BRMN/QUVDRMNAwYGBhQNAwYFBgYGBQb7BQYGBAYWDRIABAYDBhYNAwYUDRYNAQZeAvQFAQYABl4CAAZcAl4C/AUBBvQF/AX+BQEG/gX/BQEG/QX2BRUN/QX8BfYF/AX0BfYF+gUXDRgN+gX5BRcN+QUZDRcN9QX6BRgN9QX3BfoF9wX4BfoF9gUaDRUN9gX1BRoN9QUYDRoN8wUbDRwN8wXrBRsN6wUdDRsN8QXzBRwN8QXyBfMF8gXpBfMFawAeDWkAawDxBR4N8QUcDR4N7wVlAuIF7wXuBWUC7gVjAmUC6gXvBeIF6gXsBe8F7AXtBe8F6wXkBR0N6wXqBeQF6gXiBeQF6AUfDSAN6AXnBR8N5wUhDR8N4wXoBSAN4wXlBegF5QXmBegF5AUiDR0N5AXjBSIN4wUgDSIN4QVuAssF4QXZBW4C2QVsAm4C3wXhBcsF3wXgBeEF4AXXBeEFbQDNBRIAbQDfBc0F3wXLBc0F3QVrAtAF3QXcBWsC3AVpAmsC2AXdBdAF2AXaBd0F2gXbBd0F2QXSBWwC2QXYBdIF2AXQBdIF1gVoAEsL1gXVBWgA1QVmAGgA0QXWBUsL0QXTBdYF0wXUBdYF0gVNC2wC0gXRBU0L0QVLC00LzwXzC/ILzwXGBfMLxgUZA/MLzAXPBfILzAXOBc8FzgXEBc8FzQUTABIAzQXMBRMAzAXyCxMAygVyAr0FygXJBXICyQVwAnICxQXKBb0FxQXHBcoFxwXIBcoFxgW/BRkDxgXFBb8FxQW9Bb8FwwWBA4ADwwXCBYEDwgUPAIEDvgXDBYADvgXABcMFwAXBBcMFvwUaAxkDvwW+BRoDvgWAAxoDvAUjDSQNvAW1BSMNtQUlDSMNugW8BSQNugW7BbwFuwWzBbwFTgQmDWIATgS6BSYNugUkDSYNuQV5AqwFuQW4BXkCuAV3AnkCtAW5BawFtAW2BbkFtgW3BbkFtQWuBSUNtQW0Ba4FtAWsBa4FsgUnDSgNsgWxBScNsQUpDScNrQWyBSgNrQWvBbIFrwWwBbIFrgUqDSUNrgWtBSoNrQUoDSoNqwUrDSwNqwWiBSsNogUtDSsNqAWrBSwNqAWqBasFqgWgBasFqQUuDQwAqQWoBS4NqAUsDS4NpgWAApkFpgWlBYACpQV+AoACoQWmBZkFoQWjBaYFowWkBaYFogWbBS0NogWhBZsFoQWZBZsFnwUvDTANnwWeBS8NngUxDS8NmgWfBTANmgWcBZ8FnAWdBZ8FmwUyDS0NmwWaBTINmgUwDTINmAWIAoEFmAWPBYgCjwWGAogClQWYBYEFlQWXBZgFlwWNBZgFlgWDBcsAlgWVBYMFlQWBBYMFkwWFAoYFkwWSBYUCkgUOAYUCjgWTBYYFjgWQBZMFkAWRBZMFjwWIBYYCjwWOBYgFjgWGBYgFjAVeAGULjAWLBV4AiwVcAF4AhwWMBWULhwWJBYwFiQWKBYwFiAVnC4YCiAWHBWcLhwVlC2cLhQWNAm4FhQV8BY0CfAWLAo0CggWFBW4FggWEBYUFhAV6BYUFgwVwBcsAgwWCBXAFggVuBXAFgAWKAnMFgAV/BYoCfwUVAYoCewWABXMFewV9BYAFfQV+BYAFfAV1BYsCfAV7BXUFewVzBXUFeQVbAGoLeQV4BVsAeAVZAFsAdAV5BWoLdAV2BXkFdgV3BXkFdQVsC4sCdQV0BWwLdAVqC2wLcgUlASsJcgVpBSUBaQUjASUBbwVyBSsJbwVxBXIFcQVnBXIFcAUtCcsAcAVvBS0JbwUrCS0JbQWPAmAFbQVsBY8CbAUcAY8CaAVtBWAFaAVqBW0FagVrBW0FaQViBSMBaQVoBWIFaAVgBWIFZgXQABcKZgVlBdAAZQXOANAAYQVmBRcKYQVjBWYFYwVkBWYFYgUZCiMBYgVhBRkKYQUXChkKXwWXAkgFXwVWBZcCVgWVApcCXAVfBUgFXAVeBV8FXgVUBV8FXQVKBcsAXQVcBUoFXAVIBUoFWgWUAk0FWgVZBZQCWQU+AZQCVQVaBU0FVQVXBVoFVwVYBVoFVgVPBZUCVgVVBU8FVQVNBU8FUwVVAHQLUwVSBVUAUgVTAFUATgVTBXQLTgVQBVMFUAVRBVMFTwV2C5UCTwVOBXYLTgV0C3YLTAXpAiAETAVDBekCQwXnAukCSQVMBSAESQVLBUwFSwVBBUwFSgUiBMsASgVJBSIESQUgBCIERwWZAjoFRwVGBZkCRgVFAZkCQgVHBToFQgVEBUcFRAVFBUcFQwU8BecCQwVCBTwFQgU6BTwFQAUsAMILQAU/BSwAPwUqACwAOwVABcILOwU9BUAFPQU+BUAFPAXEC+cCPAU7BcQLOwXCC8QLOQWhAiMFOQUxBaECMQWfAqECNwU5BSMFNwU4BTkFOAUvBTkFJgAlBSQAJgA3BSUFNwUjBSUFNQWeAigFNQU0BZ4CNAV1AZ4CMAU1BSgFMAUyBTUFMgUzBTUFMQUqBZ8CMQUwBSoFMAUoBSoFLgVQAHwLLgUtBVAALQVOAFAAKQUuBXwLKQUrBS4FKwUsBS4FKgV+C58CKgUpBX4LKQV8C34LJwWmAhAFJwUeBaYCHgWkAqYCJAUnBRAFJAUmBScFJgUcBScFJQUSBSQAJQUkBRIFJAUQBRIFIgWjAhUFIgUhBaMCIQV8AaMCHQUiBRUFHQUfBSIFHwUgBSIFHgUXBaQCHgUdBRcFHQUVBRcFGwVNAIELGwUaBU0AGgVLAE0AFgUbBYELFgUYBRsFGAUZBRsFFwWDC6QCFwUWBYMLFgWBC4MLFAWMAR4IFAULBYwBCwWKAYwBEQUUBR4IEQUTBRQFEwUJBRQFEgUgCCQAEgURBSAIEQUeCCAIDwWoAgIFDwUOBagCDgWDAagCCgUPBQIFCgUMBQ8FDAUNBQ8FCwUEBYoBCwUKBQQFCgUCBQQFCAWwAHgKCAUHBbAABwWuALAAAwUIBXgKAwUFBQgFBQUGBQgFBAV6CooBBAUDBXoKAwV4CnoKAQWuAcMHAQX6BK4B+gSsAa4B/wQBBcMH/wQABQEFAAX4BAEF3wPFBx4A3wP/BMUH/wTDB8UH/gStAvEE/gT9BK0C/QSlAa0C+QT+BPEE+QT7BP4E+wT8BP4E+gTzBKwB+gT5BPME+QTxBPME9wSkAJcK9wT2BKQA9gSiAKQA8gT3BJcK8gT0BPcE9AT1BPcE8wSZCqwB8wTyBJkK8gSXCpkK8AS1AtkE8ATnBLUC5wSzArUC7QTwBNkE7QTvBPAE7wTlBPAE7gTbBAYA7gTtBNsE7QTZBNsE6wSyAt4E6wTqBLIC6gTcAbIC5gTrBN4E5gToBOsE6ATpBOsE5wTgBLMC5wTmBOAE5gTeBOAE5ARGAJAL5ATjBEYA4wREAEYA3wTkBJAL3wThBOQE4QTiBOQE4ASSC7MC4ATfBJIL3wSQC5IL3QS6AsYE3QTUBLoC1AS4AroC2gTdBMYE2gTcBN0E3ATSBN0E2wTIBAYA2wTaBMgE2gTGBMgE2AS3AssE2ATXBLcC1wTjAbcC0wTYBMsE0wTVBNgE1QTWBNgE1ATNBLgC1ATTBM0E0wTLBM0E0QRDAJUL0QTQBEMA0ARBAEMAzATRBJULzATOBNEEzgTPBNEEzQSXC7gCzQTMBJcLzASVC5cLygTzAQ8HygTBBPMBwQTxAfMBxwTKBA8HxwTJBMoEyQS/BMoEyAQRBwYAyATHBBEHxwQPBxEHxQS8ArgExQTEBLwCxATqAbwCwATFBLgEwATCBMUEwgTDBMUEwQS6BPEBwQTABLoEwAS4BLoEvgSPANkKvgS9BI8AvQSNAI8AuQS+BNkKuQS7BL4EuwS8BL4EugTbCvEBugS5BNsKuQTZCtsKtwTEAqAEtwSuBMQCrgTCAsQCtAS3BKAEtAS2BLcEtgSsBLcEtQSiBAYAtQS0BKIEtASgBKIEsgTBAqUEsgSxBMECsQQMAsECrQSyBKUErQSvBLIErwSwBLIErgSnBMICrgStBKcErQSlBKcEqwQ9AJ8LqwSqBD0AqgQ7AD0ApgSrBJ8LpgSoBKsEqASpBKsEpwShC8ICpwSmBKELpgSfC6ELpAQMA68DpASbBAwDmwQKAwwDoQSkBK8DoQSjBKQEowSZBKQEogSxAwYAogShBLEDoQSvA7EDnwTGApIEnwSeBMYCngQTAsYCmgSfBJIEmgScBJ8EnASdBJ8EmwSUBAoDmwSaBJQEmgSSBJQEmAQaAOQLmASXBBoAlwQYABoAkwSYBOQLkwSVBJgElQSWBJgElATmCwoDlASTBOYLkwTkC+YLkQTOAnsEkQSJBM4CiQTMAs4CjwSRBHsEjwSQBJEEkASHBJEEFAB9BBIAFACPBH0EjwR7BH0EjQTLAoAEjQSMBMsCjARDAssCiASNBIAEiASKBI0EigSLBI0EiQSCBMwCiQSIBIIEiASABIIEhgQ3AKcLhgSFBDcAhQQ1ADcAgQSGBKcLgQSDBIYEgwSEBIYEggSpC8wCggSBBKkLgQSnC6kLfwTTAmgEfwR2BNMCdgTRAtMCfAR/BGgEfAR+BH8EfgR0BH8EfQRqBBIAfQR8BGoEfARoBGoEegTQAm0EegR5BNACeQRKAtACdQR6BG0EdQR3BHoEdwR4BHoEdgRvBNECdgR1BG8EdQRtBG8EcwQ0AKwLcwRyBDQAcgQyADQAbgRzBKwLbgRwBHMEcARxBHMEbwSuC9ECbwRuBK4LbgSsC64LbARaAgIGbARjBFoCYwRYAloCaQRsBAIGaQRrBGwEawRhBGwEagQEBhIAagRpBAQGaQQCBgQGZwTVAloEZwRmBNUCZgRRAtUCYgRnBFoEYgRkBGcEZARlBGcEYwRcBFgCYwRiBFwEYgRaBFwEYARwADoLYARfBHAAXwRuAHAAWwRgBDoLWwRdBGAEXQReBGAEXAQ8C1gCXARbBDwLWwQ6CzwLWQR8AqcFWQRSBHwCUgR6AnwCVwRZBKcFVwRYBFkEWARQBFkEbgOpBQwAbgNXBKkFVwSnBakFVgTaAkkEVgRVBNoCVQRzAtoCUQRWBEkEUQRTBFYEUwRUBFYEUgRLBHoCUgRRBEsEUQRJBEsETwRkAFkLTwROBGQATgRiAGQASgRPBFkLSgRMBE8ETARNBE8ESwRbC3oCSwRKBFsLSgRZC1sLSATiAjMESARBBOICQQTgAuICRgRIBDMERgRHBEgERwQ/BEgEXAM1BMsAXANGBDUERgQzBDUERQTfAjgERQREBN8CRATlAN8CQARFBDgEQARCBEUEQgRDBEUEQQQ6BOACQQRABDoEQAQ4BDoEPgQvALsLPgQ9BC8APQQtAC8AOQQ+BLsLOQQ7BD4EOwQ8BD4EOgS9C+ACOgQ5BL0LOQS7C70LNwSDApQFNwQuBIMCLgSBAoMCNAQ3BJQFNAQ2BDcENgQsBDcENQSWBcsANQQ0BJYFNASUBZYFMgTmAiUEMgQxBOYCMQTkAuYCLQQyBCUELQQvBDIELwQwBDIELgQnBIECLgQtBCcELQQlBCcEKwRhAGALKwQqBGEAKgRfAGEAJgQrBGALJgQoBCsEKAQpBCsEJwRiC4ECJwQmBGILJgRgC2ILJATuAg0EJAQbBO4CGwTsAu4CIQQkBA0EIQQjBCQEIwQZBCQEIgQPBMsAIgQhBA8EIQQNBA8EHwTrAhIEHwQeBOsCHgRMAesCGgQfBBIEGgQcBB8EHAQdBB8EGwQUBOwCGwQaBBQEGgQSBBQEGAQpAMcLGAQXBCkAFwQnACkAEwQYBMcLEwQVBBgEFQQWBBgEFATJC+wCFAQTBMkLEwTHC8kLEQQzDTQNEQQIBDMNCAQ1DTMNDgQRBDQNDgQQBBEEEAQGBBEEDwQ2DcsADwQOBDYNDgQ0DTYNDATyAv8DDAQLBPICCwTwAvICBwQMBP8DBwQJBAwECQQKBAwECAQBBDUNCAQHBAEEBwT/AwEEBQQ3DTgNBQQEBDcNBAQJADcNAAQFBDgNAAQCBAUEAgQDBAUEAQQ5DTUNAQQABDkNAAQ4DTkN/gP7AugD/gP2A/sC9gP5AvsC/AP+A+gD/AP9A/4D/QP0A/4DUgDqAwkAUgD8A+oD/APoA+oD+gP4Au0D+gP5A/gC+QP2AvgC9QP6A+0D9QP3A/oD9wP4A/oD9gPvA/kC9gP1A+8D9QPtA+8D8wMjANML8wPyAyMA8gMhACMA7gPzA9ML7gPwA/MD8APxA/MD7wPVC/kC7wPuA9UL7gPTC9UL7AMADP8L7APjAwAM4wMnAwAM6QPsA/8L6QPrA+wD6wPhA+wD6gMKAAkA6gPpAwoA6QP/CwoA5wP9AtoD5wPmA/0C5gOpAv0C4gPnA9oD4gPkA+cD5APlA+cD4wPcAycD4wPiA9wD4gPaA9wD4ANJA0gD4APfA0kD3wMeAEkD2wPgA0gD2wPdA+AD3QPeA+AD3AMoAycD3APbAygD2wNIAygD2QMFA8ID2QPQAwUD0AMDAwUD1gPZA8ID1gPYA9kD2APOA9kD1wPEAwYA1wPWA8QD1gPCA8QD1AMCA8cD1APTAwID0wOzAQIDzwPUA8cDzwPRA9QD0QPSA9QD0APJAwMD0APPA8kDzwPHA8kDzQMdAN0LzQPMAx0AzAMbAB0AyAPNA90LyAPKA80DygPLA80DyQPfCwMDyQPIA98LyAPdC98LxgOwAuwExgO9A7ACvQOuArACwwPGA+wEwwPFA8YDxQO7A8YDxAPuBAYAxAPDA+4EwwPsBO4EwQMJA7QDwQPAAwkDwAMHAwkDvAPBA7QDvAO+A8EDvgO/A8EDvQO2A64CvQO8A7YDvAO0A7YDugNJAIsLugO5A0kAuQNHAEkAtQO6A4sLtQO3A7oDtwO4A7oDtgONC64CtgO1A40LtQOLC40LswMRA5wDswOqAxEDqgMPAxEDsAOzA5wDsAOyA7MDsgOoA7MDsQOeAwYAsQOwA54DsAOcA54DrgMOA6EDrgOtAw4DrQMaAg4DqQOuA6EDqQOrA64DqwOsA64DqgOjAw8DqgOpA6MDqQOhA6MDpwMXAOkLpwOmAxcApgMVABcAogOnA+kLogOkA6cDpAOlA6cDowPrCw8DowOiA+sLogPpC+sLoAMHDAYMoAOXAwcMlwMuAwcMnQOgAwYMnQOfA6ADnwOVA6ADngMHAAYAngOdAwcAnQMGDAcAmwMVA44DmwOaAxUDmgMTAxUDlgObA44DlgOYA5sDmAOZA5sDlwOQAy4DlwOWA5ADlgOOA5ADlAM2AzUDlAOTAzYDkwM4ADYDjwOUAzUDjwORA5QDkQOSA5QDkAMvAy4DkAOPAy8DjwM1Ay8DjQMeA3cDjQOFAx4DhQMcAx4DiwONA3cDiwOMA40DjAODA40DOgB5AzgAOgCLA3kDiwN3A3kDiQMbA3wDiQOIAxsDiAMZAxsDhAOJA3wDhAOGA4kDhgOHA4kDhQN+AxwDhQOEA34DhAN8A34DggMRAPULggOBAxEAgQMPABEAfQOCA/ULfQN/A4IDfwOAA4IDfgP3CxwDfgN9A/cLfQP1C/cLewM6DTsNewNyAzoNcgM8DToNeAN7AzsNeAN6A3sDegNwA3sDeQM9DTgAeQN4Az0NeAM7DT0NdgMgA2kDdgN1AyADdQPWAiADcQN2A2kDcQNzA3YDcwN0A3YDcgNrAzwNcgNxA2sDcQNpA2sDbwM+DT8NbwNuAz4NbgMMAD4NagNvAz8NagNsA28DbANtA28DawNADTwNawNqA0ANagM/DUANaAM5DTgNaANgAzkNYAM1DTkNZgNoAzgNZgNnA2gDZwNeA2gD5AA3DQkA5ABmAzcNZgM4DTcNZAMkA1cDZANjAyQDYwPbAiQDXwNkA1cDXwNhA2QDYQNiA2QDYANZAzUNYANfA1kDXwNXA1kDXQM2DTQNXQNcAzYNXAPLADYNWANdAzQNWANaA10DWgNbA10DWQMzDTUNWQNYAzMNWAM0DTMNVgMAA9UDVgNNAwADTQP+AgADUwNWA9UDUwNVA1YDVQNLA1YDVAPXAwYAVANTA9cDUwPVA9cDUQMpA0QDUQNQAykDUAMnAykDTANRA0QDTANOA1EDTgNPA1EDTQNGA/4CTQNMA0YDTANEA0YDSgMgANgLSgNJAyAASQMeACAARQNKA9gLRQNHA0oDRwNIA0oDRgPaC/4CRgNFA9oLRQPYC9oLQwNADT8NQwM6A0ANOgM8DUANQANDAz8NQANCA0MDQgM4A0MDQQM+DQwAQQNAAz4NQAM/DT4NPgMwAzEDPgM9AzADPQMuAzADOQM+AzEDOQM7Az4DOwM8Az4DOgMzAzwNOgM5AzMDOQMxAzMDNwM9DTsNNwM2Az0NNgM4AD0NMgM3AzsNMgM0AzcDNAM1AzcDMwM6DTwNMwMyAzoNMgM7DToNMAM0AzEDMAMvAzQDLwM1AzQDKwM7AzgDKwMtAzsDLQM8AzsDLANCAz8DLAMrA0IDKwM4A0IDKQNHA0QDKQMoA0cDKANIA0cDJQNOA0sDJQMmA04DJgNPA04DBABVA1IDBAAlA1UDJQNLA1UDJANaA1cDJAPdAloD3QJbA1oDIQNhA14DIQMjA2EDIwNiA2EDIgNnA2UDIgMhA2cDIQNeA2cDIANsA2kDIAPYAmwD2AJtA2wDHQNzA3ADHQMfA3MDHwN0A3MDHgN6A3cDHgMdA3oDHQNwA3oDGwN/A3wDGwMaA38DGgOAA38DFgOGA4MDFgMYA4YDGAOHA4YDFwOMA4oDFwMWA4wDFgODA4wDFQORA44DFQMUA5EDFAOSA5EDEAOYA5UDEAMSA5gDEgOZA5gDEQOfA5wDEQMQA58DEAOVA58DDgOkA6EDDgMcAqQDHAKlA6QDCwOrA6gDCwMNA6sDDQOsA6sDDAOyA68DDAMLA7IDCwOoA7IDCQO3A7QDCQMIA7cDCAO4A7cDBAO+A7sDBAMGA74DBgO/A74DBQPFA8IDBQMEA8UDBAO7A8UDAgPKA8cDAgO1AcoDtQHLA8oD/wLRA84D/wIBA9EDAQPSA9EDAAPYA9UDAAP/AtgD/wLOA9gD/QLdA9oD/QKrAt0DqwLeA90D+gLkA+ED+gL8AuQD/ALlA+QD+wLrA+gD+wL6AusD+gLhA+sD+ALwA+0D+AL3AvAD9wLxA/AD8wL3A/QD8wL1AvcD9QL4A/cD9AL9A/sD9ALzAv0D8wL0A/0D8gICBP8D8gLxAgIE8QIDBAIE7QIJBAYE7QLvAgkE7wIKBAkE7gIQBA0E7gLtAhAE7QIGBBAE6wIVBBIE6wJOARUETgEWBBUE6AIcBBkE6ALqAhwE6gIdBBwE6QIjBCAE6QLoAiME6AIZBCME5gIoBCUE5gLlAigE5QIpBCgE4QIvBCwE4QLjAi8E4wIwBC8E4gI2BDME4gLhAjYE4QIsBDYE3wI7BDgE3wLnADsE5wA8BDsE3AJCBD8E3ALeAkIE3gJDBEIE3QJHBFsD3QLcAkcE3AI/BEcE2gJMBEkE2gJ1AkwEdQJNBEwE1wJTBFAE1wLZAlME2QJUBFME2AJYBG0D2ALXAlgE1wJQBFgE1QJdBFoE1QJTAl0EUwJeBF0E0gJkBGEE0gLUAmQE1AJlBGQE0wJrBGgE0wLSAmsE0gJhBGsE0AJwBG0E0AJMAnAETAJxBHAEzQJ3BHQEzQLPAncEzwJ4BHcEzgJ+BHsEzgLNAn4EzQJ0BH4EywKDBIAEywJFAoMERQKEBIMEyAKKBIcEyALKAooEygKLBIoEyQKQBI4EyQLIApAEyAKHBJAExgKVBJIExgIVApUEFQKWBJUEwwKcBJkEwwLFApwExQKdBJwExAKjBKAExALDAqMEwwKZBKMEwQKoBKUEwQIOAqgEDgKpBKgEvgKvBKwEvgLAAq8EwAKwBK8EvwK2BLMEvwK+ArYEvgKsBLYEvAK7BLgEvALsAbsE7AG8BLsEuQLCBL8EuQK7AsIEuwLDBMIEugLJBMYEugK5AskEuQK/BMkEtwLOBMsEtwLlAc4E5QHPBM4EtALVBNIEtAK2AtUEtgLWBNUEtQLcBNkEtQK0AtwEtALSBNwEsgLhBN4EsgLeAeEE3gHiBOEErwLoBOUErwKxAugEsQLpBOgEsALvBOwEsAKvAu8ErwLlBO8ErQL0BPEErQKnAfQEpwH1BPQEqgL7BPgEqgKsAvsErAL8BPsEqwIABd4DqwKqAgAFqgL4BAAFqAIFBQIFqAKFAQUFhQEGBQUFpQIMBQkFpQKnAgwFpwINBQwFpgITBRAFpgKlAhMFpQIJBRMFowIYBRUFowJ+ARgFfgEZBRgFoAIfBRwFoAKiAh8FogIgBR8FoQImBSMFoQKgAiYFoAIcBSYFngIrBSgFngJ3ASsFdwEsBSsFmwIyBS8FmwKdAjIFnQIzBTIFnAI4BTYFnAKbAjgFmwIvBTgFmQI9BToFmQJHAT0FRwE+BT0FlgJEBUEFlgKYAkQFmAJFBUQFlwJLBUgFlwKWAksFlgJBBUsFlAJQBU0FlAJAAVAFQAFRBVAFkQJXBVQFkQKTAlcFkwJYBVcFkgJeBVsFkgKRAl4FkQJUBV4FjwJjBWAFjwIeAWMFHgFkBWMFjAJqBWcFjAKOAmoFjgJrBWoFjQJxBW4FjQKMAnEFjAJnBXEFigJ2BXMFigIXAXYFFwF3BXYFhwJ9BXoFhwKJAn0FiQJ+BX0FiAKEBYEFiAKHAoQFhwJ6BYQFhQKJBYYFhQIQAYkFEAGKBYkFggKQBY0FggKEApAFhAKRBZAFgwKXBZQFgwKCApcFggKNBZcFgAKcBZkFgAJ/ApwFfwKdBZwFewKjBaAFewJ9AqMFfQKkBaMFfAKqBacFfAJ7AqoFewKgBaoFeQKvBawFeQJ4Aq8FeAKwBa8FdAK2BbMFdAJ2ArYFdgK3BbYFdQK7BU0EdQJ0ArsFdAKzBbsFcgLABb0FcgJxAsAFcQLBBcAFbQLHBcQFbQJvAscFbwLIBccFbgLOBcsFbgJtAs4FbQLEBc4FawLTBdAFawJqAtMFagLUBdMFZgLaBdcFZgJoAtoFaALbBdoFZwLgBd4FZwJmAuAFZgLXBeAFZQLlBeIFZQJkAuUFZALmBeUFYALsBekFYAJiAuwFYgLtBewFYQLyBfAFYQJgAvIFYALpBfIFXgL3BfQFXgJdAvcFXQL4BfcFWQL+BfsFWQJbAv4FWwL/Bf4FWgIFBgIGWgJZAgUGWQL7BQUGVwIKBgcGVwJWAgoGVgILBgoGUgIRBg4GUgJUAhEGVAISBhEGUwIWBl4EUwJSAhYGUgIOBhYGUAIbBhgGUAJPAhsGTwIcBhsGSwIiBh8GSwJNAiIGTQIjBiIGTAInBnEETAJLAicGSwIfBicGSQIsBikGSQJIAiwGSAItBiwGRAIzBjAGRAJGAjMGRgI0BjMGRQI4BoQERQJEAjgGRAIwBjgGQgI9BjoGQgJBAj0GQQI+Bj0GPQJEBkEGPQI/AkQGPwJFBkQGPgJLBkgGPgI9AksGPQJBBksGOwJQBk0GOwI6AlAGOgJRBlAGNgJXBlQGNgI4AlcGOAJYBlcGNwJdBlsGNwI2Al0GNgJUBl0GNQJiBl8GNQI0AmIGNAJjBmIGMAJpBmYGMAIyAmkGMgJqBmkGMQJvBm0GMQIwAm8GMAJmBm8GLgJ0BnEGLgItAnQGLQJ1BnQGKQJ7BngGKQIrAnsGKwJ8BnsGKgKCBn8GKgIpAoIGKQJ4BoIGJwKHBoQGJwImAocGJgKIBocGIgKOBosGIgIkAo4GJAKPBo4GIwKVBpIGIwIiApUGIgKLBpUGIAKaBpcGIAIfApoGHwKbBpoGGwKhBp4GGwIdAqEGHQKiBqEGHAKmBqUDHAIbAqYGGwKeBqYGGQKrBqgGGQIYAqsGGAKsBqsGFAKyBq8GFAIWArIGFgKzBrIGFQK3BpYEFQIUArcGFAKvBrcGEgK8BrkGEgIRArwGEQK9BrwGDQLDBsAGDQIPAsMGDwLEBsMGDgLIBqkEDgINAsgGDQLABsgGCwLNBsoGCwIKAs0GCgLOBs0GBgLUBtEGBgIIAtQGCALVBtQGBwLbBtgGBwIGAtsGBgLRBtsGBALgBt0GBAIDAuAGAwLhBuAG/wHnBuQG/wEBAucGAQLoBucGAALtBusGAAL/Ae0G/wHkBu0G/gHyBu8G/gH9AfIG/QHzBvIG+QH5BvYG+QH7AfkG+wH6BvkG+gH/Bv0G+gH5Af8G+QH2Bv8G9wEEBwEH9wH2AQQH9gEFBwQH8gELBwgH8gH0AQsH9AEMBwsH8wESBw8H8wHyARIH8gEIBxIH8AEXBxQH8AHvARcH7wEYBxcH6wEeBxsH6wHtAR4H7QEfBx4H7AEjB7wE7AHrASMH6wEbByMH6QEoByUH6QHoASgH6AEpBygH5AEvBywH5AHmAS8H5gEwBy8H5QE0B88E5QHkATQH5AEsBzQH4gE5BzYH4gHhATkH4QE6BzkH3QFABz0H3QHfAUAH3wFBB0AH3gFFB+IE3gHdAUUH3QE9B0UH2wFKB0cH2wHaAUoH2gFLB0oH1gFRB04H1gHYAVEH2AFSB1EH1wFYB1UH1wHWAVgH1gFOB1gH1AFdB1oH1AHTAV0H0wFeB10HzwFkB2EHzwHRAWQH0QFlB2QH0AFqB2gH0AHPAWoHzwFhB2oHzgFvB2wHzgHNAW8HzQFwB28HyQF2B3MHyQHLAXYHywF3B3YHygF8B3oHygHJAXwHyQFzB3wHxwGBB34HxwHGAYEHxgGCB4EHwgGIB4UHwgHEAYgHxAGJB4gHwwGPB4wHwwHCAY8HwgGFB48HwAGUB5EHwAG/AZQHvwGVB5QHuwGbB5gHuwG9AZsHvQGcB5sHvAGiB58HvAG7AaIHuwGYB6IHuQGnB6QHuQG4AacHuAGoB6cHtAGuB6sHtAG2Aa4HtgGvB64HtQGzB8sDtQG0AbMHtAGrB7MHsgG4B7UHsgGxAbgHsQG5B7gHrQG/B7wHrQGvAb8HrwHAB78HrgHGB8MHrgGtAcYHrQG8B8YHqwHLB8gHqwGqAcsHqgHMB8sHpgHSB88HpgGoAdIHqAHTB9IHpwHXB/UEpwGmAdcHpgHPB9cHpAHcB9kHpAGjAdwHowHdB9wHnwHjB+AHnwGhAeMHoQHkB+MHoAHqB+cHoAGfAeoHnwHgB+oHnQHvB+wHnQGcAe8HnAHwB+8HmAH2B/MHmAGaAfYHmgH3B/YHmQH8B/oHmQGYAfwHmAHzB/wHlwEBCP4HlwGWAQEIlgECCAEIkgEICAUIkgGUAQgIlAEJCAgIkwEOCAwIkwGSAQ4IkgEFCA4IkAETCBAIkAGPARMIjwEUCBMIiwEaCBcIiwGNARoIjQEbCBoIjAEhCB4IjAGLASEIiwEXCCEIiQEmCCMIiQGIASYIiAEnCCYIhAEtCCoIhAGGAS0IhgEuCC0IhQEyCAYFhQGEATIIhAEqCDIIggE3CDQIggGBATcIgQE4CDcIfQE+CDsIfQF/AT4IfwE/CD4IfgFDCBkFfgF9AUMIfQE7CEMIewFICEUIewF6AUgIegFJCEgIdgFPCEwIdgF4AU8IeAFQCE8IdwFUCCwFdwF2AVQIdgFMCFQIdAFZCFYIdAFzAVkIcwFaCFkIbwFgCF0IbwFxAWAIcQFhCGAIcAFnCGQIcAFvAWcIbwFdCGcIbQFsCGkIbQFsAWwIbAFtCGwIaAFzCHAIaAFqAXMIagF0CHMIaQF5CHcIaQFoAXkIaAFwCHkIZwF+CHsIZwFmAX4IZgF/CH4IYgGFCIIIYgFkAYUIZAGGCIUIYwGLCIkIYwFiAYsIYgGCCIsIYAGQCI0IYAFfAZAIXwGRCJAIWwGXCJQIWwFdAZcIXQGYCJcIXAGeCJsIXAFbAZ4IWwGUCJ4IWQGjCKAIWQFYAaMIWAGkCKMIVAGqCKcIVAFWAaoIVgGrCKoIVQGxCK4IVQFUAbEIVAGnCLEIUgG2CLMIUgFRAbYIUQG3CLYITQG9CLoITQFPAb0ITwG+CL0ITgHCCBYETgFNAcIITQG6CMIISwHHCMQISwFKAccISgHICMcIRgHOCMsIRgFIAc4ISAHPCM4IRwHTCD4FRwFGAdMIRgHLCNMIRAHYCNUIRAFDAdgIQwHZCNgIPwHfCNwIPwFBAd8IQQHgCN8IQAHkCFEFQAE/AeQIPwHcCOQIPQHpCOYIPQE8AekIPAHqCOkIOAHwCO0IOAE6AfAIOgHxCPAIOQH3CPQIOQE4AfcIOAHtCPcINgH8CPkINgE1AfwINQH9CPwIMQEDCQAJMQEzAQMJMwEECQMJMgEJCQcJMgExAQkJMQEACQkJMAEOCQsJMAEvAQ4JLwEPCQ4JKwEVCRIJKwEtARUJLQEWCRUJLAEbCRkJLAErARsJKwESCRsJKQEgCR0JKQEoASAJKAEhCSAJJAEnCSQJJAEmAScJJgEoCScJJQEuCSsJJQEkAS4JJAEkCS4JIgEzCTAJIgEhATMJIQE0CTMJHQE6CTcJHQEfAToJHwE7CToJHgE/CWQFHgEdAT8JHQE3CT8JGwFECUEJGwEaAUQJGgFFCUQJFgFLCUgJFgEYAUsJGAFMCUsJFwFQCXcFFwEWAVAJFgFICVAJFAFVCVIJFAETAVUJEwFWCVUJDwFcCVkJDwERAVwJEQFdCVwJEAFhCYoFEAEPAWEJDwFZCWEJDQFmCWMJDQEMAWYJDAFnCWYJCAFtCWoJCAEKAW0JCgFuCW0JCQF0CXEJCQEIAXQJCAFqCXQJBgF5CXYJBgEFAXkJBQF6CXkJAQGACX0JAQEDAYAJAwGBCYAJAgGGCYQJAgEBAYYJAQF9CYYJAAGLCYgJAAH/AIsJ/wCMCYsJ+wCSCY8J+wD9AJIJ/QCTCZIJ/ACYCZYJ/AD7AJgJ+wCPCZgJ+QCdCZoJ+QD4AJ0J+ACeCZ0J9ACkCaEJ9AD2AKQJ9gClCaQJ9QCrCagJ9QD0AKsJ9AChCasJ8gCwCa0J8gDxALAJ8QCxCbAJ7QC3CbQJ7QDvALcJ7wC4CbcJ7gC+CbsJ7gDtAL4J7QC0Cb4J6wDDCcAJ6wDqAMMJ6gDECcMJ5gDKCccJ5gDoAMoJ6ADLCcoJ5wDPCTwE5wDmAM8J5gDHCc8J5ADSCWUD5AALANIJCwDTCdIJ4wDYCdYJ4wACANgJAgDZCdgJMADfCdwJMADiAN8J4gDgCd8J4QDmCeMJ4QDgAOYJ4ADnCeYJ3gDtCeoJ3gDdAO0J3QDuCe0J2wDyCYQJ2wDaAPIJ2gDzCfIJ2QD3CZYJ2QDYAPcJ2AD4CfcJ1gD+CfsJ1gDVAP4J1QD/Cf4JYAAFCgIKYADTAAUK0wAGCgUKXQAMCgkKXQDSAAwK0gANCgwKWgATChAKWgDRABMK0QAUChMK0AAaChcK0ADPABoKzwAbChoKzQAfCgcJzQDMAB8KzAAgCh8KygAkChkJygDJACQKyQAlCiQKxwArCigKxwDGACsKxgAsCisKVwAyCi8KVwDEADIKxAAzCjIKVAA5CjYKVADDADkKwwA6CjkKKwBACj0KKwDCAEAKwgBBCkAKwQBHCkQKwQDAAEcKwABICkcKvgBOCksKvgC9AE4KvQBPCk4KuwBTCncIuwC6AFMKugBUClMKuQBYCokIuQC4AFgKuABZClgKtgBfClwKtgC1AF8KtQBgCl8KUQBmCmMKUQCzAGYKswBnCmYKTwBtCmoKTwCyAG0KsgBuCm0KTAB0CnEKTACxAHQKsQB1CnQKsAB7CngKsACvAHsKrwB8CnsKrQCACvoHrQCsAIAKrACBCoAKqwCFCgwIqwCqAIUKqgCGCoUKqACMCokKqACnAIwKpwCNCowKSgCTCpAKSgClAJMKpQCUCpMKpACaCpcKpACjAJoKowCbCpoKHwChCp4KHwChAKEKoQCiCqEKoACoCqUKoACfAKgKnwCpCqgKnQCvCqwKnQCcAK8KnACwCq8KmgC0CmgHmgCZALQKmQC1CrQKmAC5CnoHmACXALkKlwC6CrkKlQDACr0KlQCUAMAKlADBCsAKSADHCsQKSACSAMcKkgDICscKRQDOCssKRQCRAM4KkQDPCs4KQgDVCtIKQgCQANUKkADWCtUKjwDcCtkKjwCOANwKjgDdCtwKjADhCusGjACLAOEKiwDiCuEKigDmCv0GigCJAOYKiQDnCuYKhwDtCuoKhwCGAO0KhgDuCu0KPwD0CvEKPwCEAPQKhAD1CvQKPAD7CvgKPACDAPsKgwD8CvsKGQACC/8KGQCCAAILggADCwILgQAJCwYLgQCAAAkLgAAKCwkLfgAQCw0LfgB9ABALfQARCxALewAVC1sGewB6ABULegAWCxULeQAaC20GeQB4ABoLeAAbCxoLdgAhCx4LdgB1ACELdQAiCyELOQAoCyULOQBzACgLcwApCygLNgAvCywLNgByAC8LcgAwCy8LMwA2CzMLMwBxADYLcQA3CzYLcAA9CzoLcABvAD0LbwA+Cz0LbQBCC94FbQBsAEILbABDC0ILawBHC/AFawBqAEcLagBIC0cLaABOC0sLaABnAE4LZwBPC04LMQBVC1ILMQBlAFULZQBWC1ULZABcC1kLZABjAFwLYwBdC1wLYQBjC2ALYQBgAGMLYAACCmMLXgBoC2ULXgBdAGgLXQAJCmgLWwBtC2oLWwBaAG0LWgAQCm0LWAByC28LWABXAHILVwAvCnILVQB3C3QLVQBUAHcLVAA2CncLUgB6C/sDUgBRAHoLUQBjCnoLUAB/C3wLUABPAH8LTwBqCn8LTQCEC4ELTQBMAIQLTABxCoQLIgCJC4YLIgBKAIkLSgCQCokLSQCOC4sLSQBIAI4LSADECo4LRgCTC5ALRgBFAJMLRQDLCpMLQwCYC5ULQwBCAJgLQgDSCpgLQACdC5oLQAA/AJ0LPwDxCp0LPQCiC58LPQA8AKILPAD4CqILOgClC4oDOgA5AKULOQAlC6ULNwCqC6cLNwA2AKoLNgAsC6oLNACvC6wLNAAzAK8LMwAzC68LEAC0C7ELEAAxALQLMQBSC7QLDQC5C7YLDQAwALkLMADcCbkLLwC+C7sLLwAuAL4LLgC/C74LLADFC8ILLAArAMULKwA9CsULKQDKC8cLKQAoAMoLKADLC8oLJgDPCzYFJgAlAM8LJQDQC88LIwDWC9MLIwAiANYLIgCGC9YLIADbC9gLIAAfANsLHwCeCtsLHQDgC90LHQAcAOALHADhC+ALGgDnC+QLGgAZAOcLGQD/CucLFwDsC+kLFwAWAOwLFgDtC+wLFADxC44EFAATAPELEwDyC/ELEQD4C/ULEQAQAPgLEACxC/gLDgD7C9YJDgANAPsLDQC2C/sLCwD+C9MJCwAKAP4LCgD/C/4LCAAFDAIMCAAHAAUMBwAGDAUMBQAMDAkMBQAEAAwMBABSAwwMAgAPDNkJAgABAA8MAQAQDA8MQQ1CDUMNRA1CDUUNQQ1DDUYNQQ1GDUcNQQ1HDUgNRA1FDUkNSg1LDUwNTQ1ODU8NUA1RDVINUw1UDVUNRA1JDVYNSg1MDVcNTQ1PDVgNUA1SDVkNUw1VDVoNWw1cDV0NXg1fDWANYQ1iDWMNZA1lDWYNZw1oDWkNaQ1mDWoNaQ1oDWYNaA1kDWYNZg1jDWoNZg1lDWMNZQ1hDWMNYw1gDWoNYw1iDWANYg1eDWANYA1dDWoNYA1fDV0NXw1bDV0NXQ1pDWoNXQ1cDWkNXA1nDWkNWg1oDWcNWg1VDWgNVQ1kDWgNWQ1lDWQNWQ1SDWUNUg1hDWUNWA1iDWENWA1PDWINTw1eDWINVw1fDV4NVw1MDV8NTA1bDV8NVg1cDVsNVg1JDVwNSQ1nDVwNVQ1ZDWQNVQ1UDVkNVA1QDVkNUg1YDWENUg1RDVgNUQ1NDVgNTw1XDV4NTw1ODVcNTg1KDVcNTA1WDVsNTA1LDVYNSw1EDVYNSQ1aDWcNSQ1FDVoNRQ1TDVoNSA1UDVMNSA1HDVQNRw1QDVQNRw1RDVANRw1GDVENRg1NDVENRg1ODU0NRg1DDU4NQw1KDU4NRQ1IDVMNRQ1CDUgNQg1BDUgNQw1LDUoNQw1CDUsNQg1EDUsNaw1sDW0Nbg1sDW8Naw1tDXANaw1wDXENaw1xDXINbg1vDXMNdA11DXYNdw14DXkNeg17DXwNfQ1+DX8Nbg1zDYANdA12DYENdw15DYINeg18DYMNfQ1/DYQNhQ2GDYcNiA2JDYoNiw2MDY0Njg2PDZANkQ2SDZMNkw2QDZQNkw2SDZANkg2ODZANkA2NDZQNkA2PDY0Njw2LDY0NjQ2KDZQNjQ2MDYoNjA2IDYoNig2HDZQNig2JDYcNiQ2FDYcNhw2TDZQNhw2GDZMNhg2RDZMNhA2SDZENhA1/DZINfw2ODZINgw2PDY4Ngw18DY8NfA2LDY8Ngg2MDYsNgg15DYwNeQ2IDYwNgQ2JDYgNgQ12DYkNdg2FDYkNgA2GDYUNgA1zDYYNcw2RDYYNfw2DDY4Nfw1+DYMNfg16DYMNfA2CDYsNfA17DYINew13DYINeQ2BDYgNeQ14DYENeA10DYENdg2ADYUNdg11DYANdQ1uDYANcw2EDZENcw1vDYQNbw19DYQNcg1+DX0Ncg1xDX4NcQ16DX4NcQ17DXoNcQ1wDXsNcA13DXsNcA14DXcNcA1tDXgNbQ10DXgNbw1yDX0Nbw1sDXINbA1rDXINbQ11DXQNbQ1sDXUNbA1uDXUNlQ2WDZcNmA2WDZkNlQ2XDZoNlQ2aDZsNlQ2bDZwNmA2ZDZ0Nng2fDaANoQ2iDaMNpA2lDaYNpw2oDakNmA2dDaoNng2gDasNoQ2jDawNpA2mDa0Npw2pDa4Nrw2wDbENsg2zDbQNtQ22DbcNuA25DboNuw28Db0NvQ26Db4NvQ28DboNvA24DboNug23Db4Nug25DbcNuQ21DbcNtw20Db4Ntw22DbQNtg2yDbQNtA2xDb4NtA2zDbENsw2vDbENsQ29Db4NsQ2wDb0NsA27Db0Nrg28DbsNrg2pDbwNqQ24DbwNrQ25DbgNrQ2mDbkNpg21DbkNrA22DbUNrA2jDbYNow2yDbYNqw2zDbINqw2gDbMNoA2vDbMNqg2wDa8Nqg2dDbANnQ27DbANqQ2tDbgNqQ2oDa0NqA2kDa0Npg2sDbUNpg2lDawNpQ2hDawNow2rDbINow2iDasNog2eDasNoA2qDa8NoA2fDaoNnw2YDaoNnQ2uDbsNnQ2ZDa4NmQ2nDa4NnA2oDacNnA2bDagNmw2kDagNmw2lDaQNmw2aDaUNmg2hDaUNmg2iDaENmg2XDaINlw2eDaINmQ2cDacNmQ2WDZwNlg2VDZwNlw2fDZ4Nlw2WDZ8Nlg2YDZ8Nvw3ADcENwg3ADcMNvw3BDcQNvw3EDcUNvw3FDcYNwg3DDccNyA3JDcoNyw3MDc0Nzg3PDdAN0Q3SDdMNwg3HDdQNyA3KDdUNyw3NDdYNzg3QDdcN0Q3TDdgN2Q3aDdsN3A3dDd4N3w3gDeEN4g3jDeQN5Q3mDecN5w3kDegN5w3mDeQN5g3iDeQN5A3hDegN5A3jDeEN4w3fDeEN4Q3eDegN4Q3gDd4N4A3cDd4N3g3bDegN3g3dDdsN3Q3ZDdsN2w3nDegN2w3aDecN2g3lDecN2A3mDeUN2A3TDeYN0w3iDeYN1w3jDeIN1w3QDeMN0A3fDeMN1g3gDd8N1g3NDeANzQ3cDeAN1Q3dDdwN1Q3KDd0Nyg3ZDd0N1A3aDdkN1A3HDdoNxw3lDdoN0w3XDeIN0w3SDdcN0g3ODdcN0A3WDd8N0A3PDdYNzw3LDdYNzQ3VDdwNzQ3MDdUNzA3IDdUNyg3UDdkNyg3JDdQNyQ3CDdQNxw3YDeUNxw3DDdgNww3RDdgNxg3SDdENxg3FDdINxQ3ODdINxQ3PDc4NxQ3EDc8NxA3LDc8NxA3MDcsNxA3BDcwNwQ3IDcwNww3GDdENww3ADcYNwA2/DcYNwQ3JDcgNwQ3ADckNwA3CDckN6Q3qDesN7A3qDe0N6Q3rDe4N6Q3uDe8N6Q3vDfAN7A3tDfEN8g3zDfQN9Q32DfcN+A35DfoN+w38Df0N7A3xDf4N8g30Df8N9Q33DQAO+A36DQEO+w39DQIOAw4EDgUOBg4HDggOCQ4KDgsODA4NDg4ODw4QDhEOEQ4ODhIOEQ4QDg4OEA4MDg4ODg4LDhIODg4NDgsODQ4JDgsOCw4IDhIOCw4KDggOCg4GDggOCA4FDhIOCA4HDgUOBw4DDgUOBQ4RDhIOBQ4EDhEOBA4PDhEOAg4QDg8OAg79DRAO/Q0MDhAOAQ4NDgwOAQ76DQ0O+g0JDg0OAA4KDgkOAA73DQoO9w0GDgoO/w0HDgYO/w30DQcO9A0DDgcO/g0EDgMO/g3xDQQO8Q0PDgQO/Q0BDgwO/Q38DQEO/A34DQEO+g0ADgkO+g35DQAO+Q31DQAO9w3/DQYO9w32Df8N9g3yDf8N9A3+DQMO9A3zDf4N8w3sDf4N8Q0CDg8O8Q3tDQIO7Q37DQIO8A38DfsN8A3vDfwN7w34DfwN7w35DfgN7w3uDfkN7g31DfkN7g32DfUN7g3rDfYN6w3yDfYN7Q3wDfsN7Q3qDfAN6g3pDfAN6w3zDfIN6w3qDfMN6g3sDfMNEw4UDhUOFg4UDhcOEw4VDhgOEw4YDhkOEw4ZDhoOFg4XDhsOHA4dDh4OHw4gDiEOIg4jDiQOJQ4mDicOFg4bDigOHA4eDikOHw4hDioOIg4kDisOJQ4nDiwOLQ4uDi8OMA4xDjIOMw40DjUONg43DjgOOQ46DjsOOw44DjwOOw46DjgOOg42DjgOOA41DjwOOA43DjUONw4zDjUONQ4yDjwONQ40DjIONA4wDjIOMg4vDjwOMg4xDi8OMQ4tDi8OLw47DjwOLw4uDjsOLg45DjsOLA46DjkOLA4nDjoOJw42DjoOKw43DjYOKw4kDjcOJA4zDjcOKg40DjMOKg4hDjQOIQ4wDjQOKQ4xDjAOKQ4eDjEOHg4tDjEOKA4uDi0OKA4bDi4OGw45Di4OJw4rDjYOJw4mDisOJg4iDisOJA4qDjMOJA4jDioOIw4fDioOIQ4pDjAOIQ4gDikOIA4cDikOHg4oDi0OHg4dDigOHQ4WDigOGw4sDjkOGw4XDiwOFw4lDiwOGg4mDiUOGg4ZDiYOGQ4iDiYOGQ4jDiIOGQ4YDiMOGA4fDiMOGA4gDh8OGA4VDiAOFQ4cDiAOFw4aDiUOFw4UDhoOFA4TDhoOFQ4dDhwOFQ4UDh0OFA4WDh0OPQ4+Dj8OQA4+DkEOPQ4/DkIOPQ5CDkMOPQ5DDkQOQA5BDkUORg5HDkgOSQ5KDksOTA5NDk4OTw5QDlEOQA5FDlIORg5IDlMOSQ5LDlQOTA5ODlUOTw5RDlYOVw5YDlkOWg5bDlwOXQ5eDl8OYA5hDmIOYw5kDmUOZQ5iDmYOZQ5kDmIOZA5gDmIOYg5fDmYOYg5hDl8OYQ5dDl8OXw5cDmYOXw5eDlwOXg5aDlwOXA5ZDmYOXA5bDlkOWw5XDlkOWQ5lDmYOWQ5YDmUOWA5jDmUOVg5kDmMOVg5RDmQOUQ5gDmQOVQ5hDmAOVQ5ODmEOTg5dDmEOVA5eDl0OVA5LDl4OSw5aDl4OUw5bDloOUw5IDlsOSA5XDlsOUg5YDlcOUg5FDlgORQ5jDlgOUQ5VDmAOUQ5QDlUOUA5MDlUOTg5UDl0OTg5NDlQOTQ5JDlQOSw5TDloOSw5KDlMOSg5GDlMOSA5SDlcOSA5HDlIORw5ADlIORQ5WDmMORQ5BDlYOQQ5PDlYORA5QDk8ORA5DDlAOQw5MDlAOQw5NDkwOQw5CDk0OQg5JDk0OQg5KDkkOQg4/DkoOPw5GDkoOQQ5EDk8OQQ4+DkQOPg49DkQOPw5HDkYOPw4+DkcOPg5ADkcO`},$s=new U(7,0,-6),ec=e=>Uint8Array.from(atob(e),e=>e.charCodeAt(0));function tc(){let e=new Int16Array(ec(Qs.pos).buffer),t=new Int8Array(ec(Qs.nor).buffer),n=ec(Qs.col),r=new Uint16Array(ec(Qs.idx).buffer),i=Qs.count,a=new Float32Array(i*3),o=new Float32Array(i*3),s=Qs.scale/32767;for(let n=0;n<i;n++)a[n*3]=e[n*3]*s,a[n*3+1]=e[n*3+2]*s,a[n*3+2]=-e[n*3+1]*s,o[n*3]=t[n*3]/127,o[n*3+1]=t[n*3+2]/127,o[n*3+2]=-t[n*3+1]/127;let c=new On;c.setAttribute(`position`,new pn(a,3)),c.setAttribute(`normal`,new pn(o,3)),c.setAttribute(`color`,new pn(n,3,!0)),c.setIndex(new pn(r,1));let l=new Qn(c,new Gr({vertexColors:!0,roughness:.92,metalness:0}));return l.position.copy($s),{mesh:l,pos:a,nor:o,idx:r,heightAt:rc(a,r)}}function nc(e,t,n,r,i=Math.random){let a=n.length/3,o=new Float32Array(a),s=new U,c=new U,l=new U,u=0;for(let t=0;t<a;t++)s.fromArray(e,n[t*3]*3),c.fromArray(e,n[t*3+1]*3),l.fromArray(e,n[t*3+2]*3),u+=c.sub(s).cross(l.sub(s)).length()*.5,o[t]=u;let d=[];for(let s=0;s<r;s++){let r=i()*u,s=0,c=a-1;for(;s<c;){let e=s+c>>1;o[e]<r?s=e+1:c=e}let l=i(),f=i();l+f>1&&(l=1-l,f=1-f);let p=1-l-f,m=n[s*3]*3,h=n[s*3+1]*3,g=n[s*3+2]*3,_=e[m]*p+e[h]*l+e[g]*f,v=e[m+1]*p+e[h+1]*l+e[g+1]*f,y=e[m+2]*p+e[h+2]*l+e[g+2]*f,b=t[m+1]*p+t[h+1]*l+t[g+1]*f;d.push(_+$s.x,v+$s.y,y+$s.z,b)}return d}function rc(e,t){let n=1e9,r=-1e9,a=1e9,o=-1e9;for(let t=0;t<e.length;t+=3)n=Math.min(n,e[t]),r=Math.max(r,e[t]),a=Math.min(a,e[t+2]),o=Math.max(o,e[t+2]);n+=$s.x-3,r+=$s.x+3,a+=$s.z-3,o+=$s.z+3;let s=Math.max(32,Math.round(256*(o-a)/(r-n))),c=new Float32Array(256*s).fill(-1),l=(e,t)=>{let i=Math.floor((e-n)/(r-n)*256),c=Math.floor((t-a)/(o-a)*s);return i>=0&&c>=0&&i<256&&c<s?c*256+i:-1},u=nc(e,new Float32Array(e.length).fill(1),t,16e4);for(let e=0;e<u.length;e+=4){let t=l(u[e],u[e+2]);t>=0&&(c[t]=Math.max(c[t],u[e+1]))}let d=new Float32Array(256*s);for(let e=0;e<d.length;e++)d[e]=c[e]===-1?0:Math.min(1,Math.max(0,(c[e]+.9)/.9));for(let e=0;e<4;e++){let e=new Float32Array(d.length);for(let t=0;t<s;t++)for(let n=0;n<256;n++){let r=0,i=0;for(let e=-2;e<=2;e++)for(let a=-2;a<=2;a++){let o=n+a,c=t+e;o>=0&&c>=0&&o<256&&c<s&&(r+=d[c*256+o],i++)}e[t*256+n]=r/i}d=e}let f=new tr(Uint8Array.from(d,e=>Math.round(e*255)),256,s,_);f.minFilter=f.magFilter=i,f.needsUpdate=!0;let p=(e,t)=>{let n=l(e,t);return n>=0?c[n]:-1};return p.landTex=f,p.bounds=new Je(n,a,r-n,o-a),p}const ic=`
uniform sampler2D uSky;uniform vec3 uSkyTint;
vec3 skyColor(vec3 d){
  float u=atan(d.x,-d.z)/6.2831853+.5;
  float el=asin(clamp(d.y,-1.,1.));
  float v=el>0. ? .4+.6*el/1.5707963 : .4+.4*el/1.5707963;
  return texture2D(uSky,vec2(u,clamp(v,.005,.995))).rgb*uSkyTint;
}`;function ac(e){let t=new Ur({uniforms:{uSky:{value:e},uSkyTint:{value:new U(1,1,1)}},side:1,depthWrite:!1,vertexShader:`varying vec3 vDir;void main(){vDir=normalize(position);vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=p.xyww;}`,fragmentShader:ic+`varying vec3 vDir;void main(){gl_FragColor=vec4(skyColor(normalize(vDir)),1.);
#include <colorspace_fragment>
}`}),n=new Qn(new Pr(400,48,24),t);return n.renderOrder=-1,n.frustumCulled=!1,n}const oc=new V(1,1.5);function sc(e,t,n,r){let a=e.capabilities.isWebGL2&&(e.extensions.has(`EXT_color_buffer_float`)||e.extensions.has(`EXT_color_buffer_half_float`)),o={type:u,format:m,minFilter:i,magFilter:i,depthBuffer:!1},s=new Xe(512,512,o),c=new Xe(512,512,o),l=Array.from({length:8},()=>new Je),d=[],f=new Ur({uniforms:{uPrev:{value:null},uTexel:{value:1/512},uDrops:{value:l},uCount:{value:0},uDamp:{value:.993}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`,fragmentShader:`
      uniform sampler2D uPrev;uniform float uTexel;uniform vec4 uDrops[8];uniform int uCount;uniform float uDamp;varying vec2 vUv;
      void main(){
        vec4 c=texture2D(uPrev,vUv);
        float s=texture2D(uPrev,vUv+vec2(uTexel,0.)).r+texture2D(uPrev,vUv-vec2(uTexel,0.)).r
               +texture2D(uPrev,vUv+vec2(0.,uTexel)).r+texture2D(uPrev,vUv-vec2(0.,uTexel)).r;
        float h=(s*.5-c.g)*uDamp;
        for(int i=0;i<8;i++){ if(i>=uCount) break; vec4 d=uDrops[i]; float r=length(vUv-d.xy)/d.z; if(r<1.) h+=d.w*(cos(r*3.14159)+1.)*.5; }
        float e=smoothstep(0.,.05,min(min(vUv.x,vUv.y),min(1.-vUv.x,1.-vUv.y)));
        gl_FragColor=vec4(clamp(h*e,-2.,2.),c.r*e,0.,1.);
      }`}),p=new Nt,h=new Fi(-1,1,1,-1,0,1);if(p.add(new Qn(new Nr(2,2),f)),a)for(let t of[s,c])e.setRenderTarget(t),e.setClearColor(0,0),e.clear();e.setRenderTarget(null);let g={uHeight:{value:s.texture},uSky:{value:t},uSkyTint:{value:new U(1,1,1)},uSun:{value:n},uTime:{value:0},uSimCenter:{value:oc},uSimSize:{value:46},uSimOn:{value:+!!a},uLand:{value:r.landTex},uLandB:{value:r.bounds}},_=new Ur({uniforms:g,vertexShader:`varying vec3 vWorld;void main(){vec4 w=modelMatrix*vec4(position,1.);vWorld=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,fragmentShader:ic+`
      uniform sampler2D uHeight;uniform vec3 uSun;uniform float uTime,uSimSize,uSimOn;uniform vec2 uSimCenter;uniform sampler2D uLand;uniform vec4 uLandB;varying vec3 vWorld;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec3 n=vec3(0.,1.,0.);
        vec2 suv=(vWorld.xz-uSimCenter)/uSimSize+.5;
        if(uSimOn>.5&&suv.x>0.&&suv.y>0.&&suv.x<1.&&suv.y<1.){
          float t=1./512.;
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
      }`}),v=new Qn(new Nr(400,400),_);v.rotation.x=-Math.PI/2;let y=[[-3.2,6.5],[-.6,4.2],[2.2,6.8],[-5.4,2.4],[.8,1.2],[-2.6,-1.4],[3.4,2.6]],b=new ur(new kr(.62,28,.35,Math.PI*2-.7).rotateX(-Math.PI/2),new Ur({uniforms:{uHeight:g.uHeight,uSimCenter:g.uSimCenter,uSimSize:g.uSimSize,uSimOn:g.uSimOn,uTime:g.uTime,uSun:g.uSun},vertexShader:`
      uniform sampler2D uHeight;uniform vec2 uSimCenter;uniform float uSimSize,uSimOn,uTime;varying vec2 vLocal;varying float vLit;
      void main(){
        vec3 c=(instanceMatrix*vec4(0.,0.,0.,1.)).xyz;
        vec2 suv=(c.xz-uSimCenter)/uSimSize+.5;float t=2./512.;
        float h=0.,gx=0.,gz=0.;
        if(uSimOn>.5){h=texture2D(uHeight,suv).r;gx=texture2D(uHeight,suv+vec2(t,0.)).r-texture2D(uHeight,suv-vec2(t,0.)).r;gz=texture2D(uHeight,suv+vec2(0.,t)).r-texture2D(uHeight,suv-vec2(0.,t)).r;}
        vec3 w=(instanceMatrix*vec4(position,1.)).xyz;vec3 o=w-c;
        w.y=.02+h*.12+sin(uTime*1.3+c.x)*.015+(o.x*gx+o.z*gz)*.9;
        vLocal=position.xz;vLit=.75+clamp((gx+gz)*4.,-.25,.25);
        gl_Position=projectionMatrix*viewMatrix*vec4(w,1.);
      }`,fragmentShader:`
      varying vec2 vLocal;varying float vLit;
      void main(){
        float r=length(vLocal)/.62;float a=atan(vLocal.y,vLocal.x);
        float vein=smoothstep(.06,0.,abs(sin(a*7.))*r)*.18;
        vec3 col=mix(vec3(.16,.42,.2),vec3(.42,.66,.3),.55+.45*sin(r*3.))*vLit+vein;
        col=mix(col,vec3(.1,.26,.14),smoothstep(.86,1.,r));
        gl_FragColor=vec4(col,1.);
        #include <colorspace_fragment>
      }`}),y.length),x=new Y,S=new H,C=new U(0,1,0),w=y.map(([e,t],n)=>{let r=.8+n*37%10/22;return x.compose(new U(e,0,t),S.setFromAxisAngle(C,n*1.7),new U(r,1,r)),b.setMatrixAt(n,x),new U(e,0,t)});b.frustumCulled=!1;let T=(e,t)=>[(e-oc.x)/46+.5,(t-oc.y)/46+.5];return{mesh:v,pads:b,padPos:w,ok:a,uniforms:g,dispose(){s.dispose(),c.dispose(),p.children[0].geometry.dispose(),f.dispose()},drop(e,t,n=.3,r=.4){if(!a)return;let[i,o]=T(e,t);i<0||o<0||i>1||o>1||(d.length>=8&&d.shift(),d.push([i,o,n/46,r]))},step(){a&&(f.uniforms.uCount.value=d.length,d.forEach((e,t)=>l[t].set(...e)),d.length=0,f.uniforms.uPrev.value=s.texture,e.setRenderTarget(c),e.render(p,h),e.setRenderTarget(null),[s,c]=[c,s],g.uHeight.value=s.texture)}}}function cc(e,t){let n=[],r=[];for(let e=0;e<=4;e++){let t=e/4,i=(1-t)**.85*.5;if(n.push(-i,t,0,i,t,0),e<4){let t=e*2;r.push(t,t+1,t+2,t+1,t+3,t+2)}}let i=new Ri;i.setAttribute(`position`,new gn(n,3)),i.setIndex(r);let a=uc(20261104),o=nc(e.pos,e.nor,e.idx,t*3,a),s=[],c=[];for(let e=0;e<o.length&&s.length<t*3;e+=4){let t=o[e+1];o[e+3]<.72||t<.32||(s.push(o[e],t-.03,o[e+2]),c.push(a()*Math.PI,.28+a()*.42+Math.min(.25,(t-.3)*.06),.035+a()*.035,a()))}i.setAttribute(`aOffset`,new nr(new Float32Array(s),3)),i.setAttribute(`aParams`,new nr(new Float32Array(c),4)),i.instanceCount=s.length/3;let l={uTime:{value:0},uPointer:{value:new U(1e4,0,1e4)},uPush:{value:0},uWind:{value:1}},u=new Qn(i,new Ur({uniforms:l,side:2,vertexShader:`
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
      }`,fragmentShader:`
      varying float vT,vShade;
      void main(){
        vec3 col=mix(vec3(.05,.16,.06),vec3(.45,.62,.2),vT)*(.8+.4*vShade);
        col+=vec3(1.,.55,.22)*pow(vT,3.)*.35;
        gl_FragColor=vec4(col,1.);
        #include <colorspace_fragment>
      }`}));return u.frustumCulled=!1,{mesh:u,uniforms:l,count:i.instanceCount}}function lc(e,t=240){let n=uc(7),r=new Float32Array(t*3),i=new Float32Array(t);for(let a=0;a<t;a++){let t=n()*Math.PI*2,o=2+n()*13;r.set([e.x+Math.cos(t)*o-3,.3+n()*2.6,e.z+Math.sin(t)*o*.8+3],a*3),i[a]=n()}let a=new On;a.setAttribute(`position`,new pn(r,3)),a.setAttribute(`aSeed`,new pn(i,1));let o={uTime:{value:0},uScale:{value:1}},s=new Sr(a,new Ur({uniforms:o,transparent:!0,depthWrite:!1,blending:2,vertexShader:`
      attribute float aSeed;uniform float uTime,uScale;varying float vGlow;
      void main(){
        float s=aSeed*6.2831;
        vec3 p=position+vec3(sin(uTime*.31+s)*1.2,sin(uTime*.53+s*2.)*.35,cos(uTime*.27+s*1.3)*1.1);
        vGlow=pow(max(0.,sin(uTime*(.9+aSeed)+s*3.)),3.);
        vec4 mv=viewMatrix*vec4(p,1.);
        gl_PointSize=uScale*(10.+vGlow*22.)/max(-mv.z,1.)*6.;
        gl_Position=projectionMatrix*mv;
      }`,fragmentShader:`
      varying float vGlow;
      void main(){
        float d=length(gl_PointCoord-.5);
        float a=pow(smoothstep(.5,0.,d),2.)*(.15+vGlow);
        gl_FragColor=vec4(vec3(1.,.86,.42)*a,a);
      }`}));return s.frustumCulled=!1,{mesh:s,uniforms:o}}function uc(e){return()=>{e|=0,e=e+1831565813|0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}const dc=`
  attribute vec3 aOffset;attribute vec4 aParams;uniform float uTime,uPush;uniform vec3 uPointer;
  vec2 bendAt(float t){
    float g=sin(uTime*.85+aOffset.x*.35+aParams.w*3.)*.5+.5;
    vec2 b=vec2(.32*g+.07*sin(uTime*2.6+aParams.w*9.),.1*sin(uTime*.7+aOffset.z*.5));
    vec2 dp=aOffset.xz-uPointer.xz;float pd=length(dp);
    b+=dp/(pd+1e-3)*uPush*smoothstep(2.2,.2,pd)*1.3;
    return b*t*t*aParams.y;
  }`;function fc(e,t){let n=uc(4242),r=e.bounds,i=[];for(let t=0;t<2e4;t++){let t=r.x+n()*r.z,a=r.y+n()*r.w,o=e(t,a);o>-.45&&o<-.08&&i.push([t,a])}let a=e=>i.reduce((t,n)=>e(n)<e(t)?n:t,i[0]),o=i.length?[[a(([e,t])=>e-t*.6),70],[a(([e,t])=>Math.abs(e-($s.x+9))-t*.4),40],[a(([e,t])=>Math.abs(e-($s.x+17))-t*.3),34],[a(([e,t])=>Math.abs(e-($s.x-3))+Math.abs(t-($s.z-8))),24]]:[],s=[],c=[],l=[],u=[];for(let[[e,t],r]of o)for(let i=0;i<r;i++){let r=Math.sqrt(n())*.85,i=n()*Math.PI*2,a=e+Math.cos(i)*r,o=t+Math.sin(i)*r*.7,d=[n()*Math.PI,1.2+n()*1.1*(1-r*.4),.035+n()*.03,n()];s.push(a,-.25,o),c.push(...d),n()<.3&&(l.push(a,-.25,o),u.push(...d))}let d=[],f=[];for(let e=0;e<=6;e++){let t=e/6,n=(1-t)**.7*.5;if(d.push(-n,t,0,n,t,0),e<6){let t=e*2;f.push(t,t+1,t+2,t+1,t+3,t+2)}}let p=new Ri;p.setAttribute(`position`,new gn(d,3)),p.setIndex(f),p.setAttribute(`aOffset`,new nr(new Float32Array(s),3)),p.setAttribute(`aParams`,new nr(new Float32Array(c),4)),p.instanceCount=s.length/3;let m=new Qn(p,new Ur({uniforms:t,side:2,vertexShader:dc+`
      varying float vT,vS;
      void main(){
        float t=position.y,h=aParams.y;vec2 dir=vec2(cos(aParams.x),sin(aParams.x));
        vec3 p=vec3(position.x*aParams.z*dir.x,t*h,position.x*aParams.z*dir.y);
        vec2 b=bendAt(t);p.xz+=b;p.y*=1.-.12*min(length(b),1.);
        vT=t;vS=aParams.w;
        gl_Position=projectionMatrix*viewMatrix*vec4(aOffset+p,1.);
      }`,fragmentShader:`
      varying float vT,vS;
      void main(){
        vec3 c=mix(vec3(.08,.14,.06),vec3(.5,.52,.25),smoothstep(.1,1.,vT))*(.8+.35*vS);
        c+=vec3(1.,.55,.25)*pow(vT,4.)*.4;
        gl_FragColor=vec4(c,1.);
        #include <colorspace_fragment>
      }`})),h=new Ri().copy(new Ar(.04,.045,.28,7));h.setAttribute(`aOffset`,new nr(new Float32Array(l),3)),h.setAttribute(`aParams`,new nr(new Float32Array(u),4)),h.instanceCount=l.length/3;let g=new Qn(h,new Ur({uniforms:t,vertexShader:dc+`
      varying float vL;
      void main(){
        float t=.84;vec3 c=aOffset+vec3(bendAt(t),t*aParams.y).xzy;
        c.y=aOffset.y+t*aParams.y;
        vL=.6+.4*normal.x;
        gl_Position=projectionMatrix*viewMatrix*vec4(c+position,1.);
      }`,fragmentShader:`
      varying float vL;
      void main(){ vec3 c=vec3(.33,.19,.09)*vL+vec3(.25,.12,.04)*max(0.,vL-.8);gl_FragColor=vec4(c,1.);
      #include <colorspace_fragment>
      }`})),_=new Tt;return _.add(m,g),m.frustumCulled=g.frustumCulled=!1,{group:_,count:p.instanceCount,bundles:o.map(([e])=>new U(e[0],0,e[1]))}}const pc=9.81;function mc(e,t,n,r,i=setTimeout){let a=new Mr(.13,1).scale(1.35,.42,1),o=new Gr({color:9277318,roughness:.6}),s=[],c=/* @__PURE__ */ new Float32Array(1080),l=/* @__PURE__ */ new Float32Array(1080),u=/* @__PURE__ */ new Float32Array(360),d=new On;d.setAttribute(`position`,new pn(c,3)),d.setAttribute(`aLife`,new pn(u,1));let f=new Sr(d,new Ur({transparent:!0,depthWrite:!1,blending:2,vertexShader:`attribute float aLife;varying float vL;void main(){vL=aLife;vec4 mv=modelViewMatrix*vec4(position,1.);gl_PointSize=(aLife>0.?60.:0.)/max(-mv.z,1.);gl_Position=projectionMatrix*mv;}`,fragmentShader:`varying float vL;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.1,d)*clamp(vL,0.,1.)*.9;gl_FragColor=vec4(vec3(.85,.95,1.)*a,a);}`}));f.frustumCulled=!1,e.add(f);let p=0;function m(e,t,n,r){for(let i=0;i<n;i++){let n=p++%360,i=Math.random()*Math.PI*2,a=(.6+Math.random())*r;c.set([e,.02,t],n*3),l.set([Math.cos(i)*a*.6,1.4*r+Math.random()*2*r,Math.sin(i)*a*.6],n*3),u[n]=1}}function h(t,n){let i=s.find(e=>!e.active);return i||(i={mesh:new Qn(a,o)},e.add(i.mesh),s.push(i)),Object.assign(i,{active:!0,sinking:0,skips:0,p:t.clone(),v:n.clone(),spin:18+Math.random()*10}),i.mesh.visible=!0,i.mesh.position.copy(t),r.onThrow?.(),i}function g(e){for(let a of s){if(!a.active)continue;if(a.sinking>0){a.sinking-=e,a.p.y-=e*.35,a.mesh.position.copy(a.p),a.sinking<=0&&(a.active=!1,a.mesh.visible=!1);continue}a.v.y-=pc*e,a.p.addScaledVector(a.v,e),a.mesh.rotation.y+=a.spin*e,a.mesh.rotation.z=Math.sin(a.mesh.rotation.y)*.08;let o=n(a.p.x,a.p.z);if(o>0&&a.p.y<o+.04)a.p.y=o+.04,a.active=!1,a.mesh.position.copy(a.p),i(()=>{a.mesh.visible=!1},2500),r.onEnd?.(a.skips,`shore`,a.p.clone());else{if(a.p.y<=0&&a.v.y<0){let e=Math.hypot(a.v.x,a.v.z),n=-a.v.y/Math.max(e,.001);if(e>2.6&&n<.8){a.skips++,a.p.y=.001,a.v.y=Math.max(-a.v.y*.5,e*.07);let n=.8+.11*Pe.clamp((e-6)/14,0,1);a.v.x*=n,a.v.z*=n,t.drop(a.p.x,a.p.z,.32,.55),m(a.p.x,a.p.z,14,1),r.onSkip?.(a.skips,a.p.clone())}else t.drop(a.p.x,a.p.z,.5,1.1),m(a.p.x,a.p.z,34,1.5),a.sinking=1.2,r.onEnd?.(a.skips,`sink`,a.p.clone())}a.mesh.position.copy(a.p)}}for(let t=0;t<360;t++)u[t]<=0||(u[t]-=e*1.3,l[t*3+1]-=pc*e,c[t*3]+=l[t*3]*e,c[t*3+1]=Math.max(0,c[t*3+1]+l[t*3+1]*e),c[t*3+2]+=l[t*3+2]*e,c[t*3+1]<=0&&l[t*3+1]<0&&(u[t]=0));d.attributes.position.needsUpdate=!0,d.attributes.aLife.needsUpdate=!0}return{throwStone:h,update:g,busy:()=>s.some(e=>e.active&&!e.sinking)}}function hc(e,t){let n=new Nt,r=new Fi(0,1,0,-1,-1,1),i=6e3,a=new Float32Array(i*3),o=new Float32Array(i*3),s=new Float32Array(i),c=new Float32Array(i*2),l=new Float32Array(i*2),u=new Float32Array(i),d=new Float32Array(i),f=new On;f.setAttribute(`position`,new pn(a,3)),f.setAttribute(`color`,new pn(o,3)),f.setAttribute(`aSeed`,new pn(s,1));let p={uSize:{value:6},uOpacity:{value:1},uTime:{value:0}},m=new Sr(f,new Ur({uniforms:p,transparent:!0,depthTest:!1,depthWrite:!1,vertexColors:!0,blending:5,blendSrc:201,blendDst:205,vertexShader:`
      attribute float aSeed;uniform float uSize,uTime;varying vec3 vC;varying float vGlow;
      void main(){
        float s=aSeed*6.2831;
        vGlow=.55+.45*pow(max(0.,sin(uTime*(.7+aSeed*1.3)+s*3.)),2.);
        vC=color;
        gl_PointSize=uSize*(.75+.5*vGlow);
        gl_Position=projectionMatrix*modelViewMatrix*vec4(position.xy,0.,1.);
      }`,fragmentShader:`
      uniform float uOpacity;varying vec3 vC;varying float vGlow;
      void main(){
        float d=length(gl_PointCoord-.5)*2.;
        float core=smoothstep(.45,0.,d),halo=pow(max(0.,1.-d),2.2);
        float a=(core*.85+halo*.5*vGlow)*uOpacity;
        gl_FragColor=vec4(vC*(core*1.2+halo*vGlow)*uOpacity,a*.55);
      }`}));m.frustumCulled=!1,n.add(m);let h=0,g=1,_=1,v=0,y=0,b={x:-1e4,y:-1e4,power:0};function x(n,m,v){g=innerWidth,_=innerHeight,r.right=g,r.bottom=-_,r.updateProjectionMatrix();let y=Math.round(Math.min(n.width/8.2,96)),b=y*1.1,x=document.createElement(`canvas`),S=Math.ceil(n.width),C=Math.ceil(b*e.length+y*.4);x.width=S,x.height=C;let w=x.getContext(`2d`,{willReadFrequently:!0});w.font=`750 ${y}px ui-rounded,"Trebuchet MS","Segoe UI",system-ui,sans-serif`,w.textBaseline=`top`,w.fillStyle=`#fff`,e.forEach((e,t)=>w.fillText(e,0,t*b));let T=w.getImageData(0,0,S,C).data,E=Math.max(3,Math.round(y/17)),D=()=>{let e=[];for(let t=0;t<C;t+=E)for(let n=0;n<S;n+=E){let r=Math.min(S-1,Math.max(0,Math.round(n+(Math.random()-.5)*E))),i=Math.min(C-1,Math.max(0,Math.round(t+(Math.random()-.5)*E)));T[(i*S+r)*4+3]>150&&e.push(r,i)}return e},O=D();for(;O.length/2>i;)E++,O=D();h=O.length/2;for(let r=0;r<h;r++){let i=n.left+O[r*2],f=n.top+O[r*2+1];c[r*2]=i,c[r*2+1]=f,s[r]=Math.random(),v?(a[r*3]=Math.random()*g,a[r*3+1]=-(_*.3+Math.random()*_*.7),u[r]=.3+Math.random()*3.2,d[r]=0):(a[r*3]=i,a[r*3+1]=-(f-scrollY),u[r]=0,d[r]=1),l[r*2]=l[r*2+1]=0,o.set(t[Math.min(e.length-1,Math.floor(O[r*2+1]/b))],r*3)}f.setDrawRange(0,h),p.uSize.value=E*2.3*m;for(let e of[`position`,`color`,`aSeed`])f.attributes[e].needsUpdate=!0}function S(e,t){v+=e;let n=Math.min(2,e*60);for(y+=e*h*.004;y>1;){y--;let e=Math.random()*h|0;u[e]<=0&&(u[e]=3+Math.random()*6,d[e]=0)}for(let r=0;r<h;r++){let i=r*3,o=r*2,f=s[r]*6.2831,p=a[i],m=a[i+1],h=l[o],g=l[o+1];if(b.power>.05){let e=p-b.x,t=m+b.y,n=e*e+t*t;if(n<14400){let i=Math.sqrt(n)+.01,a=(1-i/120)*.9*b.power;h+=e/i*a,g+=t/i*a+.15*b.power,u[r]<=0&&(d[r]=0),u[r]=Math.max(u[r],6+s[r]*16)}}if(u[r]>0){u[r]-=e,h+=(Math.sin(m*.011+v*.45+f)+.6*Math.sin(v*.9+f*2))*.035*n,g+=(Math.cos(p*.009-v*.38+f*1.7)*.035+.004)*n,h*=.975,g*=.975;let t=Math.hypot(h,g);t>1.4&&(h*=1.4/t,g*=1.4/t)}else{d[r]=Math.min(1,d[r]+e*.35);let i=.0015+.03*d[r]*d[r],a=c[o]+Math.sin(v*1.1+f)*1.4,s=-(c[o+1]-t)+Math.cos(v*.9+f*1.3)*1.4;h+=(a-p)*i*n,g+=(s-m)*i*n;let l=.9-.04*(1-d[r]);h*=l,g*=l}a[i]=p+h*n,a[i+1]=m+g*n,l[o]=h,l[o+1]=g}f.attributes.position.needsUpdate=!0}return{scene:n,cam:r,layout:x,update:S,pointer:b,uniforms:p,get count(){return h}}}function gc(e){let t=e.length,n=e.map(e=>e.slice());for(let e=0;e<30;e++){let e=0;for(let r=0;r<t;r++)for(let i=r+1;i<t;i++)e+=n[r][i]**2;if(e<1e-12)break;for(let e=0;e<t;e++)for(let r=e+1;r<t;r++){if(Math.abs(n[e][r])<1e-15)continue;let i=(n[r][r]-n[e][e])/(2*n[e][r]),a=Math.sign(i||1)/(Math.abs(i)+Math.sqrt(i*i+1)),o=1/Math.sqrt(a*a+1),s=a*o;for(let i=0;i<t;i++){let t=n[i][e],a=n[i][r];n[i][e]=o*t-s*a,n[i][r]=s*t+o*a}for(let i=0;i<t;i++){let t=n[e][i],a=n[r][i];n[e][i]=o*t-s*a,n[r][i]=s*t+o*a}}}return n.map((e,t)=>e[t]).sort((e,t)=>e-t)}function _c(e,t){let n=e.length/t,r=Array(t).fill(0),i=Array.from({length:t},()=>Array(t).fill(0));for(let i=0;i<n;i++)for(let a=0;a<t;a++)r[a]+=e[i*t+a]/n;for(let a=0;a<n;a++)for(let o=0;o<t;o++)for(let s=0;s<t;s++)i[o][s]+=(e[a*t+o]-r[o])*(e[a*t+s]-r[s])/n;return i}async function vc(e,t){if(!navigator.gpu)return null;let n=await navigator.gpu.requestAdapter({powerPreference:`high-performance`});if(!n)return null;let r=await n.requestDevice();try{let n=document.createElement(`canvas`);n.className=`saaristo-gpu`,n.setAttribute(`aria-hidden`,`true`);let i=n.getContext(`webgpu`);if(!i)return r.destroy(),null;let a=navigator.gpu.getPreferredCanvasFormat();i.configure({device:r,format:a,alphaMode:`premultiplied`});let o=new Float32Array(e*8);for(let n=0;n<e;n++){let e=Math.random()*Math.PI*2,r=Math.sqrt(Math.random())*10;o.set([t.x+Math.cos(e)*r,.5+Math.random()*4,t.z+Math.sin(e)*r*.6,Math.random(),0,0,0,0],n*8)}let s=r.createBuffer({size:o.byteLength,usage:GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_DST|GPUBufferUsage.COPY_SRC});r.queue.writeBuffer(s,0,o);let c=/* @__PURE__ */ new Float32Array(56),l=r.createBuffer({size:c.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),u=r.createComputePipeline({layout:`auto`,compute:{module:r.createShaderModule({code:`
struct P { pos: vec4f, vel: vec4f };
struct U { viewProj: mat4x4f, right: vec4f, up: vec4f, attr: vec4f, pulse: vec4f, home: vec4f,
           gust: vec4f, gustDir: vec4f, tp: vec4f, ex: vec4f };
@group(0) @binding(0) var<uniform> u: U;
fn pointerRepulsion(position: vec3f, pointer: vec3f, power: f32) -> vec3f {
  let away = position - pointer;
  let distance = length(away);
  if (distance <= 0.0001 || distance >= 3.5) { return vec3f(0.0); }
  return away / distance * (clamp(power, 0.0, 1.0) * 10.0 * (1.0 - smoothstep(0.0, 3.5, distance)));
}
@group(0) @binding(1) var<storage, read_write> ps: array<P>;
fn h3(p: f32) -> vec3f { return fract(sin(vec3f(p * 127.1, p * 311.7, p * 74.7)) * 43758.5453); }
fn sph(h: vec2f) -> vec3f {
  let z = h.x * 2.0 - 1.0; let a = h.y * 6.2831853; let r = sqrt(max(0.0, 1.0 - z * z));
  return vec3f(r * cos(a), z, r * sin(a));
}
// Curl of the potential (sin(f y + g z + t1), sin(f z + g x + t2), sin(f x + g y + t3)), two octaves.
fn curlOct(p: vec3f, t: f32, f: f32, g: f32) -> vec3f {
  let cx = cos(p.y * f + p.z * g + t * 0.31);
  let cy = cos(p.z * f + p.x * g - t * 0.27);
  let cz = cos(p.x * f + p.y * g + t * 0.23);
  return vec3f(g * cz - f * cy, g * cx - f * cz, g * cy - f * cx);
}
fn curl(p: vec3f, t: f32) -> vec3f {
  let q = vec3f(p.z * 0.8 + p.x * 0.6, p.y, p.x * 0.8 - p.z * 0.6);
  return curlOct(p, t, 1.0, 0.55) + curlOct(q * 2.1, t * 1.7, 1.0, 0.7) * 0.45;
}
@compute @workgroup_size(256) fn sim(@builtin(global_invocation_id) id: vec3u) {
  let i = id.x;
  if (i >= u32(u.tp.w)) { return; }
  let t = u.tp.x; let dt = u.tp.y;
  let p = ps[i];
  var x = p.pos.xyz; var v = p.vel.xyz; let ph = p.pos.w;
  let h = h3(ph); let g = h3(ph + 0.371);
  let k = floor(g.x * 5.0);
  let hold = 1.0 - u.ex.x * 0.92;

  // Sub-swarm leader: wanders around the shared centre; the wander shrinks now and then, so the
  // five sub-swarms drift apart and merge again, independently of the pointer.
  let split = 0.25 + 0.75 * (0.5 + 0.5 * sin(t * 0.045 + k * 1.9));
  let wander = vec3f(sin(t * (0.13 + k * 0.031) + k * 2.1) * 5.0,
                     sin(t * (0.29 + k * 0.05) + k) * 1.1,
                     cos(t * (0.11 + k * 0.027) + k * 3.7) * 3.6);
  let lead = u.home.xyz + wander * split;

  // Own anchor on a slowly turning ellipsoid shell around the leader: a cloud, not a point.
  let turn = vec2f(h.x, fract(h.y + t * 0.012 * (g.y - 0.5)));
  let rad = mix(0.45, 4.2, h.z * h.z);
  let anchor = lead + sph(turn) * rad * vec3f(1.0, 0.8, 0.85);
  let toA = anchor - x; let dA = length(toA);
  let pull = 0.405 * hold;
  var a = toA * (1.5 / (1.0 + dA * 0.35)) * pull;

  // Swirl around the leader on a tilted axis of its own; about a third circle the other way.
  let axis = normalize(sph(g.yz) + vec3f(0.0, 0.5, 0.0));
  let rel = x - lead; let rl = length(rel) + 0.3;
  let swirl = select(1.0, -1.0, g.z < 0.3) * mix(0.35, 1.0, h.x);
  a += cross(axis, rel / rl) * swirl * 2.4 * pull / (1.0 + rl * 0.25);
  // Home anchors are unchanged by the pointer; the force is local and bounded.
  a += pointerRepulsion(x, u.attr.xyz, u.attr.w);
  a += curl(x * 0.33 + vec3f(ph * 3.0), t) * mix(0.7, 1.5, g.x);

  // Stone splash: a burst outward.
  let pd = x - u.pulse.xyz; let pl = length(pd) + 0.1;
  a += pd / pl * u.pulse.w * 30.0 * exp(-pl * 0.45);
  // Swipe gust: a push along the swipe plus each firefly's own sideways scatter.
  let gd = x - u.gust.xyz; let gr = u.gustDir.w;
  let gf = u.gust.w * exp(-dot(gd, gd) / (gr * gr));
  a += (u.gustDir.xyz * 24.0 + sph(vec2f(h.y, g.z)) * 16.0) * gf;

  a.y += max(0.0, 0.3 - x.y) * 10.0;
  let hd = (x - u.home.xyz) / vec3f(1.0, 0.5, 0.6);
  let hr = length(hd);
  a -= normalize(hd + vec3f(1e-4)) * max(0.0, hr - u.home.w) * 0.9;

  v = (v + a * dt) * (1.0 - mix(0.75, 1.35, h.y) * dt);
  let vmax = mix(3.0, 7.0, g.y) + u.ex.x * 8.0;
  let sp = length(v);
  if (sp > vmax) { v = v / sp * vmax; }
  x += v * dt;
  ps[i].pos = vec4f(x, ph);
  ps[i].vel = vec4f(v, p.vel.w);
}`}),entryPoint:`sim`}}),d={srcFactor:`one`,dstFactor:`one`,operation:`add`},f=r.createShaderModule({code:`
struct P { pos: vec4f, vel: vec4f };
struct U { viewProj: mat4x4f, right: vec4f, up: vec4f, attr: vec4f, pulse: vec4f, home: vec4f,
           gust: vec4f, gustDir: vec4f, tp: vec4f, ex: vec4f };
@group(0) @binding(0) var<uniform> u: U;
@group(0) @binding(1) var<storage, read> ps: array<P>;
struct VO { @builtin(position) pos: vec4f, @location(0) uv: vec2f, @location(1) glow: f32, @location(2) tint: f32 };
@vertex fn vs(@builtin(vertex_index) vi: u32, @builtin(instance_index) ii: u32) -> VO {
  var corners = array<vec2f, 6>(vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(-1.0, 1.0), vec2f(-1.0, 1.0), vec2f(1.0, -1.0), vec2f(1.0, 1.0));
  let c = corners[vi]; let p = ps[ii]; let ph = p.pos.w;
  let blink = pow(max(0.0, sin(u.tp.x * (0.7 + fract(ph * 7.31) * 1.7) + ph * 6.2831)), 4.0);
  let s = u.tp.z * (0.35 + blink * 0.9);
  let wp = p.pos.xyz + (u.right.xyz * c.x + u.up.xyz * c.y) * s;
  var o: VO;
  o.pos = u.viewProj * vec4f(wp, 1.0);
  o.uv = c; o.glow = (0.06 + blink) * 1.5 / sqrt(u.tp.w / 1024.0); o.tint = fract(ph * 3.17);
  return o;
}
@fragment fn fs(i: VO) -> @location(0) vec4f {
  let d = length(i.uv);
  if (d > 1.0) { discard; }
  let a = pow(1.0 - d, 2.4) * i.glow;
  let col = mix(vec3f(1.0, 0.8, 0.36), vec3f(0.7, 1.0, 0.55), i.tint * 0.6);
  return vec4f(col * a, a * 0.35);
}`}),p=r.createRenderPipeline({layout:`auto`,vertex:{module:f,entryPoint:`vs`},fragment:{module:f,entryPoint:`fs`,targets:[{format:a,blend:{color:d,alpha:d}}]},primitive:{topology:`triangle-list`}}),m=e=>r.createBindGroup({layout:e.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:l}},{binding:1,resource:{buffer:s}}]}),h=m(u),g=m(p),_=new Y().set(1,0,0,0,0,1,0,0,0,0,.5,.5,0,0,0,1),v=new Y,y=new U,b=new Y,x=!1;r.lost.then(()=>{x=!0,n.remove()});let S={pos:[0,-50,0,0],dir:[0,0,0,1],scatter:0};return{canvas:n,count:e,dispose(){x||(x=!0,i.unconfigure(),s.destroy(),l.destroy(),r.destroy(),n.remove())},get lost(){return x},resize(e,t){n.width=e,n.height=t},frame(n,a,o,s,d,f=S){if(x)return;b.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),v.multiplyMatrices(_,b),c.set(v.elements,0),y.setFromMatrixColumn(n.matrixWorld,0),c.set([y.x,y.y,y.z,0],16),y.setFromMatrixColumn(n.matrixWorld,1),c.set([y.x,y.y,y.z,0],20),c.set(s,24),c.set(d,28),c.set([t.x,t.y,t.z,12],32),c.set(f.pos,36),c.set(f.dir,40),c.set([a,Math.min(o,1/30),.075,e],44),c.set([f.scatter,0,0,0],48),r.queue.writeBuffer(l,0,c);let m=r.createCommandEncoder(),C=m.beginComputePass();C.setPipeline(u),C.setBindGroup(0,h),C.dispatchWorkgroups(Math.ceil(e/256)),C.end();let w=m.beginRenderPass({colorAttachments:[{view:i.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:0},loadOp:`clear`,storeOp:`store`}]});w.setPipeline(p),w.setBindGroup(0,g),w.draw(6,e),w.end(),r.queue.submit([m.finish()])},clear(){if(x)return;let e=r.createCommandEncoder();e.beginRenderPass({colorAttachments:[{view:i.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:0},loadOp:`clear`,storeOp:`store`}]}).end(),r.queue.submit([e.finish()])},async shape(t=65536){if(x)return null;t=Math.min(t,e);let i=r.createBuffer({size:t*32,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),a=r.createCommandEncoder();a.copyBufferToBuffer(s,0,i,0,t*32),r.queue.submit([a.finish()]),await i.mapAsync(GPUMapMode.READ);let o=new Float32Array(i.getMappedRange().slice(0));i.unmap(),i.destroy();let c=new Float64Array(t*3),l=[],u=new Je,d=n.width/Math.max(1,n.height);for(let e=0;e<t;e++)c.set([o[e*8],o[e*8+1],o[e*8+2]],e*3),u.set(o[e*8],o[e*8+1],o[e*8+2],1).applyMatrix4(b),u.w>.1&&l.push(u.x/u.w*d,u.y/u.w);let f=gc(_c(c,3)),p=gc(_c(l,2)),m=e=>Math.sqrt(Math.max(0,e[0])/Math.max(1e-9,e[e.length-1])),h=l.length/2,g=/* @__PURE__ */ new Float32Array(9e3);for(let e=0;e<h;e++){let t=Math.floor((l[e*2]/d*.5+.5)*120),n=Math.floor((l[e*2+1]*.5+.5)*75);t>=0&&n>=0&&t<120&&n<75&&g[n*120+t]++}let _=[...g.keys()].sort((e,t)=>g[t]-g[e]).slice(0,180),v=[],y=0;for(let e of _){y+=g[e];for(let t=0;t<g[e];t+=8)v.push(e%120/120*d,Math.floor(e/120)/75)}return{ratio2d:m(p),ratio3d:m(f),core:m(gc(_c(v,2))),share:y/Math.max(1,h),spread3d:f.map(e=>Math.sqrt(Math.max(0,e))),onScreen:h}}}}catch(e){throw r.destroy(),e}}var yc={"aava.peep":{clips:[{src:`/assets/saaristo/audio/aava.peep-1.20a3220869.mp3`,ms:210},{src:`/assets/saaristo/audio/aava.peep-2.9134a1242f.mp3`,ms:210},{src:`/assets/saaristo/audio/aava.peep-3.6f858e5367.mp3`,ms:210}]},"aava.joy":{clips:[{src:`/assets/saaristo/audio/aava.joy-1.c473105de3.mp3`,ms:467},{src:`/assets/saaristo/audio/aava.joy-2.88d61ec43f.mp3`,ms:327}]},"aava.wing":{clips:[{src:`/assets/saaristo/audio/aava.wing-1.187751830f.mp3`,ms:140},{src:`/assets/saaristo/audio/aava.wing-2.a9745a250c.mp3`,ms:140},{src:`/assets/saaristo/audio/aava.wing-3.1b89165e7e.mp3`,ms:140}]},"aava.flutter":{clips:[{src:`/assets/saaristo/audio/aava.flutter-1.739f8e3260.mp3`,ms:950},{src:`/assets/saaristo/audio/aava.flutter-2.4107fd2451.mp3`,ms:1200}]},"water.skip":{clips:[{src:`/assets/saaristo/audio/water.skip-1.a2174a600f.mp3`,ms:450},{src:`/assets/saaristo/audio/water.skip-2.edf33578c6.mp3`,ms:500},{src:`/assets/saaristo/audio/water.skip-3.8249b4fb75.mp3`,ms:450}]},"water.dive":{clips:[{src:`/assets/saaristo/audio/water.dive-1.f3ed299450.mp3`,ms:650},{src:`/assets/saaristo/audio/water.dive-2.d16a9d12fc.mp3`,ms:801}]},"wind.swish":{clips:[{src:`/assets/saaristo/audio/wind.swish-1.9ad0e7a251.mp3`,ms:1350},{src:`/assets/saaristo/audio/wind.swish-2.0b331d722b.mp3`,ms:1300}]},"loikka.croak":{clips:[{src:`/assets/saaristo/audio/loikka.croak-1.a20755c543.mp3`,ms:480},{src:`/assets/saaristo/audio/loikka.croak-2.632812028b.mp3`,ms:480},{src:`/assets/saaristo/audio/loikka.croak-3.805c212d84.mp3`,ms:740}]},"loikka.joy":{clips:[{src:`/assets/saaristo/audio/loikka.joy-1.70c6359a42.mp3`,ms:640},{src:`/assets/saaristo/audio/loikka.joy-2.dd89c8ab28.mp3`,ms:560}]},"loikka.push":{clips:[{src:`/assets/saaristo/audio/loikka.push-1.c8aafcedfd.mp3`,ms:110},{src:`/assets/saaristo/audio/loikka.push-2.d0750fa6e3.mp3`,ms:100}]},"land.wet":{clips:[{src:`/assets/saaristo/audio/land.wet-1.67699b66d1.mp3`,ms:240},{src:`/assets/saaristo/audio/land.wet-2.604fb1e901.mp3`,ms:240},{src:`/assets/saaristo/audio/land.wet-3.416ff5d446.mp3`,ms:240}]},"amb.wind":{clips:[{src:`/assets/saaristo/audio/amb.wind-2.0823f03e7f.mp3`,ms:17500}],loop:{period:16,xfade:1.5}},"amb.lap":{clips:[{src:`/assets/saaristo/audio/amb.lap-2.8ba7781cc0.mp3`,ms:15200}],loop:{period:14,xfade:1.2}}};const bc={"aava.peep":.25,"aava.joy":.4,"aava.wing":.07,"aava.flutter":.5,"water.skip":.05,"water.dive":.3,"wind.swish":.35,"loikka.croak":.4,"loikka.joy":.5,"loikka.push":.1,"land.wet":.1},xc=[`amb.wind`,`amb.lap`],Sc=`saaristo.aanimaisema`;function Cc({world:e=`/assets/saaristo`,ambientDefault:t=!1}={}){let n=new AbortController,r=!1,i=/* @__PURE__ */ new Set,a=(e,t)=>{let n=setTimeout(()=>{i.delete(n),e()},t);i.add(n)},o=t=>t.replace(`/assets/saaristo`,e),s=window.AudioContext||window.webkitAudioContext,c={unlocked:!1,played:0,last:null,ambient:!1,loaded:0,failed:0},l=null,u=null,d=0,f=!1,p=null,m=/* @__PURE__ */ new Map,h=/* @__PURE__ */ new Map,g=/* @__PURE__ */ new Map;f=t;try{let e=localStorage.getItem(Sc);e!==null&&(f=e===`1`)}catch{}let _=e=>{let t=e.getChannelData(0),n=0;for(;n<t.length&&Math.abs(t[n])<1e-4;)n++;return Math.max(0,n-8)/e.sampleRate},v=e=>(m.has(e)||m.set(e,fetch(o(e),{signal:n.signal}).then(e=>e.ok?e.arrayBuffer():Promise.reject(Error(e.status))).then(e=>new Promise((t,n)=>l.decodeAudioData(e,t,n))).then(e=>(c.loaded++,{b:e,at:_(e)})).catch(()=>(c.failed++,null))),m.get(e));function y(){if(s&&!r){if(!l){l=new s,u=l.createGain(),u.gain.value=.9,u.connect(l.destination);for(let[e,t]of Object.entries(yc))t.loop||t.clips.forEach(e=>v(e.src));document.addEventListener(`visibilitychange`,()=>{l&&!r&&(document.hidden?l.suspend():l.resume())},{signal:n.signal})}l.state!==`running`&&!document.hidden&&l.resume(),c.unlocked=!0,f&&!p&&T()}}function b(e,t={}){let n=yc[e];if(!l||!n||document.hidden||l.state!==`running`)return!1;let i=l.currentTime;if(i-(h.get(e)??-9)<(bc[e]??.1)||d>=6)return!1;h.set(e,i);let a=Math.floor(Math.random()*n.clips.length);return n.clips.length>1&&a===g.get(e)&&(a=(a+1)%n.clips.length),g.set(e,a),v(n.clips[a].src).then(n=>{if(!n||r||!l||l.state!==`running`)return;let i=l.createBufferSource(),a=l.createGain();i.buffer=n.b,i.playbackRate.value=(t.rate??1)*(1+(Math.random()*2-1)*.03),a.gain.value=t.gain??1;let o=i.connect(a);if(l.createStereoPanner&&t.x!==void 0){let e=l.createStereoPanner();e.pan.value=Math.max(-.8,Math.min(.8,t.x*.8)),o=o.connect(e)}o.connect(u),d++,i.onended=()=>{d--},i.start(l.currentTime+(t.delay??0),n.at),c.played++,c.last=e}),!0}let x=e=>Float32Array.from({length:64},(t,n)=>e(n/63)),S=x(e=>Math.sin(e*Math.PI/2)),C=x(e=>Math.cos(e*Math.PI/2));function w(e,t){let n=yc[e];if(!n)return null;let{period:i,xfade:a}=n.loop,o=[],s=0,c=0,u=0,d=null,f=!1;return v(n.clips[0].src).then(e=>{if(!e||f||r)return;d=e,s=l.currentTime+.05;let n=()=>{for(;s+c*i<l.currentTime+i+1;){let e=s+c*i,n=l.createBufferSource(),r=l.createGain();n.buffer=d.b,n.connect(r).connect(t),c>0&&r.gain.setValueCurveAtTime(S,e,a),r.gain.setValueCurveAtTime(C,e+i,a),n.start(e,d.at),n.stop(e+i+a),o.push(n),n.onended=()=>{let e=o.indexOf(n);e>=0&&o.splice(e,1)},c++}};n(),u=setInterval(n,1e3)}),()=>{f=!0,clearInterval(u);for(let e of[...o])try{e.stop(l.currentTime+.7)}catch{}}}function T(){if(!l)return;let e=l.createGain(),t=l.createGain(),n=l.createGain();e.gain.setValueAtTime(0,l.currentTime),e.gain.linearRampToValueAtTime(1,l.currentTime+2.5),t.connect(e),n.connect(e),e.connect(u);let r=[w(`amb.wind`,t),w(`amb.lap`,n)].filter(Boolean);p={bus:e,wind:t,stop:()=>{e.gain.cancelScheduledValues(l.currentTime),e.gain.setTargetAtTime(0,l.currentTime,.2),r.forEach(e=>e()),a(()=>e.disconnect(),1200)}},c.ambient=!0}function E(e){f=e;try{localStorage.setItem(Sc,e?`1`:`0`)}catch{}e?(y(),l&&!p&&T()):p&&(p.stop(),p=null,c.ambient=!1)}function D(e,t){if(b(`wind.swish`,{gain:.45+.55*e,rate:.9+.25*e,x:t}),p){let t=p.wind.gain,n=l.currentTime;t.cancelScheduledValues(n),t.setTargetAtTime(1+1.6*e,n,.12),t.setTargetAtTime(1,n+.5,.9)}}return{dispose(){if(!r){r=!0,n.abort(),p&&=(p.stop(),null);for(let e of i)clearTimeout(e);i.clear(),l&&l.close()}},unlock:y,play:b,gust:D,setAmbient:E,get ambient(){return f},stats:c,families:Object.keys(yc),ambientFamilies:xc}}function wc(t){let{container:n,assets:r={},publication:i=!1,reducedMotion:a,paused:o=!1}=t;if(!n)throw Error(`Saaristo requires a container`);let s=i?document.documentElement:n,c=n,l=i?document:n,u=document.createElement(`span`),d=e=>l.querySelector(e)||(i?null:u),f=e=>l.querySelectorAll(e),p=matchMedia(`(prefers-reduced-motion: reduce)`),m=()=>a??(p.matches||i&&(new URLSearchParams(location.search).has(`calm`)||s.classList.contains(`calm-chars`))),h={frames:0,skips:0,best:0,throws:0,gusts:0,paused:o,workMode:!1,charactersVisible:!0,aava:`float`,loikkaPad:0};i&&(window.__saaristo=h);let g=U,_=Pe.clamp,v=(e,t)=>e+Math.random()*(t-e),y=!1,b=0,x=new AbortController,S=i?window.innerWidth:Math.max(1,n.clientWidth),C=i?window.innerHeight:Math.max(1,n.clientHeight),w=window.devicePixelRatio||1,T=e=>e.clientX-(i?0:n.getBoundingClientRect().left),E=e=>e.clientY-(i?0:n.getBoundingClientRect().top),D=(e,t,n,r={})=>e?.addEventListener(t,n,{...r,signal:x.signal}),O=/* @__PURE__ */ new Set,A=(e,t)=>{let n=setTimeout(()=>{O.delete(n),y||e()},t);return O.add(n),n},ee=e=>{clearTimeout(e),O.delete(e)};function j(e){s.dataset.saaristo=`fallback`,s.dataset.saaristoReason=e,h.lost=!0;for(let e of f(`[data-throw],[data-loikka-hop],[data-saaristo-pause],[data-saaristo-sound],[data-hulluttelu]`))e.disabled=!0;let n=d(`[data-saaristo-live]`);n&&(n.textContent=`Tämä selain näyttää saaren kuvana. Elävä lampi tarvitsee WebGL2-tuen.`),t.onStatus?.({status:`fallback`,reason:e})}let M;try{if(M=new Zs({antialias:!0,powerPreference:`high-performance`}),!M.capabilities.isWebGL2)throw Error(`webgl2`)}catch{M?.dispose(),M=null,j(`no-webgl`)}return M?te():{scene:null,camera:null,state:h,resize(){},invalidate(){},setActivityFocus(){},setCameraPose(){},setAtmosphere(){},setBackdropVisible(){},renderAt(){},setWorkMode(e){h.workMode=!!e},setCharactersVisible(e){h.charactersVisible=!!e},advanceTime(){},setPaused(e){h.paused=e},dispose(){y||(y=!0,x.abort())}};function N(e,t){let n={map:{value:e},uCut:{value:-10},uFlip:{value:0}},r=new Qn(new Nr(t,t),new Ur({uniforms:n,vertexShader:`varying vec2 vUv;varying float vY;void main(){vUv=uv;vec4 w=modelMatrix*vec4(position,1.);vY=w.y;gl_Position=projectionMatrix*viewMatrix*w;}`,fragmentShader:`
      uniform sampler2D map;uniform float uCut,uFlip;varying vec2 vUv;varying float vY;
      void main(){
        vec4 c=texture2D(map,vec2(mix(vUv.x,1.-vUv.x,uFlip),vUv.y));
        if(c.a<.4||vY<uCut) discard;
        float wet=smoothstep(.16,0.,vY-uCut);
        gl_FragColor=vec4(mix(c.rgb,c.rgb*vec3(.62,.78,.82),wet*.55),1.);
        #include <colorspace_fragment>
      }`}));return r.userData.u=n,r}function te(){let a=S<760;M.setPixelRatio(Math.min(w,a?1.5:1.75)),M.setSize(S,C),M.autoClear=!1,M.domElement.className=`saaristo-canvas`,M.domElement.setAttribute(`aria-hidden`,`true`),i||(M.domElement.style.display=`block`,M.domElement.style.width=`100%`,M.domElement.style.height=`100%`),c.append(M.domElement),D(M.domElement,`webglcontextlost`,e=>{e.preventDefault(),M.domElement.style.opacity=`0`,Me?.dispose(),Me=null,j(`context-lost`)});let o=new Nt,l=new Pi(45,S/C,.1,900),u=new g(0,.07,-1).normalize(),te=new bi().load(`${r.world??`/assets/saaristo`}/sky.webp`,()=>{Ot=!0,y||(s.dataset.saaristoSky=`ready`)});te.colorSpace=k,te.wrapS=e;let ne=ac(te);o.add(ne);let P=new Si(16766640,1919562,1.6);o.add(P);let re=new Li(16756848,2.4);re.position.set(-4,6,-30),o.add(re);let F=new Li(10470655,.6);F.position.set(6,8,20),o.add(F);let ie=tc();o.add(ie.mesh);let I=sc(M,te,u,ie.heightAt);o.add(I.mesh,I.pads);let L=cc(ie,a?9e3:3e4);o.add(L.mesh);let R={uTime:L.uniforms.uTime,uPush:{value:0},uPointer:{value:new g(1e4,0,1e4)}},z=fc(ie.heightAt,R);o.add(z.group);let ae=lc($s,a?120:240);o.add(ae.mesh);let oe=[ne,ie.mesh,I.mesh,I.pads,L.mesh,z.group,ae.mesh],se={default:{sky:16766640,ground:1919562,ambient:1.6,sun:16756848,sunlight:2.4,fill:10470655,fillLight:.6,tint:[1,1,1]},cool:{sky:14084084,ground:2639954,ambient:1.7,sun:16769458,sunlight:1.85,fill:11130863,fillLight:.7,tint:[.73,.88,1]},warm:{sky:16770501,ground:4345928,ambient:1.65,sun:16761483,sunlight:2.1,fill:12110808,fillLight:.6,tint:[1,.94,.82]},twilight:{sky:10533592,ground:2109250,ambient:1.45,sun:15971232,sunlight:1.65,fill:9222372,fillLight:.8,tint:[.25,.33,.52]}},ce=`default`;h.atmosphere=ce,h.backdropVisible=!0;function le(e){if(y||!Object.hasOwn(se,e)||ce===e)return;let t=se[e];ce=e,h.atmosphere=e,P.color.setHex(t.sky),P.groundColor.setHex(t.ground),P.intensity=t.ambient,re.color.setHex(t.sun),re.intensity=t.sunlight,F.color.setHex(t.fill),F.intensity=t.fillLight,ne.material.uniforms.uSkyTint.value.set(...t.tint),I.uniforms.uSkyTint.value.set(...t.tint),Ot=!0}let ue=new bi,de=e=>{let t=ue.load(e,()=>{Ot=!0});return t.colorSpace=k,t},fe=Object.fromEntries([`idle`,`crouch`,`leap`,`airborne`,`land`,`happy`].map(e=>[e,de(`${r.characters??`/lite/characters`}/loikka/${e}.png`)])),B=Object.fromEntries([`idle`,`blink`,`wave`,`curious`,`swim`].map(e=>[e,de(`${r.characters??`/lite/characters`}/aava/${e}.png`)])),pe=N(fe.idle,1.15),me=N(B.idle,1.5);o.add(pe,me);let he=d(`[data-saaristo-live]`),ge=d(`[data-skip-count]`),_e=d(`[data-skip-best]`),ve=d(`[data-saaristo-pops]`),ye=new g,be=null;function xe(e,t,n,r=1600){if(!ve)return null;ye.copy(t).project(l);let i=document.createElement(`span`);return i.className=`saaristo-pop`+(n?` `+n:``),i.textContent=e,i.style.left=`${(ye.x*.5+.5)*S}px`,i.style.top=`${(-ye.y*.5+.5)*C}px`,ve.append(i),i._t=A(()=>i.remove(),r),i}let Se=Cc({world:r.world,ambientDefault:i}),Ce=e=>ye.copy(e).project(l).x;Object.defineProperty(h,"sound",{value:Se.stats});let we=d(`[data-saaristo-sound]`),Te=()=>{we?.setAttribute(`aria-pressed`,String(Se.ambient)),we?.toggleAttribute(`data-waiting`,Se.ambient&&!Se.stats.unlocked)};for(let e of[`pointerdown`,`keydown`])D(i?window:n,e,()=>{Se.unlock(),Te()},{capture:!0,passive:!0});we&&(window.AudioContext||window.webkitAudioContext||(we.disabled=!0),Te(),D(we,`click`,()=>{Se.setAmbient(!Se.ambient),Te()}));let Ee=[0,-50,0,0];function De(e,t){Ee[0]=e.x,Ee[1]=.4,Ee[2]=e.z,Ee[3]=t,!Y&&e.distanceTo(I.padPos[Qe])<1.7&&(nt(!0),xe(`hups!`,pe.position.clone().setY(1.5),`is-small`,1200),Se.play(`loikka.croak`,{x:Ce(pe.position)})),X.mode===`float`&&e.distanceTo(X.pos)<1.6&&(ft(),Se.play(`aava.peep`,{x:Ce(X.pos),delay:.15}))}let Oe=mc(o,I,ie.heightAt,{onThrow(){h.throws++,ge.textContent=`0`,be=null,Se.play(`wind.swish`,{gain:.3,rate:1.5,x:-.3})},onSkip(e,t){h.skips=e,ge.textContent=String(e),be=xe(String(e),t.clone().setY(.6),e>=10?`is-hot`:``,1300),De(t,.6),Se.play(`water.skip`,{x:Ce(t),rate:Math.min(1.5,.92+e*.045),gain:.9})},onEnd(e,t,n){if(h.skips=e,h.best=Math.max(h.best,e),_e.textContent=String(h.best),he.textContent=e===0?`Plumps! Kokeile matalampaa ja nopeampaa heittoa.`:`Kivi pomppasi ${e} ${e===1?`kerran`:`kertaa`}${t===`shore`?` ja liukui rantaan`:``}.`,t===`sink`&&(De(n,1),Se.play(`water.dive`,{x:Ce(n),gain:.8})),be&&e>0){ee(be._t),be.className=`saaristo-pop is-final`+(e>=8?` is-big`:``),be.textContent=e>=8?`✦ ${e}`:String(e);let t=be;t._t=A(()=>t.remove(),3400)}}},A);Object.defineProperty(h,"advanceStones",{value:e=>{if(y||!Number.isFinite(e))return;let t=_(e,0,10);for(;t>1e-9&&Oe.busy();){let e=Math.min(t,1/60);Oe.update(e),t-=e}Ot=!0}});let ke=d(`[data-saaristo-headline]`),Ae=!i||m()?null:hc([`Pieni oivallus.`,`Suuri seikkailu.`],[[1,.84,.42],[.78,1,.56]]);function je(e){if(!Ae)return;let t=ke.getBoundingClientRect();Ae.layout({left:t.left,top:t.top+scrollY,width:Math.min(t.width,S-t.left-16)},M.getPixelRatio(),e)}Ae&&(s.dataset.saaristoText=`particles`,je(!0));let Me=null,Ne=!0,Pe=d(`[data-hulluttelu="parvi"]`),H=d(`[data-parvi-note]`);Pe&&(Pe.disabled=!0),m()?s.dataset.saaristoParvi=`off`:vc(a?16384:65536,new g($s.x-2,1.6,$s.z+3)).then(e=>{if(!e)throw Error(`none`);y||h.lost?e.dispose():(Me=e,c.append(e.canvas),i||Object.assign(e.canvas.style,{position:`absolute`,inset:`0`,width:`100%`,height:`100%`,pointerEvents:`none`}),U(),s.dataset.saaristoParvi=String(e.count),Pe&&(Pe.disabled=!1),H&&(H.textContent=`${e.count.toLocaleString(`fi-FI`)} tulikärpästä laskee WebGPU:n laskentavarjostin.`))}).catch(()=>{y||(s.dataset.saaristoParvi=`off`,Pe&&(Pe.checked=!1),H&&(H.textContent=`Tämä selain ei tue WebGPU:ta, joten parvi jää lepäämään.`))});function U(){Me&&Me.resize(M.domElement.width,M.domElement.height)}Object.defineProperty(h,"swarmShape",{value:()=>Me?Me.shape():Promise.resolve(null)});let Fe={vesi:e=>{I.uniforms.uSimOn.value=e&&I.ok?1:0,I.pads.visible=e},ruoho:e=>{L.mesh.visible=e},kaislat:e=>{z.group.visible=e},tulikarpaset:e=>{ae.mesh.visible=e},kivet:e=>{d(`[data-throw]`).disabled=!e,h.stonesOff=!e,Ke?.classList.toggle(`is-off`,!e)},kirjaimet:e=>{Ae&&(Ae.scene.visible=e,s.dataset.saaristoText=e?`particles`:`plain`)},parvi:e=>{Ne=e,Me&&(Me.canvas.style.display=e?``:`none`,e||Me.clear())}};for(let e of f(`[data-hulluttelu]`)){let t=e.dataset.hulluttelu;Fe[t]?D(e,`change`,()=>{Fe[t](e.checked),Ot=!0}):e.disabled=!0}let Ie=new qi,W=new V,G=new Mn(new g(0,1,0),0),Le=new g,K=[0,2,0,0],q=new g,J=new g(1e4,0,1e4),Re=null,ze=0,Be=!1,Ve=0,He={pos:[0,-50,0,0],dir:[0,0,0,3],scatter:0},Ue=null,We=0;function Ge(e,t){let n=performance.now(),r=Ue;if(Ue={x:T(t),y:E(t),t:n,p:e.clone()},!r||n-r.t>120)return;let i=Math.hypot(T(t)-r.x,E(t)-r.y)/Math.max(8,n-r.t)*1e3,a=e.clone().sub(r.p).setY(0);if(i<1300||a.lengthSq()<1e-4)return;a.normalize();let o=Math.min(1,.35+(i-1300)/2500);o>=He.pos[3]&&(He.pos=[e.x,1.4,e.z,o],He.dir=[a.x,.25,a.z,3+o*4]),He.scatter=Math.max(He.scatter,o),n-We>400&&(h.gusts++,We=n,Se.gust(o,T(t)/S*2-1))}let Ke=d(`[data-throwzone]`),qe=()=>!i||scrollY>C*.3,Je=e=>e.target.closest(`a,button,input,label,summary,.saaristo-panel`);function Ye(e){W.set(T(e)/S*2-1,-(E(e)/C)*2+1),Ie.setFromCamera(W,l)}function Xe(e){return Ye(e),Ie.ray.intersectPlane(G,Le)&&Le.distanceTo(l.position)<60?Le:null}D(i?window:n,`pointermove`,e=>{if(!i&&!t.interactive||(vt.set(T(e)/S-.5,E(e)/C-.5),Ae&&(Ae.pointer.x=T(e),Ae.pointer.y=E(e),Ae.pointer.power=1),m()))return;if(Be){let t=Xe(e);t&&(X.target=ot(t.clone()));return}Ye(e);let n=Ie.intersectObject(ie.mesh,!1);n.length?(L.uniforms.uPointer.value.copy(n[0].point),ze=1,q.copy(n[0].point).setY(n[0].point.y+1.2),Ve=1,Ge(n[0].point,e)):(ze=0,Ie.ray.intersectPlane(G,Le)&&Le.distanceTo(l.position)<45&&(R.uPointer.value.copy(Le),q.copy(Le).setY(1.2),Ve=1,Ge(Le,e),Le.distanceTo(J)>.35&&(I.drop(Le.x,Le.z,.28,.07),J.copy(Le))))},{passive:!0}),D(i?window:n,`pointerleave`,()=>{ze=0,Ve=0,Ae&&(Ae.pointer.power=0)}),D(i?window:n,`pointerdown`,e=>{if(!i&&!t.interactive||Je(e)||m())return;Ye(e);let n=Ie.intersectObjects([me,pe,I.pads],!1)[0];if(n?.object===me&&X.mode===`float`){Be=!0,X.mode=`drag`,h.aava=`drag`,Re=null,Se.play(`aava.peep`,{x:Ce(X.pos)});return}if(n?.object===pe){Y||(tt(Qe,!0),Se.play(`loikka.joy`,{x:Ce(pe.position)}));return}if(n?.object===I.pads&&n.instanceId!==void 0){!Y&&n.instanceId!==Qe&&lt(n.instanceId)&&tt(n.instanceId);return}let r=!!e.target.closest(`[data-throwzone]`);(e.pointerType===`mouse`||r)&&(r&&Ke.setPointerCapture?.(e.pointerId),Re={x:T(e),y:E(e),t:performance.now(),zone:r})}),D(i?window:n,`pointerup`,e=>{if(!i&&!t.interactive)return;if(Be){Be=!1,X.mode=`float`,h.aava=`float`,X.next=v(4,7);return}if(!Re||h.stonesOff){Re=null;return}let n=T(e)-Re.x,r=E(e)-Re.y,a=Math.max(60,performance.now()-Re.t)/1e3,o=Re;if(Re=null,r>-40){let t=Xe(e);t&&(I.drop(t.x,t.z,.4,.5),X.mode===`float`&&t.distanceTo(X.pos)<10&&(X.target=ot(t.clone()),X.curious=1.6,X.speed=1.1,Math.random()<.5&&Se.play(`aava.peep`,{x:Ce(X.pos),delay:.2})));return}if(!qe())return;let s=_(Math.hypot(n,r)/a*.014,5,28),c=_(.05+Math.abs(n)/(Math.hypot(n,r)+1)*.08,.04,.16);Ze(Math.atan2(n,-r)*.6-(o.zone?.02:.12),s,c,o.zone)}),D(i?window:n,`pointercancel`,()=>{Re=null,Be=!1,X.mode===`drag`&&(X.mode=`float`)});function Ze(e,t,n,r){let i=new g(Math.sin(e),0,-Math.cos(e)),a=new g().setFromMatrixColumn(l.matrixWorld,0).setY(0).normalize(),o=l.position.clone().addScaledVector(a,r?-2.4:-.8).setY(.95).addScaledVector(i,3.5);Oe.throwStone(o,i.multiplyScalar(t).setY(t*n)),Ot=!0}D(d(`[data-throw]`),`click`,()=>Ze(v(-.42,-.18),v(15,21),.06,!1));let Qe=i?0:3,Y=null,$e=2.2;h.loikkaPad=Qe;let et=e=>I.padPos[e].clone().setY(.52);pe.position.copy(et(Qe));function tt(e,t=!1){Y={from:et(Qe),to:et(e),t:t?0:-.18,idx:e,happy:t,h:t?.9:1.4},$e=v(4,7)}function nt(e=!1){let t=Qe,n=-1;for(let r=0;r<(e?7:1);r++){let e=(Qe+1+Math.floor(Math.random()*(I.padPos.length-1)))%I.padPos.length;if(!lt(e))continue;let r=I.padPos[e].distanceTo(I.padPos[Qe]);r>n&&(n=r,t=e)}tt(t)}D(d(`[data-loikka-hop]`),`click`,()=>{Y||nt()});let rt={x0:-6.2,x1:3,z0:-2,z1:7.5},it={x0:-4.1,x1:5.3,z0:3.3,z1:8.7},at=e=>!!xt&&e.x>it.x0&&e.x<it.x1&&e.z>it.z0&&e.z<it.z1;function ot(e){return e.x=_(e.x,rt.x0,rt.x1),e.z=_(e.z,rt.z0,rt.z1),e.y=0,at(e)&&(e.z=it.z0-.2),ie.heightAt(e.x,e.z)>-.35?X.pos.clone():e}function st(e){for(let t=0;t<20;t++){let t=ot(e?X.pos.clone().add(new g(v(-6,6),0,v(-4,4))):new g(v(rt.x0,rt.x1),0,v(rt.z0,rt.z1)));if(t.distanceTo(X.pos)>2.5&&!at(t)&&I.padPos.every(e=>e.distanceTo(t)>1.1))return t}return at(X.pos)?ct():X.pos.clone()}let X={mode:`float`,t:0,pos:new g(-3.4,0,5.2),target:null,speed:.35,next:v(5,8),blink:3,curious:0,flip:0,from:new g,to:new g,wake:0};h.aavaPos=X.pos;function ct(){for(let e=0;e<40;e++){let e=new g(v(rt.x0,rt.x1),0,v(rt.z0,it.z0-.2));if(ie.heightAt(e.x,e.z)<=-.35&&I.padPos.every(t=>t.distanceTo(e)>1.1))return e}return new g(-1.8,0,2.6)}let lt=e=>!at(I.padPos[e]);function ut(){if(xt){if(!lt(Qe)||Y&&!lt(Y.idx)){let e=I.padPos.map((e,t)=>t).filter(lt);e.length&&(Y=null,Qe=e.reduce((e,t)=>I.padPos[e].distanceTo(I.padPos[Qe])<=I.padPos[t].distanceTo(I.padPos[Qe])?e:t),h.loikkaPad=Qe,pe.position.copy(et(Qe)))}(at(X.pos)||X.target&&at(X.target)||(X.mode===`fly`||X.mode===`dive`)&&at(X.to))&&(at(X.pos)&&X.pos.copy(ct()),X.mode=`float`,X.target=null,X.t=0,h.aava=`float`,me.position.set(X.pos.x,dt,X.pos.z))}}let dt=.3;function ft(e){X.mode=`fly`,X.t=0,X.flap=0,X.from.copy(X.pos),X.to.copy(e??st(!0)),I.drop(X.pos.x,X.pos.z,.5,.45),h.aava=`fly`,Se.play(`aava.flutter`,{x:Ce(X.pos)})}function pt(){X.mode=`dive`,X.t=0,X.from.copy(X.pos),X.to.copy(st(!0)),I.drop(X.pos.x,X.pos.z,.45,.5),h.aava=`dive`,Se.play(`water.dive`,{x:Ce(X.pos),gain:.7})}function mt(e,t){let n=me.userData.u;X.t+=e;let r=dt,i=0,a=B.idle;if(n.uCut.value=.02,me.visible=!0,X.mode===`float`||X.mode===`drag`){X.mode===`float`&&(X.next-=e,X.next<0&&(X.next=v(6,10),(Math.random()<.5?pt:ft)()),(!X.target||X.pos.distanceTo(X.target)<.2)&&(X.target=Math.random()<.6?st(!0):X.pos.clone(),X.speed=.35));let n=(X.target??X.pos).clone().sub(X.pos);n.y=0;let o=X.mode===`drag`?3.5:X.speed,s=n.length();s>.05&&at(X.pos.clone().addScaledVector(n,Math.min(1,(o*e+.3)/s)))?X.target=null:s>.05&&(X.pos.addScaledVector(n,Math.min(1,o*e/s)),X.flip=n.x<-.02?1:n.x>.02?0:X.flip,X.wake-=e,X.wake<0&&(X.wake=.3,I.drop(X.pos.x,X.pos.z,.3,.06))),r=dt+Math.sin(t*1.6)*.04,i=Math.sin(t*1.2)*.04,X.blink-=e,X.curious-=e,a=X.mode===`drag`||X.curious>0?B.curious:X.blink<.14&&X.blink>0?B.blink:B.idle,X.blink<0&&(X.blink=v(2.5,5))}else if(X.mode===`dive`){a=B.swim;let t=.9,n=1.6;if(X.t<t){let n=X.t/t;r=dt-n*1.5,i=(X.flip?1:-1)*.55,X.pos.x+=(X.flip?-1:1)*e*.8}else if(X.t<2.5){me.visible=!1;let r=(X.t-t)/n;X.pos.lerpVectors(X.from,X.to,r*r*(3-2*r)),X.flip=+(X.to.x<X.from.x),X.wake-=e,X.wake<0&&(X.wake=.22,I.drop(X.pos.x,X.pos.z,.2,.05))}else if(X.t<3.2){X.t-e<2.5&&(I.drop(X.pos.x,X.pos.z,.45,.45),Se.play(`water.skip`,{x:Ce(X.pos),rate:.8,gain:.5}),Math.random()<.35&&Se.play(`aava.peep`,{x:Ce(X.pos),delay:.35}));let i=(X.t-t-n)/.7;r=dt-(1-i)*(1-i)*1.3,a=B.idle}else X.mode=`float`,X.target=null,h.aava=`float`}else if(X.mode===`fly`){let e=Math.min(1,X.t/1.7),t=e*e*(3-2*e);X.pos.lerpVectors(X.from,X.to,t),X.flip=+(X.to.x<X.from.x),r=dt+Math.sin(e*Math.PI)*2.3,n.uCut.value=-10;let o=Math.floor(X.t*10);a=o%2?B.wave:B.idle,o!==X.flap&&(X.flap=o,o%2&&X.t>.6&&e<.9&&Se.play(`aava.wing`,{x:Ce(X.pos),gain:.8})),i=(X.flip?1:-1)*Math.cos(e*Math.PI)*.18,e>=1&&(I.drop(X.pos.x,X.pos.z,.55,.55),X.mode=`float`,X.target=null,X.next=v(6,10),h.aava=`float`,Se.play(`water.skip`,{x:Ce(X.pos),rate:.75,gain:.6}))}n.map.value=a,n.uFlip.value=X.flip,me.position.set(X.pos.x,r,X.pos.z),me.quaternion.copy(l.quaternion),me.rotateZ(i)}let ht={p:new g(.5,4.8,19.5),l:new g(3.5,1,-4)},gt={p:new g(-1.5,1.35,15.5),l:new g(1.5,.7,-6)},_t=new V,vt=new V,yt=new g,bt=0,xt=null,St=0,Ct=null,wt=new g(.6,.7,6),Tt=new g,Et=10;function Dt(e){if(Ct){l.position.fromArray(Ct.position),l.fov=Ct.fov,l.updateProjectionMatrix(),l.lookAt(...Ct.target),l.updateMatrixWorld();return}let t=Math.max(1,document.documentElement.scrollHeight-C);bt=i?_(scrollY/Math.min(t*.55,C*1.8),0,1):0;let n=bt*bt*(3-2*bt);l.position.lerpVectors(ht.p,gt.p,n).add(new g(_t.x*.9,-_t.y*.4,0)),yt.lerpVectors(ht.l,gt.l,n),l.fov=l.aspect<1?62:45;let r=+!!xt;St=m()||h.paused||h.workMode?r:St+(r-St)*Math.min(1,e*4),Math.abs(r-St)<.001&&(St=r);let a=_(Et/(2*Math.tan(l.fov*Math.PI/360)*l.aspect),6,15);Tt.copy(wt),Tt.y+=a*.53,Tt.z+=a*.85,l.position.lerp(Tt,St),yt.lerp(wt,St),l.updateProjectionMatrix(),l.lookAt(yt),l.updateMatrixWorld(),Ke?.classList.toggle(`is-away`,!qe()||scrollY>C*1.5)}let Ot=!0,kt=performance.now(),At=0,jt=0,Z=.8,Mt=!0,Pt=[];Object.defineProperty(h,"afterNextFrame",{value:e=>{y||(Pt.push(e),Ot=!0)}});let Ft={croak:v(8,16),peep:v(10,20)};function It(e=i?window.innerWidth:n.clientWidth,t=i?window.innerHeight:n.clientHeight,r=window.devicePixelRatio||1){y||(S=Math.max(1,e),C=Math.max(1,t),w=r,M.setPixelRatio(Math.min(w,S<760?1.5:1.75)),M.setSize(S,C),l.aspect=S/C,U(),je(!1),Ot=!0)}D(window,`resize`,()=>It());let Lt=!i&&typeof ResizeObserver<`u`?new ResizeObserver(()=>{y||n.clientWidth===S&&n.clientHeight===C||It()}):null;Lt?.observe(n);let Rt=Ae?ke.getBoundingClientRect():null,zt=Rt?`${Math.round(Rt.width)}x${Math.round(Rt.height)}`:``,Bt=Ae&&typeof ResizeObserver<`u`?new ResizeObserver(()=>{if(y)return;let e=ke.getBoundingClientRect(),t=`${Math.round(e.width)}x${Math.round(e.height)}`;if(t===zt)return;let n=!Ae.count;zt=t,je(n),Ot=!0}):null;Bt?.observe(ke),D(window,`scroll`,()=>{Ot=!0},{passive:!0}),D(p,`change`,()=>{Ot=!0}),D(document,`visibilitychange`,()=>{kt=performance.now()});let Vt=d(`[data-saaristo-pause]`);D(Vt,`click`,()=>{h.paused=!h.paused,Vt.setAttribute(`aria-pressed`,String(h.paused)),(Vt.querySelector(`.saaristo-chip-label`)??Vt).textContent=h.paused?`Jatka liikettä`:`Pysäytä liike`,kt=performance.now(),Ot=!0});function Ht(e,t){if(y||h.lost)return;t===void 0&&(b=requestAnimationFrame(Ht));let n=h.workMode||t===void 0&&(m()||h.paused);if(t===void 0&&(document.hidden||n&&!Ot&&!Oe.busy()))return;let r=t??Math.max(0,Math.min(.05,(e-kt)/1e3));if(kt=e,Ot=!1,n)h.started||(pe.position.copy(et(Qe)),mt(0,0));else{jt+=r,At+=r;let e=0;for(;At>=1/60&&e<4;)I.step(),At-=1/60,e++;if(Z-=r,Z<0&&(Z=v(.5,1.9),I.drop(v(-8,10),v(-10,12),.18,.08)),_t.lerp(vt,.05),$e-=r,!Y&&$e<0&&(nt(),$e=v(3,6)),Ft.croak-=r,Ft.peep-=r,Ft.croak<0&&(Ft.croak=v(14,32),Y||Se.play(`loikka.croak`,{x:Ce(pe.position),gain:.75})),Ft.peep<0&&(Ft.peep=v(15,40),X.mode===`float`&&Se.play(`aava.peep`,{x:Ce(X.pos),gain:.8})),Y){Y.t+=r;let e=_(Y.t/.75,0,1);!Y.pushed&&Y.t>=0&&(Y.pushed=!0,Se.play(`loikka.push`,{x:Ce(pe.position)})),pe.userData.u.map.value=Y.happy?fe.happy:Y.t<0?fe.crouch:e<.3?fe.leap:e<.85?fe.airborne:fe.land,pe.userData.u.uFlip.value=+(Y.to.x<Y.from.x-.01),pe.position.lerpVectors(Y.from,Y.to,e).setY(.52+Math.sin(e*Math.PI)*Y.h),e>=1&&(I.drop(Y.to.x,Y.to.z,.55,.35),Se.play(`land.wet`,{x:Ce(Y.to)}),Qe=Y.idx,h.loikkaPad=Qe,Y=null,A(()=>{Y||(pe.userData.u.map.value=fe.idle)},260))}else pe.position.y=.52+Math.sin(jt*1.3+Qe)*.02;mt(r,jt),L.uniforms.uPush.value+=(ze-L.uniforms.uPush.value)*Math.min(1,r*6),R.uPush.value+=(Math.max(Ve&&!ze?1:0,He.pos[3]*1.6)-R.uPush.value)*Math.min(1,r*4),He.pos[3]*=.03**r,He.scatter=Math.max(0,He.scatter-r/1.8),Oe.update(r),Ae&&(Ae.update(r,scrollY),Ae.pointer.power*=.94)}n&&Oe.update(r),h.started=!0,I.uniforms.uTime.value=L.uniforms.uTime.value=ae.uniforms.uTime.value=jt,Ae&&(Ae.uniforms.uTime.value=jt,Ae.uniforms.uOpacity.value=_(1-bt*2.2,0,1)),Dt(r),pe.quaternion.copy(l.quaternion),Mt||(pe.visible=!1,me.visible=!1),M.clear(),M.render(o,l),Ae&&Ae.scene.visible&&Ae.uniforms.uOpacity.value>0&&(M.clearDepth(),M.render(Ae.scene,Ae.cam));for(let e of Pt.splice(0))e();Me&&Ne&&!n&&(K[3]+=(+!!Ve-K[3])*Math.min(1,r*2),Ve&&(K[0]=q.x,K[1]=q.y,K[2]=q.z,Ve*=.995),Me.frame(l,jt,r,K,Ee,He),Ee[3]*=.02**r),h.time=jt,h.frames++,h.frames===1&&!h.lost&&(s.dataset.saaristo=m()?`static`:`webgl`)}return s.dataset.saaristoWater=I.ok?`simulated`:`flat`,s.dataset.saaristoGrass=String(L.count),s.dataset.saaristoReeds=String(z.count),b=requestAnimationFrame(Ht),t.onStatus?.({status:`ready`}),{scene:o,camera:l,state:h,resize:It,setCameraPose(e){if(!(y||i)){if(e===null)Ct=null;else{if(![e.position,e.target].every(e=>Array.isArray(e)&&e.length===3&&e.every(Number.isFinite))||!Number.isFinite(e.fov)||e.fov<15||e.fov>85)return;Ct={position:[...e.position],target:[...e.target],fov:e.fov}}Ot=!0}},setAtmosphere:le,setBackdropVisible(e){if(!(y||i)){h.backdropVisible=!!e;for(let t of oe)t.visible=!!e;Ot=!0}},renderAt(e){y||i||!h.workMode||!Number.isFinite(e)||e<0||(jt=e,Ht(performance.now(),0))},setCharactersVisible(e){y||(Mt=!!e,h.charactersVisible=Mt,pe.visible=Mt,me.visible=Mt,Ot=!0)},invalidate(){y||(Ot=!0)},setActivityFocus(e,t){y||(xt=!!e,ut(),t?.target?.length===3&&t.target.every(Number.isFinite)&&wt.fromArray(t.target),Number.isFinite(t?.span)&&(Et=_(t.span,3,20)),Ot=!0)},advanceTime(e){if(y||h.lost||!Number.isFinite(e)||e<=0)return;if(h.workMode){Ht(performance.now(),0);return}let t=Math.min(e,1e4)/1e3;for(;t>1e-9;){let e=Math.min(t,1/60);Ht(performance.now(),e),t-=e}kt=performance.now()},setPaused(e){y||(h.paused=!!e,kt=performance.now(),Ot=!0)},setWorkMode(e){y||(h.workMode=!!e,kt=performance.now(),Ot=!0)},dispose(){if(y)return;y=!0,Lt?.disconnect(),Bt?.disconnect(),x.abort(),cancelAnimationFrame(b);for(let e of O)clearTimeout(e);O.clear(),Se.dispose(),Me?.dispose(),I.dispose();let e=/* @__PURE__ */ new Set,t=t=>{t?.isTexture&&!e.has(t)&&(e.add(t),t.dispose())},n=n=>n?.traverse(n=>{n.geometry&&!e.has(n.geometry)&&(e.add(n.geometry),n.geometry.dispose());for(let r of Array.isArray(n.material)?n.material:[n.material])if(r&&!e.has(r)){e.add(r);for(let e of Object.values(r))t(e);for(let e of Object.values(r.uniforms||{}))t(e.value);r.dispose()}});n(o),n(Ae?.scene);for(let e of Object.values(fe))t(e);for(let e of Object.values(B))t(e);M.dispose(),M.domElement.remove()}}}}wc({container:document.querySelector(`[data-saaristo-stage]`),publication:!0});