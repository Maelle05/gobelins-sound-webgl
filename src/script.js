import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as dat from 'lil-gui'

/**
 * Base
 */
let canvas = null
let scene = null
let sizes = null
let camera = null
let controls = null
let renderer = null


// Debug
const gui = new dat.GUI()

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

  // Controls
  controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas
  })
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
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

const createDiscoBall = () => {
  console.log('Disco Mirors 🪩')

  const geometry = new THREE.PlaneGeometry( .2, .2)
  const material = new THREE.MeshPhysicalMaterial({ 
    color: 0xf0f0f0,
    side: 1,
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

    const x = (r * Math.cos(theta)) * Math.cos(0)
    const y = (r * Math.cos(theta)) * Math.sin(0)
    const z = r * Math.sin(theta)
    
    dummy.position.set(x, y + phi, z);
    dummy.lookAt(0,0,0);
    dummy.updateMatrix();

    mirorsInstancedMesh.setMatrixAt( i++, dummy.matrix );
  }


  scene.add(mirorsInstancedMesh)

}

// Flor
import { Reflector } from 'three/examples/jsm/objects/Reflector'
const createFloor = () => {
  console.log('Create Flor')
  const geometry = new THREE.CircleGeometry( 5, 32)

  const mesh = new Reflector(
    geometry,
    {
      color: new THREE.Color(0x7f7f7f),
      textureWidth: window.innerWidth * window.devicePixelRatio,
      textureHeight: window.innerHeight * window.devicePixelRatio
    }
  )
  mesh.rotateX( - Math.PI / 2)
  mesh.position.y = -1.3

  scene.add(mesh)
}

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // mirorsInstancedMesh.rotateY(elapsedTime * 0.01)

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

initWebgl()
// addEnvMap()
addLight()
createFloor()
// createSphereCustomMat()
createDiscoBall()
tick()