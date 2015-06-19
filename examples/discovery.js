const controller = require('../index.js')

controller.discoverer.on('add', function(cam) {
	console.log(cam)
})