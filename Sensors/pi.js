var pi = require('socket.io-client').connect('http://kappisan.com');
var python=require('python').shell;

var gpio = require("pi-gpio");
var exec = require('child_process').exec,
    child;

console.log("sensors connecting");

// numbers of pi gpios connected
var d0 = 3,
    d1 = 5,
    d2 = 7,
    d3 = 8,
    d4 = 10;

function turnOnGPIO(io) {

        gpio.open(io, "output", function(err) {
                gpio.write(io, 1, function() {
                        gpio.close(io);
                });
        });
        return;
}

function turnOffGPIO(io) {

        gpio.open(io, "output", function(err) {
                gpio.write(io, 0, function() {
                        gpio.close(io);
                });
        });
        return;
}

function changeDisplay() {

	var truth = [false,false,false,false,false];
	
	for(var i = 0; i < 5; i++) {
		if(Math.random() >= 0.5) truth[i] = true;
	}
	
	if(truth[0]) turnOnGPIO(d0);
	else turnOffGPIO(d0)

        if(truth[1]) turnOnGPIO(d1);
        else turnOffGPIO(d1)
	 
        if(truth[2]) turnOnGPIO(d2);
        else turnOffGPIO(d2)

        if(truth[3]) turnOnGPIO(d3);
        else turnOffGPIO(d3)

        if(truth[4]) turnOnGPIO(d4);
        else turnOffGPIO(d4)


	return;

}

pi.on('connect',function() {
  pi.emit("connect-sensors", true);

  setInterval(function () {
    child = exec('sudo python sensors.py', [], function(error, stdout, stderr) { 
      console.log(stdout);
      if(stdout == '' || stdout == null) { 
	console.log("python-error"); return; 
      }

      pi.emit('sensors', stdout);
      changeDisplay();
    });
  }, 3000);


  pi.on('command', function(data){
    //console.log(data);


    console.log('hello');
    return;
  });
});
