uniform sampler2D uMap;
uniform float uDaylight;
varying vec2 vUv;
void main() {
  vec3 color = texture2D(uMap, vUv).rgb;
  gl_FragColor = vec4(color * uDaylight, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
