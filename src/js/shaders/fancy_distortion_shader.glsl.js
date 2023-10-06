import Engine from "..";
import simplexNoise from "./simplexNoise.glsl";
import perlinNoise from "./perlinNoise.glsl";
const VERTEX_SHADER = /*glsl*/ `
${simplexNoise}
${perlinNoise}
varying float noiseSeed;
varying vec2 vUv;
void main () {
  vec4 nposition = vec4(position, 1.0);
  float rawNoise = 1. -abs(staticFractalNoise(uv));
//   noiseSeed = cnoise(nposition.xyz + uTime);
  nposition.z -= rawNoise;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * nposition;
}
`;

const FRAGMENT_SHADER = /*glsl*/ `
${simplexNoise}
varying float noiseSeed;
varying vec2 vUv;
uniform bool renderNoise;
void main () {
    vec3 baseColor = vec3(0.3, 0.2, 0.1);  // Dark brown for lower areas
    vec3 midColor = vec3(0.5, 0.3, 0.2);
    // vec3 tipColor = vec3(0.8, 0.8, .8);
    // // vec3 color = mix(color2, color1, noiseSeed);
    // // gl_FragColor = vec4(color, 1.0);
    float noiseValue = 1. -abs(staticFractalNoise(vUv));

    vec3 colorMixA = mix(midColor, baseColor, noiseValue);
    // vec3 color = mix(colorMixA, mix(midColor, vec3(1.0, 1.0, 1.0), noiseValue), noiseValue);
    if (renderNoise) {
       gl_FragColor = vec4(colorMixA,1.0);
      
    } else {
       gl_FragColor = vec4(vec3(0.0, 1.0, 1.0),1.0);
    }
}
`;
export default new Engine.THREE.ShaderMaterial({
  vertexShader: VERTEX_SHADER,
  fragmentShader: FRAGMENT_SHADER,
  uniforms: {
    uTime: { value: Engine._clock.getElapsedTime() },
    renderNoise: { value: false },
  },
  side: Engine.THREE.DoubleSide,
  wireframe : true,
});
