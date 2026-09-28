uniform sampler2D uWaterTexture;
varying vec2 vUv;
varying float vWave;

void main() {
  vec3 textureColor = texture2D(uWaterTexture, vUv).rgb;

  float brightness = 0.85 + vWave * 1.5;
  vec3 finalColor = textureColor * brightness;

  gl_FragColor = vec4(finalColor, 0.92);
}
