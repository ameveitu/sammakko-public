import * as THREE from 'three';
import { expect,it } from 'vitest';
import { drawProgrammingFerry,ferryMapPosition } from '../src/world/programming-ferry-stage';

const model={kind:'programming-ferry',title:'Koereitti',board:{width:5,height:5,rocks:[{x:0,y:0},{x:3,y:2}]},
  start:{x:1,y:3,heading:'east'},goal:{destination:{x:2,y:2},heading:'north',via:[{x:2,y:3}]},
  pose:{x:2,y:3,heading:'east'},path:[{x:1,y:3},{x:2,y:3}],step:1,stopped:false};
const named=(group,name)=>{
  const matches=[];group.traverse(node=>{if(node.name===name)matches.push(node);});return matches;
};
it('builds a visible 5×5 harbour with a real heading, two shoals and the played route prefix',()=>{
  const parent=new THREE.Group(),details=drawProgrammingFerry(parent,model);
  expect(named(parent,'charted-water-cell')).toHaveLength(25);
  expect(named(parent,'shoal-rock')).toHaveLength(2);
  expect(named(parent,'intermediate-dock')).toHaveLength(1);
  expect(named(parent,'destination-dock')).toHaveLength(1);
  expect(named(parent,'sailed-trace')).toHaveLength(1);
  const boat=named(parent,'programmable-ferry')[0];
  const position=ferryMapPosition(model.pose,5,5,.57);
  expect(boat.position.x).toBeCloseTo(position.x);
  expect(boat.position.z).toBeCloseTo(position.z);
  const bow=new THREE.Vector3(0,0,-1).applyQuaternion(boat.quaternion);
  expect(bow.x).toBeCloseTo(1);expect(bow.z).toBeCloseTo(0);
  expect(details).toMatchObject({pose:model.pose,path:model.path,step:1,north:'-z'});
  expect(ferryMapPosition({x:0,y:0},5,5,.57).z).toBeLessThan(ferryMapPosition({x:0,y:1},5,5,.57).z);
});
it('does not render a destination or trace before a forecast-only run',()=>{
  const parent=new THREE.Group();
  const details=drawProgrammingFerry(parent,{...model,goal:undefined,path:[model.start],pose:model.start,step:0});
  expect(named(parent,'destination-dock')).toHaveLength(0);
  expect(named(parent,'intermediate-dock')).toHaveLength(0);
  expect(named(parent,'sailed-trace')).toHaveLength(0);
  expect(details.pose).toEqual(model.start);
});
