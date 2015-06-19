const httpRequest = require('request')
const net = require('net')

// Create sockets
//	UDP socket:
const dgram = require('dgram')
const udpSocket = dgram.createSocket('udp4')

// Add auto-descovery functionality
var discoverer = require('./lib/discoverer')
discoverer.init(udpSocket)
module.exports.discoverer = discoverer


// Add camera
module.exports.Camera = Camera

function Camera(newAddress) {
	// the IP address
	var address = null

	Object.defineProperties(this, {
		'address': {
			get: function() {return address},
			set: function(newValue) {
				if (net.isIP( newValue))
					address = newValue
				else
					throw new Error("Not a valid IP address")
			}
		}
	})

	if (newAddress) this.address = newAddress

	this.sendCommand = function(type, command, callback) {
		const basePath = basePaths[type] 
		if (basePath === undefined)
			throw new Error('Invalid command type "'+type+'". Use one of the following types: "movement", "static"')
		const url = ['http://', address, '/', basePath, 'cmd=', command, '&res=1'].join('')
		httpRequest(url, callback)
	}
}

Camera.prototype.gotoPreset = function(number) {
	const presetNumber = parseInt(number)
	if (presetNumber == NaN || presetNumber > 99 || presetNumber < 0) {
		throw new Error('Invalid preset number, it must be an integer in the range [0,99]')
	}
	var presetString = ('00'+presetNumber)
	presetString = presetString.substr(presetString.length - 2)
	this.sendCommand('movement', '%23R' + presetString)
}

Camera.prototype.getTallyLight = function(callback) {
	// calls the calback with true when the light is on, false when the light is off
	var cam = this
	cam.sendCommand('movement', '%23TAE', function(error, response, body) {
		if (body == 'tAE1')
			cam.sendCommand('movement', '%23DA', function(error, response, body) {
				callback(body == 'dA1')
			})
		else callback(false)
	})
}

const basePaths = {
	movement: "cgi-bin/aw_ptz?",
	static:   "cgi-bin/aw_cam?"
}