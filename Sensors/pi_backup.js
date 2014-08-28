var pi = require('socket.io-client').connect('http://kappisan.com');
var python=require('python').shell;
var exec = require('child_process').exec,
    child;

console.log("sensors connecting");

pi.on('connect',function() {
  pi.emit("connect-sensors", true);

  setInterval(function () {
    child = exec('sudo python sensors.py', [], function(error, stdout, stderr) { 
      console.log(stdout);
      if(stdout == '' || stdout == null) { 
	console.log("python-error"); return; 
      }

      pi.emit('sensors', stdout);
    });
  }, 3000);


  pi.on('command', function(data){
    //console.log(data);


    console.log('hello');
    return;
  });
});
