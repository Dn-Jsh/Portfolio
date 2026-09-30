"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import type { GearModelKind } from "@/data/gear";
import { buildGearModel } from "./buildGearModel";

type GearModelProps = {
  kind: GearModelKind;
  name: string;
  fallbackImage: string;
  featured?: boolean;
};

export function GearModel({ kind, name, fallbackImage, featured = false }: GearModelProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const resetRef = useRef<() => void>(() => {});

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      return; // The transparent product photo remains visible without WebGL.
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.75;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.className = "gear-canvas";
    renderer.domElement.setAttribute("aria-hidden", "true");
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    const model = buildGearModel(kind);
    const laptopLid = model.userData.lid as THREE.Group | undefined;
    scene.add(model);
    const bounds = new THREE.Box3().setFromObject(model);
    const center = bounds.getCenter(new THREE.Vector3());
    const viewDirection = {
      laptop: new THREE.Vector3(3.9, 2.45, 7.2),
      keyboard: new THREE.Vector3(0.7, 4.6, 5.8),
      mouse: new THREE.Vector3(-3, 2.5, 5.8),
      earbuds: new THREE.Vector3(1.2, 1.7, 6.4),
      phone: new THREE.Vector3(3.9, 2.45, 6.7),
    }[kind].normalize();
    scene.add(new THREE.AmbientLight(0xffffff, 2.5));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
    keyLight.position.set(-4, 7, 8);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xdfeeff, 2.2);
    fillLight.position.set(5, 2, 5);
    scene.add(fillLight);
    const rimLight = new THREE.DirectionalLight(0xffd7ed, 1.5);
    rimLight.position.set(3, 5, -5);
    scene.add(rimLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.minDistance = 2.5;
    controls.maxDistance = 12;
    controls.autoRotate = false;
    controls.minPolarAngle = 0.15;
    controls.maxPolarAngle = Math.PI - 0.15;
    controls.target.copy(center);

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = motionQuery.matches;
    let dragging = false;
    let hasInteracted = false;
    let visible = true;
    const onMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
    };
    const onPointerDown = () => { dragging = true; hasInteracted = true; };
    const onPointerUp = () => { dragging = false; };
    const onWheel = () => { hasInteracted = true; };
    motionQuery.addEventListener("change", onMotionChange);
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("pointerup", onPointerUp);

    const fitCamera = () => {
      const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), viewDirection).normalize();
      const up = new THREE.Vector3().crossVectors(viewDirection, right).normalize();
      const tanVertical = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const tanHorizontal = tanVertical * camera.aspect;
      let distance = 0;
      for (const x of [bounds.min.x, bounds.max.x]) {
        for (const y of [bounds.min.y, bounds.max.y]) {
          for (const z of [bounds.min.z, bounds.max.z]) {
            const corner = new THREE.Vector3(x, y, z).sub(center);
            const depth = corner.dot(viewDirection);
            distance = Math.max(
              distance,
              depth + Math.abs(corner.dot(right)) * 1.2 / tanHorizontal,
              depth + Math.abs(corner.dot(up)) * 1.2 / tanVertical,
            );
          }
        }
      }
      controls.target.copy(center);
      camera.position.copy(center).addScaledVector(viewDirection, Math.max(3.1, distance));
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
    resize();
    resetRef.current = () => {
      model.rotation.set(0, 0, 0);
      model.position.y = 0;
      if (laptopLid) laptopLid.rotation.x = -0.18;
      hasInteracted = false;
      fitCamera();
    };

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    }, { rootMargin: "150px" });
    visibilityObserver.observe(mount);

    let lastTime = 0;
    renderer.setAnimationLoop((time) => {
      if (!visible || document.hidden) {
        lastTime = time;
        return;
      }
      const delta = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0.016;
      lastTime = time;
      if (!reducedMotion && !dragging) {
        model.rotation.y += delta * (kind === "laptop" ? 0.29 : 0.27);
        model.rotation.z = Math.sin(time * 0.00075) * 0.016;
        model.position.y = Math.sin(time * 0.00135) * 0.075;
        if (laptopLid) laptopLid.rotation.x = -0.18 + Math.sin(time * 0.00047) * 0.065;
      }
      controls.update(delta);
      renderer.render(scene, camera);
    });
    controls.update();
    renderer.render(scene, camera);
    mount.parentElement?.classList.add("is-ready");

    return () => {
      renderer.setAnimationLoop(null);
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
      motionQuery.removeEventListener("change", onMotionChange);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("wheel", onWheel);
      window.removeEventListener("pointerup", onPointerUp);
      controls.dispose();
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      model.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        geometries.add(child.geometry);
        const childMaterials = Array.isArray(child.material) ? child.material : [child.material];
        childMaterials.forEach((material) => materials.add(material));
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => {
        if (material instanceof THREE.MeshBasicMaterial || material instanceof THREE.MeshStandardMaterial) material.map?.dispose();
        // Shared module-level materials remain in use by other gear viewers.
        if (material instanceof THREE.MeshBasicMaterial) material.dispose();
      });
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
      <div className="gear-model-controls">
        <button className="gear-model-control" type="button" onClick={() => resetRef.current()} aria-label={`Reset view of ${name}`}>
          ↺ Reset
        </button>
      </div>
      <span className="gear-drag-hint" aria-hidden="true">drag · scroll to zoom</span>
    </div>
  );
}
