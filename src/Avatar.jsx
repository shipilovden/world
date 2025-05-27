// Импорты из React и @react-three
import React, { useEffect, useRef, useState } from 'react';
import { useGLTF, useAnimations, OrbitControls } from '@react-three/drei';
import { useBox } from '@react-three/cannon';
import { useThree, useFrame } from '@react-three/fiber';
import { CharacterControls } from './CharacterControls';
import { DIRECTIONS } from './utils/keys';export default function Avatar({ joystickDir }) {
  // Реф для анимационной группы
  const group = useRef();  // Состояние для отслеживания нажатых клавиш
  const [keysPressed, setKeysPressed] = useState({});  // Состояние для режима бега
  const [isRunMode, setIsRunMode] = useState(false);  // Состояние для режима следования камеры
  const [cameraFollowMode, setCameraFollowMode] = useState(false);  // Получаем доступ к камере и орбитальному контролю
  const { camera } = useThree();
  const orbitControlsRef = useRef();  // Реф для контроллера персонажа
  const characterControlsRef = useRef();  // Загружаем GLTF модель и анимации
  const { scene, animations } = useGLTF('/models/Soldier.glb');  // Подключаем анимации к нужной группе
  const { actions, names, mixer } = useAnimations(animations, group);  // Добавляем физическую коробку (коллизию) вокруг модели
  const [ref] = useBox(() => ({
    mass: 1,                  // Вес тела
    position: [0, 1, 0],      // Начальная позиция
    args: [1, 2, 1],          // Размеры коллизии (ширина, высота, глубина)
  }));  // Обработчики клавиатуры
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

  // Переключение режима бега по нажатию Shift
  if (key === 'shift' && !keysPressed['shift']) {
    setIsRunMode(prev => !prev);
    if (characterControlsRef.current) {
      characterControlsRef.current.switchRunToggle();
    }
  }
  
  // Переключение режима следования камеры по нажатию R
  if (key === 'r') {
    setCameraFollowMode(prev => !prev);
  }
  
  setKeysPressed((prev) => ({ ...prev, [key]: true }));
};

const handleKeyUp = (e) => {
  setKeysPressed((prev) => ({ ...prev, [e.key.toLowerCase()]: false }));
};

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);

return () => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
};

  }, [keysPressed]);  // Запускаем Idle-анимацию и настраиваем тени
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;      // Разрешаем отбрасывать тени
        child.receiveShadow = true;   // Разрешаем получать тени
      }
    });

if (names.length > 0) {
  console.log('🎮 Доступные анимации:', names);
  console.log('🧩 Анимации-объекты:', actions);
  
  // Создаем карту анимаций для контроллера
  const animationsMap = new Map();
  
  // Проверяем наличие нужных анимаций
  if (names.includes('Idle')) animationsMap.set('Idle', actions['Idle']);
  if (names.includes('Walk')) animationsMap.set('Walk', actions['Walk']);
  if (names.includes('Run')) animationsMap.set('Run', actions['Run']);
  
  // Если нет точных совпадений, используем первую анимацию как Idle
  if (animationsMap.size === 0 && names.length > 0) {
    animationsMap.set('Idle', actions[names[0]]);
  }
  
  // Находим OrbitControls в сцене
  const orbitControl = orbitControlsRef.current;
  
  // Инициализируем контроллер персонажа
  if (mixer && animationsMap.size > 0) {
    characterControlsRef.current = new CharacterControls(
      scene,
      mixer,
      animationsMap,
      orbitControl,
      camera,
      'Idle'
    );
  }
}

  }, [scene, actions, names, mixer, camera]);  // Обновляем контроллер персонажа в каждом кадре
  useFrame((state, delta) => {
    if (characterControlsRef.current) {
      characterControlsRef.current.update(delta, keysPressed);
    }

// Обновляем позицию камеры в режиме следования
if (cameraFollowMode && ref.current && characterControlsRef.current) {
  // Получаем текущую позицию аватара
  const avatarPosition = ref.current.position;
  
  // Получаем направление движения из контроллера персонажа
  const direction = characterControlsRef.current.walkDirection;
  
  // Расстояние позади аватара
  const distance = 5;
  // Высота камеры относительно аватара
  const height = 2;
  
  // Вычисляем позицию камеры позади аватара
  const cameraPosition = {
    x: avatarPosition.x - direction.x * distance,
    y: avatarPosition.y + height,
    z: avatarPosition.z - direction.z * distance
  };
  
  // Плавно перемещаем камеру в нужную позицию
  camera.position.lerp(cameraPosition, 0.05);
  
  // Направляем камеру на аватара
  const targetPosition = {
    x: avatarPosition.x,
    y: avatarPosition.y + 1,
    z: avatarPosition.z
  };
  
  // Обновляем цель OrbitControls
  if (orbitControlsRef.current) {
    orbitControlsRef.current.target.set(targetPosition.x, targetPosition.y, targetPosition.z);
  }
  
  // Смотрим на аватара
  camera.lookAt(targetPosition.x, targetPosition.y, targetPosition.z);
}

  });  // Добавьте этот useEffect:
  useEffect(() => {
    if (!joystickDir) {
      setKeysPressed((prev) => ({ ...prev, w: false, a: false, s: false, d: false }));
      return;
    }
    // Преобразуем направление джойстика в клавиши
    const dirMap = {
      FORWARD: { w: true },
      BACKWARD: { s: true },
      LEFT: { a: true },
      RIGHT: { d: true },
    };
    // Сброс всех и установка нужного направления
    setKeysPressed((prev) => ({
      w: !!dirMap[joystickDir]?.w,
      a: !!dirMap[joystickDir]?.a,
      s: !!dirMap[joystickDir]?.s,
      d: !!dirMap[joystickDir]?.d,
      shift: prev.shift, // не сбрасываем shift
    }));
  }, [joystickDir]);

  return (
    <>
      <OrbitControls
        ref={orbitControlsRef}
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
      />
      <group ref={ref}>
        {/* Вложенная группа для привязки анимаций */}
        <group ref={group} position={[0, -1, 0]}>
          <primitive object={scene} scale={1} />
        </group>
      </group>
    </>
  );
}

