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

      this.socket.on('deletePlayer',(data)=>{
        const players = this.player.game.remotePlayers.filter((data)=>{
          if(this.player.id == data.id){
            return player;
          }
        })

        if(players.length > 0){
          try {
            let index = this.player.game.remotePlayers.indexOf(players[0]);
            if(index != -1){
              this.player.game.remotePlayers.splice(index,1);// rimuove il giocatore
              this.player.game.scena.remove(players[0].object);//rimuove il modello 3d dalla scena
            }else{
              index = this.player.game.initialisingPlayers.indexOf(data.id);
              if(index != -1){
                const pl = this.player.game.initialisingPlayers[index];
                player.deleted = true;
                this.player.game.initialisingPlayers.splice(index,1);
              }
            }
          } catch (error) {
            console.log('errore nel deletePlayer:'+error);
          }
        }

      })//metodo deletePlayer
    }//fine costruttore

    initSocket(){
      this.socket.emit('init',({
        model: this.player.model,
        colour: this.player.colour,
        x: this.player.playerParent.position.x,
        y: this.player.playerParent.position.y,
        z: this.player.playerParent.position.z,
        h: this.player.playerParent.rotation.y,
        pb: this.player.playerParent.rotation.x 
      }));
    }

    updateSocket(){
      this.socket.emit('update',({
        x: this.player.playerParent.position.x,
        y: this.player.playerParent.position.y,
        z: this.player.playerParent.position.z,
        h: this.player.playerParent.rotation.y,
        pb: this.player.playerParent.rotation.x,
        action: this.player.activeAction
      }))
    }
   
}

