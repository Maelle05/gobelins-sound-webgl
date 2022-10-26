import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as dat from 'lil-gui'
import { MathUtils } from 'three';

/**
 * Base
 */
let canvas = null
let scene = null
let sizes = null
let camera = null
let renderer = null

// Debug
const gui = new dat.GUI()
gui.close()

// Textures
const textureLoader = new THREE.TextureLoader()

// Animate
const clock = new THREE.Clock()

// Color
const palette = ['0FC0FC', '7B1DAF', 'FF2FB9', 'D4FF47', '1B3649']

function initWebgl(){
  // Canvas
  canvas = document.querySelector('canvas.webgl')

  // Scene
  scene = new THREE.Scene()

  // Sizes
  sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  }

  window.addEventListener('resize', () =>
  {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  })

  // Camera
  camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
  camera.position.set(0.25, 1, 5)
  scene.add(camera)

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas
  })
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
}

function isMobileDevice() { 
  if( navigator.userAgent.match(/iPhone/i)
  || navigator.userAgent.match(/webOS/i)
  || navigator.userAgent.match(/Android/i)
  || navigator.userAgent.match(/iPad/i)
  || navigator.userAgent.match(/iPod/i)
  || navigator.userAgent.match(/BlackBerry/i)
  || navigator.userAgent.match(/Windows Phone/i)
  ){
     return true;
   }
  else {
     return false;
   }
 }
// Controls
const mouse = { x: 0, y: 0 }
const mouseTarget = { x: 0, y: 0 }
function initCameraControls() {
  if (!isMobileDevice()) {
    window.addEventListener('mousemove', (e)=>{
      mouseTarget.x = (e.clientX - sizes.width/2) / (sizes.width/2)
      mouseTarget.y = (e.clientY - sizes.height/2) / (sizes.height/2)
    })
  } else {
    mouseTarget.y = 2
  }
  
  // Controls
  
}

// Sound
import Audio from './libs/audio';
let myAudio = null
function initSound(){
  canvas.addEventListener('click', startAudio)
}

function startAudio() {
  console.log('Init 🎶');
  myAudio = new Audio()
  myAudio.showPreview = false
  myAudio.start( {
    onBeat: onBeat,
    live: false,
    src: '/music/Never_Going_Home.mp3',
  })
  canvas.removeEventListener('click', startAudio)
}

function onBeat() {
  // updateDiscoBall(myAudio.values[2] * 0.3)
  for (let i = 0; i < nbMirors; i++) {
    if (Math.random() > .93 && myAudio.volume * .04 > 0.10) {
      instancedMeshTrans[i].intensityTarget = myAudio.volume * .07 
    } else {
      instancedMeshTrans[i].intensityTarget = 0
    }
  }
}

// Light
function addLight(){
  // Lights
  const ambiant = new THREE.AmbientLight(0x202020)
  scene.add(ambiant)

  const lightBehind = new THREE.PointLight(0x0FC0FC, .5)
  lightBehind.position.x = 5
  lightBehind.position.y = 5
  lightBehind.position.z = -5
  scene.add(lightBehind)

  const lightFront = new THREE.PointLight(0xFF2FB9, .5)
  lightFront.position.x = -5
  lightFront.position.y = -5
  lightFront.position.z = 5
  scene.add(lightFront)

  const lightFrontTow = new THREE.PointLight(0x7B1DAF, .5)
  lightFrontTow.position.x = 5
  lightFrontTow.position.y = -5
  lightFrontTow.position.z = 5
  scene.add(lightFrontTow)
}

// Env Map
let textureCube = null
function addEnvMap(){
  const loader = new THREE.CubeTextureLoader();
  loader.setPath( 'envMap/' );

  textureCube = loader.load( [ 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' ] );
  textureCube.encoding = THREE.sRGBEncoding;

  scene.background = textureCube;

  console.log(textureCube);
}


// Sphere Custom Mat
let materialCustomMat = null
import sphereVertexShader from './webgl/shaders/sphere/vert.glsl'
import sphereFragmentShader from './webgl/shaders/sphere/frag.glsl'

const createSphereCustomMat = () => {
  console.log('Create Sphere');
  const geometry = new THREE.SphereGeometry( 1, 32, 32)

  materialCustomMat = new THREE.RawShaderMaterial({
    vertexShader: sphereVertexShader,
    fragmentShader: sphereFragmentShader,
  })

  const mesh =  new THREE.Mesh(geometry, materialCustomMat)
  scene.add(mesh)
}

// Disco Ball
const nbMirors = 433
let mirorsInstancedMesh = null
const dummy = new THREE.Object3D()

let instancedMeshTrans = []

const createDiscoBall = () => {
  console.log('Disco Mirors 🪩')

  const geometry = new THREE.PlaneGeometry( .2, .2)
  const material = new THREE.MeshPhysicalMaterial({ 
    color: 0xf0f0f0,
    side: 2,
    metalness: .5,
    roughness: .5,
    reflectivity: 0,
    // envMap: textureCube 
  })
  mirorsInstancedMesh = new THREE.InstancedMesh( geometry, material, nbMirors )

  // GUI
  const discoSetting = gui.addFolder('🪩 Setting')
  const discoSettingMat = discoSetting.addFolder('Material')
  discoSettingMat.add(material, 'metalness', 0, 1, .01)
  discoSettingMat.add(material, 'roughness', 0, 1, .01)
  discoSettingMat.add(material, 'reflectivity', 0, 1, .01)
  discoSetting.close()

  for (let i = 0; i < nbMirors; i++) {
    const objTrans = {
      intensity: 0,
      intensityTarget: 0
    }
    instancedMeshTrans.push(objTrans)
  }

  updateDiscoBall()

  mirorsInstancedMesh.translateY(0.5)
  scene.add(mirorsInstancedMesh)
}

const updateDiscoBall = () => {
  for (let i = 0; i < nbMirors; i++) {
    let theta = 0 // Entre 0 et Math.PI*2 
    let phi = 0
    let r =  1

    if (i < 53){
      theta = Math.PI/27 * i;
      phi = 0;
      r =  1;
    } else if(i < 105) {
      theta = Math.PI/26 * i;
      phi = 0.23;
      r =  .97;
    } else if(i < 151) {
      theta = Math.PI/23 * i;
      phi = 0.45;
      r =  .89;
    } else if(i < 189) {
      theta = Math.PI/19 * i;
      phi = 0.65;
      r =  .76;
    } else if(i < 217) {
      theta = Math.PI/14 * i;
      phi = 0.815;
      r =  .59;
    } else if(i < 235) {
      theta = Math.PI/9 * i;
      phi = 0.94;
      r =  .40;
    } else if(i < 243) {
      theta = Math.PI/4 * i;
      phi = 1.015;
      r =  .19;
    } else if(i < 295) {
      theta = Math.PI/26 * i;
      phi = -0.23;
      r =  .97;
    } else if(i < 341) {
      theta = Math.PI/23 * i;
      phi = -0.45;
      r =  .89;
    } else if(i < 379) {
      theta = Math.PI/19 * i;
      phi = -0.65;
      r =  .76;
    } else if(i < 407) {
      theta = Math.PI/14 * i;
      phi = -0.815;
      r =  .59;
    } else if(i < 425) {
      theta = Math.PI/9 * i;
      phi = -0.94;
      r =  .40;
    } else if(i < 433) {
      theta = Math.PI/4 * i;
      phi = -1.015;
      r =  .19;
    }

    r += instancedMeshTrans[i].intensity

    const x = (r * Math.cos(theta)) * Math.cos(0)
    const y = (r * Math.cos(theta)) * Math.sin(0)
    const z = r * Math.sin(theta)
    
    dummy.position.set(x, y + phi, z);
    dummy.lookAt(0,0,0);
    dummy.updateMatrix();

    mirorsInstancedMesh.setMatrixAt( i++, dummy.matrix );
    mirorsInstancedMesh.instanceMatrix.needsUpdate = true
  }
}

// Flor
import vertexFloorShader from './webgl/shaders/floor/vert.glsl'
import fragmentFloorShader from './webgl/shaders/floor/frag.glsl'

let materialF = null
const createFloor = () => {
  console.log('Create Floor')

  // Floor
  const geometryF = new THREE.PlaneGeometry(15, 15, 200, 200)
  materialF = new THREE.RawShaderMaterial({
    uniforms: {
      uTime: { value: clock.elapsedTime},
      uIntencity: { value: .3},
      uWaves: { value: 3.},
      uSpeed: { value: 3.},
    },
    vertexShader: vertexFloorShader,
    fragmentShader: fragmentFloorShader,
    transparent: true,
    wireframe: false
  })
  const meshF = new THREE.Mesh(geometryF, materialF)
  meshF.rotateX( - Math.PI / 2)
  meshF.position.y = -2.1

  // GUI
  const floorSetting = gui.addFolder('Floor Setting')
  const floorSettingMat = floorSetting.addFolder('Sheader Material')
  floorSettingMat.add(materialF.uniforms.uIntencity, 'value', .27, .6, .01).name('Intencity')
  floorSettingMat.add(materialF.uniforms.uWaves, 'value', 0, 9, .1).name('Waves')
  floorSettingMat.add(materialF.uniforms.uSpeed, 'value', 0, 15, .1).name('Speed')
  floorSetting.close()

  scene.add( meshF )
}

// WALLS
import { Reflector } from 'three/examples/jsm/objects/Reflector'
const createWallOne = () => {
  console.log('Create Wall one ')
  // Reflector
  const geometry = new THREE.PlaneGeometry( 17, 15, 30, 30)
  // const meshReflector = new Reflector(
  //   geometry,
  //   {
  //     color: new THREE.Color(0x7f7f7f),
  //     textureWidth: window.innerWidth * window.devicePixelRatio,
  //     textureHeight: window.innerHeight * window.devicePixelRatio,
  //   }
  // )

  const meshReflector = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x1B3649}))
  meshReflector.translateY(4)
  meshReflector.translateX(8)
  meshReflector.rotateY(-Math.PI/2)
  scene.add(meshReflector)
}

import vertexWallShader from './webgl/shaders/wall/vert.glsl'
import fragmentWallShader from './webgl/shaders/wall/frag.glsl'
const nbSquareWall = 30
let materialWall = null
const createWallTwo = () => {
  const geometry =  new THREE.PlaneGeometry(16, 16, 32, 32)
  materialWall = new THREE.RawShaderMaterial({
    uniforms: {
    },
    vertexShader: vertexWallShader,
    fragmentShader: fragmentWallShader,
    transparent: true,
    wireframe: false
  })

  const wall = new THREE.Mesh( geometry, materialWall )
  wall.translateZ(-8.5)
  wall.translateY(3.5)
  scene.add(wall)
}

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    mirorsInstancedMesh.rotation.y = elapsedTime * 0.2

    // Update floor sheaders
    if (materialF) materialF.uniforms.uTime.value = elapsedTime * 0.2

    if (myAudio){
      myAudio.update()
      materialF.uniforms.uIntencity.value = MathUtils.lerp(materialF.uniforms.uIntencity.value, myAudio.values[2], .4)

      for (let i = 0; i < nbMirors; i++) {
        instancedMeshTrans[i].intensity = MathUtils.lerp(instancedMeshTrans[i].intensity, instancedMeshTrans[i].intensityTarget, .4)
      }

      updateDiscoBall()
    } 

    // Update controls
    mouse.x = MathUtils.lerp(mouse.x, mouseTarget.x, .1)
    mouse.y = MathUtils.lerp(mouse.y, mouseTarget.y, .1)
    camera.position.x = mouse.x
    camera.position.y = mouse.y * .3
    camera.lookAt(0, 0, 0)


    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

initWebgl()
initCameraControls()
initSound()
// addEnvMap() 
addLight()
createFloor()
createWallOne()
createWallTwo()
// createSphereCustomMat()
createDiscoBall()
tick()