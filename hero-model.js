import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const container = document.getElementById("modelContainer");

if (container) {
  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100,
  );
  camera.position.set(1, 1.4, 3);
  camera.lookAt(0, 1, 0);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2.2);
  hemiLight.position.set(0, 20, 0);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 2.2);
  dirLight.position.set(-2, 6, 4);
  scene.add(dirLight);

  let mixer = null;
  const clock = new THREE.Clock();

  const loader = new GLTFLoader();
  loader.load(
    "assets/models/Soldier.glb",
    (gltf) => {
      const model = gltf.scene;

      model.scale.set(1, 1, 1);
      model.position.set(0, 0, 0);

      model.rotation.y = Math.PI;

      scene.add(model);

      const walkClip =
        gltf.animations.find((clip) =>
          clip.name.toLowerCase().includes("walk"),
        ) || gltf.animations[0];

      if (walkClip) {
        mixer = new THREE.AnimationMixer(model);
        const action = mixer.clipAction(walkClip);
        action.play();
      }
    },
    undefined,
    (error) => {
      console.error("Failed to load hero model:", error);
    },
  );

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    renderer.render(scene, camera);
  }
  animate();

  function handleResize() {
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (width === 0 || height === 0) return;

    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", handleResize);
}
