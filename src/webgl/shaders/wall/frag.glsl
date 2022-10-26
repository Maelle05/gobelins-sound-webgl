precision highp float;

varying vec3 vPosition;
varying vec2 vUv;

void main() {
  vec3 blue = vec3(0.059,0.753,0.988);
  vec3 purple = vec3(0.482,0.114,0.686);
  vec3 pink = vec3(1.,0.184,0.725);

  vec3 color = vec3(vPosition.x, vPosition.y, vPosition.x);
  
  if(sin(vPosition.x * 2.3)  > 0.){
    color = pink;
    if(sin(vPosition.y * 2.3)  > 0.){
      color = blue;
    }
  } else {
    color = blue;
    if(sin(vPosition.y * 2.3)  > 0.){
      color = pink;
    }
  }


  gl_FragColor = vec4(color, .9);
}
