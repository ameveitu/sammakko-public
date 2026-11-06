import { describe,it,expect } from 'vitest';
import * as THREE from 'three';
import { mountThermalStationStage } from '../src/world/thermal-station-stage.js';
import { thermalScene } from '../src/content/scenes/thermal-station';
import { solutionThermalStation } from '../src/content/models/thermal-station';

describe('thermal scene lifecycle',()=>{
 it('hides outcome and motion until observation, then disposes all scene objects',()=>{
  const task={kind:'thermal-station',input:{kind:'convection',context:'tank',medium:'water',question:'circulation',warmC:20,coolC:10},question:'?',choices:[],hint:''};
  const parent=new THREE.Group(),before=mountThermalStationStage(parent,thermalScene(task));
  expect(before.snapshot()).toMatchObject({observed:false,particleCount:0});expect(before.snapshot()).not.toHaveProperty('outcome');before.advanceTime(3000);before.dispose();expect(parent.children).toHaveLength(0);
  const after=mountThermalStationStage(parent,thermalScene(task,solutionThermalStation(task)));expect(after.snapshot()).toMatchObject({observed:true,particleCount:8});const points=[];parent.traverse(o=>{if(o.geometry?.type==='SphereGeometry')points.push(o.position.clone());});expect(points.every(p=>p.y>.4)).toBe(true);const left=points.findIndex(p=>p.x<-.9);expect(left).toBeGreaterThanOrEqual(0);after.advanceTime(100);const newPoints=[];parent.traverse(o=>{if(o.geometry?.type==='SphereGeometry')newPoints.push(o.position.clone());});expect(newPoints[left].y).toBeGreaterThan(points[left].y);after.advanceTime(1100);let moved=false;let i=0;parent.traverse(o=>{if(o.geometry?.type==='SphereGeometry'){moved ||= !o.position.equals(points[i++]);}});expect(moved).toBe(true);after.dispose();expect(parent.children).toHaveLength(0);
 });
});
