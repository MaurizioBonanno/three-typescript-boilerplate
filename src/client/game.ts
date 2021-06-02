
import { AnimationAction, AnimationMixer, Clock, TextureLoader,Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, WebGLRenderer, AmbientLight, Color, Fog, GridHelper, PlaneBufferGeometry, MeshPhongMaterial, Vector3, Object3D } from 'three';
import { OrbitControls } from '../../node_modules/three/examples/jsm/controls/OrbitControls';
import { FBXLoader } from '../../node_modules/three/examples/jsm/loaders/FBXLoader';

enum Actions {
    Idle,
    Walking,
    Running,
    Backwards
}
enum Movement{
    Stand,
    Forward,
    Back,
    Left,
    Right
}
interface animable{
  animate();
}


class Human implements animable{ 
    activeMovement: Movement = Movement.Stand;
    fbxLoader: FBXLoader;
    mixer: AnimationMixer;
    animationActions: AnimationAction[]= new Array();
    modelReady = false;
    activeAction: AnimationAction;
    clock = new Clock();
    pathModel;
    pathTexture;
    scena: Scena;
    playerParent = new Object3D();
    constructor(scene: Scena,pathModel: string,pathTexture: string){
        this.fbxLoader = new FBXLoader();
        this.pathModel = pathModel;
        this.pathTexture = pathTexture;
        this.scena = scene;
    }

    addModel(){
        this.fbxLoader.load(this.pathModel, (object)=>{
            object.name = "Pompiere";

            this.playerParent.add(object)
            this.scena.add(this.playerParent);
            
            this.mixer = new AnimationMixer(object);
            let aAction = this.mixer.clipAction((object as any).animations[0]);
            this.animationActions.push(aAction);

            this.addAnimation('./assets/fbx/anims/Walking.fbx');
            this.addAnimation('assets/fbx/anims/Running.fbx');
            this.addAnimation('assets/fbx/anims/Walking Backwards.fbx');

            this.activeAction = this.animationActions[0];
            this.activeAction.play();

            const tLoader: TextureLoader = new TextureLoader();
            tLoader.load(this.pathTexture,
                (texture)=>{
                    object.traverse((child)=>{
                        if((child as THREE.Mesh).isMesh){
                            ((child as Mesh).material as MeshBasicMaterial).map = texture;
                        }
                    })
                });
        },(xhr)=>{
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            this.modelReady = true
        },(error)=>{
            console.log(error);
        })
    }

    //carica un'animazione da un file fbx esterno
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

    moveHuman(dt){
        switch(this.activeMovement){
            case Movement.Stand:
                console.log('Movimento stand');
            break;
            case Movement.Forward:
                console.log('Movimento avanti');
                this.playerParent.translateZ(dt*150);
            break;
            case Movement.Back:
                console.log('Movimento indietro');
                this.playerParent.translateZ(-dt*50)
            break;
            case Movement.Right:
                console.log('Movimneto a destra');
            break;
            case Movement.Left:
                console.log('Movimento a sinistra');
            break;
        }
    }
    
    animate() {
        var dt = this.clock.getDelta();
        if(this.modelReady){
            if(this.mixer!=undefined){
                this.mixer.update(dt);
            }
            
        }
        this.moveHuman(dt);
    }

}

/*
la classe Hero estende la classe base Human , la classe Hero è fatta per il Player , ha tutte le funzioni
del giocatore che sta giocando sul suo client, mentre la classe Human o altra classe che la estende
deve essere usata per creare i giocatori on line
*/
class Hero extends Human{
    //è l'oggetto genitore del modello 
  //  playerParent = new Object3D(); 

    //un oggetto genitore per la camera
    front = new Object3D();
    //altro oggetto genitore per la camera
    back = new Object3D();

    //l'oggetto genitore attivo della camera
    activeCamera: Object3D;

    constructor(scene: Scena,pathModel: string,pathTexture: string){
        super(scene,pathModel,pathTexture);
        this.createCameras();
    }

    //aggiunge un modello fbx con texture alla classe


    //crea gli oggetti 3D genitori della camera
    createCameras(){
        const offSet = new Vector3(0, 80 ,0);
        this.front = new Object3D();
        this.front.position.set(0, 500, 600);
        this.front.parent = this.playerParent;

        this.back = new Object3D();
        this.back.position.set(0, 500, -600);
        this.back.parent = this.playerParent;

        this.setActiveCamera(this.back);
    }

    //setta la camera attiva l'oggetto3D genitore della camera attivo
    setActiveCamera(camera: Object3D){
        this.activeCamera = camera;
    }

    //sovrascrive il metodo
    animate() {
       // console.log('metodo animate sovrascritto')
        var dt = this.clock.getDelta();
        if(this.modelReady){
            if(this.mixer!=undefined){
                this.mixer.update(dt);
            }
            
        }
        this.moveHuman(dt);

        if(this.activeCamera != undefined){
            this.scena.camera.position.lerp(this.activeCamera.getWorldPosition(new Vector3()),0.05);
            let pos = this.playerParent.position.clone();
            pos.y += 200;
            this.scena.camera.lookAt(pos);
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

    getCamera(){
        return this.camera;
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
    player: Hero;
    constructor(){
        console.log('new game');
        this.scena = new Scena();
        this.renderer = new Renderer();
        this.renderer.addToPage();
        this.player = new Hero(this.scena, 'assets/fbx/people/FireFighter.fbx','assets/images/SimplePeople_FireFighter_White.png');
/*         this.player.addAnimation('assets/fbx/anims/Walking.fbx','Walking');
        this.player.addAnimation('assets/fbx/anims/Running.fbx','Running'); */
        this.player.addModel();
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
                    this.player.activeMovement = Movement.Forward;
                break;
                case "ArrowDown":
                    console.log('indietro');
                    this.player.setAction(Actions.Backwards);
                    this.player.activeMovement = Movement.Back
                break;
                case "ArrowRight":
                    console.log('destra');
                    this.player.activeMovement = Movement.Right;
                break;
                case "ArrowLeft":
                    console.log('sinistra');
                    this.player.activeMovement = Movement.Left;
                break;
            }
        }

        document.onkeyup = (evt)=>{
            this.player.setAction(Actions.Idle);
            this.player.activeMovement = Movement.Stand;
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