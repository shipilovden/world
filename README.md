# 🌍 DEN WORLD

**Расширяемый 3D-мир** на базе [React Three Fiber](https://docs.pmnd.rs/react-three-fiber), [Tweakpane](https://cocopon.github.io/tweakpane/) и [Three.js](https://threejs.org/).  
Этот проект — чистая сцена с возможностью интерактивной настройки параметров в реальном времени.

> 🔗 Актуальное демо:  
> https://denworld.vercel.app/

---

## 📸 Скриншоты

### Главная сцена  
![Главная сцена](public/screenshots/denworld_1.png)

### Интерфейс Tweakpane  
![Интерфейс Tweakpane](public/screenshots/denworld_2.png)

---

## ⚙️ Установка и запуск (PowerShell / Windows)

### 📦 Клонирование репозитория

```powershell
git clone https://github.com/shipilovden/world.git
cd world
📁 Установка зависимостей
powershell

npm install
или (если используешь Yarn):

powershell

yarn install
🚀 Запуск проекта
powershell

npm run dev
После запуска открой в браузере:

http://localhost:5173
🔧 Используемые технологии
React Three Fiber — рендеринг 3D-сцены

Three.js — базовый WebGL-рендеринг

Tweakpane — UI для интерактивных настроек

Cannon-es — физика

Vite — современная сборка проекта

🧠 Возможности
Реалистичная 3D-сцена

Панель настроек с параметрами:

Цвет, прозрачность, металличность, нормали, высота

Загрузка текстур: Base, Normal, Roughness, AO, Metalness, Height

Масштаб и смещение текстур (UV)

Flip X / Flip Y

Кнопка Reset (внизу панели)

Прокрутка панели, адаптированная под любой экран

Стартовый экран с кнопкой Start

🙏 Благодарности
Проект основан на:

📦 https://github.com/tamani-coding/threejs-character-controls-example
Автор: @tamani-coding