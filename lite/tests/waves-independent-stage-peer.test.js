import {it,expect} from 'vitest';
import * as THREE from 'three';
import {mountWavesObservatoryStage} from '../src/world/waves-observatory-stage.js';
it('the observed silhouette faces the source-side camera rather than being culled behind the screen',()=>{
  for(const shape of ['round','square'])for(const context of ['lamp','sun']){
    const parent=new THREE.Group(),stage=mountWavesObservatoryStage(parent,{kind:'waves-observatory',sourceX:0,objectX:4,screenX:10,sourceY:0,objectY:1,objectHalf:.5,shape,context,
      observation:{kind:'light',objectY:1,shadowLow:context==='sun'?.5:1.25,shadowHigh:context==='sun'?1.5:3.75}});
    const root=parent.children[0];parent.updateMatrixWorld(true);
    const shadow=root.children.find(o=>o.material?.color?.getHex()===0x384c60);expect(shadow).toBeDefined();
    const target=shadow.getWorldPosition(new THREE.Vector3()),from=root.localToWorld(new THREE.Vector3(shadow.position.x-1,shadow.position.y,0));
    const ray=new THREE.Raycaster(from,target.clone().sub(from).normalize());
    expect(ray.intersectObject(root,true)[0]?.object,`${context}/${shape} shadow should be the first visible surface`).toBe(shadow);
    stage.dispose();expect(parent.children).toHaveLength(0);
  }
});
