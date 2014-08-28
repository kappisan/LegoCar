var http = require('http'),
    app = http.createServer(handler),
    io = require('socket.io').listen(app, { log: false }),
    fs = require('fs'),
    pi, pi2, webclient;

io.sockets.on('connection', function (socket) {

  console.log('got a connection');

  socket.on('connect-motors', function (data) {
    pi = socket;
    console.log('motors online');
  });

  socket.on('connect-sensors', function (data) {
    pi2 = socket;
    console.log('sensors online');
  });

  socket.on('connect-webclient', function (data) {
    webclient = socket;
    console.log('webclient is connected');
  });


  socket.on('sensors', function(data) {
	
	var array = data.split(" ");
	
	var sens = {
		sensors: array,
		motors: false
	}

	console.log(array);

	if(!webclient) return;

	console.log("sending to webclient");

	webclient.emit('sensorsarray', array);

  });


  socket.on('command', function(data) {

    console.log('sending command', data);

    if(!pi) return;

    pi.emit('command', data);
  });
});

function handler(req, res){

  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    'Expires': '-1',
    'Pragma': 'no-cache'
  });

  var url = require('url');
  var url_parts = url.parse(req.url, true);
  var path = url_parts.path;

  console.log(path);

  res.write(fs.readFileSync('www/header.html'));

  if(path == "/control") res.write(fs.readFileSync('www/control.html')); 
  if(path == "/construction") res.write(fs.readFileSync('www/construction.html')); 
  else res.write(fs.readFileSync('www/index.html'));

  res.write(fs.readFileSync('www/footer.html'));

  res.end();

}
app.listen(8080);
