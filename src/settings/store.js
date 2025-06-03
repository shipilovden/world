const store = {
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
    __needsUpdate: false,
  },

  ground: {
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
    __needsUpdate: false,
  },

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

  fog: {
    fogEnabled: true,
    fogMode: "linear",
    fogDensity: 0.005,
    fogNear: 30,
    fogFar: 100,
    fogColor: "#f0f0f0",
    __needsUpdate: false,
  },

  voxels: {
    items: [],
    selectedId: null,
    __needsUpdate: false,
  },

  resetGround() {
    Object.assign(this.ground, {
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
      __needsUpdate: true,
    });
  },

  resetSky() {
    Object.assign(this.sky, {
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
      __needsUpdate: true,
    });

    if (this.sky.environmentMap) {
      this.sky.environmentMap.dispose();
      this.sky.environmentMap = null;
    }
  },

  resetFog() {
    Object.assign(this.fog, {
      fogEnabled: true,
      fogMode: "linear",
      fogDensity: 0.005,
      fogNear: 30,
      fogFar: 100,
      fogColor: "#f0f0f0",
      __needsUpdate: true,
    });
  },

  addVoxel() {
    const id = Date.now().toString();
    console.log("🧱 Воксель добавлен:", id);

    this.voxels.items.push({
      id,
      position: { x: 0, y: 0.5, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
      color: "#ffffff",
    });

    this.voxels.selectedId = id;
    this.voxels.__needsUpdate = true;
  },

  removeVoxel(id) {
    this.voxels.items = this.voxels.items.filter((v) => v.id !== id);

    if (this.voxels.selectedId === id) {
      this.voxels.selectedId = this.voxels.items.length > 0
        ? this.voxels.items[this.voxels.items.length - 1].id
        : null;
    }

    this.voxels.__needsUpdate = true;
  },

  updateVoxel(id, updates) {
    const voxel = this.voxels.items.find((v) => v.id === id);
    if (voxel) {
      Object.assign(voxel, updates);
      this.voxels.__needsUpdate = true;
    }
  },

  getSelectedVoxelId() {
    return this.voxels.selectedId;
  },

  deselectVoxel() {
    this.voxels.selectedId = null;
    this.voxels.__needsUpdate = true;
  },
};

export default store;
