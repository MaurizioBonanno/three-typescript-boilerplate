import * as THREE from '/build/three.module.js';
import { OrbitControls } from '/jsm/controls/OrbitControls';
import { FBXLoader } from '/jsm/loaders/FBXLoader';
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x00a0f0);
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
var light = new THREE.AmbientLight(0xaaaaaa);
scene.add(light);
scene.fog = new THREE.Fog(0xa0a0a0, 700, 1800);
//ground
var mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(4000, 4000), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
mesh.rotation.x = Math.PI / 2;
mesh.receiveShadow = true;
scene.add(mesh);
var grid = new THREE.GridHelper(4000, 60, 0x000000, 0x000000);
//grid.position.y = -100;
grid.material.opacity = 0.2;
grid.material.transparent = true;
scene.add(grid);
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 10, 20000);
camera.position.set(200, 400, 500);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
controls.screenSpacePanning = true;
controls.target.set(0, 1, 0);
let mixer;
let modelReady = false;
let animationActions = new Array();
let activeAction;
let lastAction;
const fbxLoader = new FBXLoader();
fbxLoader.load('assets/fbx/people/FireFighter.fbx', (object) => {
    // object.scale.set(.01, .01, .01)
    mixer = new THREE.AnimationMixer(object);
    let animationAction = mixer.clipAction(object.animations[0]);
    animationActions.push(animationAction);
    activeAction = animationActions[0];
    modelReady = true;
    activeAction.play();
    scene.add(object);
    const tLoader = new THREE.TextureLoader();
    tLoader.load('assets/images/SimplePeople_FireFighter_White.png', (texture) => {
        object.traverse((child) => {
            if (child.isMesh) {
                child.material.map = texture;
            }
        });
    });
    //add an animation from another file
    // fbxLoader.load('models/vanguard@samba.fbx',
    //     (object) => {
    //         console.log("loaded samba")
    //         let animationAction = mixer.clipAction((object as any).animations[0]);
    //         animationActions.push(animationAction)         
    //         animationsFolder.add(animations, "samba")
    //         //add an animation from another file
    //         fbxLoader.load('models/vanguard@bellydance.fbx',
    //             (object) => {
    //                 console.log("loaded bellydance")
    //                 let animationAction = mixer.clipAction((object as any).animations[0]);
    //                 animationActions.push(animationAction)
    //                 animationsFolder.add(animations, "bellydance")
    //                 //add an animation from another file
    //                 fbxLoader.load('models/vanguard@goofyrunning.fbx',
    //                     (object) => {
    //                         console.log("loaded goofyrunning");
    //                         (object as any).animations[0].tracks.shift() //delete the specific track that moves the object forward while running
    //                         //console.dir((object as any).animations[0])
    //                         let animationAction = mixer.clipAction((object as any).animations[0]);
    //                         animationActions.push(animationAction)
    //                         animationsFolder.add(animations, "goofyrunning")
    //                         modelReady = true
    //                     },
    //                     (xhr) => {
    //                         console.log((xhr.loaded / xhr.total * 100) + '% loaded')
    //                     },
    //                     (error) => {
    //                         console.log(error);
    //                     }
    //                 )
    //             },
    //             (xhr) => {
    //                 console.log((xhr.loaded / xhr.total * 100) + '% loaded')
    //             },
    //             (error) => {
    //                 console.log(error);
    //             }
    //         )
    //     },
    //     (xhr) => {
    //         console.log((xhr.loaded / xhr.total * 100) + '% loaded')
    //     },
    //     (error) => {
    //         console.log(error);
    //     }
    // )
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
var animations = {
    default: function () {
        setAction(animationActions[0]);
    }
};
const setAction = (toAction) => {
    if (toAction != activeAction) {
        lastAction = activeAction;
        activeAction = toAction;
        lastAction.stop();
        //lastAction.fadeOut(1)
        activeAction.reset();
        //activeAction.fadeIn(1)
        activeAction.play();
    }
};
const clock = new THREE.Clock();
var animate = function () {
    requestAnimationFrame(animate);
    controls.update();
    if (modelReady)
        mixer.update(clock.getDelta());
    render();
};
function render() {
    renderer.render(scene, camera);
}
animate();
