var ble = require('newtmgr').transport.ble;
var utility = require('newtmgr').utility;
var ProgressBar = require('progressbar.js');
var noble = require('noble/with-bindings')(require('noble/lib/webbluetooth/bindings'));

var options = {
  services: ['8d53dc1d1db74cd3868b8a527460aa84'],
  characteristics: ['da2e7828fbce4e01ae9e261174997c48'],
  name: "nimble-bleprph",
};

//need to connect onclick for permissions reasons
var connect = function(event) {
  var nameInput = document.getElementById('nameInput');

  if(nameInput.value){
    options.name = nameInput.value;
  }

  var onStateChange = function (state) {
    if (state === 'poweredOn') {
      ble.scanAndConnect(noble, options, function(err, peripheral, characteristic){
        peripheral.once('disconnect', function(){
          appendDom('output', "Device disconnected");
          disable(characteristic)
        });
        enable(characteristic);
        appendDom('output', "Connected");
      });
    }
  };
  noble.once('stateChange', onStateChange);
}

var reset = function(characteristic, event) {
  ble.reset(characteristic, function(err, obj){
    appendDom('output', utility.prettyError(obj));
  });
}

var list = function(characteristic, event) {
  ble.image.list(characteristic, function(err, obj){
    appendDom('output', utility.prettyList(obj));
  });
}

var test = function(characteristic, event) {
  var hashInput = document.getElementById('hashInput');
  ble.image.test(characteristic, Buffer.from(hashInput.value), function(err, obj){
    appendDom('output', utility.prettyError(obj));
  });
}

var confirm = function(characteristic, event) {
  var hashInput = document.getElementById('hashInput');
  ble.image.confirm(characteristic, Buffer.from(hashInput.value), function(err, obj){
    appendDom('output', utility.prettyError(obj));
  });
}

var upload = function(characteristic, event) {
  var bar = new ProgressBar.Line('#progress', {easing: 'easeInOut'});

  var firmwareUpload = function(err, fileBuffer){
    var onStatus = function(obj){
      bar.animate(obj.off/fileBuffer.length);
    }

    var status;
    status = ble.image.upload(characteristic, fileBuffer, function(err, obj){
      appendDom('output', utility.prettyError(obj));
      status.removeListener('status', onStatus);
      bar.animate(0);
    });
    status.on('status', onStatus);
  }


  getFile(firmwareUpload);
}

document.getElementById("connectBtn").addEventListener("click", connect.bind(this), false);


var appendDom = function(elementName, data){
  var output = document.getElementById(elementName);
  var charDiv = document.createElement("div");
  charDiv.innerHTML = JSON.stringify(data);
  output.appendChild(charDiv);
}

var getFile = function(cb){
  var inputDialog = document.createElement('input');
  inputDialog.id = 'fileUpload';
  inputDialog.type = "file";
  inputDialog.click();
  inputDialog.onchange = function(data){

    var selectedFile = data.target.files[0];

    if(selectedFile){
      var reader = new FileReader();
      reader.onloadend = function(theFile){
        var buffer  = Buffer.from(theFile.target.result);

        appendDom('output', 'uploading ' + selectedFile.name + " " + buffer.length + " bytes");

        cb(null, buffer);
      };
      reader.readAsArrayBuffer(selectedFile);
    }
  }
}

var enable = function(characteristic){
  //reconnecting doesnt seem to work so disable on connect, and dont reenable on disconnect
  var connectBtn = document.getElementById("connectBtn");
  connectBtn.removeEventListener("click", connect.bind(this), false);
  connectBtn.disabled = true;

  var resetBtn = document.getElementById("resetBtn");
  resetBtn.addEventListener("click", reset.bind(null, characteristic), false);
  resetBtn.disabled = false;

  var listBtn = document.getElementById("listBtn");
  listBtn.addEventListener("click", list.bind(null, characteristic), false);
  listBtn.disabled = false;

  var testBtn = document.getElementById("testBtn");
  testBtn.addEventListener("click", test.bind(null, characteristic), false);
  testBtn.disabled = false;

  var confirmBtn = document.getElementById("confirmBtn")
  confirmBtn.addEventListener("click", confirm.bind(null, characteristic), false);
  confirmBtn.disabled = false;

  var uploadBtn = document.getElementById("uploadBtn");
  uploadBtn.addEventListener("click", upload.bind(null, characteristic), false);
  uploadBtn.disabled = false;
}

var disable = function(characteristic){
  var resetBtn = document.getElementById("resetBtn");
  resetBtn.removeEventListener("click", reset.bind(null, characteristic), false);
  resetBtn.disabled = true;

  var listBtn = document.getElementById("listBtn");
  listBtn.removeEventListener("click", list.bind(null, characteristic), false);
  listBtn.disabled = true;

  var testBtn = document.getElementById("testBtn");
  testBtn.removeEventListener("click", test.bind(null, characteristic), false);
  testBtn.disabled = true;

  var confirmBtn = document.getElementById("confirmBtn")
  confirmBtn.removeEventListener("click", confirm.bind(null, characteristic), false);
  confirmBtn.disabled = true;

  var uploadBtn = document.getElementById("uploadBtn");
  uploadBtn.removeEventListener("click", upload.bind(null, characteristic), false);
  uploadBtn.disabled = true;
}
