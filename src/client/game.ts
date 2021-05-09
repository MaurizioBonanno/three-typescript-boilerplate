import * as THREE from '/build/three.module.js'
import { OrbitControls } from '/jsm/controls/OrbitControls';
import { FBXLoader } from '/jsm/loaders/FBXLoader';

interface animable{
  animate();
}

class Action {
    name: string;
    action: THREE.AnimationAction;
    constructor(name: string, action: THREE.AnimationAction){
        this.name = name;
        this.action = action;
    }
}

class Human implements animable{
    fbxLoader: FBXLoader;
    object: any;
    mixer: THREE.AnimationMixer;
    animationActions: Action[] = new Array();
    modelReady = false;
    activeAction: THREE.AnimationAction;
    clock = new THREE.Clock();
    constructor(scene: Scena,pathModel: string,pathTexture: string){
        this.fbxLoader = new FBXLoader();
        this.fbxLoader.load(pathModel,(object3D)=>{
            this.object = object3D;
            scene.add(object3D);

            this.mixer = new THREE.AnimationMixer(object3D);
            let aAction = this.mixer.clipAction((object3D as any).animations[0]);
            this.animationActions.push(new Action('idle',aAction));

            this.activeAction = this.animationActions[0].action;
            this.activeAction.play();

            const tLoader: THREE.TextureLoader = new THREE.TextureLoader();
            tLoader.load(pathTexture,
            (texture)=>{
                object3D.traverse((child)=>{
                    if((child as THREE.Mesh).isMesh){
                        ((child as THREE.Mesh).material as THREE.MeshBasicMaterial).map = texture;
                    }
                })
            })

        },(xhr)=>{
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            this.modelReady = true
         },
        (error)=>{console.log('error')});
    }

    addAnimation(pathAnimation: string,name: string){
        this.fbxLoader.load(pathAnimation,(animation)=>{

            let animationAction = this.mixer.clipAction((animation as any).animations[0]);
            this.animationActions.push(new Action(name,animationAction));

        },(xhr)=>{},(error)=>{
            console.log(error);
        });
    }
    animate() {
        var dt = this.clock.getDelta();
        if(this.modelReady){
            if(this.mixer!=undefined){
                this.mixer.update(dt);
            }
            
        }
    }

}
class Camera extends THREE.PerspectiveCamera{
    constructor(){
        super(75, window.innerWidth / window.innerHeight, 10, 20000);
        this.position.set(200, 400, 500);
    }
}
class Ground extends THREE.Mesh{
    constructor(){
        super(new THREE.PlaneBufferGeometry(4000,4000),new THREE.MeshPhongMaterial({color: 0x999999, depthWrite: false }));
        this.rotation.x = Math.PI/2;
        this.receiveShadow = true;   
    }
}

class OControl extends OrbitControls implements animable{
    constructor(camera, domElement){
        super(camera,domElement);
        this.screenSpacePanning = true;
        this.target.set(0,1,0);
    }
    animate() {
        this.update();
    }
}
class Scena extends THREE.Scene{
    light : THREE.AmbientLight;
    ground: Ground;
    camera: Camera;
    constructor(){
        super();
        this.background = new THREE.Color( 0x00a0f0 );
        this.light = new THREE.AmbientLight(0xaaaaaa);
        this.add(this.light);
        this.fog = new THREE.Fog(0x00a0f0, 700, 1800);
        this.ground = new Ground();
        this.add(this.ground);
        this.add(new THREE.GridHelper( 4000, 60, 0x000000, 0x000000 ));
        this.camera = new Camera();
        this.add(this.camera);
    }
}
class Renderer extends THREE.WebGLRenderer{
    constructor(){
        super();
        this.setSize(window.innerWidth,window.innerHeight);
    }
    addToPage(){
        document.body.appendChild(this.domElement);
    }
}
class Game {
    scena : Scena;
    renderer : Renderer;
    orbitControl: OControl;
    animables: animable[] = new Array();
    player: Human;
    constructor(){
        console.log('new game');
        this.scena = new Scena();
        this.renderer = new Renderer();
        this.renderer.addToPage();
        this.player = new Human(this.scena, 'assets/fbx/people/FireFighter.fbx','assets/images/SimplePeople_FireFighter_White.png');
        this.animables.push(this.player);
    }
    render(){
        this.renderer.render(this.scena,this.scena.camera);
    }
    addOrbitControls(){
        this.orbitControl = new OControl(this.scena.camera, this.renderer.domElement);
        this.animables.push(this.orbitControl);
    }

}



const game = new Game();
game.addOrbitControls();

var animate = ()=>{
    requestAnimationFrame(animate);
    game.animables.forEach(element => {
        element.animate();
    });
    game.render()
}
animate();

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    game.scena.camera.aspect = window.innerWidth / window.innerHeight
    game.scena.camera.updateProjectionMatrix()
    game.renderer.setSize(window.innerWidth, window.innerHeight)
    game.render()
}