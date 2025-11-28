import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ComponentType } from "../types";
import { createComponentModel } from "../models/componentModels";

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

    // Create component model using the centralized model factory
    const mesh = createComponentModel(type);
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
