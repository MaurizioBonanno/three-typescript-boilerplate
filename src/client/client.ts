import { io } from 'socket.io-client'


export class Client {
    socket: any;
    constructor(){
      this.socket = io();
    }
   
}

