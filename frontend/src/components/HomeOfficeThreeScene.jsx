import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const staffMarkers = [
  { id: 'product', name: '产品经理', status: '思考中', color: '#667085', left: '46%', top: '27%' },
  { id: 'dev', name: '开发工程师', status: '编码中', color: '#22c55e', left: '68%', top: '38%' },
  { id: 'test', name: '测试工程师', status: '测试中', color: '#10b981', left: '29%', top: '60%' },
  { id: 'ops', name: '运维工程师', status: '部署中', color: '#6366f1', left: '56%', top: '68%' },
];

const cameraViews = [
  { position: [8.8, 6.1, 8.1], fov: 37 },
  { position: [0, 8.4, 8.4], fov: 40 },
  { position: [-8.4, 6.0, 7.6], fov: 38 },
];

function material(color, options = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.02, ...options });
}

function box(size, color, position, options = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material(color, options.material));
  mesh.position.set(...position);
  if (options.rotation) mesh.rotation.set(...options.rotation);
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  return mesh;
}

function cylinder(radiusTop, radiusBottom, height, color, position, segments = 18) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments), material(color));
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function addWindow(group, x, z, width, side = 'back') {
  const frame = box([width + 0.16, 1.42, 0.1], '#25334a', [x, 1.75, z], { castShadow: false });
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(width, 1.18),
    new THREE.MeshStandardMaterial({
      color: '#8bd1ff',
      emissive: '#2f8ee8',
      emissiveIntensity: 0.35,
      roughness: 0.18,
      metalness: 0.1,
    }),
  );
  glass.position.set(x, 1.75, side === 'back' ? z + 0.06 : z);

  if (side === 'left') {
    frame.rotation.y = Math.PI / 2;
    glass.rotation.y = Math.PI / 2;
    glass.position.set(x + 0.06, 1.75, z);
  }
  if (side === 'right') {
    frame.rotation.y = Math.PI / 2;
    glass.rotation.y = -Math.PI / 2;
    glass.position.set(x - 0.06, 1.75, z);
  }

  group.add(frame, glass);

  [-0.34, 0.34].forEach((offset) => {
    const mullion = box([0.045, 1.18, 0.04], '#1e2e44', [x + offset * width, 1.75, side === 'back' ? z + 0.1 : z], {
      castShadow: false,
    });
    if (side !== 'back') {
      mullion.rotation.y = Math.PI / 2;
      mullion.position.set(x, 1.75, z + offset * width);
    }
    group.add(mullion);
  });
}

function addPlant(group, x, z, scale = 1) {
  const plant = new THREE.Group();
  plant.position.set(x, 0, z);
  plant.scale.setScalar(scale);
  plant.add(cylinder(0.22, 0.28, 0.36, '#c7cbd0', [0, 0.18, 0]));
  plant.add(cylinder(0.04, 0.05, 0.48, '#2f7d45', [0, 0.55, 0], 8));

  for (let i = 0; i < 10; i += 1) {
    const angle = (i / 10) * Math.PI * 2;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), material(i % 2 ? '#69b94c' : '#49a866'));
    leaf.scale.set(0.55, 1.35 + (i % 3) * 0.18, 0.12);
    leaf.position.set(Math.cos(angle) * 0.2, 0.82, Math.sin(angle) * 0.2);
    leaf.rotation.set(0.65, angle, 0.15);
    leaf.castShadow = true;
    plant.add(leaf);
  }

  group.add(plant);
}

function addPerson(group, x, z, shirt = '#2f6bff', rotation = 0) {
  const person = new THREE.Group();
  person.position.set(x, 0.55, z);
  person.rotation.y = rotation;
  person.userData.floatBase = 0.55;

  person.add(cylinder(0.16, 0.2, 0.5, shirt, [0, 0.42, 0]));
  person.add(new THREE.Mesh(new THREE.SphereGeometry(0.18, 18, 14), material('#f0c097')));
  person.children[person.children.length - 1].position.set(0, 0.78, 0);
  person.add(new THREE.Mesh(new THREE.SphereGeometry(0.185, 18, 12), material('#172033')));
  person.children[person.children.length - 1].position.set(0, 0.91, -0.025);

  const armLeft = cylinder(0.04, 0.04, 0.34, '#f0c097', [-0.15, 0.47, 0.12], 10);
  armLeft.rotation.set(0.75, 0, 0.55);
  const armRight = cylinder(0.04, 0.04, 0.34, '#f0c097', [0.15, 0.47, 0.12], 10);
  armRight.rotation.set(0.75, 0, -0.55);
  person.add(armLeft, armRight);
  group.add(person);
  return person;
}

function addMonitor(group, x, z, rotation = 0, glow = '#52c7ff') {
  const monitor = new THREE.Group();
  monitor.position.set(x, 0.57, z);
  monitor.rotation.y = rotation;

  const screenMaterial = new THREE.MeshStandardMaterial({
    color: '#16233a',
    emissive: glow,
    emissiveIntensity: 0.55,
    roughness: 0.32,
  });
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.34, 0.04), screenMaterial);
  screen.position.set(0, 0.36, 0);
  screen.userData.screen = true;
  monitor.add(screen);
  monitor.add(box([0.08, 0.28, 0.05], '#344054', [0, 0.14, 0], { castShadow: false }));
  monitor.add(box([0.36, 0.035, 0.22], '#263447', [0, 0.02, 0], { castShadow: false }));
  group.add(monitor);
}

function addDesk(group, x, z, rotation = 0, shirt = '#2f6bff', twoPeople = true) {
  const desk = new THREE.Group();
  desk.position.set(x, 0, z);
  desk.rotation.y = rotation;

  desk.add(box([1.9, 0.16, 1.05], '#d8a269', [0, 0.48, 0]));
  desk.add(box([2.02, 0.18, 1.18], '#344054', [0, 0.38, 0]));
  [-0.78, 0.78].forEach((legX) => {
    desk.add(box([0.18, 0.45, 0.18], '#202a3a', [legX, 0.2, -0.38]));
    desk.add(box([0.18, 0.45, 0.18], '#202a3a', [legX, 0.2, 0.38]));
  });
  desk.add(box([0.5, 0.035, 0.25], '#eef2f7', [-0.55, 0.64, -0.28], { castShadow: false }));
  desk.add(box([0.46, 0.035, 0.22], '#eef2f7', [0.55, 0.64, 0.24], { castShadow: false }));
  desk.add(cylinder(0.07, 0.06, 0.1, '#2f855a', [0.02, 0.63, 0.41], 14));

  addMonitor(desk, -0.42, -0.16, 0.15, '#52c7ff');
  addMonitor(desk, 0.5, 0.05, -0.2, '#6ee7b7');
  addPerson(desk, -0.42, -0.82, shirt, 0.04);
  desk.add(box([0.5, 0.46, 0.42], '#1f2937', [-0.42, 0.26, -0.95]));
  if (twoPeople) {
    addPerson(desk, 0.55, 0.84, '#f59e0b', Math.PI);
    desk.add(box([0.5, 0.46, 0.42], '#1f2937', [0.55, 0.26, 0.98]));
  }

  group.add(desk);
}

function buildOfficeScene(scene) {
  const group = new THREE.Group();
  scene.add(group);

  group.add(box([14.2, 0.28, 8.3], '#dce3ee', [0, -0.08, 0], { castShadow: false }));
  group.add(box([13.6, 0.08, 7.7], '#687283', [0, 0.02, 0], { castShadow: false }));

  for (let x = -6.5; x <= 6.5; x += 1) group.add(box([0.018, 0.012, 7.65], '#8995a8', [x, 0.08, 0], { castShadow: false }));
  for (let z = -3.5; z <= 3.5; z += 1) group.add(box([13.65, 0.012, 0.018], '#8995a8', [0, 0.085, z], { castShadow: false }));

  group.add(box([13.8, 3.1, 0.24], '#cfc6c4', [0, 1.55, -4.02], { castShadow: false }));
  group.add(box([0.24, 2.8, 8.1], '#d7d0d0', [-7.02, 1.38, 0], { castShadow: false }));
  group.add(box([0.24, 2.8, 8.1], '#d5cccc', [7.02, 1.38, 0], { castShadow: false }));

  addWindow(group, -4.35, -3.86, 2.35);
  addWindow(group, -1.2, -3.86, 2.55);
  addWindow(group, 2.2, -3.86, 2.45);
  addWindow(group, 5.35, -3.86, 2.2);
  addWindow(group, -6.86, -1.9, 1.95, 'left');
  addWindow(group, 6.86, -1.85, 1.95, 'right');

  addDesk(group, -3.6, -0.8, 0.04, '#2f6bff');
  addDesk(group, 2.45, -0.85, -0.08, '#10b981');
  addDesk(group, -4.55, 2.15, 0.1, '#f59e0b', false);
  addDesk(group, 0.2, 2.55, -0.1, '#6366f1');

  const emptyDesk = new THREE.Group();
  emptyDesk.position.set(4.25, 0, 1.35);
  emptyDesk.rotation.y = -0.18;
  emptyDesk.add(box([1.7, 0.055, 1.1], '#74a6ff', [0, 0.08, 0], { castShadow: false, material: { transparent: true, opacity: 0.28 } }));
  emptyDesk.add(box([1.55, 0.12, 0.86], '#d8a269', [0, 0.48, 0], { material: { transparent: true, opacity: 0.55 } }));
  group.add(emptyDesk);

  addPlant(group, -6.1, -2.9, 1.05);
  addPlant(group, -6.25, 2.9, 0.86);
  addPlant(group, -2.9, -3.38, 0.8);
  addPlant(group, 4.8, -3.25, 0.78);
  addPlant(group, 6.35, -2.75, 1.25);
  addPlant(group, 2.55, 3.18, 0.95);

  group.add(box([0.86, 1.04, 0.54], '#273549', [5.9, 0.52, 2.45]));
  return group;
}

function OfficeLabels() {
  return (
    <>
      {staffMarkers.map((marker) => (
        <button
          key={marker.id}
          type="button"
          className="absolute min-w-[108px] -translate-x-1/2 rounded-[14px] bg-[rgba(17,24,39,0.88)] px-4 py-2 text-center text-white shadow-[0_16px_30px_rgba(15,23,42,0.25)] backdrop-blur transition hover:-translate-y-0.5"
          style={{ left: marker.left, top: marker.top }}
        >
          <div className="text-[13px] font-semibold leading-5">{marker.name}</div>
          <div className="mt-1 inline-flex rounded-full px-3 py-1 text-[12px] font-semibold" style={{ backgroundColor: marker.color }}>
            {marker.status}
          </div>
        </button>
      ))}
      <div className="absolute left-[74%] top-[51%] rounded-[16px] border border-[#8ab4ff]/60 bg-[rgba(20,31,48,0.84)] px-5 py-4 text-center text-white shadow-[0_18px_34px_rgba(15,23,42,0.24)] backdrop-blur">
        <div className="text-[15px] font-semibold">空闲工位</div>
        <button type="button" className="mt-2 rounded-full bg-white/10 px-4 py-2 text-[13px] font-medium">
          + 创建员工
        </button>
      </div>
    </>
  );
}

function MiniMap() {
  return (
    <div className="absolute bottom-3 right-4 w-[148px] rounded-[12px] border border-[#edf1f8] bg-white/92 p-2 shadow-[0_12px_30px_rgba(15,23,42,0.12)] backdrop-blur">
      <div className="mb-2 flex items-center justify-between text-[12px] font-medium text-[#42526e]">
        <span>鸟瞰视图</span>
        <span className="text-[#2f6bff]">×</span>
      </div>
      <div className="relative h-[58px] overflow-hidden rounded-[8px] bg-[#eef3f8]">
        <div className="absolute left-[12%] top-[18%] h-[36px] w-[116px] rotate-[14deg] rounded-[4px] border border-[#d6deea] bg-white" />
        {[
          ['24%', '26%'],
          ['42%', '30%'],
          ['32%', '58%'],
          ['56%', '57%'],
          ['72%', '39%'],
        ].map(([left, top]) => (
          <span key={`${left}-${top}`} className="absolute h-2 w-2 rounded-full bg-[#2f6bff]" style={{ left, top }} />
        ))}
      </div>
    </div>
  );
}

export default function HomeOfficeThreeScene() {
  const mountRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneStateRef = useRef(null);
  const [view, setView] = useState(0);
  const [musicOn, setMusicOn] = useState(true);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.add(new THREE.AmbientLight(0xffffff, 1.15));

    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(2, 8, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    scene.add(sun);
    scene.add(new THREE.HemisphereLight(0xb5dcff, 0x6b7280, 0.8));

    const camera = new THREE.PerspectiveCamera(cameraViews[0].fov, 1, 0.1, 100);
    camera.position.set(...cameraViews[0].position);
    camera.lookAt(0, 0.1, 0);
    cameraRef.current = camera;

    const office = buildOfficeScene(scene);
    sceneStateRef.current = { scene, renderer, camera, office };

    const resize = () => {
      const width = mount.clientWidth || 1;
      const height = mount.clientHeight || 1;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    let frameId = 0;
    const animate = () => {
      const elapsed = performance.now() * 0.001;
      office.traverse((object) => {
        if (object.userData.screen && object.material) {
          object.material.emissiveIntensity = 0.48 + Math.sin(elapsed * 2.8) * 0.08;
        }
        if (object.userData.floatBase) {
          object.position.y = object.userData.floatBase + Math.sin(elapsed * 2.2 + object.position.x) * 0.025;
        }
      });
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener('resize', resize);
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) object.material.forEach((item) => item.dispose());
          else object.material.dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement);
      sceneStateRef.current = null;
      cameraRef.current = null;
    };
  }, []);

  useEffect(() => {
    const camera = cameraRef.current;
    if (!camera) return;
    const next = cameraViews[view];
    camera.position.set(...next.position);
    camera.fov = next.fov;
    camera.lookAt(0, 0.1, 0);
    camera.updateProjectionMatrix();
  }, [view]);

  return (
    <div className="relative h-[480px] overflow-hidden rounded-[18px] border border-[#edf1f8] bg-[linear-gradient(180deg,#f8fbff_0%,#edf4fb_100%)]">
      <div ref={mountRef} className="absolute inset-0" />
      <OfficeLabels />
      <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
        <div className="pointer-events-auto flex items-center gap-3">
          <button type="button" className="rounded-full bg-white/92 px-4 py-2 text-[13px] font-medium text-[#42526e] shadow-sm backdrop-blur">
            办公室视图
          </button>
          <button
            type="button"
            onClick={() => setMusicOn((current) => !current)}
            className="rounded-full bg-white/92 px-4 py-2 text-[13px] font-medium text-[#42526e] shadow-sm backdrop-blur"
          >
            音乐: {musicOn ? '开' : '关'}
          </button>
          <button
            type="button"
            onClick={() => setView((current) => (current + 1) % cameraViews.length)}
            className="rounded-full bg-white/92 px-4 py-2 text-[13px] font-medium text-[#42526e] shadow-sm backdrop-blur"
          >
            视角切换
          </button>
        </div>
      </div>
      <MiniMap />
    </div>
  );
}
