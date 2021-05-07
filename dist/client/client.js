import * as THREE from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls';
import { FBXLoader } from '/jsm/loaders/FBXLoader';
const scene = new THREE.Scene();
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
let light = new THREE.PointLight();
light.position.set(0.8, 1.4, 1.0);
scene.add(light);
let ambientLight = new THREE.AmbientLight();
scene.add(ambientLight);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0.8, 1.4, 5.0);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;
controls.target.set(0, 1, 0);
const material = new THREE.MeshNormalMaterial();
let mixer;
let model;
let modelReady = false;
let animationActions = new Array();
let activeAction;
const fbxLoader = new FBXLoader();
fbxLoader.load('assets/fbx/people/FireFighter.fbx', (object) => {
    object.traverse(function (child) {
        if (child.isMesh) {
            child.material = material;
            if (child.material) {
                child.material.transparent = false;
            }
        }
    });
    object.scale.set(.01, .01, .01);
    mixer = new THREE.AnimationMixer(object);
    let animationAction = mixer.clipAction(object.animations[0]);
    animationActions.push(animationAction);
    activeAction = animationActions[0];
    model = object;
    scene.add(object);
}, (xhr) => {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
}, (error) => {
    console.log(error);
});
window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
}
var animate = function () {
    requestAnimationFrame(animate);
    controls.update();
    render();
};
function render() {
    renderer.render(scene, camera);
}
animate();
