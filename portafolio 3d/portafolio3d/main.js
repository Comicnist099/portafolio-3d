import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let speedMouseGlobal=1;
// Setup

/* // Agregar OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;

// Configuración del mouse
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', onMouseMove, false);

function onMouseMove(event) {
  // Normalizar las coordenadas del mouse
  mouse.x = (event.clientX / window.innerWidth) * 20 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 20 + 1;
} */
//escena
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
let actualTarget=-1;
const target = [
  new THREE.Vector3(0, 0, 3),
  new THREE.Vector3(.2, -1, 2),
  new THREE.Vector3(.2, -.5, 1),
  new THREE.Vector3(.2, -.6, 1),
  new THREE.Vector3(-2, -.5, 1),
  new THREE.Vector3(-2, 0, 0),
  new THREE.Vector3(-2.1, -.5, -.5)
];
const target2 = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 1, 1),
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(-2, 0, 0),
  new THREE.Vector3(0, 0, 0)
];

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true; // Habilitar el mapeo de sombras}
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // o el tipo que prefieras

document.body.appendChild( renderer.domElement );

let lerpFactor = 0.01;
let transitionAnimation;

let isTransitioning = false;


let lerpRotationFactor = 0.01;
let rotationTransitionAnimation;

// Función para rotar suavemente la cámara hacia un objetivo específico
function rotateCameraSmoothlyTo(target) {
  cancelAnimationFrame(rotationTransitionAnimation);

  const currentRotation = new THREE.Euler().setFromQuaternion(camera.quaternion);
  const targetRotation = new THREE.Euler().setFromVector3(target.clone().normalize());

  const currentRotationVector = new THREE.Vector3().setFromEuler(currentRotation);
  const targetRotationVector = new THREE.Vector3().setFromEuler(targetRotation);

  const newRotationVector = new THREE.Vector3().lerpVectors(currentRotationVector, targetRotationVector, lerpRotationFactor * (speedMouseGlobal / 20));
  const newRotation = new THREE.Euler().setFromVector3(newRotationVector);

  camera.quaternion.setFromEuler(newRotation);

  if (currentRotationVector.distanceTo(targetRotationVector) > 0.001) {
    rotationTransitionAnimation = requestAnimationFrame(() => rotateCameraSmoothlyTo(target));
  }
}


function transitionTo(target,rotation) {
  cancelAnimationFrame(transitionAnimation);

  const newPosition = camera.position.clone().lerp(target, lerpFactor * (speedMouseGlobal / 20));
  camera.position.copy(newPosition);

  // Update the camera's lookAt to make it point towards the target
  rotateCameraSmoothlyTo(rotation);


  if (camera.position.distanceTo(target) > 0.001) {
    // Use the speed of the mouse wheel in the recursive call
    transitionAnimation = requestAnimationFrame(() => transitionTo(target,rotation));
  } else {
    speedMouseGlobal = 1;
    isTransitioning = false;
  }
}


////OBJETOS
let loader = new GLTFLoader();
let model;
loader.load('public/pokemon/untitled.glb', function (gltf) {
  model= gltf.scene;
  model.scale.x = 0.5;
  model.scale.y = 0.5;
  model.scale.z = 0.5;
  model.rotation.x = .1;

  model.position.z = 0;
  model.position.y = -1;


  model.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true; 
        child.receiveShadow = true; 
        scene.add(model);

      }
  });

});

document.addEventListener('wheel', function(event) {
  const wheelDirection = event.deltaY > 0 ? 'down' : 'up';

    speedMouseGlobal=speedMouseGlobal+20;

  console.log(speedMouseGlobal);
  if (!isTransitioning) {
    animateLights();

    isTransitioning = true;


    if(wheelDirection=='up'){
      if(actualTarget<target.length-1)
      actualTarget=actualTarget+1;
    transitionTo(target[actualTarget],target2[actualTarget]);
    }else if(wheelDirection=='down'){
      if(actualTarget>0)
      actualTarget=actualTarget-1;

      transitionTo(target[actualTarget],target2[actualTarget]);
    }
  }


});


// Agregar una luz puntual
let pointLight = new THREE.PointLight(0xff5000, 0, 1.5);
pointLight.position.set(.2, -.2, .5);
scene.add(pointLight);

// Nueva variable para controlar la animación
let targetIntensity = 1;  // Intensidad final deseada
let currentIntensity = 0;  // Intensidad actual

// Función para animar las luces
function animateLights() {
    // Ajusta gradualmente la intensidad hacia el objetivo
    currentIntensity += (targetIntensity - currentIntensity) * 0.005;
    
    // Aplica la intensidad a la luz
    pointLight.intensity = currentIntensity;

    // Llama a la función nuevamente en el próximo cuadro de animación
    requestAnimationFrame(animateLights);
}

// Inicia la animación

let pointLight2 = new THREE.PointLight(0xff7000, 1, 1.5);
pointLight2.position.set(-1.6, -.2, 1.2);
scene.add(pointLight2);


// Cubito
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('victoria.JPG');
const geometry = new THREE.BoxGeometry(.5, .5, .5);
const material = new THREE.MeshStandardMaterial({ map: texture }); // Usar MeshStandardMaterial para recibir y proyectar sombras
const cube = new THREE.Mesh(geometry, material);

cube.castShadow = true; // Permitir que el cubo proyecte sombras
cube.receiveShadow = true; // Permitir que el cubo reciba sombras


scene.add(cube);

camera.position.z = 5;



const animate = function () {
  requestAnimationFrame(animate);
  // Rotar el cubo
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
};

window.addEventListener('resize', function () {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;

  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(newWidth, newHeight);
});
const backgroundTexture = textureLoader.load('moon.jpg');
const backgroundGeometry = new THREE.SphereGeometry(50, 50, 50);
const backgroundMaterial = new THREE.MeshStandardMaterial({ map: backgroundTexture, side: THREE.BackSide });
const backgroundSphere = new THREE.Mesh(backgroundGeometry, backgroundMaterial);

backgroundSphere.castShadow = true; // Permitir que el cubo proyecte sombras
backgroundSphere.receiveShadow = true; // Permitir que el cubo reciba sombras
scene.add(backgroundSphere);

animate();


