uniform float uTime;
varying vec2 vUv;
void main() {
  vUv = uv;
  vec3 p = position;
  p.z += sin(uv.x * 8.0 - uTime * 3.0 + uv.y * 2.0) * uv.x * 0.19;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
