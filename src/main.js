var from2 = require('from2');
var through2 = require('through2');
var to2 = require('flush-write-stream');

var nmgr = require('newtmgr').nmgr;
var ble = require('newtmgr').ble;
var utility = require('newtmgr').utility;

var options = {
  services: ['8d53dc1d1db74cd3868b8a527460aa84'],
  characteristics: ['da2e7828fbce4e01ae9e261174997c48'],
  name: "nimble-bleprph",
  nowait: true //hack for webble, whose statechange isnt good yet
};

var output = document.getElementById('output');
var hashInput = document.getElementById('hashInput');
var nameInput = document.getElementById('nameInput');

var characteristic;

//need to connect onclick for permissions reasons
var connect = function(event) {
  if(nameInput.value){
    options.name = nameInput.value;
  }

  ble.connect(options, function(err, _characteristic){
    console.log("subscribed and ready");
    characteristic = _characteristic;
  });
}

var reset = function(event) {
  characteristic.write(nmgr.generateResetBuffer(), true);

  var stream = utility.emitterStream(characteristic)
  stream
    .pipe(nmgr.decode())
    .pipe(append())
    .pipe(to2.obj(function (chunk, enc, cb) {
      stream.push(null); //close previous instance of emitterStream so we dont have dangling listeners
      return cb()
    }));
}

var list = function(event) {
  characteristic.write(nmgr.generateListBuffer(), true);

  var stream = utility.emitterStream(characteristic)
  stream
    .pipe(nmgr.decode())
    .pipe(utility.hashToStringTransform())
    .pipe(append())
    .pipe(to2.obj(function (chunk, enc, cb) {
      stream.push(null); //close previous instance of emitterStream so we dont have dangling listeners
      return cb()
    }));
}

var test = function(event) {
  characteristic.write(nmgr.generateTestBuffer(hashInput.value), true);

  var stream = utility.emitterStream(characteristic)
  stream
    .pipe(nmgr.decode())
    .pipe(append())
    .pipe(to2.obj(function (chunk, enc, cb) {
      stream.push(null); //close previous instance of emitterStream so we dont have dangling listeners
      return cb()
    }));
}

var confirm = function(event) {
  characteristic.write(nmgr.generateConfirmBuffer(hashInput.value), true);

  var stream = utility.emitterStream(characteristic)
  stream
    .pipe(nmgr.decode())
    .pipe(append())
    .pipe(to2.obj(function (chunk, enc, cb) {
      stream.push(null); //close previous instance of emitterStream so we dont have dangling listeners
      return cb()
    }));
}

document.getElementById("connectBtn").addEventListener("click", connect.bind(this), false);
document.getElementById("resetBtn").addEventListener("click", reset.bind(this), false);
document.getElementById("listBtn").addEventListener("click", list.bind(this), false);
document.getElementById("testBtn").addEventListener("click", test.bind(this), false);
document.getElementById("confirmBtn").addEventListener("click", confirm.bind(this), false);


var append = function() {

  function transform(chunk, enc, cb){
    var charDiv = document.createElement("div");
    charDiv.innerHTML = JSON.stringify(chunk);
    output.appendChild(charDiv);
    return cb(null, chunk);
  }

  return through2.obj(transform);
}
