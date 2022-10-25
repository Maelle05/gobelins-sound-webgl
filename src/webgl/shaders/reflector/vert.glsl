uniform mat4 textureMatrix;

uniform float uTime;

varying vec4 vUv;

void main() {
  vec3 pos = position;

  vUv = textureMatrix * vec4( pos, 1.0 );
  gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );

}