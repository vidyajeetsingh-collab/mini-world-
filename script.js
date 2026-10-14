import * as THREE from
    'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

import { OrbitControls } from
    'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/controls/OrbitControls.js';

// ========================================
// MINI VERSE 3D
// Complete upgraded world
// ========================================

const canvas = document.getElementById('world');
const loading = document.getElementById('loading');
const info = document.getElementById('info');

if (!canvas) {
    throw new Error('Canvas element #world was not found.');
}

// SCENE
const scene = new THREE.Scene();

const daySky = 0x87ceeb;
const nightSky = 0x101a36;

scene.background = new THREE.Color(daySky);
scene.fog = new THREE.Fog(daySky, 150, 300);

// CAMERA
const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(65, 55, 80);

// RENDERER
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    powerPreference: 'high-performance'
});

renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio || 1, 1.5)
);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// CAMERA CONTROLS
const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.06;

controls.enableRotate = true;
controls.enableZoom = true;
controls.enablePan = true;

controls.rotateSpeed = 0.7;
controls.zoomSpeed = 0.8;
controls.panSpeed = 0.7;

controls.minDistance = 12;
controls.maxDistance = 190;
controls.maxPolarAngle = Math.PI / 2.05;
controls.screenSpacePanning = true;

// ========================================
// LIGHTING
// ========================================

const ambientLight = new THREE.HemisphereLight(
    0xffffff,
    0x58704b,
    1.8
);

scene.add(ambientLight);

const sun = new THREE.DirectionalLight(
    0xffffff,
    2.2
);

sun.position.set(50, 90, 40);
sun.castShadow = true;

sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -120;
sun.shadow.camera.right = 120;
sun.shadow.camera.top = 120;
sun.shadow.camera.bottom = -120;

scene.add(sun);

const moonLight = new THREE.DirectionalLight(
    0x9bbcff,
    0
);

moonLight.position.set(-40, 60, -30);
scene.add(moonLight);

// ========================================
// MATERIALS
// ========================================

function makeMaterial(color, extra = {}) {
    return new THREE.MeshStandardMaterial({
        color,
        roughness: 0.85,
        ...extra
    });
}

const mat = {
    grass: makeMaterial(0x5ca34b),
    grassDark: makeMaterial(0x41813a),

    road: makeMaterial(0x343b45),
    sidewalk: makeMaterial(0xb9b9b1),
    roadLine: makeMaterial(0xffffff),

    building1: makeMaterial(0xe6d8b8),
    building2: makeMaterial(0xd2dce5),
    building3: makeMaterial(0xe4b78a),

    glass: makeMaterial(0x70c7e8, {
        metalness: 0.25,
        roughness: 0.3
    }),

    door: makeMaterial(0x49352a),
    roof: makeMaterial(0x858b96),

    trunk: makeMaterial(0x704323),
    leaves: makeMaterial(0x238448),

    white: makeMaterial(0xffffff),
    red: makeMaterial(0xd9473f),
    blue: makeMaterial(0x2869cf),
    yellow: makeMaterial(0xf5ca42),

    pants: makeMaterial(0x26344b),
    skin: makeMaterial(0xd9a477)
};

// ========================================
// GENERAL 3D OBJECT CREATOR
// ========================================

function addBox(
    name,
    x,
    y,
    z,
    width,
    height,
    depth,
    material,
    shadows = true
) {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        material
    );

    mesh.name = name;

    // y represents the bottom of the object
    mesh.position.set(
        x,
        y + height / 2,
        z
    );

    mesh.castShadow = shadows;
    mesh.receiveShadow = true;

    scene.add(mesh);

    return mesh;
}

// ========================================
// GROUND
// ========================================

addBox(
    'Green World',
    0, -1, 0,
    220, 1, 220,
    mat.grass,
    false
);

// Decorative green sections
addBox(
    'Western Park',
    -65, 0.01, 0,
    20, 0.05, 100,
    mat.grassDark,
    false
);

addBox(
    'Eastern Park',
    65, 0.01, 0,
    20, 0.05, 100,
    mat.grassDark,
    false
);

// ========================================
// ROADS AND SIDEWALKS
// ========================================

// Main roads
addBox(
    'North South Road',
    0, 0.02, 0,
    13, 0.08, 220,
    mat.road,
    false
);

addBox(
    'East West Road',
    0, 0.03, 0,
    220, 0.08, 13,
    mat.road,
    false
);

// Sidewalks along the main roads
addBox(
    'Roadside West',
    -8, 0.02, 0,
    2, 0.1, 220,
    mat.sidewalk,
    false
);

addBox(
    'Roadside East',
    8, 0.02, 0,
    2, 0.1, 220,
    mat.sidewalk,
    false
);

addBox(
    'Roadside North',
    0, 0.02, -8,
    220, 0.1, 2,
    mat.sidewalk,
    false
);

addBox(
    'Roadside South',
    0, 0.02, 8,
    220, 0.1, 2,
    mat.sidewalk,
    false
);

// Road markings
for (let z = -100; z <= 100; z += 10) {
    addBox(
        'Road Marking',
        0, 0.08, z,
        0.22, 0.02, 4,
        mat.roadLine,
        false
    );
}

for (let x = -100; x <= 100; x += 10) {
    addBox(
        'Road Marking',
        x, 0.09, 0,
        4, 0.02, 0.22,
        mat.roadLine,
        false
    );
}

// ========================================
// BUILDINGS
// ========================================

const buildings = [];

function createBuilding(
    name,
    x,
    z,
    width,
    height,
    depth,
    material
) {
    const building = addBox(
        name,
        x, 0, z,
        width, height, depth,
        material
    );

    building.userData.description =
        name + ' — ' +
        Math.max(1, Math.round(height / 4)) +
        ' floors';

    buildings.push(building);

    // Front windows
    const floors = Math.floor(height / 4);
    const columns = Math.max(
        2,
        Math.floor(width / 3)
    );

    for (let floor = 0; floor < floors; floor++) {
        for (let col = 0; col < columns; col++) {
            const wx =
                x - width / 2 +
                (col + 0.5) * width / columns;

            const wy = 1.2 + floor * 4;

            const windowMesh = new THREE.Mesh(
                new THREE.BoxGeometry(
                    Math.min(1.5, width / columns * 0.55),
                    1.5,
                    0.08
                ),
                mat.glass
            );

            windowMesh.position.set(
                wx,
                wy,
                z + depth / 2 + 0.05
            );

            scene.add(windowMesh);
        }
    }

    // Side windows
    for (let floor = 0; floor < floors; floor++) {
        for (let col = 0; col < 3; col++) {
            const wz =
                z - depth / 2 +
                (col + 0.5) * depth / 3;

            const wy = 1.2 + floor * 4;

            const windowMesh = new THREE.Mesh(
                new THREE.BoxGeometry(
                    0.08,
                    1.5,
                    1.2
                ),
                mat.glass
            );

            windowMesh.position.set(
                x + width / 2 + 0.05,
                wy,
                wz
            );

            scene.add(windowMesh);
        }
    }

    // Rooftop structure
    addBox(
        name + ' Rooftop',
        x,
        height,
        z,
        width * 0.35,
        1.2,
        depth * 0.35,
        mat.roof
    );

    // Entrance door
    addBox(
        name + ' Entrance',
        x,
        0,
        z + depth / 2 + 0.12,
        2,
        3,
        0.18,
        mat.door
    );

    // Entrance canopy
    addBox(
        name + ' Canopy',
        x,
        3.05,
        z + depth / 2 + 0.7,
        4,
        0.3,
        1.5,
        mat.roof
    );

    return building;
}

// Four main buildings
createBuilding(
    'Science Block',
    -30, -30,
    24, 20, 20,
    mat.building1
);

createBuilding(
    'Main Library',
    30, -30,
    22, 28, 20,
    mat.building2
);

createBuilding(
    'Student Centre',
    -32, 30,
    25, 16, 22,
    mat.building3
);

createBuilding(
    'Administration',
    32, 30,
    22, 22, 20,
    mat.building1
);

// ========================================
// FOOTBALL FIELD
// ========================================

const field = addBox(
    'Football Field',
    68, 0.02, -40,
    48, 0.12, 30,
    makeMaterial(0x328747),
    false
);

function fieldLine(x, z, width, depth) {
    addBox(
        'Field Boundary',
        x, 0.15, z,
        width, 0.04, depth,
        mat.white,
        false
    );
}

fieldLine(68, -55, 48, 0.15);
fieldLine(68, -25, 48, 0.15);
fieldLine(44, -40, 0.15, 30);
fieldLine(92, -40, 0.15, 30);
fieldLine(68, -40, 0.15, 30);

// ========================================
// TREES
// ========================================

function createTree(x, z, scale = 1) {
    const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(
            0.3 * scale,
            0.45 * scale,
            3 * scale,
            8
        ),
        mat.trunk
    );

    trunk.position.set(
        x,
        1.5 * scale,
        z
    );

    trunk.castShadow = true;
    scene.add(trunk);

    const crown = new THREE.Mesh(
        new THREE.SphereGeometry(
            2 * scale,
            10,
            8
        ),
        mat.leaves
    );

    crown.position.set(
        x,
        4 * scale,
        z
    );

    crown.castShadow = true;
    scene.add(crown);
}

// Boundary trees
for (let i = -90; i <= 90; i += 12) {
    createTree(i, -100, 1.1);
    createTree(i, 100, 1.1);

    if (Math.abs(i) > 12) {
        createTree(-100, i, 1);
        createTree(100, i, 1);
    }
}

// Trees alongside the road
for (let i = -70; i <= 70; i += 14) {
    createTree(i, -13, 0.8);
    createTree(i, 13, 0.8);
}

// Additional park trees
for (let i = 0; i < 12; i++) {
    createTree(
        -78 + Math.random() * 12,
        -40 + Math.random() * 80,
        0.8 + Math.random() * 0.4
    );

    createTree(
        66 + Math.random() * 12,
        -10 + Math.random() * 80,
        0.8 + Math.random() * 0.4
    );
}

// ========================================
// 3D HUMAN CHARACTERS
// ========================================

const people = [];

function createPerson(x, z, clothingMaterial) {
    const person = new THREE.Group();

    // Body
    const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(
            0.38,
            0.7,
            4,
            8
        ),
        clothingMaterial
    );

    body.position.y = 1.55;
    body.castShadow = true;
    person.add(body);

    // Head
    const head = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.36,
            12,
            10
        ),
        mat.skin
    );

    head.position.y = 2.5;
    head.castShadow = true;
    person.add(head);

    // Hair
    const hair = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.37,
            12,
            8,
            0,
            Math.PI * 2,
            0,
            Math.PI / 2
        ),
        makeMaterial(0x30251f)
    );

    hair.position.y = 2.62;
    person.add(hair);

    // Limbs
    function makeLimb(
        length,
        radius,
        material,
        xPos,
        yPos
    ) {
        const limb = new THREE.Mesh(
            new THREE.CapsuleGeometry(
                radius,
                length,
                3,
                6
            ),
            material
        );

        limb.position.set(
            xPos,
            yPos,
            0
        );

        limb.castShadow = true;
        person.add(limb);

        return limb;
    }

    const leftArm = makeLimb(
        0.55, 0.12,
        clothingMaterial,
        -0.48, 1.55
    );

    const rightArm = makeLimb(
        0.55, 0.12,
        clothingMaterial,
        0.48, 1.55
    );

    const leftLeg = makeLimb(
        0.55, 0.14,
        mat.pants,
        -0.2, 0.52
    );

    const rightLeg = makeLimb(
        0.55, 0.14,
        mat.pants,
        0.2, 0.52
    );

    person.position.set(x, 0, z);
    scene.add(person);

    people.push({
        object: person,
        limbs: [
            leftArm,
            rightArm,
            leftLeg,
            rightLeg
        ],
        startX: x,
        startZ: z,
        phase: Math.random() * Math.PI * 2
    });
}

// Create people around the campus
for (let i = 0; i < 10; i++) {
    createPerson(
        -8 + Math.random() * 16,
        -20 + Math.random() * 40,
        mat.blue
    );

    createPerson(
        -20 + Math.random() * 40,
        -8 + Math.random() * 16,
        mat.red
    );
}

// ========================================
// BUILDING INTERACTION
// ========================================

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

renderer.domElement.addEventListener(
    'pointerdown',
    event => {
        pointer.x =
            (event.clientX / window.innerWidth) * 2 - 1;

        pointer.y =
            -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(
            pointer,
            camera
        );

        const hits = raycaster.intersectObjects(
            buildings,
            false
        );

        if (hits.length > 0) {
            info.textContent =
                hits[0].object.userData.description;

            info.style.display = 'block';
        }
    }
);

// ========================================
// DAY / NIGHT MODE
// ========================================

let nightMode = false;

document.getElementById('dayNight')
    .addEventListener('click', () => {

        nightMode = !nightMode;

        if (nightMode) {
            scene.background.set(nightSky);
            scene.fog.color.set(nightSky);

            sun.intensity = 0.25;
            ambientLight.intensity = 0.4;
            moonLight.intensity = 0.8;

            document.getElementById('dayNight')
                .textContent = '☀ DAY';

        } else {
            scene.background.set(daySky);
            scene.fog.color.set(daySky);

            sun.intensity = 2.2;
            ambientLight.intensity = 1.8;
            moonLight.intensity = 0;

            document.getElementById('dayNight')
                .textContent = '☾ NIGHT';
        }
    });

// ========================================
// CAMERA BUTTONS
// ========================================

let autoRotate = false;

document.getElementById('rotate')
    .addEventListener('click', () => {

        autoRotate = !autoRotate;

        controls.autoRotate = autoRotate;
        controls.autoRotateSpeed = 1.2;
    });

document.getElementById('zoomIn')
    .addEventListener('click', () => {

        camera.position
            .sub(controls.target)
            .multiplyScalar(0.85)
            .add(controls.target);
    });

document.getElementById('zoomOut')
    .addEventListener('click', () => {

        camera.position
            .sub(controls.target)
            .multiplyScalar(1.18)
            .add(controls.target);
    });

document.getElementById('reset')
    .addEventListener('click', () => {

        camera.position.set(65, 55, 80);

        controls.target.set(0, 0, 0);

        controls.autoRotate = false;
        autoRotate = false;

        controls.update();

        info.style.display = 'none';
    });

// ========================================
// RESIZE SUPPORT
// ========================================

window.addEventListener('resize', () => {
    camera.aspect =
        window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.5)
    );
});

// ========================================
// ANIMATION
// ========================================

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    // Move people and animate their limbs
    people.forEach(person => {
        const movement =
            time * 3 + person.phase;

        person.object.position.x =
            person.startX +
            Math.sin(time * 0.5 + person.phase) * 2;

        person.object.position.z =
            person.startZ +
            Math.cos(time * 0.4 + person.phase) * 2;

        person.limbs[0].rotation.z =
            Math.sin(movement) * 0.35;

        person.limbs[1].rotation.z =
            -Math.sin(movement) * 0.35;

        person.limbs[2].rotation.z =
            Math.sin(movement) * 0.25;

        person.limbs[3].rotation.z =
            -Math.sin(movement) * 0.25;
    });

    controls.update();

    renderer.render(
        scene,
        camera
    );
}

// Start the world
animate();

if (loading) {
    loading.style.display = 'none';
}

console.log('MINI VERSE 3D initialized successfully.');