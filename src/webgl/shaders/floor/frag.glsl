precision highp float;

varying vec2 vUv;
varying vec3 vPos;
varying float vDist;

void main() {
  vec3 blue = vec3(0.059,0.753,0.988);
  vec3 purple = vec3(0.482,0.114,0.686);
  vec3 pink = vec3(1.,0.184,0.725);

  vec3 color = vec3(0.);

  color = mix(pink , blue, vDist*.5);
  color = mix(vec3(.0), color, vPos.z);

  float dist = distance(vPos, vec3(0.));
  dist = 9. - dist;

  gl_FragColor = vec4(color, dist);
}
