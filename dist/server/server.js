"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = __importDefault(require("socket.io"));
const port = process.env.port || 3000;
var Actions;
(function (Actions) {
    Actions[Actions["Idle"] = 0] = "Idle";
    Actions[Actions["Walking"] = 1] = "Walking";
    Actions[Actions["Running"] = 2] = "Running";
    Actions[Actions["Backwards"] = 3] = "Backwards";
})(Actions || (Actions = {}));
class App {
    constructor(port) {
        this.port = port;
        const app = express_1.default();
        app.use(express_1.default.static(path_1.default.join(__dirname, '../client')));
        app.use('/build/three.module.js', express_1.default.static(path_1.default.join(__dirname, '../../node_modules/three/build/three.module.js')));
        app.use('/jsm/controls/OrbitControls', express_1.default.static(path_1.default.join(__dirname, '../../node_modules/three/examples/jsm/controls/OrbitControls.js')));
        app.use('/jsm/loaders/FBXLoader', express_1.default.static(path_1.default.join(__dirname, '../../node_modules/three/examples/jsm/loaders/FBXLoader.js')));
        app.use('/jsm/libs/inflate.module.min.js', express_1.default.static(path_1.default.join(__dirname, '../../node_modules/three/examples/jsm/libs/inflate.module.min.js')));
        app.use('/jsm/curves/NURBSCurve.js', express_1.default.static(path_1.default.join(__dirname, '../../node_modules/three/examples/jsm/curves/NURBSCurve.js')));
        app.use('/jsm/curves/NURBSUtils.js', express_1.default.static(path_1.default.join(__dirname, '../../node_modules/three/examples/jsm/curves/NURBSUtils.js')));
        app.use('/jsm/libs/stats.module', express_1.default.static(path_1.default.join(__dirname, '../../node_modules/three/examples/jsm/libs/stats.module.js')));
        app.use('/jsm/libs/fflate.module.min.js', express_1.default.static(path_1.default.join(__dirname, '../../node_modules/three/examples/jsm/libs/fflate.module.min.js')));
        app.get('/', (req, res) => {
            res.sendFile(__dirname + '../client/index.html');
        });
        app.get('/login', (req, res) => {
            res.send('pagina di login');
        });
        this.server = new http_1.default.Server(app);
        this.io = new socket_io_1.default.Server(this.server);
        this.io.sockets.on('connection', (socket) => {
            socket.userData = { x: 0, y: 0, z: 0, heading: 0 }; //valori di default
            console.log(`socket : ${socket.id}, è connesso`);
            socket.emit('setId', { id: socket.id, userData: socket.userData });
            socket.on('init', (data) => {
                socket.userData.model = data.model;
                socket.userData.color = data.color;
                socket.userData.x = data.x;
                socket.userData.y = data.y;
                socket.userData.heading = data.h;
                socket.userData.pb = data.pb;
                socket.userData.action = Actions.Idle;
            });
            socket.on('update', (data) => {
                socket.userData.model = data.model;
                socket.userData.color = data.color;
                socket.userData.x = data.x;
                socket.userData.y = data.y;
                socket.userData.heading = data.h;
                socket.userData.pb = data.pb;
                socket.userData.action = data.action;
            });
            socket.on('chat message', (data) => {
                console.log(`chat message ${data.id}: ${data.message}`);
                io.to(data.id).emit('chat message', { id: socket.id, message: data.message });
            });
            socket.on('disconnect', () => {
                console.log(`socket disconnesso id: ${socket.id}`);
                socket.broadcast.emit('deletePlayer', { id: socket.id });
            });
        });
        //mainLoop
        setInterval(() => {
            const nsp = this.io.of('/'); //creo una route sul socket
            let pack = [];
            for (const id in this.io.sockets.sockets) {
                const socket = nsp.connected[id];
                //solo i socket che sono stati inizialiati
                if (socket.userData.model !== undefined) {
                    pack.push({
                        id: socket.id,
                        model: socket.userData.model,
                        colour: socket.userData.colour,
                        x: socket.userData.x,
                        y: socket.userData.y,
                        z: socket.userData.z,
                        heading: socket.userData.heading,
                        pb: socket.userData.pb,
                        action: socket.userData.action
                    });
                }
            }
            if (pack.length > 0) {
                console.log('abbiamo un array di utenti');
                this.io.emit('remoteData', pack);
            }
        }, 40);
    }
    Start() {
        this.server.listen(this.port, () => {
            console.log(`Server listening on port ${this.port}.`);
        });
    }
}
new App(port).Start();
//# sourceMappingURL=server.js.map