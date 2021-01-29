import {listen, request, events} from "../lib/communicator.mjs";
import {parse} from "../lib/commands.js";
import {discoverer} from '../index.js';

events.on('data', msg => {
  console.log(
      "received a message from", msg.from,
      "raw:", msg.data,
      "parsed:", parse(msg.data)
  );
});

// Detect cameras
discoverer.on('add', function(cam) {

  // Start receiving updates from this camera
  listen(cam.address);

  // Also request a status update
  request("/live/camdata.html", cam.address);

})
