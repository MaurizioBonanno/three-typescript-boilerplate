
import { Scena } from 'game';
import { BoxGeometry, MeshBasicMaterial,Mesh } from 'three';
export default class Town{
   scena: Scena;
   colliders = []
   constructor(scena: Scena){
       this.scena = scena;
   }
   //crea una serie di box contro cui collidere
   createBoxTown(){
    const collider = new BoxGeometry(500, 400, 500);
    const material = new MeshBasicMaterial({color:0x222222, wireframe:false});
        for (let x = -5000; x < 5000; x+=1000) {
            for (let z = -5000; z < 5000; z+=1000) {
                if(x==0 && z==0) continue;
                //creo i box e li piazzo a 250 unità di distanza ciascuno
                const box = new Mesh(collider,material);
                box.position.set(x, 250, z);
                this.scena.add(box);
                this.colliders.push(box);
            }
        }
    //creo la piattaforma da dove partiamo
    const geometry = new BoxGeometry(1000, 40, 1000);
    const stage = new Mesh(geometry, material);
    stage.position.set(0, 20, 0);
    this.scena.add(stage);
    this.colliders.push(stage);
   }
}