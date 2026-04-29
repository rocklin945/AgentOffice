import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const officeModelPath = '/models/office-scene/isometric_office.glb';

const staffMarkers = [
  { id: 'product', name: '产品经理', status: '思考中', color: '#667085', left: '43%', top: '28%' },
  { id: 'dev', name: '开发工程师', status: '编码中', color: '#22c55e', left: '67%', top: '40%' },
  { id: 'test', name: '测试工程师', status: '测试中', color: '#10b981', left: '28%', top: '61%' },
  { id: 'ops', name: '运维工程师', status: '部署中', color: '#6366f1', left: '55%', top: '69%' },
];

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
  model.scale.setScalar(11.8 / maxAxis);

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

function frameCamera(camera, controls, object, viewportRatio) {
  const bounds = new THREE.Box3().setFromObject(object);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  bounds.getSize(size);
  bounds.getCenter(center);

  const maxAxis = Math.max(size.x, size.z, size.y * 1.65);
  const direction = new THREE.Vector3(1.05, 0.82, 1).normalize();
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const distance = (maxAxis / (2 * Math.tan(fov / 2))) * (viewportRatio > 1.8 ? 0.78 : 0.92);

  const target = new THREE.Vector3(center.x - size.x * (-0.15), center.y + size.y * (-0.65), center.z - size.z * 0.11);
  camera.position.copy(target).add(direction.multiplyScalar(distance));
  camera.near = 0.01;
  camera.far = distance * 8;
  camera.lookAt(target);
  camera.updateProjectionMatrix();

  controls.target.copy(target);
  controls.minDistance = distance * 0.35;
  controls.maxDistance = distance * 2.2;
  controls.update();
}

function OfficeLabels() {
  return (
    <>
      {staffMarkers.map((marker) => (
        <button
          key={marker.id}
          type="button"
          className="absolute min-w-[108px] -translate-x-1/2 rounded-[14px] bg-[rgba(17,24,39,0.86)] px-4 py-2 text-center text-white shadow-[0_16px_30px_rgba(15,23,42,0.25)] backdrop-blur transition hover:-translate-y-0.5"
          style={{ left: marker.left, top: marker.top }}
        >
          <div className="text-[13px] font-semibold leading-5">{marker.name}</div>
          <div className="mt-1 inline-flex rounded-full px-3 py-1 text-[12px] font-semibold" style={{ backgroundColor: marker.color }}>
            {marker.status}
          </div>
        </button>
      ))}
      <div className="absolute left-[74%] top-[53%] rounded-[16px] border border-[#8ab4ff]/60 bg-[rgba(20,31,48,0.82)] px-5 py-4 text-center text-white shadow-[0_18px_34px_rgba(15,23,42,0.24)] backdrop-blur">
        <div className="text-[15px] font-semibold">空闲工位</div>
        <button type="button" className="mt-2 rounded-full bg-white/10 px-4 py-2 text-[13px] font-medium">
          + 创建员工
        </button>
      </div>
    </>
  );
}

export default function HomeOfficeThreeScene() {
  const mountRef = useRef(null);
  const stateRef = useRef(null);
  const [musicOn, setMusicOn] = useState(true);
  const [loaded, setLoaded] = useState(false);

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
        frameCamera(camera, controls, model, mount.clientWidth / Math.max(mount.clientHeight, 1));
        stateRef.current = { model, scene, renderer, camera, controls };
        setLoaded(true);
      },
      undefined,
      (error) => {
        console.error('Office GLB failed to load:', error);
      },
    );

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

  const resetView = () => {
    const current = stateRef.current;
    if (!current?.model) return;
    frameCamera(
      current.camera,
      current.controls,
      current.model,
      mountRef.current.clientWidth / Math.max(mountRef.current.clientHeight, 1),
    );
  };

  return (
    <div className="relative z-10 -mt-24 h-[600px] overflow-visible bg-transparent pt-24">
      <div ref={mountRef} className="absolute -inset-x-32 -top-40 -bottom-24 cursor-grab active:cursor-grabbing" />
      {loaded ? <OfficeLabels /> : null}
      {!loaded ? (
        <div className="absolute inset-0 flex items-center justify-center text-[14px] font-medium text-[#66758f]">
          正在加载办公室模型...
        </div>
      ) : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
        <div className="pointer-events-auto flex items-center gap-3">
          <button
            type="button"
            onClick={resetView}
            className="rounded-full bg-white/92 px-4 py-2 text-[13px] font-medium text-[#42526e] shadow-sm backdrop-blur"
          >
            办公室视图
          </button>
          <button
            type="button"
            onClick={() => setMusicOn((current) => !current)}
            className="rounded-full bg-white/92 px-4 py-2 text-[13px] font-medium text-[#42526e] shadow-sm backdrop-blur"
          >
            音乐: {musicOn ? '开' : '关'}
          </button>
          <button type="button" onClick={resetView} className="rounded-full bg-white/92 px-4 py-2 text-[13px] font-medium text-[#42526e] shadow-sm backdrop-blur">
            重置视角
          </button>
        </div>
      </div>
    </div>
  );
}
