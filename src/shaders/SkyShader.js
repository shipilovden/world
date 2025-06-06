// src/shaders/SkyShader.js
import * as THREE from 'three';

export const SkyShader = {
  uniforms: {
    turbidity: { value: 2.0 },
    rayleigh: { value: 1.0 },
    mieCoefficient: { value: 0.005 },
    mieDirectionalG: { value: 0.8 },
    sunPosition: { value: new THREE.Vector3(0, 1, 0) },
    up: { value: new THREE.Vector3(0, 1, 0) }
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
    uniform vec3 up;
    varying vec3 vWorldPosition;

    const float pi = 3.141592653589793;
    const float n = 1.0003;
    const float N = 2.545e25;
    const float rayleighZenithLength = 8.4e3;
    const float mieZenithLength = 1.25e3;
    const vec3 lambda = vec3(680E-9, 550E-9, 450E-9);
    const vec3 K = vec3(0.686, 0.678, 0.666);
    const float v = 4.0;
    const float sunAngularDiameterCos = 0.999956676946448443553574619906976478926848692873900859324;

    vec3 totalRayleigh(vec3 lambda) {
      return (8.0 * pow(pi, 3.0) * pow(pow(n, 2.0) - 1.0, 2.0) * (6.0 + 3.0 * v)) / (3.0 * N * pow(lambda, vec3(4.0)) * (6.0 - 7.0 * v));
    }

    vec3 totalMie(vec3 lambda, vec3 K, float T) {
      float c = (0.2 * T) * 10e-18;
      return 0.434 * c * pi * pow((2.0 * pi) / lambda, vec3(v - 2.0)) * K;
    }

    float rayleighPhase(float cosTheta) {
      return (3.0 / (16.0 * pi)) * (1.0 + pow(cosTheta, 2.0));
    }

    float hgPhase(float cosTheta, float g) {
      float g2 = pow(g, 2.0);
      float inverse = 1.0 / pow(1.0 - 2.0 * g * cosTheta + g2, 1.5);
      return (1.0 / (4.0 * pi)) * ((1.0 - g2) * inverse);
    }

    float sunIntensity(float zenithAngleCos) {
      zenithAngleCos = clamp(zenithAngleCos, -1.0, 1.0);
      return 400000.0 * exp(-0.8 * pow(0.8 - zenithAngleCos, 0.4));
    }

    void main() {
      vec3 direction = normalize(vWorldPosition);
      
      // Optical length
      float zenithAngle = acos(max(0.0, dot(up, direction)));
      float inverse = 1.0 / (cos(zenithAngle) + 0.15 * pow(93.885 - ((zenithAngle * 180.0) / pi), -1.253));
      float sR = rayleighZenithLength * inverse;
      float sM = mieZenithLength * inverse;

      // Combined extinction factor
      vec3 Fex = exp(-(totalRayleigh(lambda) * sR + totalMie(lambda, K, turbidity) * sM));

      // Sun
      float sunfade = 1.0 - clamp(1.0 - exp((sunPosition.y / 450000.0)), 0.0, 1.0);
      float sunE = sunIntensity(dot(normalize(sunPosition), up)) * sunfade;
      vec3 sunColor = vec3(sunE);

      // Scattering
      float cosTheta = dot(direction, normalize(sunPosition));
      
      vec3 betaRTheta = totalRayleigh(lambda) * rayleighPhase(cosTheta * 0.5 + 0.5);
      vec3 betaMTheta = totalMie(lambda, K, turbidity) * hgPhase(cosTheta, mieDirectionalG);
      
      vec3 Lin = pow(sunE * ((betaRTheta + betaMTheta) / (totalRayleigh(lambda) + totalMie(lambda, K, turbidity))) * (1.0 - Fex), vec3(1.5));
      Lin *= mix(vec3(1.0), pow(sunColor * ((betaRTheta + betaMTheta) / (totalRayleigh(lambda) + totalMie(lambda, K, turbidity))) * Fex, vec3(1.0 / 2.0)), clamp(pow(1.0 - dot(up, normalize(sunPosition)), 5.0), 0.0, 1.0));

      // Composition + solar disc
      float sundisk = smoothstep(sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta);
      vec3 L0 = (sunColor * 19000.0 * Fex) * sundisk;

      vec3 texColor = (Lin + L0) * 0.04 + vec3(0.0, 0.0003, 0.00075);
      
      vec3 retColor = pow(texColor, vec3(1.0 / (1.2 + (1.2 * sunfade))));

      gl_FragColor = vec4(retColor, 1.0);
    }
  `
};
