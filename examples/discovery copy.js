const controller = require('../index.js')

controller.discoverer.on('add', function(cam) {
	// console.log(cam)
	const camera = new controller.Camera(cam.address)
	// console.log(camera)
	// camera.sendCommand('movement','QID', function(error, response, body) {
	// 	console.log(response.body)
	// })
	camera.batchInfo(function(error, response, body) {
		var keyVal = response.body.split("\r\n")		  
		var obj = {};
		var i;
		for (i in keyVal) {
			if(keyVal[i].indexOf(':') > 0) {
				// keyVal[i] = keyVal[i].split(":");
				var splits = keyVal[i].match(/([^:]*):(.*)/);
				splits.shift()
				// console.log(splits)
				obj[splits[0]] = splits[1];
			} else {
				// console.log(keyVal[i], 'is not a key/value')
			}
		}
		console.log(response.body, keyVal, obj)
	})
})