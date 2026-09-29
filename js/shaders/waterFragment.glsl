uniform sampler2D uWaterTexture;
uniform float uTime;
uniform float uDaylight;
varying vec2 vUv;
varying float vWave;
void main() {
  vec2 flow = vUv + vec2(uTime * 0.012, sin(uTime * 0.15) * 0.025);
  vec3 color = texture2D(uWaterTexture, flow).rgb;
  float ripple = smoothstep(0.07, 0.13, vWave);
  color = mix(color, vec3(0.63, 0.88, 0.75), ripple * 0.55);
  gl_FragColor = vec4(color * uDaylight, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
