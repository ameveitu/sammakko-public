import {describe,it,expect} from 'vitest';
import * as THREE from 'three';
import {mountElectricityHarborStage} from '../src/world/electricity-harbor-stage.js';
describe('electricity stage lifecycle',()=>{
 it('preserves learner wiring, reveals only observed outcome, and disposes its group',()=>{const parent=new THREE.Group();const scene={kind:'electricity-harbor',mode:'build',given:{},wires:[['p','la']],observed:false};const stage=mountElectricityHarborStage(parent,scene);expect(stage.snapshot()).toMatchObject({mode:'build',wires:[['p','la']],observed:false});expect(stage.snapshot()).not.toHaveProperty('outcome');expect(parent.children).toHaveLength(1);stage.advanceTime(500);stage.dispose();expect(parent.children).toHaveLength(0);});
 it('renders both supplied meter network layouts and detaches cleanly',()=>{for(const meter of ['current','voltage']){const parent=new THREE.Group();const stage=mountElectricityHarborStage(parent,{kind:'electricity-harbor',mode:'meter',given:{meter},wires:[],meterOption:'across-source',observed:true,outcome:{reading:6}});expect(stage.snapshot().outcome).toEqual({reading:6});stage.dispose();expect(parent.children).toHaveLength(0);}});
});
