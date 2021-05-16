
import { AnimationAction, AnimationMixer, Clock, TextureLoader,Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer, AmbientLight, Color, Fog, GridHelper, PlaneBufferGeometry, MeshPhongMaterial } from 'three';
import { OrbitControls } from '../../node_modules/three/examples/jsm/controls/OrbitControls';
import { FBXLoader } from '../../node_modules/three/examples/jsm/loaders/FBXLoader';

enum Actions {
    Idle,
    Walking,
    Running
}
interface animable{
  animate();
}

/* class Action {
    name: string;
    action: AnimationAction;
    constructor(name: string, action: AnimationAction){
        this.name = name;
        this.action = action;
    }
} */

class Human implements animable{
    fbxLoader: FBXLoader;
    mixer: AnimationMixer;
    animationActions: AnimationAction[]= new Array();
    modelReady = false;
    activeAction: AnimationAction;
    clock = new Clock();
    constructor(scene: Scena,pathModel: string,pathTexture: string){
        this.fbxLoader = new FBXLoader();
        this.fbxLoader.load(pathModel,(object3D)=>{
            object3D.name = 'Pompiere';
            scene.add(object3D);

            this.mixer = new AnimationMixer(object3D);
            let aAction = this.mixer.clipAction((object3D as any).animations[0]);
            this.animationActions.push(aAction);

            this.addAnimation('./assets/fbx/anims/Walking.fbx');

            this.activeAction = this.animationActions[0];
            this.activeAction.play();


            const tLoader: TextureLoader = new TextureLoader();
            tLoader.load(pathTexture,
            (texture)=>{
                object3D.traverse((child)=>{
                    if((child as THREE.Mesh).isMesh){
                        ((child as Mesh).material as MeshBasicMaterial).map = texture;
                    }
                })
            })

        },(xhr)=>{
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            this.modelReady = true
         },
        (error)=>{console.log(error)});
    }

    addAnimation(pathAnimation: string){
        this.fbxLoader.load(pathAnimation,(anim)=>{
            console.log(`Carico ${pathAnimation}:${anim}`);
            let aAction = this.mixer.clipAction((anim as any).animations[0]);
            this.animationActions.push(aAction);

        },(xhr)=>{
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },(error)=>{
            console.log(error);
        });
    }

// a questo metodo viene passato l'enum che contiene il nome dell'azione
    setAction(action: Actions){
        console.log(action);
        if( this.activeAction !== this.animationActions[action]){
            this.activeAction.time = 0;
            this.mixer.stopAllAction();
            this.activeAction = this.animationActions[action];
            this.activeAction.time = Date.now();
            this.activeAction.fadeIn(0.5);
            this.activeAction.play();
        }
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
class Camera extends PerspectiveCamera{
    constructor(){
        super(75, window.innerWidth / window.innerHeight, 10, 20000);
        this.position.set(200, 400, 500);
    }
}
class Ground extends Mesh{
    constructor(){
        super(new PlaneBufferGeometry(4000,4000),new MeshPhongMaterial({color: 0x999999, depthWrite: false }));
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
class Scena extends Scene{
    light : AmbientLight;
    ground: Ground;
    camera: Camera;
    constructor(){
        super();
        this.background = new Color( 0x00a0f0 );
        this.light = new AmbientLight(0xaaaaaa);
        this.add(this.light);
        this.fog = new Fog(0x00a0f0, 700, 1800);
        this.ground = new Ground();
        this.add(this.ground);
        this.add(new GridHelper( 4000, 60, 0x000000, 0x000000 ));
        this.camera = new Camera();
        this.add(this.camera);
    }
}
class Renderer extends WebGLRenderer{
    constructor(){
        super();
        this.setSize(window.innerWidth,window.innerHeight);
        this.shadowMap.enabled = true;
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
/*         this.player.addAnimation('assets/fbx/anims/Walking.fbx','Walking');
        this.player.addAnimation('assets/fbx/anims/Running.fbx','Running'); */
        this.animables.push(this.player);
    }
    render(){
        this.renderer.render(this.scena,this.scena.camera);
    }
    addOrbitControls(){
        this.orbitControl = new OControl(this.scena.camera, this.renderer.domElement);
        this.animables.push(this.orbitControl);
    }

    addKeyControl(){
        document.onkeydown = (evt)=>{
            console.log(evt.key);
            switch(evt.key){
                case "ArrowUp":
                    console.log('avanti');
                    this.player.setAction(Actions.Walking);
                break;
                case "ArrowDown":
                    console.log('indietro');
                break;
                case "ArrowRight":
                    console.log('destra');
                break;
                case "ArrowLeft":
                    console.log('sinistra');
                break;
            }
        }

        document.onkeyup = (evt)=>{
            this.player.setAction(Actions.Idle);
        }

    }

}



const game = new Game();
game.addOrbitControls();
game.addKeyControl();

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