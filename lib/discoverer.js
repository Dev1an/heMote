const EventEmitter = require('events').EventEmitter
var discoverer = module.exports = new EventEmitter()

const broadcastMessage = new Buffer("00010028000D0000000000000026186A7813A9FE3A59000020111E11231F1E1913000000010000000000000000000000FFF00024002000210022002300250028004000410042004400A500A600A700A800AD00B300B700B8FFFF0FE5", "hex");

var broadcastTimer;
module.exports.init = function(udpSocket) {
	udpSocket.on('message', messageListener)

	udpSocket.bind(10669, function() {
	    // executed when binding is done
	    // (binding is needed to enable broadcast messaging)
	    // (we bind to port 10669 because thats the port the cameras send msgs to)
	    this.setBroadcast(true);
	    broadcast();
	    broadcastTimer = setInterval(broadcast, 5000);
	});

	function broadcast() {
	    udpSocket.send(broadcastMessage, 0, broadcastMessage.length, 10670, '255.255.255.255');
	}
}

var cameras = {}
function messageListener(data) {
    // Code for changing internal ip settings of the camera
	var hexDataString = data.toString('hex');
	if (hexDataString.search('00a8001043414d3a') !== -1) {
		// data is a msg from the camera

		const messageFields = {
		    // an object containing references to useful information in a discovery UDP message
		    // the values represent the position of the first character of the information
			'ip': hexDataString.search("00200004")/2+4,
			'defaultGateway': hexDataString.search("00220004")/2+4,
			'primaryDNS': hexDataString.search("00230008")/2+4,
			'secondaryDNS': hexDataString.search("00230008")/2+8,
			'subnetMask': hexDataString.search("00a10004")/2+4,
			'port': hexDataString.search("00250002")/2+4,
			'model': hexDataString.search("00a8001043414d3a")/2+8
		}
		var properties = {}; // We create an obj where the useful information will be stored in.
		
		properties.macAddress = [];
		for (var i = 6; i<12; i++) {
            properties.macAddress.push(data.slice(i, i+1).toString('hex'));
        }
        properties.macAddress = properties.macAddress.join(':');
        
		for (property in {'ip':0, 'defaultGateway':0, 'primaryDNS':0, 'secondaryDNS':0, 'subnetMask':0}) {
			if (messageFields[property] !== -1) { // check if the property is found in the message.
				properties[property] =	data.readUInt8(messageFields[property]) + "." +
										data.readUInt8(messageFields[property]+1) + "." +
										data.readUInt8(messageFields[property]+2) + "." +
										data.readUInt8(messageFields[property]+3);
			}
		}
										
		if (messageFields.port !== -1) properties.port = data.readUInt16BE(messageFields.port);
        if (messageFields.model !== -1) var model = data.slice(messageFields.model, messageFields.model+12).toString().replace(/\u0000/g,"");
		properties.model = model;

		if (typeof cameras[properties.macAddress] === 'undefined') {
			discoverer.emit('add', properties)
		} else {
			discoverer.emit('update', properties)
		}
		cameras[properties.macAddress] = properties
	}
}

// Send already detected cameras to new listeners for the 'add' event
discoverer.on('newListener', function(event, listener) {
	if (event == 'add' && Object.keys(cameras).length > 0) {
		for (camera in cameras) listener(cameras[camera])
	}
})