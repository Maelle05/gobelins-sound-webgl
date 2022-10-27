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
gui.hide()

// Textures
const textureLoader = new THREE.TextureLoader()

// Animate
const clock = new THREE.Clock()

// Color
const palette = ['#0FC0FC', '#7B1DAF', '#FF2FB9', '#1B3649']

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
  
  mouseTarget.x = 6
  // Controls
  
}

// button enter
let currentPosBal = 6
let targetPosBal = 6
document.querySelector('#neonShadow').addEventListener('click', start)
function start(){
  document.querySelector('.ui').style.opacity = 0
  document.querySelector('canvas').style.filter = 'blur(0)'

  targetPosBal = 0.3

  setTimeout(()=>{
    document.querySelector('.ui').style.display = 'none'
  }, 300)
  startAudio()
}

// Sound
import Audio from './libs/audio';
let myAudio = null

function startAudio() {
  console.log('Init 🎶');
  myAudio = new Audio()
  myAudio.showPreview = false
  myAudio.start( {
    onBeat: onBeat,
    live: false,
    src: '/music/Antoine-crab-song.mov',
  })
  canvas.removeEventListener('click', startAudio)
}

let lastBeatTime = null
function onBeat() {
  if (myAudio.volume > 6) {
    lastBeatTime = Date.now()
    for (let i = 0; i < nbMirors; i++) {
      if (Math.random() > .93 && myAudio.volume * .04 > 0.10) {
        instancedMeshTrans[i].intensityTarget = myAudio.volume * .05 
      } else {
        instancedMeshTrans[i].intensityTarget = 0
      }
    }
    updateCanvas2D(true)

    setTimeout(()=>{
      if (Date.now() - lastBeatTime > 500) {
        updateCanvas2D(false)
        for (let i = 0; i < nbMirors; i++) {
          instancedMeshTrans[i].intensityTarget = 0
        }

      }
    }, 500)
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

  // mirorsInstancedMesh.translateY(0.5)
  mirorsInstancedMesh.translateY(6)
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
let targetSpeed = 3.
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
  
  // Wall 1
  const geometry = new THREE.PlaneGeometry( 17, 15, 30, 30)
  const meshReflector = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x1B3649}))
  meshReflector.translateY(4)
  meshReflector.translateX(8)
  meshReflector.translateZ(0.2)
  meshReflector.rotateY(-Math.PI/2)
  scene.add(meshReflector)

  // Reflectors Wall 1
  // const ReflectorOneWallOne = new THREE.Mesh(new THREE.PlaneGeometry( 7, 3, 10, 10), new THREE.MeshBasicMaterial({ color: 'red', side: 2}) )
  const ReflectorOneWallOne = new Reflector(
    new THREE.PlaneGeometry( 8, 3, 10, 10),
    {
      color: new THREE.Color(0x7f7f7f),
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
    }
  )
  ReflectorOneWallOne.rotateY(-Math.PI/2)
  ReflectorOneWallOne.translateZ(-7.9)
  ReflectorOneWallOne.translateX(-3)
  ReflectorOneWallOne.translateY(.2)

  const ReflectorTwoWallOne = new Reflector(
    new THREE.PlaneGeometry( 8, 3, 10, 10),
    {
      color: new THREE.Color(0x7f7f7f),
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
    }
  )
  ReflectorTwoWallOne.rotateY(-Math.PI/2)
  ReflectorTwoWallOne.translateZ(-7.9)
  ReflectorTwoWallOne.translateX(-3)
  ReflectorTwoWallOne.translateY(4)

  const ReflectorThreeWallOne = new Reflector(
    new THREE.PlaneGeometry( 8, 3, 10, 10),
    {
      color: new THREE.Color(0x7f7f7f),
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio,
    }
  )
  ReflectorThreeWallOne.rotateY(-Math.PI/2)
  ReflectorThreeWallOne.translateZ(-7.9)
  ReflectorThreeWallOne.translateX(-3)
  ReflectorThreeWallOne.translateY(7.9)

  scene.add(ReflectorOneWallOne, ReflectorTwoWallOne, ReflectorThreeWallOne)
}

const createWallThree = () => {
  console.log('Create Wall two ')
  
  // Wall 1
  const geometry = new THREE.PlaneGeometry( 17, 15, 30, 30)
  const meshReflector = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x1B3649}))
  meshReflector.translateY(4)
  meshReflector.translateX(-8)
  meshReflector.translateZ(0.2)
  meshReflector.rotateY(Math.PI/2)
  scene.add(meshReflector)

  // Light Wall 2
  const LightOneWallTwo = new THREE.Mesh(new THREE.PlaneGeometry( 10, 3, 10, 10), new THREE.MeshBasicMaterial({ color: 'black' , side: 2}) )
  LightOneWallTwo.rotateY(-Math.PI/2)
  LightOneWallTwo.rotateZ(Math.PI/2)
  LightOneWallTwo.translateZ(7.9)
  LightOneWallTwo.translateX(3.5)
  LightOneWallTwo.translateY(5.5)

  const LightTwoWallTwo = new THREE.Mesh(new THREE.PlaneGeometry( 10, 3, 10, 10), new THREE.MeshBasicMaterial({ color: 'black' , side: 2}) )
  // const LightTwoWallTwo = new Reflector(
  //   new THREE.PlaneGeometry( 10, 3, 10, 10),
  //   {
  //     color: new THREE.Color(0x7f7f7f),
  //     textureWidth: window.innerWidth * window.devicePixelRatio,
  //     textureHeight: window.innerHeight * window.devicePixelRatio,
  //   }
  // )
  LightTwoWallTwo.rotateY(-Math.PI/2)
  LightTwoWallTwo.rotateZ(Math.PI/2)
  LightTwoWallTwo.translateZ(7.9)
  LightTwoWallTwo.translateX(3.5)
  LightTwoWallTwo.translateY(1.8)

  const LightThreeWallTwo = new THREE.Mesh(new THREE.PlaneGeometry( 10, 3, 10, 10), new THREE.MeshBasicMaterial({ color: 'black' , side: 2}) )
  LightThreeWallTwo.rotateY(-Math.PI/2)
  LightThreeWallTwo.rotateZ(Math.PI/2)
  LightThreeWallTwo.translateZ(7.9)
  LightThreeWallTwo.translateX(3.5)
  LightThreeWallTwo.translateY(-1.6)

  scene.add(LightOneWallTwo, LightTwoWallTwo, LightThreeWallTwo)
}

import vertexWallShader from './webgl/shaders/wall/vert.glsl'
import fragmentWallShader from './webgl/shaders/wall/frag.glsl'
const nbSquareWall = 30
let materialWall = null
const canvas2D = document.createElement('canvas')
const ctx = canvas2D.getContext('2d')
let canvasTex = null

const createWallTwo = () => {
  canvas2D.width = 100
  canvas2D.height = 100

  // canvas2D.style.position = "absolute"
  // canvas2D.style.zIndex = "9999"
  // canvas2D.style.backgroundColor = "black"

  // document.querySelector('body').appendChild(canvas2D)

  // updateCanvas2D()

  const geometry =  new THREE.PlaneGeometry(16, 16, 12, 12)
  materialWall = new THREE.RawShaderMaterial({
    uniforms: {
      uTime: { value: clock.elapsedTime },
      uCanvasTex: { value: canvasTex },
      uIntencity: { value: .3 }
    },
    vertexShader: vertexWallShader,
    fragmentShader: fragmentWallShader,
    transparent: true,
    wireframe: false,
  })

  const wall = new THREE.Mesh( geometry, materialWall )
  wall.translateZ(-8.3)
  wall.translateY(3.5)
  scene.add(wall)
}

const updateCanvas2D = (isColor) => {
  ctx.clearRect(0, 0, canvas2D.width, canvas2D.height)
  for (let i = 0; i < 12; i++) {
    for (let j = 0; j < 12; j++) {
      if(Math.random()>.9){
        ctx.beginPath();
        const colorId = Math.floor(Math.random() * (palette.length - 0 + 1)) + 0;
        const width =  Math.floor(100/12)
        const height = Math.floor(100/12)
        ctx.rect(width*i, height*j, width, height);
        if(isColor){
          ctx.fillStyle = palette[colorId];
        } else {
          ctx.fillStyle = 'black';
        }
        ctx.fill();
      }
    }
  }
  canvasTex = new THREE.CanvasTexture(canvas2D)
  canvasTex.minFilter = THREE.NearestFilter
  canvasTex.magFilter = THREE.NearestFilter
}

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    mirorsInstancedMesh.rotation.y = elapsedTime * 0.2

    // Update floor sheaders
    if (materialF){
       materialF.uniforms.uTime.value = elapsedTime * 0.2
       materialF.uniforms.uSpeed.value = MathUtils.lerp(materialF.uniforms.uSpeed.value, targetSpeed, .5)
    }
    if (materialWall) materialWall.uniforms.uTime.value = elapsedTime * 0.2

    if (myAudio){
      myAudio.update()
      // targetSpeed = Math.round(myAudio.values[0])
      materialF.uniforms.uIntencity.value = MathUtils.lerp(materialF.uniforms.uIntencity.value, myAudio.values[2], .4)
      materialWall.uniforms.uIntencity.value = MathUtils.lerp(materialWall.uniforms.uIntencity.value, myAudio.values[0] * 0.5, .4)
      materialWall.uniforms.uCanvasTex.value = canvasTex

      for (let i = 0; i < nbMirors; i++) {
        instancedMeshTrans[i].intensity = MathUtils.lerp(instancedMeshTrans[i].intensity, instancedMeshTrans[i].intensityTarget, .4)
      }

      updateDiscoBall()
    } 

    currentPosBal = MathUtils.lerp(currentPosBal, targetPosBal, .01)
    mirorsInstancedMesh.position.y = currentPosBal

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
// addEnvMap() 
addLight()
createFloor()
createWallOne()
createWallTwo()
createWallThree()
// createSphereCustomMat()
createDiscoBall()
tick()