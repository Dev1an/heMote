// Create sockets
//	UDP socket:
const dgram = require('dgram')
const udpSocket = dgram.createSocket('udp4')

// Add auto-descovery functionality
var discoverer = require('./lib/discoverer')
discoverer.init(udpSocket)
module.exports.discoverer = discoverer