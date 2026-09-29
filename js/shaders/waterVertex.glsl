uniform float uTime;
varying vec2 vUv;
varying float vWave;
void main() {
  vUv = position.xy * 0.13;
  vec3 p = position;
  float wave = sin(position.x * 0.8 + uTime) * 0.08 + cos(position.y * 0.8 + uTime) * 0.05;
  p.z += wave;
  vWave = wave;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
