const socket = io()

// Elements ($-sign is convention for DOM elements)
const $messageForm = document.querySelector('#form1')
const $msgFormInput = $messageForm.querySelector('input')
const $msgFormBtn = $messageForm.querySelector('button')
const $locationBtn = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates
const msgTemplate = document.querySelector('#msg-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options getting query string from join page
const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true}) //opton object is for removing the ? mark from query string

const  autoscroll = () => {
    //new message elemet 
    const $newMessage = $messages.lastElementChild 

    // Height of new messages
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //height of message container
    const constainerHeight = $messages.scrollHeight
    
    // how far have i scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (constainerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}

socket.on('message', (message) => {
    // console.log('--> ' + message.text);
    const html = Mustache.render(msgTemplate, { //mustache takes template args in a array with key value
        username: message.username,
        createdAt: moment(message.createdAt).format('h:MM a'),
        message: message.text
    })

    $messages.insertAdjacentHTML("beforeend", html)
    console.log(message);
    autoscroll()
})

socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        createdAt: moment(message.createdAt).format('h:MM a'),
        url: message.url
    })
    $messages.insertAdjacentHTML("beforeend", html)
    autoscroll()
})

socket.on('roomData', ( {room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {

    e.preventDefault()
    
    $msgFormBtn.setAttribute('disabled', 'disabled')
    let msg = e.target.elements.msg.value
    //console.log(msg);
    socket.emit('sendMessage', msg, (error) => { //error is the parameter coming from server when acknowledging msg
        
        $msgFormBtn.removeAttribute('disabled')
        $msgFormInput.value = ''
        $msgFormInput.focus()

        if (error) {
            return console.log(error); //we're being stopped by bad-words module in this case!
        }
        console.log('message delivered ');
    })
})

$locationBtn.addEventListener('click', (e) => {
    if (!navigator.geolocation) {
        return alert('your browser doesnt support GeoLoc')
    }

    $locationBtn.setAttribute('disabled', 'disabled')
    console.log('getting location now...');
    navigator.geolocation.getCurrentPosition( (position) => {
        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }
        socket.emit('sendLocation', location, () => {
            $locationBtn.removeAttribute('disabled')
            console.log('location shared', location);
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.assign ('/')
    }
} )