"use strict"
const opuntia = require("opuntia");

//-------------------------------------------------------------------------------------------------
// DEV WEB SERVER
const server = new opuntia.Server(
    // Router
    {
        _files:	__dirname+'/',
        _default:'test.html',
        h_get: 	opuntia.files.get
    }, 
    // Config
    {
        PROTOCOL   	: 'http:',
        PORT       	: 80
    }
)
server.listen();







