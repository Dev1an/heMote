const controller = require('../index.js')
const commands = require('../lib/commands')

controller.discoverer.on('add', function(cam) {
	const camera = new controller.Camera(cam.address)
	camera.batchInfo(function(error, response, body) {
		console.log(commands.parse(response.body))
	})
})