var pull = require('pull-stream')
var through = require('pull-through')
var toPull = require('stream-to-pull-stream')
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

//need to connect onclick for permissions reasons
var connect = function(event) {
  var nameInput = document.getElementById('nameInput');

  if(nameInput.value){
    options.name = nameInput.value;
  }

  ble.connect(options, function(err, characteristic){
    console.log("subscribed and ready");

    document.getElementById("resetBtn").addEventListener("click", reset.bind(this, characteristic), false);
    document.getElementById("listBtn").addEventListener("click", list.bind(this, characteristic), false);
    document.getElementById("testBtn").addEventListener("click", test.bind(this, characteristic), false);
    document.getElementById("confirmBtn").addEventListener("click", confirm.bind(this, characteristic), false);
  });
}


var reset = function(characteristic, event) {
  var sourcer = Sourcer([nmgr.generateResetBuffer()]);

  pull(
    sourcer.source(),
    ble.duplexPull(characteristic),
    toPull(nmgr.decode()),
    appendDomPull('output'),
    pull.drain(sourcer.next.bind(sourcer), function(err){
      console.log("finished with status:", err);
    })
  );
}

var list = function(characteristic, event) {
  var sourcer = Sourcer([nmgr.generateImageListBuffer()]);

  pull(
    sourcer.source(),
    ble.duplexPull(characteristic),
    toPull(nmgr.decode()),
    toPull(utility.hashToStringTransform()),
    appendDomPull('output'),
    pull.drain(sourcer.next.bind(sourcer), function(err){
      console.log("finished with status:", err);
    })
  );
}

var test = function(characteristic, event) {
  var hashInput = document.getElementById('hashInput');

  var cmd = {};
  cmd.confirm = false;
  cmd.hash = Buffer.from(hashInput);
  var sourcer = Sourcer([nmgr.generateImageTestBuffer(cmd)]);

  pull(
    sourcer.source(),
    ble.duplexPull(characteristic),
    toPull(nmgr.decode()),
    appendDomPull('output'),
    pull.drain(sourcer.next.bind(sourcer), function(err){
      console.log("finished with status:", err);
    })
  );
}

var confirm = function(characteristic, event) {
  var hashInput = document.getElementById('hashInput');

  var cmd = {};
  cmd.confirm = true;
  cmd.hash = Buffer.from(hashInput);
  var sourcer = Sourcer([nmgr.generateImageConfirmBuffer(cmd)]);

  pull(
    sourcer.source(),
    ble.duplexPull(characteristic),
    toPull(nmgr.decode()),
    appendDomPull('output'),
    pull.drain(sourcer.next.bind(sourcer), function(err){
      console.log("finished with status:", err);
    })
  );
}

document.getElementById("connectBtn").addEventListener("click", connect.bind(this), false);


var appendDomPull = function(elementName){
  var output = document.getElementById(elementName);
  return through(function (data) {
    var charDiv = document.createElement("div");
    charDiv.innerHTML = JSON.stringify(data);
    output.appendChild(charDiv);
    this.queue(data)
  }, function (end) {
    this.queue(null)
  })
}
