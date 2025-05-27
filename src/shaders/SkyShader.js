// src/shaders/SkyShader.js
import * as THREE from 'three';

export const SkyShader = {
  uniforms: {
    turbidity: { value: 2.0 },
    rayleigh: { value: 1.0 },
    mieCoefficient: { value: 0.005 },
    mieDirectionalG: { value: 0.8 },
    sunPosition: { value: new THREE.Vector3(0, 1, 0) }
  },
  vertexShader: `
    varying vec3 vWorldPosition;
    void main() {
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 sunPosition;
    uniform float rayleigh;
    uniform float turbidity;
    uniform float mieCoefficient;
    uniform float mieDirectionalG;
    varying vec3 vWorldPosition;

    const vec3 up = vec3(0.0, 1.0, 0.0);
    const float pi = 3.141592653589793;

    const float n = 1.0003;
    const float N = 2.545e25;
    const float rayleighZenithLength = 8.4e3;
    const float mieZenithLength = 1.25e3;
    const vec3 lambda = vec3(680E-9, 550E-9, 450E-9);
    const vec3 K = vec3(0.686, 0.678, 0.666);

    float RayleighPhase(float cosTheta) {
      return (3.0 / (16.0 * pi)) * (1.0 + pow(cosTheta, 2.0));
    }

    float MiePhase(float cosTheta, float g) {
      return (3.0 / (8.0 * pi)) * ((1.0 - g * g) * (1.0 + cosTheta * cosTheta)) /
             ((2.0 + g * g) * pow(1.0 + g * g - 2.0 * g * cosTheta, 1.5));
    }

    void main() {
      vec3 direction = normalize(vWorldPosition);
      float zenithAngle = acos(max(0.0, dot(up, direction)));
      float inverse = 1.0 / (cos(zenithAngle) + 0.15 * pow(93.885 - (zenithAngle * 180.0 / pi), -1.253));
      float sR = rayleighZenithLength * inverse;
      float sM = mieZenithLength * inverse;

      vec3 Fex = exp(-(K * sR + mieCoefficient * sM));
      float cosTheta = dot(direction, normalize(sunPosition));
      float rPhase = RayleighPhase(cosTheta);
      vec3 betaR = (3.0 / (16.0 * pi)) * rayleigh * pow(lambda, vec3(-4.0));
      float mPhase = MiePhase(cosTheta, mieDirectionalG);
      vec3 betaM = mieCoefficient * K;

      vec3 Lin = pow(1.0 - Fex, vec3(1.5)) * (betaR * rPhase + betaM * mPhase);
      Lin *= mix(vec3(1.0), pow(1.0 - direction.y, vec3(5.0)), 0.5);

      vec3 L0 = 0.1 * Fex;
      vec3 texColor = Lin + L0;
      texColor = pow(texColor, vec3(1.0 / (1.2 + (1.2 * (1.0 - direction.y)))));

      gl_FragColor = vec4(texColor, 1.0);
    }
  `
};
