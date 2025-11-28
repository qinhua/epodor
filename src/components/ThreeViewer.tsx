import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ComponentType } from "../types";

interface ThreeViewerProps {
  type: ComponentType;
}

const ThreeViewer: React.FC<ThreeViewerProps> = ({ type }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    // 创建更暗的渐变背景纹理
    const createGradientBackground = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext("2d");
      if (!context) return null;

      // 创建从顶部到底部的渐变 - 使用更暗的色调
      const gradient = context.createLinearGradient(0, 0, 0, 512);
      gradient.addColorStop(0, "#0f172a"); // 顶部：非常深的蓝灰色
      gradient.addColorStop(0.3, "#1e293b"); // 上部分：深灰蓝色
      gradient.addColorStop(0.7, "#1e293b"); // 中间：保持深色
      gradient.addColorStop(1, "#334155"); // 底部：稍亮的灰蓝色

      context.fillStyle = gradient;
      context.fillRect(0, 0, 512, 512);

      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };

    const bgTexture = createGradientBackground();
    if (bgTexture) {
      scene.background = bgTexture;
    } else {
      // 备用：使用更暗的纯色背景
      scene.background = new THREE.Color(0x1e293b);
    }
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 2, 6);
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false // 使用不透明背景以显示场景背景色
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls - 提供流畅的拖拽旋转体验
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // 启用阻尼，提供更流畅的交互
    controls.dampingFactor = 0.05; // 阻尼系数
    controls.enableZoom = true; // 允许缩放
    controls.enablePan = false; // 禁用平移，只允许旋转和缩放
    controls.minDistance = 3; // 最小缩放距离
    controls.maxDistance = 15; // 最大缩放距离
    controls.minPolarAngle = 0; // 最小垂直角度
    controls.maxPolarAngle = Math.PI; // 最大垂直角度（允许完整旋转）
    controls.autoRotate = false; // 不自动旋转
    controls.target.set(0, 0, 0); // 旋转目标点
    controlsRef.current = controls;

    // Lights - 适中的光照强度
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // 适中的环境光
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5); // 主光源
    dirLight.position.set(5, 5, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x06b6d4, 0.8); // 边缘光
    rimLight.position.set(-5, 2, -10);
    scene.add(rimLight);

    // 添加填充光以提供柔和的光照
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-3, 0, 5);
    scene.add(fillLight);

    // Materials
    const matMetal = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      metalness: 0.9,
      roughness: 0.2
    });
    const matDarkPlastic = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.1,
      roughness: 0.6
    });
    const matWhitePlastic = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      roughness: 0.5
    });
    const matBlueBody = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      metalness: 0.1,
      roughness: 0.5
    });
    const matResistorBody = new THREE.MeshStandardMaterial({
      color: 0xd2b48c,
      roughness: 0.4
    });
    const matGlass = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.8,
      opacity: 0.5,
      roughness: 0.1
    });
    const matCopper = new THREE.MeshStandardMaterial({
      color: 0xb87333,
      metalness: 0.6,
      roughness: 0.4
    });

    // Create mesh group
    const mesh = new THREE.Group();

    // Helper: Leads
    const addLeads = (
      dist: number,
      length: number = 1.5,
      vertical = false,
      material = matMetal
    ) => {
      const geo = new THREE.CylinderGeometry(0.05, 0.05, length, 8);
      const l1 = new THREE.Mesh(geo, material);
      const l2 = new THREE.Mesh(geo, material);
      if (vertical) {
        l1.position.set(-dist, -length / 2, 0);
        l2.position.set(dist, -length / 2, 0);
      } else {
        l1.rotation.z = Math.PI / 2;
        l2.rotation.z = Math.PI / 2;
        l1.position.x = -dist - length / 2;
        l2.position.x = dist + length / 2;
      }
      mesh.add(l1);
      mesh.add(l2);
    };

    // Create component based on type
    switch (type) {
      case ComponentType.RESISTOR: {
        const body = new THREE.Mesh(
          new THREE.CylinderGeometry(0.5, 0.5, 2, 32),
          matResistorBody
        );
        body.rotation.z = Math.PI / 2;
        mesh.add(body);
        addLeads(1.0);
        // Bands
        [0.8, 0.4, 0, -0.4].forEach((x, i) => {
          const c = [0x8b4513, 0x000000, 0xff0000, 0xffd700][i];
          const band = new THREE.Mesh(
            new THREE.CylinderGeometry(0.51, 0.51, 0.2, 32),
            new THREE.MeshBasicMaterial({ color: c })
          );
          band.rotation.z = Math.PI / 2;
          band.position.x = x - 0.2;
          mesh.add(band);
        });
        break;
      }
      case ComponentType.CAPACITOR: {
        const body = new THREE.Mesh(
          new THREE.CylinderGeometry(0.6, 0.6, 1.6, 32),
          matDarkPlastic
        );
        mesh.add(body);
        const stripe = new THREE.Mesh(
          new THREE.CylinderGeometry(0.61, 0.61, 1.6, 32, 1, true, 0, 0.6),
          new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
        );
        mesh.add(stripe);
        const top = new THREE.Mesh(
          new THREE.CylinderGeometry(0.58, 0.58, 0.1, 32),
          matMetal
        );
        top.position.y = 0.8;
        mesh.add(top);
        addLeads(0.2, 1.2, true);
        break;
      }
      case ComponentType.LED: {
        const bulb = new THREE.Mesh(
          new THREE.CylinderGeometry(0.5, 0.5, 0.8, 32),
          new THREE.MeshPhysicalMaterial({
            color: 0xff0000,
            transmission: 0.6,
            roughness: 0.1
          })
        );
        const dome = new THREE.Mesh(
          new THREE.SphereGeometry(0.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
          bulb.material as THREE.MeshPhysicalMaterial
        );
        bulb.position.y = 0.2;
        dome.position.y = 0.6;
        mesh.add(bulb);
        mesh.add(dome);
        const rim = new THREE.Mesh(
          new THREE.CylinderGeometry(0.6, 0.6, 0.1, 32),
          bulb.material as THREE.MeshPhysicalMaterial
        );
        rim.position.y = -0.2;
        mesh.add(rim);
        addLeads(0.15, 1.5, true);
        break;
      }
      case ComponentType.TRANSISTOR: {
        // TO-92
        const shape = new THREE.Shape();
        shape.moveTo(-0.4, 0);
        shape.lineTo(0.4, 0);
        shape.arc(0, 0, 0.4, 0, Math.PI, false);
        const body = new THREE.Mesh(
          new THREE.ExtrudeGeometry(shape, { depth: 0.8, bevelEnabled: false }),
          matDarkPlastic
        );
        body.rotation.x = -Math.PI / 2;
        body.position.set(0, 0.5, -0.4);
        mesh.add(body);
        [-0.2, 0, 0.2].forEach((x) => {
          const l = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 1.5, 0.1),
            matMetal
          );
          l.position.set(x, -0.5, 0);
          mesh.add(l);
        });
        break;
      }
      case ComponentType.MOSFET: {
        // TO-220
        const backPlate = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 2.0, 0.1),
          matMetal
        );
        backPlate.position.y = 0.5;
        const hole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.2, 0.2, 16),
          matMetal
        );
        hole.rotation.x = Math.PI / 2;
        hole.position.set(0, 1.2, 0);
        // Simple subtraction visual by just adding a dark circle
        const holeVis = new THREE.Mesh(
          new THREE.CircleGeometry(0.15, 16),
          new THREE.MeshBasicMaterial({ color: 0x000000 })
        );
        holeVis.position.set(0, 1.2, 0.06);
        mesh.add(backPlate);
        mesh.add(holeVis);

        const body = new THREE.Mesh(
          new THREE.BoxGeometry(1.5, 1.2, 0.5),
          matDarkPlastic
        );
        body.position.set(0, 0.1, 0.3);
        mesh.add(body);

        [-0.5, 0, 0.5].forEach((x) => {
          const l = new THREE.Mesh(
            new THREE.BoxGeometry(0.15, 1.5, 0.1),
            matMetal
          );
          l.position.set(x, -1.0, 0.3);
          mesh.add(l);
        });
        break;
      }
      case ComponentType.IC:
      case ComponentType.OPTOCOUPLER: {
        // DIP-8 or DIP-4
        const width = type === ComponentType.OPTOCOUPLER ? 1.0 : 1.8;
        const body = new THREE.Mesh(
          new THREE.BoxGeometry(width, 0.5, 1.2),
          type === ComponentType.OPTOCOUPLER ? matWhitePlastic : matDarkPlastic
        );
        mesh.add(body);
        const pins = type === ComponentType.OPTOCOUPLER ? 2 : 4;
        for (let i = 0; i < pins; i++) {
          const px = -width / 3 + i * (width / 1.5); // approximate
          const p1 = new THREE.Mesh(
            new THREE.BoxGeometry(0.1, 0.6, 0.1),
            matMetal
          );
          p1.position.set(px, -0.4, 0.6);
          p1.rotation.x = 0.2;
          const p2 = p1.clone();
          p2.position.set(px, -0.4, -0.6);
          p2.rotation.x = -0.2;
          mesh.add(p1);
          mesh.add(p2);
        }
        break;
      }
      case ComponentType.DIODE:
      case ComponentType.ZENER_DIODE: {
        const mat =
          type === ComponentType.ZENER_DIODE
            ? new THREE.MeshPhysicalMaterial({
                color: 0xff6666,
                transmission: 0.6
              })
            : matDarkPlastic;
        const body = new THREE.Mesh(
          new THREE.CylinderGeometry(0.4, 0.4, 1.2, 32),
          mat
        );
        body.rotation.z = Math.PI / 2;
        mesh.add(body);
        const band = new THREE.Mesh(
          new THREE.CylinderGeometry(0.41, 0.41, 0.2, 32),
          matMetal
        );
        band.rotation.z = Math.PI / 2;
        band.position.x = 0.4;
        mesh.add(band);
        addLeads(0.6);
        break;
      }
      case ComponentType.VARISTOR: {
        // Blue Disc
        const disc = new THREE.Mesh(
          new THREE.CylinderGeometry(1, 1, 0.2, 32),
          matBlueBody
        );
        disc.rotation.x = Math.PI / 2;
        mesh.add(disc);
        addLeads(0.4, 1.5, true);
        break;
      }
      case ComponentType.SPEAKER: {
        // Buzzer
        const cyl = new THREE.Mesh(
          new THREE.CylinderGeometry(0.8, 0.8, 0.8, 32),
          matDarkPlastic
        );
        mesh.add(cyl);
        const hole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.1, 0.1, 16),
          matMetal
        );
        hole.position.y = 0.4;
        mesh.add(hole);
        addLeads(0.3, 1.0, true);
        break;
      }
      case ComponentType.SWITCH: {
        // Tactile Switch
        const base = new THREE.Mesh(
          new THREE.BoxGeometry(1.0, 0.2, 1.0),
          matMetal
        );
        mesh.add(base);
        const btn = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.3, 0.3, 16),
          matDarkPlastic
        );
        btn.position.y = 0.2;
        mesh.add(btn);
        break;
      }
      default: {
        // Fallback
        const generic = new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          matDarkPlastic
        );
        mesh.add(generic);
      }
    }

    scene.add(mesh);

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // 更新控件（必须调用以应用阻尼效果）
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!container) return;

      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    // Use ResizeObserver for better resize handling
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      resizeObserver.disconnect();

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (container && rendererRef.current.domElement) {
          container.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current = null;
      }

      // Dispose geometries and materials
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => mat.dispose());
          } else {
            object.material.dispose();
          }
        }
      });

      sceneRef.current = null;
    };
  }, [type]);

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[300px] cursor-grab active:cursor-grabbing touch-none select-none"
    />
  );
};

export default ThreeViewer;
