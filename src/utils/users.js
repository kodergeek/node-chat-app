const users = [] 

const addUser = ({id, username, room}) => { 
    //clean the data
    console.log('user inside addUser: ' + username);
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate the data
    if ( !username || !room ) {
        return {
            error: 'username and room are requried'
        }
    }

    //check for existing user in room
    const existingUser = users.find( (user) => {
        return user.username === username && user.room === room
    })

    //validate username
    if (existingUser) {
        return {
            error: 'username is taken'
        }
    }

    const user = {id, username, room}
    users.push(user)
    return {user} // {users}
}

//remove user from room
const removeUser = (id) => {

    const index = users.findIndex( (user) => user.id === id )

    if (index !== -1 ) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find( (user) =>  user.id === id  )
}

const getUsersInRoom = (room ) => {
    return users.filter ( (user ) => user.room === room.toLowerCase() )
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}
