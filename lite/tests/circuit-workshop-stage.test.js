import {describe,it,expect} from 'vitest';
import * as THREE from 'three';
import {mountCircuitWorkshopStage} from '../src/world/circuit-workshop-stage.js';
import {circuitWorkshopScene,solutionCircuitWorkshop} from '../src/content/models/circuit-workshop';
const task={kind:'circuit-workshop',input:{kind:'network',goal:'parallel-current',topology:'parallel',volts:12,resistances:[6,3],change:'remove',removeIndex:1,order:'normal'},question:'?',fields:[],hint:''};
describe('circuit workshop stage',()=>{it('uses the before/after topology and only exposes observed outcomes',()=>{const parent=new THREE.Group(),before=circuitWorkshopScene(task),view=mountCircuitWorkshopStage(parent,before);expect(before.circuit.edges).toHaveLength(2);expect(view.snapshot()).not.toHaveProperty('outcome');view.dispose();expect(parent.children).toHaveLength(0);const after=circuitWorkshopScene(task,solutionCircuitWorkshop(task));expect(after.circuit.edges).toHaveLength(1);const next=mountCircuitWorkshopStage(parent,after);expect(next.snapshot()).toHaveProperty('outcome');next.advanceTime(1000);next.dispose();expect(parent.children).toHaveLength(0);});});
