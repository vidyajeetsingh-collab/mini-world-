import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js';

const canvas = document.getElementById('world');
const loading = document.getElementById('loading');
const info = document.getElementById('info');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 100, 280);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(55, 45, 65);

const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI / 2.05;
controls.minDistance = 15;
controls.maxDistance = 150;

scene.add(new THREE.HemisphereLight(0xffffff, 0x526b40, 2));

const sun = new THREE.DirectionalLight(0xffffff, 2.5);
sun.position.set(40, 80, 30);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
scene.add(sun);

// Materials
const materials = {
    grass: new THREE.MeshStandardMaterial({ color: 0x5ca34b }),
    road: new THREE.MeshStandardMaterial({ color: 0x353b42 }),
    line: new THREE.MeshStandardMaterial({ color: 0xffffff }),
    building1: new THREE.MeshStandardMaterial({ color: 0xe6d8b8 }),
    building2: new THREE.MeshStandardMaterial({ color: 0xd2dce5 }),
    building3: new THREE.MeshStandardMaterial({ color: 0xe4b78a }),
    glass: new THREE.MeshStandardMaterial({
        color: 0x70c7e8,
        metalness: 0.25,
        roughness: 0.25
    }),
    trunk: new THREE.MeshStandardMaterial({ color: 0x704323 }),
    leaves: new THREE.MeshStandardMaterial({ color: 0x238448 }),
    white: new THREE.MeshStandardMaterial({ color: 0xffffff }),
    red: new THREE.MeshStandardMaterial({ color: 0xd9473f }),
    blue: new THREE.MeshStandardMaterial({ color: 0x2869cf }),
    yellow: new THREE.MeshStandardMaterial({ color: 0xf5ca42 })
};

function addBox(name, x, y, z, width, height, depth, material, shadow = true) {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        material
    );
    mesh.name = name;
    mesh.position.set(x, y + height / 2, z);
    mesh.castShadow = shadow;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
}

// Ground
addBox('Ground', 0, -1, 0, 220, 1, 220, materials.grass, false);

// Roads
add