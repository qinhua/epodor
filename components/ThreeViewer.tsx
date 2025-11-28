import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ComponentType } from '../types';

interface ThreeViewerProps {
  type: ComponentType;
}

const ThreeViewer: React.FC<ThreeViewerProps> = ({ type }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const meshRef = useRef<THREE.Group>(null);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    
    // Camera
    const camera = new THREE.PerspectiveCamera(50, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 6;
    camera.position.y = 2;
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 5, 10);
    scene.add(dirLight);
    const rimLight = new THREE.DirectionalLight(0x06b6d4, 0.8);
    rimLight.position.set(-5, 2, -10);
    scene.add(rimLight);

    // Materials
    const matMetal = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.9, roughness: 0.2 });
    const matDarkPlastic = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.1, roughness: 0.6 });
    const matWhitePlastic = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.5 });
    const matBlueBody = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.1, roughness: 0.5 });
    const matResistorBody = new THREE.MeshStandardMaterial({ color: 0xd2b48c, roughness: 0.4 });
    const matGlass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.8, opacity: 0.5, roughness: 0.1 });
    const matCopper = new THREE.MeshStandardMaterial({ color: 0xb87333, metalness: 0.6, roughness: 0.4 });

    // Mesh
    const mesh = new THREE.Group();
    meshRef.current = mesh;

    // Helper: Leads
    const addLeads = (dist: number, length: number = 1.5, vertical = false, color = matMetal) => {
      const geo = new THREE.CylinderGeometry(0.05, 0.05, length);
      const l1 = new THREE.Mesh(geo, color);
      const l2 = new THREE.Mesh(geo, color);
      if (vertical) {
        l1.position.set(-dist, -length/2, 0);
        l2.position.set(dist, -length/2, 0);
      } else {
        l1.rotation.z = Math.PI/2; l2.rotation.z = Math.PI/2;
        l1.position.x = -dist - length/2;
        l2.position.x = dist + length/2;
      }
      mesh.add(l1); mesh.add(l2);
    };

    switch (type) {
      case ComponentType.RESISTOR: {
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2, 32), matResistorBody);
        body.rotation.z = Math.PI / 2;
        mesh.add(body);
        addLeads(1.0);
        // Bands
        [0.8, 0.4, 0, -0.4].forEach((x, i) => {
          const c = [0x8B4513, 0x000000, 0xFF0000, 0xFFD700][i];
          const band = new THREE.Mesh(new THREE.CylinderGeometry(0.51, 0.51, 0.2, 32), new THREE.MeshBasicMaterial({color: c}));
          band.rotation.z = Math.PI/2;
          band.position.x = x - 0.2;
          mesh.add(band);
        });
        break;
      }
      case ComponentType.CAPACITOR: {
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 1.6, 32), matDarkPlastic);
        mesh.add(body);
        const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.61, 0.61, 1.6, 32, 1, true, 0, 0.6), new THREE.MeshStandardMaterial({color: 0xaaaaaa}));
        mesh.add(stripe);
        const top = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.1), matMetal);
        top.position.y = 0.8;
        mesh.add(top);
        addLeads(0.2, 1.2, true);
        break;
      }
      case ComponentType.LED: {
        const bulb = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.8, 32), new THREE.MeshPhysicalMaterial({color: 0xff0000, transmission: 0.6, roughness: 0.1}));
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 16, 0, Math.PI*2, 0, Math.PI/2), bulb.material);
        bulb.position.y = 0.2; dome.position.y = 0.6;
        mesh.add(bulb); mesh.add(dome);
        const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.1), bulb.material);
        rim.position.y = -0.2; mesh.add(rim);
        addLeads(0.15, 1.5, true);
        break;
      }
      case ComponentType.TRANSISTOR: { // TO-92
        const shape = new THREE.Shape();
        shape.moveTo(-0.4,0); shape.lineTo(0.4,0); shape.arc(0,0,0.4,0,Math.PI,false);
        const body = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, {depth:0.8, bevelEnabled:false}), matDarkPlastic);
        body.rotation.x = -Math.PI/2; body.position.set(0, 0.5, -0.4);
        mesh.add(body);
        [-0.2,0,0.2].forEach(x => {
          const l = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.5, 0.1), matMetal);
          l.position.set(x, -0.5, 0); mesh.add(l);
        });
        break;
      }
      case ComponentType.MOSFET: { // TO-220
        const backPlate = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.0, 0.1), matMetal);
        backPlate.position.y = 0.5;
        const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.2), matMetal);
        hole.rotation.x = Math.PI/2; hole.position.set(0, 1.2, 0); 
        // Simple subtraction visual by just adding a dark circle
        const holeVis = new THREE.Mesh(new THREE.CircleGeometry(0.15, 16), new THREE.MeshBasicMaterial({color:0x000000}));
        holeVis.position.set(0, 1.2, 0.06);
        mesh.add(backPlate); mesh.add(holeVis);
        
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.2, 0.5), matDarkPlastic);
        body.position.set(0, 0.1, 0.3);
        mesh.add(body);
        
        [-0.5, 0, 0.5].forEach(x => {
            const l = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.5, 0.1), matMetal);
            l.position.set(x, -1.0, 0.3); mesh.add(l);
        });
        break;
      }
      case ComponentType.IC: 
      case ComponentType.OPTOCOUPLER: { // DIP-8 or DIP-4
        const width = type === ComponentType.OPTOCOUPLER ? 1.0 : 1.8;
        const body = new THREE.Mesh(new THREE.BoxGeometry(width, 0.5, 1.2), type === ComponentType.OPTOCOUPLER ? matWhitePlastic : matDarkPlastic);
        mesh.add(body);
        const pins = type === ComponentType.OPTOCOUPLER ? 2 : 4;
        for(let i=0; i<pins; i++) {
          const px = -width/3 + i * (width/1.5); // approximate
          const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 0.1), matMetal);
          p1.position.set(px, -0.4, 0.6); p1.rotation.x = 0.2;
          const p2 = p1.clone();
          p2.position.set(px, -0.4, -0.6); p2.rotation.x = -0.2;
          mesh.add(p1); mesh.add(p2);
        }
        break;
      }
      case ComponentType.DIODE:
      case ComponentType.ZENER_DIODE: {
        const color = type === ComponentType.ZENER_DIODE ? 0xffaaaa : 0x111111; // Zener reddish glass
        const mat = type === ComponentType.ZENER_DIODE ? new THREE.MeshPhysicalMaterial({color:0xff6666, transmission:0.6}) : matDarkPlastic;
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.2, 32), mat);
        body.rotation.z = Math.PI/2; mesh.add(body);
        const band = new THREE.Mesh(new THREE.CylinderGeometry(0.41, 0.41, 0.2, 32), matMetal);
        band.rotation.z = Math.PI/2; band.position.x = 0.4; mesh.add(band);
        addLeads(0.6);
        break;
      }
      case ComponentType.VARISTOR: { // Blue Disc
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.2, 32), matBlueBody);
        disc.rotation.x = Math.PI/2;
        mesh.add(disc);
        addLeads(0.4, 1.5, true);
        break;
      }
      case ComponentType.SPEAKER: { // Buzzer
        const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.8, 32), matDarkPlastic);
        mesh.add(cyl);
        const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.1), matMetal);
        hole.position.y = 0.4; mesh.add(hole);
        addLeads(0.3, 1.0, true);
        break;
      }
      case ComponentType.SWITCH: { // Tactile Switch
        const base = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.2, 1.0), matMetal);
        mesh.add(base);
        const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.3), matDarkPlastic);
        btn.position.y = 0.2; mesh.add(btn);
        break;
      }
      default: // Fallback
        const generic = new THREE.Mesh(new THREE.BoxGeometry(1,1,1), matDarkPlastic);
        mesh.add(generic);
    }

    scene.add(mesh);

    // Animation
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if(mountRef.current) {
         camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
         camera.updateProjectionMatrix();
         renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if(mountRef.current && renderer.domElement) mountRef.current.removeChild(renderer.domElement);
      renderer.dispose();
    }
  }, [type]);

  // Interaction
  const handleStart = (e: any) => {
    isDragging.current = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    previousMousePosition.current = { x: clientX, y: clientY };
  };
  const handleMove = (e: any) => {
    if(!isDragging.current || !meshRef.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const delta = { x: clientX - previousMousePosition.current.x, y: clientY - previousMousePosition.current.y };
    meshRef.current.rotation.y += delta.x * 0.01;
    meshRef.current.rotation.x += delta.y * 0.01;
    previousMousePosition.current = { x: clientX, y: clientY };
  };
  const handleEnd = () => isDragging.current = false;

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full min-h-[300px] cursor-move touch-none"
      onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd} onMouseLeave={handleEnd}
      onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
    />
  );
};

export default ThreeViewer;
