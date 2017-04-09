var pull = require('pull-stream')
var toPull = require('stream-to-pull-stream')
var through = require('pull-through')
var nmgr = require('newtmgr').nmgr;
var ble = require('newtmgr').ble;
var utility = require('newtmgr').utility;
var Sourcer = require('newtmgr').Sourcer;

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
  var sourcer = Sourcer([nmgr.generateResetBuffer()]);

  pull(
    sourcer.source(),
    ble.duplexPull(characteristic),
    toPull(nmgr.decode()),
    appendPull(),
    pull.drain(sourcer.next.bind(sourcer), function(err){
      console.log("finished with status:", err);
    })
  );
}

var list = function(event) {
  var sourcer = Sourcer([nmgr.generateListBuffer()]);

  pull(
    sourcer.source(),
    ble.duplexPull(characteristic),
    toPull(nmgr.decode()),
    toPull(utility.hashToStringTransform()),
    appendPull(),
    pull.drain(sourcer.next.bind(sourcer), function(err){
      console.log("finished with status:", err);
    })
  );
}

var test = function(event) {
  var sourcer = Sourcer([nmgr.generateTestBuffer(argv.hash)]);

  pull(
    sourcer.source(),
    ble.duplexPull(characteristic),
    toPull(nmgr.decode()),
    appendPull(),
    pull.drain(sourcer.next.bind(sourcer), function(err){
      console.log("finished with status:", err);
    })
  );
}

var confirm = function(event) {
  var sourcer = Sourcer([nmgr.generateConfirmBuffer(argv.hash)]);

  pull(
    sourcer.source(),
    ble.duplexPull(characteristic),
    toPull(nmgr.decode()),
    appendPull(),
    pull.drain(sourcer.next.bind(sourcer), function(err){
      console.log("finished with status:", err);
    })
  );
}

document.getElementById("connectBtn").addEventListener("click", connect.bind(this), false);
document.getElementById("resetBtn").addEventListener("click", reset.bind(this), false);
document.getElementById("listBtn").addEventListener("click", list.bind(this), false);
document.getElementById("testBtn").addEventListener("click", test.bind(this), false);
document.getElementById("confirmBtn").addEventListener("click", confirm.bind(this), false);

var appendPull = through(function (data) {
  var charDiv = document.createElement("div");
  charDiv.innerHTML = JSON.stringify(chunk);
  output.appendChild(charDiv);
  this.queue(data)
}, function (end) {
  this.queue(null)
})
