/***********************************************
 * This module provides 'listen' and 'request'
 * both generate 'events':
 *   events.on('data', msg => doSomething)
 ************************************************/

import TCP from 'net';
import EventEmitter from 'events';
export const events = new EventEmitter();

const cameras = new Set();
const camPort = 80; /* This is fixed, its the port used for sending http messages to the camera */

const myIP = '0.0.0.0'; /* My own IP address */
const defaultListenPort = 35203; /* The port on which you want to receive messages from the camera */

const server = TCP.createServer();

function hex2asc(pStr) {
  let tempstr = '';
  for (let b = 0; b < pStr.length; b += 2) {
    tempstr = tempstr + String.fromCharCode(parseInt(pStr.substr(b, 2), 16));
  }
  return tempstr;
}

/*************************************
 * Send messages to camera over HTTP */
export function request(question, camIP) {
  let counter = 0;
  const client = new TCP.Socket();
  client.connect(camPort, camIP, function() {
    /* 			    console.log('CONNECTED TO: ' + camIP + ':' + camPort); */
    /*
          Write a question to the socket as soon as the client is connected, the Camera will receive it as message from the client. Example questions are:
            /cgi-bin/aw_ptz?cmd=%23APC3FFF3FFF&res=1			to pan/tilt
            /cgi-bin/aw_ptz?cmd=%23C07&res=1					to clear a preset
            /live/camdata.html									to get all cam data
            /cgi-bin/event?connect=start&my_port=31004&UID=13	to start update notifications
            /cgi-bin/aw_ptz?cmd=%23DA0&res=1					to set tally info
            for more info check http://eww.pass.panasonic.co.jp/p2ui/guest/ShowWebContents.do?key=U034 for Interface Specifications
    */
    client.write("GET " + question + " HTTP/1.0\r\nHost:0\r\n\r\n");
    /* 			console.log(question.red); */
  });

  /* Add a 'data' event handler for the client socket */
  /* data is what the Camera sent to this socket */
  let headerEnd = false;
  client.on('data', function(data) {
    /* 			console.log(counter + " " + data.toString().green); */
    const hEndPos = data.toString().search("\r\n\r\n");
    if (hEndPos !== -1) headerEnd = true;
    if (headerEnd && data.toString().slice(hEndPos+4).length > 0) {
      //console.log("Answer " + counter + " to question " + question.toString() + ":" + data.toString().slice(hEndPos+4));
      events.emit('data', {
        from: "HTTP answer body",
        question: question.toString(),
        data: data.toString().slice(hEndPos + 4),
        index: counter,
        ip: camIP
      })
      //if (callBackFunction) callBackFunction(data.slice(hEndPos+4), counter);
    }
    counter++;
  });

  /* Add a 'close' event handler for the client socket */
  client.on('close', function() {
    /* 			    console.log('Connection closed');*/
  });
  return client;
}

/***************************************
 * Listen for TCP messages from camera */
export function listen(camIP, listenPort) {
  // Add the camera ip to cameras Set
  cameras.add(camIP)

  // Listen to TCP messages coming to this server
  server.listen(listenPort ?? defaultListenPort, myIP);
  console.log("We are listening on", listenPort ?? defaultListenPort)

  // This command instructs the camera to send us status updates on TCP
  request("/cgi-bin/event?connect=start&my_port=35203&uid=50", camIP)
  console.log("Requested updates from camera", camIP)

  server.on('connection', function (sock) {
    /* We have a connection - a socket object is assigned to the connection automatically */
    // Het if statement dat hier wordt gebruikt om na te kijken of de socket "sock"
    // de socket is naar de camera die overeenkomt met het camera object.
    if (cameras.has(sock.remoteAddress)) {
      /* console.log('CONNECTED: ' + sock.remoteAddress +':'+ sock.remotePort); */
      sock.setEncoding("hex");

      /* Add a 'data' event handler to this instance of socket */
      sock.on('data', function (data) {
        // "data" is een Buffer met het TCP packet. Om er de nuttige informatie uit te halen
        // worden de headers enzovoort gestripped en de rest wordt dan vervolgens opgeslagen
        // in de variabele "info".
        let info = data.slice(60);
        info = info.slice(0, info.search("0d0a"));
        //console.log('Update Info: ' + hex2asc(info));
        events.emit('data', {
          from: "TCP listener",
          ip: sock.remoteAddress,
          data: hex2asc(info)
        })
      })
    }
  })

  /* Add a 'close' event handler for the client socket */
  server.on('close', function() {
    console.log('stopped listening 🙉')
  });
  return server;
}

//console.log("Requesting camera data:", cameraCommand("/live/camdata.html", '192.168.0.51'))