var from2 = require('from2');
var to2 = require('flush-write-stream');

var nmgr = require('newtmgr').nmgr;
var ble = require('./ble');

var NMGR_SVC_UUID = '8d53dc1d1db74cd3868b8a527460aa84';
var NMGR_CHAR_UUID = 'da2e7828fbce4e01ae9e261174997c48';

var output = document.getElementById('output');

var onClick = function(event) {

  var listen = function() {
    return to2.obj(function (chunk, enc, callback) {
      console.log(chunk);
      var charDiv = document.createElement("div");
      output.appendChild(charDiv);
      this.push(chunk);
      callback()
    })
  };

  var stream = ble({name:"nimble-blesplit", serviceUuid:NMGR_SVC_UUID, characteristicUuid: NMGR_CHAR_UUID});

  from2([nmgr.generateListBuffer()])
    .pipe(stream, {end: false}) //dont let from2 close stream
    .pipe(nmgr.decode())
    .pipe(listen());
}

document.getElementById("resetBtn").addEventListener("click", onClick.bind(this), false);
