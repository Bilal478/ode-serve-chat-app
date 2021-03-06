var express = require('express');
var http = require('http');
const path = require("path");
const router = require("express").Router();
var app = express();
let cors = require('cors')

app.use(cors())

var server = http.createServer(app);
var io = require('socket.io').listen(server);


var usernames = []
var rooms = ['commonroom', 'Astronomy', 'Science', 'Botany', 'Music', 'Tesla', 'Spacex', 'BlueOrigin']
var room_users = {
    commonroom: [],
    Astronomy: [],
    Science: [],
    Botany: [],
    Music: [],
    Tesla: [],
    Spacex: [],
    BlueOrigin: [],
}


//app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

router.route("/").post((req, res) => {
    let roomname = req.body.roomname;
    console.log(req.body)
    rooms.push(roomname);
    room_users[roomname] = [];

    res.status(200).json({"sucess": "Room Created"})
})


router.route("/").get((req, res) => res.send("YO"))
app.use("/addroom", router);
io.on('connect', (socket) => {

    socket.on('adduser', function (username) {
        socket.username = username
        socket.room = 'commonroom'

        room_users[socket.room].push(username)
        socket.join('commonroom')
        socket.emit('chat_update', {
            username: socket.username,
            message: `you have connected to room ${socket.room}`
        })
        io.to(socket.room).emit('site_data', {
            users: room_users[socket.room],
            rooms,
            current_room: socket.room
        })
        socket.broadcast.to(socket.room).emit('update_update', {
            username: socket.username,
            message: `${socket.username} has connected to room ${socket.room}`
        })

    })
    socket.on('chat_message', (data) => {
        io.sockets.in(socket.room).emit('chat_update', {
            username: socket.username,
            message: data
        })
    })
    socket.on('switchrooms', (newroom) => {
        socket.leave(socket.room)
        socket.join(newroom)
        room_users[socket.room] = room_users[socket.room].filter((i) => {
            return i != socket.username
        })
        socket.room = newroom
        room_users[socket.room].push(socket.username)
        socket.emit('chat_update', {
            username: socket.username,
            message: `you have connected to room ${socket.room}`
        })
        io.in(socket.room).emit('site_data', {
            users: room_users[socket.room],
            rooms,
            current_room: socket.room
        })
        socket.broadcast.to(socket.room).emit('update_update', {
            username: socket.username,
            message: `${socket.username} has connected to room ${socket.room}`
        })
    })
})
var PORT=process.env.port ||33000;
server.listen(PORT, () => console.log("Server Connected"));