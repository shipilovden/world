// src/CharacterControls.js
import * as THREE from 'three';
import { DIRECTIONS, W, A, S, D } from './utils/keys';

export class CharacterControls {
  constructor(model, mixer, animationsMap, orbitControl, camera, currentAction) {
    this.model = model;
    this.mixer = mixer;
    this.animationsMap = animationsMap;
    this.orbitControl = orbitControl;
    this.camera = camera;
    this.currentAction = currentAction;
    this.toggleRun = false; // Изменено с true на false - теперь ходьба по умолчанию

    // Set initial animation
    this.animationsMap.forEach((action, name) => {
      if (name === currentAction) action.play();
    });

    // Movement
    this.walkDirection = new THREE.Vector3();
    this.rotateAngle = new THREE.Vector3(0, 1, 0);
    this.rotateQuaternion = new THREE.Quaternion();
    this.cameraTarget = new THREE.Vector3();

    this.fadeDuration = 0.2;
    this.runVelocity = 2.5;
    this.walkVelocity = 1;

    this.updateCameraTarget(0, 0);
  }

  switchRunToggle() {
    this.toggleRun = !this.toggleRun;
  }

  update(delta, keysPressed) {
    const directionPressed = DIRECTIONS.some((key) => keysPressed[key]);

    let action = 'Idle';
    if (directionPressed && this.toggleRun) {
      action = 'Run';
    } else if (directionPressed) {
      action = 'Walk';
    }

    if (this.currentAction !== action) {
      const toPlay = this.animationsMap.get(action);
      const current = this.animationsMap.get(this.currentAction);

      current?.fadeOut(this.fadeDuration);
      toPlay?.reset().fadeIn(this.fadeDuration).play();
      
      // Устанавливаем скорость анимации
      if (action === 'Run') {
        toPlay.setEffectiveTimeScale(0.5); // Замедляем анимацию бега
      } else if (action === 'Walk') {
        toPlay.setEffectiveTimeScale(0.5); // Замедляем анимацию ходьбы
      } else {
        toPlay.setEffectiveTimeScale(1.0); // Обычная скорость для Idle
      }
      
      this.currentAction = action;
    }

    this.mixer.update(delta);

    if (action === 'Walk' || action === 'Run') {
      const angleY = Math.atan2(
        this.camera.position.x - this.model.position.x,
        this.camera.position.z - this.model.position.z
      );

      const directionOffset = this.getDirectionOffset(keysPressed);

      this.rotateQuaternion.setFromAxisAngle(this.rotateAngle, angleY + directionOffset);
      this.model.quaternion.rotateTowards(this.rotateQuaternion, 0.2);

      this.camera.getWorldDirection(this.walkDirection);
      this.walkDirection.y = 0;
      this.walkDirection.normalize();
      this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset);

      const velocity = action === 'Run' ? this.runVelocity : this.walkVelocity;
      const moveX = this.walkDirection.x * velocity * delta;
      const moveZ = this.walkDirection.z * velocity * delta;

      this.model.position.x += moveX;
      this.model.position.z += moveZ;

      this.updateCameraTarget(moveX, moveZ);
    }
  }

  updateCameraTarget(moveX, moveZ) {
    this.camera.position.x += moveX;
    this.camera.position.z += moveZ;

    this.cameraTarget.copy(this.model.position);
    this.cameraTarget.y += 1;
    this.orbitControl.target.lerp(this.cameraTarget, 0.2);
  }

  getDirectionOffset(keysPressed) {
    if (keysPressed[W]) {
      if (keysPressed[A]) return Math.PI / 4;
      if (keysPressed[D]) return -Math.PI / 4;
      return 0;
    }
    if (keysPressed[S]) {
      if (keysPressed[A]) return Math.PI / 4 + Math.PI / 2;
      if (keysPressed[D]) return -Math.PI / 4 - Math.PI / 2;
      return Math.PI;
    }
    if (keysPressed[A]) return Math.PI / 2;
    if (keysPressed[D]) return -Math.PI / 2;
    return 0;
  }
}
