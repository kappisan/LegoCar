var mongodb= require('mongodb'),
  server = new mongodb.Server('localhost', 27017, {
    auto_reconnect: true
  }),
  db1 = new mongodb.Db('legocar', server);


// callback: (err, db)
function openDatabase(callback) {
  db1.open(function(err, db) {
    if (err)
      return callback(err);

    console.log('Database connected');

    return callback(null, db);
  });
}

// callback: (err, collection)
function authenticate(db, username, password, callback) {
  db.authenticate(username, password, function(err, result) {
    if (err) {
      return callback (err);
    }
    if (result) {
      var collection = new mongodb.Collection(db, 'sensordata');

      // always, ALWAYS return the error object as the first argument of a callback
      return callback(null, collection);
    } else {
      return callback (new Error('authentication failed'));
    }
  });
}

function logCommand(data) {
  console.log('logging data');

  var collection = new mongodb.Collection(db1, 'commands');

  if(!collection) { console.log('error no collection'); return; }

  var date = new Date();

  var dbObject = {
    command: data,
    second: date.getUTCSeconds(),
    minute: date.getMinutes(),
    hour: date.getHours(),
    day: date.getDate(),
    month: date.getMonth(),
    year: date.getFullYear(),
  }

  collection.insert(dbObject, function(err, records){
    console.log("Record added as "+records[0]._id);
  });

}

function logSensors(data) {
  console.log('logging data');

  var collection = new mongodb.Collection(db1, 'sensors');

  if(!collection) { console.log('error no collection'); return; }

  var date = new Date();

  var dbObject = {
    temp: data[0],
    light: data[1],
    sonar: data[2],
    second: date.getUTCSeconds(),
    minute: date.getMinutes(),
    hour: date.getHours(),
    day: date.getDate(),
    month: date.getMonth(),
    year: date.getFullYear(),
  }

  collection.insert(dbObject, function(err, records){
    console.log("Record added as "+records[0]._id);
  });
}

function logLastConnected(what, data) {
  console.log('logging connection time');

  var collection = new mongodb.Collection(db1, 'connections');

  if(!collection) { console.log('error no collection'); return; }

  console.log('logged connection to ' + what);

  var date = new Date();

  var query = {
    module: what
  }

  var dbObject = {
    module: what,
    second: date.getUTCSeconds(),
    minute: date.getMinutes(),
    hour: date.getHours(),
    day: date.getDate(),
    month: date.getMonth(),
    year: date.getFullYear(),
    error: false
  }

  collection.update(query, dbObject, { upsert: true });
}

exports.openDatabase = openDatabase;
exports.authenticate = authenticate;
exports.logCommand = logCommand;
exports.logSensors = logSensors;
exports.logLastConnected = logLastConnected;