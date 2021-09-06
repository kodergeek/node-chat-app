function generateMessage(username, text) {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

function generateLocMessage(username, url) {
    return {
        username,
        url,
        createdAt: new Date().getTime()
    }
}

module.exports  = { generateMessage, generateLocMessage }