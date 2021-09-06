const express = require('express')
const http = require('http')
var path = require('path');
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage , generateLocMessage} = require('./utils/generateMessage')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const port = process.env.PORT || 3000

const app = express()
const server = http.createServer(app)
const io = socketio(server)

app.use(express.static(path.join(__dirname , '../public' )))

io.on('connection', (socket) => { 
    //console.log('new web socket connectin');
    
    socket.on('join', ({ username, room }, callback) => {

        // console.log('username is ' + username + " room is " + room);
        const {error, user} = addUser( {id: socket.id, username, room} )
        if (error) {
            return callback(error)
        }
        
        // console.log('user object is', user);
        socket.join(user.room)
        socket.emit('message', generateMessage('Admin', 'welcome to ourt app!'))
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`) ) //broadcast to everyone in room except user
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('profanity is not allowed')
        }

        const user = getUser(socket.id)
        if (!user) {
            return callback('no user found!!!')
        }
        io.to(user.room).emit('message', generateMessage(user.username, message))    
        callback() 
    } )

    socket.on('sendLocation', (position, callback) => { //callback is used to acknowledge receipt of msg to client
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage',generateLocMessage(user.username, `https://google.com/maps?q=${position.latitude},${position.longitude}`))
        callback()
    } )

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) //notify others if there was indeed a useer in this room and not that disconnect happened cause of errors
        {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log('server is UP on port ' + port);
})

