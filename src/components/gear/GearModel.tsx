"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import type { GearModelKind } from "@/data/gear";
import { getGearModelAsset } from "./buildGearModel";

type GearModelProps = {
  kind: GearModelKind;
  name: string;
  fallbackImage: string;
  featured?: boolean;
};

function disposeModel(model: THREE.Object3D) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    geometries.add(child.geometry);
    (Array.isArray(child.material) ? child.material : [child.material]).forEach((material) => materials.add(material));
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => {
    for (const value of Object.values(material)) {
      if (value instanceof THREE.Texture) value.dispose();
    }
    material.dispose();
  });
}

export function GearModel({ kind, name, fallbackImage, featured = false }: GearModelProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const resetRef = useRef<() => void>(() => {});
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const modelUrl = getGearModelAsset(kind);
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      return; // The product cutout stays visible without WebGL.
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = "gear-canvas";
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.01, 100);
    const pivot = new THREE.Group();
    let model: THREE.Group | null = null;
    let modelBounds = new THREE.Box3();
    let modelSize = new THREE.Vector3();
    scene.add(pivot);

    scene.add(new THREE.AmbientLight(0xffffff, 1.45));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.15);
    keyLight.position.set(-4, 7, 8);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xdfeeff, 0.8);
    fillLight.position.set(5, 2, 5);
    scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0xffd7ed, 1.0);
    rimLight.position.set(3, 5, -5);
    scene.add(rimLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.autoRotate = false;
    controls.minPolarAngle = 0.08;
    controls.maxPolarAngle = Math.PI - 0.08;

    const viewDirection = {
      laptop: new THREE.Vector3(2.6, 6.0, 7.2),
      keyboard: new THREE.Vector3(0.7, 4.6, 5.8),
      mouse: new THREE.Vector3(-3.2, 6.5, 5.8),
      earbuds: new THREE.Vector3(1.2, 5.0, 6.4),
      phone: new THREE.Vector3(3.9, 2.45, 6.7),
    }[kind].normalize();

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    let dragging = false;
    let hasInteracted = false;
    let visible = false;
    let disposed = false;
    const onMotionChange = (event: MediaQueryListEvent) => { reducedMotion = event.matches; };
    const onPointerDown = () => { dragging = true; hasInteracted = true; };
    const onPointerUp = () => { dragging = false; };
    const onWheel = () => { hasInteracted = true; };
    motionQuery.addEventListener("change", onMotionChange);
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("pointerup", onPointerUp);

    const fitCamera = () => {
      if (modelBounds.isEmpty() || modelSize.lengthSq() === 0) return;
      const center = modelBounds.getCenter(new THREE.Vector3());
      const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), viewDirection).normalize();
      if (right.lengthSq() < 0.001) right.set(1, 0, 0);
      const up = new THREE.Vector3().crossVectors(viewDirection, right).normalize();
      const tanVertical = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const tanHorizontal = tanVertical * camera.aspect;
      let distance = 0;
      for (const x of [modelBounds.min.x, modelBounds.max.x]) {
        for (const y of [modelBounds.min.y, modelBounds.max.y]) {
          for (const z of [modelBounds.min.z, modelBounds.max.z]) {
            const corner = new THREE.Vector3(x, y, z).sub(center);
            const depth = corner.dot(viewDirection);
            distance = Math.max(
              distance,
              depth + Math.abs(corner.dot(right)) * 1.18 / tanHorizontal,
              depth + Math.abs(corner.dot(up)) * 1.18 / tanVertical,
            );
          }
        }
      }
      const size = Math.max(modelSize.length(), 0.1);
      camera.near = Math.max(size / 250, 0.005);
      camera.far = size * 32;
      camera.updateProjectionMatrix();
      controls.minDistance = size * 0.35;
      controls.maxDistance = size * 6;
      controls.target.copy(center);
      camera.position.copy(center).addScaledVector(
        viewDirection,
        Math.max(size * 0.65, distance) * (kind === "mouse" ? 0.84 : 1),
      );
      controls.update();
    };

    const resize = () => {
      const width = mount.clientWidth;
      const height = mount.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      if (!hasInteracted) fitCamera();
      renderer.setSize(width, height, false);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);

    resetRef.current = () => {
      if (!model) return;
      model.rotation.set(0, 0, 0);
      model.position.y = 0;
      hasInteracted = false;
      fitCamera();
    };

    let lastTime = 0;
    let frameLoopActive = false;
    const renderFrame = (time: number) => {
      if (!model) return;
      const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0.016;
      lastTime = time;
      if (!reducedMotion && !dragging) {
        model.rotation.y += delta * (kind === "laptop" ? 0.20 : 0.24);
        model.rotation.z = Math.sin(time * 0.00075) * 0.012;
        model.position.y = Math.sin(time * 0.00135) * Math.min(modelSize.y * 0.024, 0.075);
      }
      controls.update(delta);
      renderer.render(scene, camera);
    };

    const syncAnimationLoop = () => {
      const shouldAnimate = visible && !document.hidden && model !== null;
      if (shouldAnimate === frameLoopActive) return;
      frameLoopActive = shouldAnimate;
      lastTime = 0;
      renderer.setAnimationLoop(shouldAnimate ? renderFrame : null);
    };

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncAnimationLoop();
    }, { rootMargin: "150px" });
    visibilityObserver.observe(mount);
    document.addEventListener("visibilitychange", syncAnimationLoop);

    let loadedAsset: THREE.Object3D | null = null;
    new GLTFLoader().load(
      modelUrl,
      (gltf) => {
        if (disposed) {
          disposeModel(gltf.scene);
          return;
        }
        loadedAsset = gltf.scene;
        const initialBounds = new THREE.Box3().setFromObject(loadedAsset);
        if (initialBounds.isEmpty()) {
          setLoadFailed(true);
          return;
        }
        const center = initialBounds.getCenter(new THREE.Vector3());
        loadedAsset.position.sub(center);
        model = new THREE.Group();
        model.add(loadedAsset);
        pivot.add(model);
        pivot.updateMatrixWorld(true);
        modelBounds = new THREE.Box3().setFromObject(model);
        modelSize = modelBounds.getSize(new THREE.Vector3());
        resize();
        fitCamera();
        controls.saveState();
        mount.parentElement?.classList.add("is-ready");
        renderer.render(scene, camera);
        syncAnimationLoop();
      },
      undefined,
      () => {
        if (!disposed) setLoadFailed(true);
      },
    );

    resize();
    return () => {
      disposed = true;
      renderer.setAnimationLoop(null);
      visibilityObserver.disconnect();
      document.removeEventListener("visibilitychange", syncAnimationLoop);
      resizeObserver.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointerup", onPointerUp);
      controls.dispose();
      if (model) disposeModel(model);
      else if (loadedAsset) disposeModel(loadedAsset);
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
      mount.parentElement?.classList.remove("is-ready");
      resetRef.current = () => {};
    };
  }, [kind]);

  return (
    <div className="gear-model" role="group" aria-label={`Interactive 3D model of ${name}`}>
      <Image
        src={fallbackImage}
        alt=""
        fill
        sizes={featured ? "(max-width: 768px) 100vw, 60vw" : "(max-width: 768px) 100vw, 50vw"}
        priority={featured}
        className="gear-poster object-contain"
      />
      <div ref={mountRef} className="gear-model-mount" />
      {loadFailed && <span className="gear-model-failure" role="status">3D preview unavailable · showing product image</span>}
      <div className="gear-model-controls">
        <button className="gear-model-control" type="button" onClick={() => resetRef.current()} aria-label={`Reset view of ${name}`}>
          ↺ Reset
        </button>
      </div>
      <span className="gear-drag-hint" aria-hidden="true">drag · scroll to zoom</span>
    </div>
  );
}
