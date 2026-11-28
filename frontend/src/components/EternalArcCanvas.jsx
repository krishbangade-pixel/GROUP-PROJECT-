import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

function isWebGLAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export default function EternalArcCanvas() {
  const containerRef = useRef(null);
  const [webglSupported] = useState(isWebGLAvailable);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !webglSupported) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.6;
    container.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.2, 6.0);

    // Ambient light - low for high cinematic contrast
    const ambientLight = new THREE.AmbientLight(0x181c26, 0.85);
    scene.add(ambientLight);

    // Strong high-angle key light creating the intense top-right specular sheen
    const keyLight = new THREE.DirectionalLight(0xffffff, 6.2);
    keyLight.position.set(6, 8, 4);
    scene.add(keyLight);

    // Secondary specular highlight on the upper rim of the arc
    const rimPoint = new THREE.PointLight(0xf2f7ff, 5.0, 14);
    rimPoint.position.set(3.2, 4.2, 3.0);
    scene.add(rimPoint);

    // Cool subtle blue fill light from the bottom left
    const fillLight = new THREE.DirectionalLight(0x6585ba, 1.4);
    fillLight.position.set(-6, -4, -3);
    scene.add(fillLight);

    // The Eternal Arc — Torus Geometry
    // Radius 2.35, tube thickness 0.23, smooth segments
    const torusGeometry = new THREE.TorusGeometry(2.35, 0.23, 64, 192);
    const torusMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x111317,
      emissive: 0x010204,
      roughness: 0.16,
      metalness: 0.97,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 1.0,
    });

    const arcMesh = new THREE.Mesh(torusGeometry, torusMaterial);
    // Initial tilt matching the Spline composition
    arcMesh.rotation.x = 1.16;
    arcMesh.rotation.y = -0.32;
    arcMesh.rotation.z = -0.58;
    arcMesh.position.set(1.05, 0.05, 0);
    scene.add(arcMesh);

    // Subtle concentric laser/accent ring inside the torus
    const innerGeometry = new THREE.TorusGeometry(1.88, 0.025, 32, 140);
    const innerMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b4a6b,
      roughness: 0.4,
      metalness: 0.8,
    });
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    arcMesh.add(innerMesh);

    // Subtle drifting stardust
    const particleCount = 90;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 11;
      particlePositions[i + 1] = (Math.random() - 0.5) * 9;
      particlePositions[i + 2] = (Math.random() - 0.5) * 7;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3)
    );
    const particleMaterial = new THREE.PointsMaterial({
      color: 0xbfd7ff,
      size: 0.028,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Mouse Interaction
    let targetX = 0;
    let targetY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event) => {
      const { innerWidth, innerHeight } = window;
      mouseX = (event.clientX / innerWidth - 0.5) * 2;
      mouseY = (event.clientY / innerHeight - 0.5) * 2;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Responsive Resize
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse damping
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      // Base rotation + subtle floating oscillation + mouse parallax
      arcMesh.rotation.z = -0.58 + Math.sin(elapsedTime * 0.42) * 0.07 + targetX * 0.2;
      arcMesh.rotation.x = 1.16 + Math.cos(elapsedTime * 0.35) * 0.05 - targetY * 0.2;
      arcMesh.rotation.y = -0.32 + Math.sin(elapsedTime * 0.22) * 0.04 + targetX * 0.12;
      arcMesh.position.y = 0.05 + Math.sin(elapsedTime * 0.75) * 0.08;

      innerMesh.rotation.z = elapsedTime * 0.12;
      particles.rotation.y = elapsedTime * 0.015;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      torusGeometry.dispose();
      torusMaterial.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, [webglSupported]);

  return (
    <div className="eternal-arc-canvas-wrapper" ref={containerRef}>
      {/* High-intensity volumetric light beam matching Spline */}
      <div className="spline-light-beam-glow"></div>
      <div className="spline-light-beam-ray"></div>
      <div className="spline-light-ambient-glow"></div>
      {!webglSupported && (
        <img
          src="/spline-preview.jpg"
          alt="The Eternal Arc"
          className="spline-fallback-img"
        />
      )}
    </div>
  );
}
