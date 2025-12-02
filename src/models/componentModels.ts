import * as THREE from "three";
import { ComponentType } from "../types";

// Material definitions
export const createMaterials = () => {
  const matMetal = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0,
    metalness: 0.9,
    roughness: 0.2,
  });
  const matDarkPlastic = new THREE.MeshStandardMaterial({
    color: 0x111111,
    metalness: 0.1,
    roughness: 0.6,
  });
  const matWhitePlastic = new THREE.MeshStandardMaterial({
    color: 0xeeeeee,
    roughness: 0.5,
  });
  const matBlueBody = new THREE.MeshStandardMaterial({
    color: 0x3b82f6,
    metalness: 0.1,
    roughness: 0.5,
  });
  const matResistorBody = new THREE.MeshStandardMaterial({
    color: 0xd2b48c,
    roughness: 0.4,
  });
  const matGlass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transmission: 0.8,
    opacity: 0.5,
    roughness: 0.1,
  });
  const matCopper = new THREE.MeshStandardMaterial({
    color: 0xb87333,
    metalness: 0.6,
    roughness: 0.4,
  });

  return {
    matMetal,
    matDarkPlastic,
    matWhitePlastic,
    matBlueBody,
    matResistorBody,
    matGlass,
    matCopper,
  };
};

// Helper function to add leads to components
const addLeads = (
  mesh: THREE.Group,
  dist: number,
  length: number = 1.5,
  vertical = false,
  material: THREE.Material = createMaterials().matMetal
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

// Create 3D model for a component type
export const createComponentModel = (type: ComponentType): THREE.Group => {
  const mesh = new THREE.Group();
  const materials = createMaterials();
  const {
    matMetal,
    matDarkPlastic,
    matWhitePlastic,
    matBlueBody,
    matResistorBody,
    matGlass,
    matCopper,
  } = materials;

  switch (type) {
    case ComponentType.RESISTOR: {
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 2, 32),
        matResistorBody
      );
      body.rotation.z = Math.PI / 2;
      mesh.add(body);
      addLeads(mesh, 1.0, 1.5, false, matMetal);
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
      addLeads(mesh, 0.2, 1.2, true, matMetal);
      break;
    }
    case ComponentType.LED: {
      const bulb = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.8, 32),
        new THREE.MeshPhysicalMaterial({
          color: 0xff0000,
          transmission: 0.6,
          roughness: 0.1,
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
      addLeads(mesh, 0.15, 1.5, true, matMetal);
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
    case ComponentType.IC: {
      // DIP-8 (NE555) - 8 pins total, 4 on each side
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.5, 1.2),
        matDarkPlastic
      );
      mesh.add(body);
      // Left side pins (1-4)
      for (let i = 0; i < 4; i++) {
        const pin = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 0.6, 0.1),
          matMetal
        );
        const pinZ = -0.45 + i * 0.3;
        pin.position.set(-0.9, -0.4, pinZ);
        pin.rotation.x = 0.2;
        mesh.add(pin);
      }
      // Right side pins (5-8)
      for (let i = 0; i < 4; i++) {
        const pin = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 0.6, 0.1),
          matMetal
        );
        const pinZ = 0.45 - i * 0.3;
        pin.position.set(0.9, -0.4, pinZ);
        pin.rotation.x = -0.2;
        mesh.add(pin);
      }
      break;
    }
    case ComponentType.OPTOCOUPLER: {
      // DIP-4 or DIP-6
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 0.5, 1.2),
        matWhitePlastic
      );
      mesh.add(body);
      // Left side pins
      for (let i = 0; i < 2; i++) {
        const pin = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 0.6, 0.1),
          matMetal
        );
        const pinZ = -0.3 + i * 0.6;
        pin.position.set(-0.5, -0.4, pinZ);
        pin.rotation.x = 0.2;
        mesh.add(pin);
      }
      // Right side pins
      for (let i = 0; i < 2; i++) {
        const pin = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 0.6, 0.1),
          matMetal
        );
        const pinZ = 0.3 - i * 0.6;
        pin.position.set(0.5, -0.4, pinZ);
        pin.rotation.x = -0.2;
        mesh.add(pin);
      }
      break;
    }
    case ComponentType.DIODE:
    case ComponentType.ZENER_DIODE: {
      const mat =
        type === ComponentType.ZENER_DIODE
          ? new THREE.MeshPhysicalMaterial({
              color: 0xff6666,
              transmission: 0.6,
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
      addLeads(mesh, 0.6, 1.5, false, matMetal);
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
      addLeads(mesh, 0.4, 1.5, true, matMetal);
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
      addLeads(mesh, 0.3, 1.0, true, matMetal);
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
    case ComponentType.INDUCTOR: {
      // Toroidal Inductor
      const torus = new THREE.Mesh(
        new THREE.TorusGeometry(0.6, 0.2, 16, 32),
        matDarkPlastic
      );
      torus.rotation.x = Math.PI / 2;
      mesh.add(torus);
      addLeads(mesh, 0.4, 1.5, false, matMetal);
      break;
    }
    case ComponentType.POTENTIOMETER: {
      // Potentiometer with adjustment knob
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.7, 0.6, 32),
        matDarkPlastic
      );
      body.rotation.x = Math.PI / 2;
      mesh.add(body);
      const knob = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16),
        matMetal
      );
      knob.rotation.x = Math.PI / 2;
      knob.position.x = 0.5;
      mesh.add(knob);
      addLeads(mesh, 0.5, 1.2, false, matMetal);
      break;
    }
    case ComponentType.TRANSFORMER: {
      // E-core Transformer
      const core1 = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.3, 1.0),
        matMetal
      );
      core1.position.y = 0.5;
      mesh.add(core1);
      const core2 = new THREE.Mesh(
        new THREE.BoxGeometry(2.0, 0.3, 1.0),
        matMetal
      );
      core2.position.y = -0.5;
      mesh.add(core2);
      const center = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 1.0, 0.4),
        matMetal
      );
      mesh.add(center);
      const coil1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.8, 32),
        matCopper
      );
      coil1.position.set(-0.6, 0, 0);
      mesh.add(coil1);
      const coil2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.8, 32),
        matCopper
      );
      coil2.position.set(0.6, 0, 0);
      mesh.add(coil2);
      addLeads(mesh, 0.8, 1.0, true, matMetal);
      break;
    }
    case ComponentType.FUSE: {
      // Glass Fuse
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 1.8, 32),
        matGlass
      );
      body.rotation.z = Math.PI / 2;
      mesh.add(body);
      const cap1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.2, 32),
        matMetal
      );
      cap1.rotation.z = Math.PI / 2;
      cap1.position.x = 1.0;
      mesh.add(cap1);
      const cap2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.2, 32),
        matMetal
      );
      cap2.rotation.z = Math.PI / 2;
      cap2.position.x = -1.0;
      mesh.add(cap2);
      const filament = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 1.6, 8),
        new THREE.MeshBasicMaterial({ color: 0xffaa00 })
      );
      filament.rotation.z = Math.PI / 2;
      mesh.add(filament);
      addLeads(mesh, 1.1, 0.8, false, matMetal);
      break;
    }
    case ComponentType.CRYSTAL: {
      // Crystal Oscillator - Common metal can style
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 1.2, 32),
        matMetal
      );
      body.rotation.z = Math.PI / 2;
      mesh.add(body);
      const topCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.38, 0.15, 32),
        matMetal
      );
      topCap.rotation.z = Math.PI / 2;
      topCap.position.x = 0.6;
      mesh.add(topCap);
      const bottomCap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38, 0.38, 0.15, 32),
        matMetal
      );
      bottomCap.rotation.z = Math.PI / 2;
      bottomCap.position.x = -0.6;
      mesh.add(bottomCap);
      addLeads(mesh, 0.6, 1.2, false, matMetal);
      break;
    }
    case ComponentType.THERMISTOR: {
      // Thermistor - Similar to resistor but with different color
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 1.5, 32),
        new THREE.MeshStandardMaterial({
          color: 0x8b4513,
          roughness: 0.4,
        })
      );
      body.rotation.z = Math.PI / 2;
      mesh.add(body);
      addLeads(mesh, 0.75, 1.5, false, matMetal);
      break;
    }
    case ComponentType.THYRISTOR: {
      // Thyristor - Similar to transistor but with different shape
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 1.0, 32),
        matDarkPlastic
      );
      body.rotation.x = Math.PI / 2;
      mesh.add(body);
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.6, 0.1, 32),
        matMetal
      );
      base.rotation.x = Math.PI / 2;
      base.position.x = -0.5;
      mesh.add(base);
      [-0.2, 0, 0.2].forEach((x) => {
        const l = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 1.2, 0.1),
          matMetal
        );
        l.position.set(x, -0.6, 0);
        mesh.add(l);
      });
      break;
    }
    case ComponentType.RELAY: {
      // Relay - Box with coil and contacts
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 1.0, 1.0),
        matWhitePlastic
      );
      mesh.add(body);
      const coil = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.3, 0.6, 16),
        matCopper
      );
      coil.rotation.z = Math.PI / 2;
      coil.position.set(-0.3, 0, 0);
      mesh.add(coil);
      const contact1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.3, 0.1),
        matMetal
      );
      contact1.position.set(0.5, 0.2, 0.3);
      mesh.add(contact1);
      const contact2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.3, 0.1),
        matMetal
      );
      contact2.position.set(0.5, 0.2, -0.3);
      mesh.add(contact2);
      addLeads(mesh, 0.6, 1.0, true, matMetal);
      break;
    }
    case ComponentType.OPAMP: {
      const body = new THREE.Mesh(
        new THREE.ConeGeometry(0.9, 1.8, 32),
        new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: 0.4 })
      );
      body.rotation.z = Math.PI;
      mesh.add(body);
      addLeads(mesh, 0.6, 1.2, true, matMetal);
      break;
    }
    case ComponentType.VOLTAGE_SOURCE: {
      const plateLong = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 1.2, 0.1),
        matMetal
      );
      plateLong.position.x = -0.4;
      const plateShort = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.6, 0.1),
        matMetal
      );
      plateShort.position.x = 0.4;
      mesh.add(plateLong);
      mesh.add(plateShort);
      addLeads(mesh, 0.9, 1.0, false, matMetal);
      break;
    }
    case ComponentType.CURRENT_SOURCE: {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.6, 0.08, 16, 32),
        matMetal
      );
      ring.rotation.x = Math.PI / 2;
      mesh.add(ring);
      const arrow = new THREE.Mesh(
        new THREE.ConeGeometry(0.2, 0.4, 16),
        matMetal
      );
      arrow.position.y = 0.2;
      mesh.add(arrow);
      addLeads(mesh, 0.8, 1.0, false, matMetal);
      break;
    }
    case ComponentType.GROUND: {
      const bar1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.05, 0.1),
        matMetal
      );
      bar1.position.y = -0.2;
      const bar2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.05, 0.1),
        matMetal
      );
      bar2.position.y = -0.4;
      const bar3 = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.05, 0.1),
        matMetal
      );
      bar3.position.y = -0.6;
      mesh.add(bar1);
      mesh.add(bar2);
      mesh.add(bar3);
      const stem = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.4, 0.1),
        matMetal
      );
      stem.position.y = -0.05;
      mesh.add(stem);
      break;
    }
    case ComponentType.BUTTON: {
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 0.2, 1.0),
        matMetal
      );
      mesh.add(base);
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.3, 24),
        matWhitePlastic
      );
      cap.position.y = 0.25;
      mesh.add(cap);
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

  return mesh;
};
