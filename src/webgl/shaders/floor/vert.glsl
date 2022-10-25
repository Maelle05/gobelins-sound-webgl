precision highp float;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

uniform float uTime;
uniform float uIntencity;
uniform float uWaves;
uniform float uSpeed;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;
varying vec3 vPos;
varying float vDist;

void main() {
  vUv = uv;
   
  vec3 pos = position;
  float intencity = uIntencity;
  float nbWaves = uWaves;

  float distance = length(vUv - .5) * 4.;

  pos.z = cos(distance * nbWaves - (uTime * uSpeed) ) * sin(distance * nbWaves - (uTime * uSpeed) ) * intencity;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );

  vPos = pos;
  vDist = distance;
}
