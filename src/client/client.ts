import { io } from 'socket.io-client'
import { Hero } from './game';


export class Client {
    socket: any;
    player: Hero;
    constructor(player: Hero){
      this.player = player;
      this.socket = io();
      this.socket.on('setId',(data)=>{
        this.player.id = data.id;
        console.log(` si è connesso ${this.player.id}`);
        console.log(`Data X: ${data.userData.x}, Data Y: ${data.userData.y}, Data Z: ${data.userData.z}`);
      })
      this.socket.on('remoteData',(data)=>{
        this.player.game.remoteData = data;
      })
    }
   
}

