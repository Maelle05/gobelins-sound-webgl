import * as THREE from 'three'
import { MathUtils } from 'three';

export default class Particles {
  constructor(size, scene){
    this.size = size
    this.scene = scene

    this.particleGroups = 100;
    this.particles = 50;
    this.geometry = new THREE.BufferGeometry();
    this.positions = [];
    this.colors = [];

    this.colorRng = [
      0x0FC0FC, 0x1898C2, 0x1579A4,  // blue
      0x7B1DAF, 0x661A90, 0x511471,  // purple
      0xFF2FB9, 0xD12397, 0xFF2FB9   // pink  
    ];

    this.controls = {
      speed: 2,
      x: 3,
      y: 5,
      z: 1,
      min: -10,
      max: 10,
      step: 0.2
    }
  }

  generate(){
    // generate base particle group vertices + colors
    for (let i=0; i<this.particles; i++) {  
      // positions
      this.positions.push(
        THREE.Math.randFloatSpread(10),
        THREE.Math.randFloatSpread(10),
        THREE.Math.randFloatSpread(20)
      );
      
      // colors
      this.c = THREE.Math.randInt(0, this.colorRng.length-1);
      this.color = new THREE.Color(this.colorRng[this.c]);
        this.colors.push(this.color.r, this.color.g, this.color.b, .5);
      }
      
      this.geometry.addAttribute('position', new THREE.Float32BufferAttribute(this.positions, 3));
      this.geometry.addAttribute( 'color', new THREE.Float32BufferAttribute(this.colors, 4));
      this.geometry.computeBoundingSphere();
      
      this.material = new THREE.PointsMaterial({
        size: THREE.Math.randFloat(0.03,0.05), // slight particle size variation
        vertexColors: THREE.VertexColors,
        transparent: true
      });
      
      // create particle groups
      for(let i=0; i<this.particleGroups; i++) {
        this.points = new THREE.Points(this.geometry, this.material);
        this.points.rotation.x = THREE.Math.randFloatSpread(3);
        this.points.rotation.y = THREE.Math.randFloatSpread(3);
        this.points.rotation.z = THREE.Math.randFloatSpread(3);
        this.points.name = `points${i}`;
        this.scene.add(this.points);
      }
      
      this.prev = Date.now();
  }

  animate(strength){
    let { x, y, z } = this.controls;  
    this.mySpeed = 4
    this.now = Date.now();
    let t = this.now - this.prev;
    let duration = -2 / this.mySpeed * 10000;
    let angle = Math.PI * 2 * t / duration;
    this.now = this.prev;  

    // rotate particle groups, exponentiate on x, y & z values / i
    for(let i=0; i<this.particleGroups; i++) {
      let points = this.scene.getObjectByName(`points${i}`);
      points.rotation.x = angle + i**(x/i); 
      points.rotation.y = angle + i**(y/i);
      points.rotation.z = angle + i**(z/i);
      
      points.material.opacity = strength - .4
    }
  }

}


