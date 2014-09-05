var http = require('http'),
    fs = require("fs"),
    path = require("path"),
    app = http.createServer(handler),
    io = require('socket.io').listen(app, { log: false }),
    fs = require('fs'),
    motors_pi, sensors_pi, webclient;

var exec = require('child_process').exec,
    child;

// DATABASE

var db = require('./db.js');
// open the database once
db.openDatabase(function(err, db) {
  if (err) {
    console.log('ERROR CONNECTING TO DATABASE');
    console.log(err);
    process.exit(1);
  }

  // authenticate once after you opened the database. What's the point of 
  // authenticating on-demand (for each query)?
  db.authenticate(db, 'usernsame', 'password', function(err, collection) {
    if (err) {
      console.log('ERROR AUTHENTICATING');
      console.log(err);
      process.exit(1);
    }

    // use the returned collection as many times as you like INSIDE THE CALLBACK
    collection.find({}, {limit: 10})
    .toArray(function(err, docs) {
      console.log('\n------ 1 ------');
      console.log(docs);
    });

    collection.find({}, {limit: 10})
    .toArray(function(err, docs) {
      console.log('\n------ 2 ------');
      console.log(docs);
    });
  });
});

// LISTENERS

io.sockets.on('connection', function (socket) {

  console.log('got a connection');

  socket.on('connect-motors', function (data) {
    motors_pi = socket;
    console.log('motors online');
    db.logLastConnected("motors", Date());
  });

  socket.on('connect-sensors', function (data) {
    sensors_pi = socket;
    console.log('sensors online');
    db.logLastConnected("sensors", Date());
  });

  socket.on('connect-webclient', function (data) {
    webclient = socket;
    console.log('webclient is connected');
    db.logLastConnected("webclient", Date());
  });

  socket.on('restore-db-to', function (data) {
    restoreDB(data);
  });

  socket.on('backup-now', function () {
    backupDB();
  });

  socket.on('sensors', function(data) {
	
    if(!data) return;

  	var array = data.split(" ");

  	console.log(array);

    if(db) db.logSensors(array);
    else console.log('no db - not logging');

  	if(!webclient) return;

  	console.log("sending to webclient");

  	webclient.emit('sensorsarray', array);

  });


  socket.on('command', function(data) {

    console.log('sending command', data);

    if(db) db.logCommand(data);
    else console.log('no db - not logging');

    if(motors_pi) motors_pi.emit('command', data);

    if(sensors_pi) sensors_pi.emit('command', data);

  });

  // send available restore points to frontend
  socket.on('request-restorepoints', function(data) {

      if(!webclient) { console.log('webclient not found, not sending restore points'); return; }

      console.log('webclient connected, sending restore points....');

      webclient.emit('send-restorepoints', getRestorePoints());

  }); 

});

// FUNCTIONS

function restoreDB(data) {
  console.log('running shell script to mongorestore for ' +  data);

  if(typeof data !== "string") console.log("input invalid");

  child = exec('sh restore.sh ' + data, [], function(error, stdout, stderr) { 
    console.log(stdout);
    if(stdout == '' || stdout == null) { 
     console.log("no output from running shell script, error maybe????"); return; 
    }

    if(!error) webclient.emit('send-restorepoints', getRestorePoints());
  });

}

function backupDB() {
  console.log('run shell script to mongobackup here');
  child = exec('sh backup.sh', [], function(error, stdout, stderr) { 
    console.log(stdout);
    if(stdout == '' || stdout == null) { 
     console.log("no output from running shell script, error maybe????"); return; 
    }
  });
}

function getRestorePoints() {

  var out;

  console.log('reading file system backups');

  var files = fs.readdirSync('./db/');
  for (var i in files) {
    console.log('read: ' + files[i]);
  }

  return files;
}

function handler(req, res){

  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    'Expires': '-1',
    'Pragma': 'no-cache'
  });

  var url = require('url');
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;

  if(url_parts.path == "/backup") res.write(fs.readFileSync('www/backup.html')); 
  else if(url_parts.path == "/logs") res.write(fs.readFileSync('www/logs.html')); 
  else res.write(fs.readFileSync('www/control.html')); 

  res.end();
}

app.listen(8080);
