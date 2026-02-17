import * as THREE from 'three';
import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';

// Configuration
const CONFIG = {
    characters: ' .:-+*=%@#',
    fontSize: 10,
    color: '#333333',
    bgColor: '#faf9f6',
};

let camera, scene, renderer, effect;
let waterMesh, waterGeo;

// Ripple Simulation State
const ripples = [];
const MAX_RIPPLES = 6;  // Fewer concurrent ripples (Zen)
const RIPPLE_SPEED = 0.3; // Much slower expansion
const RIPPLE_DECAY = 0.005; // Fades out very slowly

init();
animate();

function init() {
    const container = document.getElementById('walden-container');
    if (!container) return; // Stop if container doesn't exist (e.g. non-home pages)

    // 1. Scene & Camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / 400, 1, 1000);
    camera.position.set(0, 400, 0);
    camera.lookAt(0, 0, 0);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(CONFIG.bgColor);

    // 2. Light
    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(100, 200, 100);
    scene.add(dirLight);

    // 3. Water Plane
    waterGeo = new THREE.PlaneGeometry(800, 400, 100, 50);
    const waterMat = new THREE.MeshPhongMaterial({
        color: 0x222222,
        flatShading: true,
        side: THREE.DoubleSide
    });
    waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.rotation.x = -Math.PI / 2;
    scene.add(waterMesh);

    // 4. Renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, 400);

    effect = new AsciiEffect(renderer, CONFIG.characters, { invert: true });
    effect.setSize(window.innerWidth, 400);
    effect.domElement.style.color = CONFIG.color;
    effect.domElement.style.backgroundColor = CONFIG.bgColor;
    effect.domElement.style.fontSize = `${CONFIG.fontSize}px`;
    effect.domElement.style.lineHeight = `${CONFIG.fontSize}px`;
    effect.domElement.style.cursor = 'crosshair';

    container.innerHTML = "";
    container.appendChild(effect.domElement);

    // Events
    window.addEventListener('resize', onWindowResize);
    // Mouse Interaction
    effect.domElement.addEventListener('mousemove', onMouseMove);

    // Initial splash
    addRipple(0, 0, 1.5);
}

function addRipple(x, z, strength) {
    ripples.push({
        x: x,
        y: z,
        age: 0,
        strength: strength
    });
    if (ripples.length > MAX_RIPPLES) {
        ripples.shift();
    }
}

function onMouseMove(e) {
    if (!effect) return;
    const rect = effect.domElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Require intent (rare trigger)
    if (Math.random() > 0.95) {
        addRipple(x * 400, -y * 200, 0.8 + Math.random() * 0.5);
    }
}

function onWindowResize() {
    if (!camera || !renderer || !effect) return;
    camera.aspect = window.innerWidth / 400;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, 400);
    effect.setSize(window.innerWidth, 400);
}

function animate() {
    requestAnimationFrame(animate);

    // Random Rain (Zen Mode - Rare)
    if (Math.random() > 0.992) {
        addRipple(
            (Math.random() - 0.5) * 600,
            (Math.random() - 0.5) * 300,
            0.5 + Math.random() * 1.0
        );
    }

    render();
}

function render() {
    if (!waterGeo || !effect) return;

    // Update Ripples
    const positionAttribute = waterGeo.getAttribute('position');
    const vertex = new THREE.Vector3();

    for (let i = 0; i < positionAttribute.count; i++) {
        vertex.fromBufferAttribute(positionAttribute, i);

        let totalZ = 0;

        for (let r of ripples) {
            const dist = Math.sqrt(Math.pow(vertex.x - r.x, 2) + Math.pow(vertex.y - r.y, 2));

            // Interaction range
            if (dist < r.age * 10 + 50 && dist > r.age * 5 - 50) {
                // Damping sin wave
                totalZ += Math.sin(dist * 0.06 - r.age) * r.strength * 5 * Math.exp(-dist * 0.005);
            }
        }

        positionAttribute.setZ(i, totalZ);
    }

    positionAttribute.needsUpdate = true;
    waterGeo.computeVertexNormals();

    // Update Physics
    for (let i = ripples.length - 1; i >= 0; i--) {
        ripples[i].age += RIPPLE_SPEED;
        ripples[i].strength -= RIPPLE_DECAY;
        if (ripples[i].strength <= 0) {
            ripples.splice(i, 1);
        }
    }

    effect.render(scene, camera);
}
