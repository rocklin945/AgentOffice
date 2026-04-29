import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const officeModelPath = '/models/office-scene/isometric_office.glb';
const modelFitSize = 11.8;
const cameraDistanceScale = 1.18;
const initialCameraPosition = new THREE.Vector3(15.587, 8.349, 16.461);
const initialControlsTarget = new THREE.Vector3(0.426, -0.433, -1.29);

function fitOfficeModel(model) {
  const bounds = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  bounds.getSize(size);
  bounds.getCenter(center);

  model.position.sub(center);
  model.updateMatrixWorld(true);

  const normalizedBounds = new THREE.Box3().setFromObject(model);
  model.position.y -= normalizedBounds.min.y;
  model.position.x -= size.x * 0.05;
  model.position.z -= size.z * 0.08;

  const maxAxis = Math.max(size.x, size.y, size.z) || 1;
  model.scale.setScalar(modelFitSize / maxAxis);

  model.traverse((object) => {
    if (!object.isMesh) return;
    object.castShadow = true;
    object.receiveShadow = true;
    if (object.material) {
      object.material.side = THREE.FrontSide;
      object.material.needsUpdate = true;
    }
  });
}

function applyInitialView(camera, controls) {
  camera.position.copy(initialCameraPosition);
  camera.near = 0.01;
  camera.far = camera.position.distanceTo(initialControlsTarget) * 8;
  camera.lookAt(initialControlsTarget);
  camera.updateProjectionMatrix();

  controls.target.copy(initialControlsTarget);
  controls.minDistance = 7.332;
  controls.maxDistance = 46.09;
  controls.update();
}

function logOfficeSceneParams(label, model, camera, controls) {
  const bounds = new THREE.Box3().setFromObject(model);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  bounds.getSize(size);
  bounds.getCenter(center);

  const round = (value) => Number(value.toFixed(3));
  const vector = (item) => ({
    x: round(item.x),
    y: round(item.y),
    z: round(item.z),
  });

  console.log(`[HomeOfficeThreeScene] ${label}`, {
    modelFitSize,
    cameraDistanceScale,
    model: {
      position: vector(model.position),
      rotation: {
        x: round(model.rotation.x),
        y: round(model.rotation.y),
        z: round(model.rotation.z),
      },
      scale: vector(model.scale),
    },
    camera: {
      position: vector(camera.position),
      fov: round(camera.fov),
      distanceToTarget: round(camera.position.distanceTo(controls.target)),
    },
    controls: {
      target: vector(controls.target),
      minDistance: round(controls.minDistance),
      maxDistance: round(controls.maxDistance),
    },
    bounds: {
      center: vector(center),
      size: vector(size),
      min: vector(bounds.min),
      max: vector(bounds.max),
    },
  });
}

export default function HomeOfficeThreeScene() {
  const mountRef = useRef(null);
  const stateRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    let disposed = false;
    let frameId = 0;

    const scene = new THREE.Scene();
    scene.background = null;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 1000);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.rotateSpeed = 0.55;
    controls.zoomSpeed = 0.85;
    controls.minPolarAngle = 0.2;
    controls.maxPolarAngle = 1.35;

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const hemi = new THREE.HemisphereLight(0xcfe8ff, 0x9ca3af, 0.9);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 2.4);
    sun.position.set(5, 8, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    scene.add(sun);

    const resize = () => {
      const width = mount.clientWidth || 1;
      const height = mount.clientHeight || 1;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

    };

    resize();
    window.addEventListener('resize', resize);

    const loader = new GLTFLoader();
    loader.load(
      officeModelPath,
      (gltf) => {
        if (disposed) return;
        const model = gltf.scene;
        fitOfficeModel(model);
        scene.add(model);
        applyInitialView(camera, controls);
        stateRef.current = { model, scene, renderer, camera, controls };
        logOfficeSceneParams('loaded', model, camera, controls);
      },
      undefined,
      (error) => {
        console.error('Office GLB failed to load:', error);
      },
    );

    const logAfterInteraction = () => {
      const current = stateRef.current;
      if (!current?.model) return;
      logOfficeSceneParams('interaction-end', current.model, current.camera, current.controls);
    };
    controls.addEventListener('end', logAfterInteraction);

    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      controls.removeEventListener('end', logAfterInteraction);
      controls.dispose();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) object.material.forEach((item) => item.dispose());
          else object.material.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
      stateRef.current = null;
    };
  }, []);

  return (
    <div className="relative z-10 -mt-24 h-[600px] overflow-visible bg-transparent pt-24">
      <div ref={mountRef} className="absolute -inset-x-32 -top-40 -bottom-24 cursor-grab active:cursor-grabbing" />
    </div>
  );
}
