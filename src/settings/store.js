// src/settings/store.js
import * as THREE from "three";

const store = {
  // === GRID ===
  grid: {
    showSmall: true,
    showMedium: true,
    showLarge: true,
    opacitySmall: 0.3,
    opacityMedium: 0.6,
    opacityLarge: 0.8,
    colorSmall: "#888888",
    colorMedium: "#ff0000",
    colorLarge: "#0000ff",

    enabled: true,
    cellSize: 0.5,
    cellThickness: 0.5,
    cellColor: "#6f6f6f",
    sectionSize: 1,
    sectionThickness: 1,
    sectionColor: "#2080ff",
    fadeDistance: 50,
    fadeStrength: 1,
    fadeFrom: 1,
    infiniteGrid: false,
    followCamera: false,

    __needsUpdate: false,
  },

  // === GROUND ===
  ground: {
    color: "#ffffff",
    opacity: 1,
    roughness: 1,
    metalness: 0,
    aoMapIntensity: 1,
    normalScale: 1,
    displacementScale: 0,
    textureScaleX: 1,
    textureScaleY: 1,
    uvOffsetX: 0,
    uvOffsetY: 0,
    textureUrl: "",
    texture: null,
    normalMap: null,
    roughnessMap: null,
    aoMap: null,
    metalnessMap: null,
    heightMap: null,
    flipX: false,
    flipY: false,
    __needsUpdate: false,
  },

  // === SKY ===
  sky: {
    turbidity: 2,
    rayleigh: 1,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.8,
    elevation: 33,
    azimuth: 180,
    exposure: 0.5,
    backgroundColor: "#000000",
    environmentMap: null,
    environmentUrl: "",
    skyAlpha: 1.0,
    skyColor: "#87ceeb",
    __needsUpdate: false,
  },

  // === FOG ===
  fog: {
    fogEnabled: true,
    fogMode: "linear",
    fogDensity: 0.005,
    fogNear: 30,
    fogFar: 100,
    fogColor: "#f0f0f0",
    __needsUpdate: false,
  },

  // === SHADOWS ===
shadow: {
  enabled: true,               // чекбокс Enable Shadows
  type: "contact",             // 'contact' | 'ssao'
  opacity: 0.75,               // влияет на яркость тени и DirectionalLight.intensity
  blur: 2.5,                   // мягкость тени (ContactShadows + light.shadow.radius)
  distance: 30,                // область охвата DirectionalLight.shadow.camera
  color: "#000000",            // цвет тени (для всех источников)
  ssaoSamples: 32,             // качество SSAO
  ssaoRadius: 0.6,             // радиус размытия SSAO
  ssaoIntensity: 1.5,          // сила SSAO затемнения
  __needsUpdate: false,        // внутренний флаг для перерисовки
},


  // === VOXELS ===
  voxels: {
    items: [],
    selectedId: null,
    __needsUpdate: false,
  },

  voxel: {
    color: "#ffffff",
    opacity: 1,
    roughness: 1,
    metalness: 0,
    aoMapIntensity: 1,
    normalScale: 1,
    displacementScale: 0,
    textureScaleX: 1,
    textureScaleY: 1,
    uvOffsetX: 0,
    uvOffsetY: 0,
    size: 1,
    spacing: 0.1,
    gridWidth: 10,
    gridHeight: 10,
    gridDepth: 10,
    textureUrl: "",
    texture: null,
    normalMap: null,
    roughnessMap: null,
    aoMap: null,
    metalnessMap: null,
    heightMap: null,
    flipX: false,
    flipY: false,
    generateRandom: false,
    clearAll: false,
    __needsUpdate: false,
  },

  // === BROADCASTER ===
  broadcaster: {
    active: false,
    remove: false,
    play: false,
    pause: false,
    micEnabled: false,
    triggerUpload: false,
    url: "",
    currentTrack: "",
    volume: 0.5,
    distance: 10,
    mode: "translate",
    color: "#ff0000",
    size: 1,
    __needsUpdate: false,
  },

  // === VOXEL ACTIONS ===
  addVoxel() {
    const id = Date.now().toString();
    const uniformScale = 1;
    const voxel = {
      id,
      position: { x: 0, y: 0.5, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: uniformScale, y: uniformScale, z: uniformScale },
      uniformScale,
      color: "#ffffff",
      opacity: 1,
      roughness: 1,
      metalness: 0,
      aoMapIntensity: 1,
      normalScale: 1,
      displacementScale: 0.1,
      uvOffsetX: 0,
      uvOffsetY: 0,
      texture: null,
      textureUrl: "",
      normalMap: null,
      roughnessMap: null,
      aoMap: null,
      metalnessMap: null,
      heightMap: null,
      textureScaleX: 1,
      textureScaleY: 1,
      flipX: false,
      flipY: false,
    };
    this.voxels.items.push(voxel);
    this.voxels.selectedId = id;
    this.voxels.__needsUpdate = true;
  },

  removeVoxel(id) {
    this.voxels.items = this.voxels.items.filter((v) => v.id !== id);
    if (this.voxels.selectedId === id) {
      this.voxels.selectedId = this.voxels.items.length
        ? this.voxels.items[this.voxels.items.length - 1].id
        : null;
    }
    this.voxels.__needsUpdate = true;
  },

  updateVoxel(id, updates) {
    const voxel = this.voxels.items.find((v) => v.id === id);
    if (voxel) {
      Object.keys(updates).forEach((key) => {
        if (
          typeof updates[key] === "object" &&
          updates[key] !== null &&
          !updates[key].isTexture
        ) {
          voxel[key] = { ...voxel[key], ...updates[key] };
        } else {
          voxel[key] = updates[key];
        }
      });
      this.voxels.__needsUpdate = true;
    }
  },

  getSelectedVoxelId() {
    return this.voxels.selectedId;
  },

  selectVoxel(id) {
    this.voxels.selectedId = id;
  },

  deselectVoxel() {
    this.voxels.selectedId = null;
    this.voxels.__needsUpdate = true;
  },

  resetGround() {
    const defaultGround = {
      color: "#ffffff",
      opacity: 1,
      roughness: 1,
      metalness: 0,
      aoMapIntensity: 1,
      normalScale: 1,
      displacementScale: 0,
      textureScaleX: 1,
      textureScaleY: 1,
      uvOffsetX: 0,
      uvOffsetY: 0,
      textureUrl: "",
      flipX: false,
      flipY: false,
    };

    if (this.ground.texture) this.ground.texture.dispose();
    if (this.ground.normalMap) this.ground.normalMap.dispose();
    if (this.ground.roughnessMap) this.ground.roughnessMap.dispose();
    if (this.ground.aoMap) this.ground.aoMap.dispose();
    if (this.ground.metalnessMap) this.ground.metalnessMap.dispose();
    if (this.ground.heightMap) this.ground.heightMap.dispose();

    Object.assign(this.ground, defaultGround, {
      texture: null,
      normalMap: null,
      roughnessMap: null,
      aoMap: null,
      metalnessMap: null,
      heightMap: null,
      __needsUpdate: true,
    });
  },

  resetVoxel() {
    const defaultVoxel = {
      color: "#ffffff",
      opacity: 1,
      roughness: 1,
      metalness: 0,
      aoMapIntensity: 1,
      normalScale: 1,
      displacementScale: 0,
      textureScaleX: 1,
      textureScaleY: 1,
      uvOffsetX: 0,
      uvOffsetY: 0,
      size: 1,
      spacing: 0.1,
      gridWidth: 10,
      gridHeight: 10,
      gridDepth: 10,
      textureUrl: "",
      flipX: false,
      flipY: false,
      generateRandom: false,
      clearAll: false,
    };

    if (this.voxel.texture) this.voxel.texture.dispose();
    if (this.voxel.normalMap) this.voxel.normalMap.dispose();
    if (this.voxel.roughnessMap) this.voxel.roughnessMap.dispose();
    if (this.voxel.aoMap) this.voxel.aoMap.dispose();
    if (this.voxel.metalnessMap) this.voxel.metalnessMap.dispose();
    if (this.voxel.heightMap) this.voxel.heightMap.dispose();

    Object.assign(this.voxel, defaultVoxel, {
      texture: null,
      normalMap: null,
      roughnessMap: null,
      aoMap: null,
      metalnessMap: null,
      heightMap: null,
      __needsUpdate: true,
    });
  },
};

export default store;
