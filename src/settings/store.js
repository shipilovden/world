// store.js — глобальное состояние через простую подписку

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

  resetGround() {
    this.ground.color = "#ffffff";
    this.ground.opacity = 1;
    this.ground.roughness = 1;
    this.ground.metalness = 0;
    this.ground.aoMapIntensity = 1;
    this.ground.normalScale = 1;
    this.ground.displacementScale = 0.1;
    this.ground.uvOffsetX = 0;
    this.ground.uvOffsetY = 0;
    this.ground.texture = null;
    this.ground.textureUrl = "";
    this.ground.normalMap = null;
    this.ground.roughnessMap = null;
    this.ground.aoMap = null;
    this.ground.metalnessMap = null;
    this.ground.heightMap = null;
    this.ground.textureScaleX = 1;
    this.ground.textureScaleY = 1;
    this.ground.flipX = false;
    this.ground.flipY = false;
    this.ground.__needsUpdate = true;
  },
};

export default store;