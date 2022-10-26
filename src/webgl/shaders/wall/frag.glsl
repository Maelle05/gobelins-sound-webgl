precision highp float;

uniform float uTime;
uniform sampler2D uCanvasTex;
uniform float uIntencity;

varying vec2 vUv;

void main() {
  vec4 canvas = texture2D( uCanvasTex,vUv );

  gl_FragColor = vec4(vec3(canvas.rgb), uIntencity);
}
