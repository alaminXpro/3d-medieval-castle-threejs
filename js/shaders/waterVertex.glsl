uniform float uTime;
varying vec2 vUv;
varying float vWave;

void main() {
  vUv = uv;

  vec3 newPosition = position;

  float wave1 = sin(position.x * 0.8 + uTime) * 0.08;
  float wave2 = cos(position.y * 0.8 + uTime) * 0.05;

  newPosition.z += wave1 + wave2;
  vWave = wave1 + wave2;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
