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
controls.dampingFactor = 0.06;

controls.enableRotate = true;
controls.enableZoom = true;
controls.enablePan = true;

controls.rotateSpeed = 0.7;
controls.zoomSpeed = 0.8;
controls.panSpeed = 0.7;

controls.maxPolarAngle = Math.PI / 2.05;
controls.minDistance = 12;
controls.maxDistance = 180;

controls.screenSpacePanning = true;

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
addBox('Main Road', 0, 0.02, 0, 13, 0.08, 220, materials.road, false);
addBox('Cross Road', 0, 0.03, 0, 220, 0.08, 13, materials.road, false);

// Road markings
for (let z = -100; z <= 100; z += 10) {
    addBox('Road marking', 0, 0.09, z, 0.25, 0.02, 4, materials.line, false);
}
for (let x = -100; x <= 100; x += 10) {
    addBox('Road marking', x, 0.10, 0, 4, 0.02, 0.25, materials.line, false);
}

// Buildings with windows
function createBuilding(name, x, z, width, height, depth, material) {
    const building = addBox(name, x, 0, z, width, height, depth, material);
    building.userData.description =
        `${name} — ${Math.max(1, Math.round(height / 4))} floors`;

    // Front-facing windows
    const floors = Math.floor(height / 4);
    const columns = Math.max(2, Math.floor(width / 3));

    for (let floor = 0; floor < floors; floor++) {
        for (let col = 0; col < columns; col++) {
            const wx = x - width / 2 + (col + 0.5) * width / columns;
            const wy = 1.2 + floor * 4;
            const wz = z + depth / 2 + 0.04;

            const windowMesh = new THREE.Mesh(
                new THREE.BoxGeometry(
                    Math.min(1.5, width / columns * 0.55),
                    1.5,
                    0.08
                ),
                materials.glass
            );
            windowMesh.position.set(wx, wy, wz);
            scene.add(windowMesh);
        }
    }

    // Side windows
    for (let floor = 0; floor < floors; floor++) {
        for (let col = 0; col < 3; col++) {
            const wz = z - depth / 2 + (col + 0.5) * depth / 3;
            const wy = 1.2 + floor * 4;

            const windowMesh = new THREE.Mesh(
                new THREE.BoxGeometry(0.08, 1.5, 1.2),
                materials.glass
            );
            windowMesh.position.set(x + width / 2 + 0.04, wy, wz);
            scene.add(windowMesh);
        }
    }

    return building;
}

createBuilding('Science Block', -30, -30, 24, 20, 20, materials.building1);
createBuilding('Main Library', 30, -30, 22, 28, 20, materials.building2);
createBuilding('Student Centre', -32, 30, 25, 16, 22, materials.building3);
createBuilding('Administration', 32, 30, 22, 22, 20, materials.building1);

// Football field
const field = new THREE.Mesh(
    new THREE.BoxGeometry(48, 0.12, 30),
    new THREE.MeshStandardMaterial({ color: 0x328747 })
);
field.position.set(68, 0, -40);
field.receiveShadow = true;
scene.add(field);

// Field boundary
function fieldLine(x, z, width, depth) {
    const line = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.04, depth),
        materials.white
    );
    line.position.set(x, 0.09, z);
    scene.add(line);
}
fieldLine(68, -55, 48, 0.15);
fieldLine(68, -25, 48, 0.15);
fieldLine(44, -40, 0.15, 30);
fieldLine(92, -40, 0.15, 30);
fieldLine(68, -40, 0.15, 30);

// Trees
function createTree(x, z, scale = 1) {
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35 * scale, 0.5 * scale, 3 * scale, 8),
        materials.trunk
    );
    trunk.position.set(x, 1.5 * scale, z);
    trunk.castShadow = true;
    scene.add(trunk);

    const crown = new THREE.Mesh(
        new THREE.SphereGeometry(2 * scale, 10, 8),
        materials.leaves
    );
    crown.position.set(x, 4 * scale, z);
    crown.castShadow = true;
    scene.add(crown);
}

for (let i = -90; i <= 90; i += 12) {
    createTree(i, -90, 1.1);
    createTree(i, 90, 1.1);
    if (Math.abs(i) > 12) {
        createTree(-90, i, 1);
        createTree(90, i, 1);
    }
}

for (let i = -70; i <= 70; i += 14) {
    createTree(i, -12, 0.8);
    createTree(i, 12, 0.8);
}

// Animated characters
const people = [];

function createPerson(x, z, material) {
    const person = new THREE.Group();

    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.55, 1.5, 8),
        material
    );
    body.position.y = 1.2;
    body.castShadow = true;
    person.add(body);

    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.42, 12, 10),
        new THREE.MeshStandardMaterial({ color: 0xe7b98a })
    );
    head.position.y = 2.25;
    head.castShadow = true;
    person.add(head);

    person.position.set(x, 0, z);
    scene.add(person);

    people.push({
        object: person,
        startX: x,
        startZ: z,
        phase: Math.random() * Math.PI * 2
    });
}

for (let i = 0; i < 14; i++) {
    createPerson(-8 + Math.random() * 16, -20 + Math.random() * 40, materials.blue);
    createPerson(-20 + Math.random() * 40, -8 + Math.random() * 16, materials.red);
}

// Select buildings by tapping
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

renderer.domElement.addEventListener('pointerdown', (event) => {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(pointer, camera);

    const hits = raycaster.intersectObjects(scene.children, false);
    const building = hits.find(hit =>
        hit.object.userData.description
    );

    if (building) {
        info.textContent = building.object.userData.description;
        info.style.display = 'block';
    }
});

// Rotate camera around the world
let autoRotate = false;
let nightMode = false;

document.getElementById('rotate').addEventListener('click', () => {
    autoRotate = !autoRotate;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.2;
});

document.getElementById('zoomIn').addEventListener('click', () => {
    camera.position.sub(controls.target).multiplyScalar(0.85).add(controls.target);
});

document.getElementById('zoomOut').addEventListener('click', () => {
    camera.position.sub(controls.target).multiplyScalar(1.18).add(controls.target);
});

document.getElementById('dayNight').addEventListener('click', () => {
    nightMode = !nightMode;

    if (nightMode) {
        scene.background.set(0x101a36);
        scene.fog.color.set(0x101a36);
        sun.intensity = 0.45;
        document.getElementById('dayNight').textContent = '☀ DAY';
    } else {
        scene.background.set(0x87ceeb);
        scene.fog.color.set(0x87ceeb);
        sun.intensity = 2.5;
        document.getElementById('dayNight').textContent = '☾ NIGHT';
    }
});

document.getElementById('reset').addEventListener('click', () => {
    camera.position.set(55, 45, 65);
    controls.target.set(0, 0, 0);
    controls.autoRotate = false;
    autoRotate = false;
    controls.update();
    info.style.display = 'none';
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    people.forEach(person => {
        person.object.position.x =
            person.startX + Math.sin(time * 0.5 + person.phase) * 2;
        person.object.position.z =
            person.startZ + Math.cos(time * 0.4 + person.phase) * 2;
    });

    controls.update();
    renderer.render(scene, camera);
}

animate();
loading.style.display = 'none';