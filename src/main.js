var ble = require('newtmgr').transport.ble;
var utility = require('newtmgr').utility;
var ProgressBar = require('progressbar.js');
var noble = require('noble/with-bindings')(require('noble/lib/webbluetooth/bindings'));
var Chart = require('chart.js');
var stacked100 = require('chartjs-plugin-stacked100');

var options = {
  services: ['8d53dc1d1db74cd3868b8a527460aa84'],
  characteristics: ['da2e7828fbce4e01ae9e261174997c48'],
  name: "nimble-bleprph",
};

noble.on('error', function(err){
  appendDom('output', err.toString());
});

noble._bindings.on('error', function(err){
  appendDom('output', err.toString());
});

var g_peripheral;
var g_characteristic;

var connect = function(peripheral, cb){
  ble.connect(peripheral, options, function(err, characteristic){
    if (err) return cb(err);
    g_characteristic = characteristic;
    g_peripheral = peripheral;

    g_peripheral.once('disconnect', function(){
      appendDom('output', "Device disconnected");
      disable();
    });

    enable();
    cb(err);
  });
};

//need to scan onclick for permissions reasons
var scan = function(event) {

  var nameInput = document.getElementById('nameInput');

  if(nameInput.value){
    options.name = nameInput.value;
  }

  //should probably check and check noble.state. but meh
  ble.scan(noble, options, function(err, peripheral){
    if (err){
      appendDom('output', "err scanning: " + err);
      return;
    }

    connect(peripheral, function(err){
      if (err){
        appendDom('output', "err connecting: " + err);
        return;
      }
      appendDom('output', "Connected");
    });
  });
};

var reset = function(event) {
  g_peripheral.once('disconnect', function(){
    connect(g_peripheral, function(err){
      if (err){
        appendDom('output', "err connecting: " + err);
        return;
      }
      appendDom('output', "Connected");
    });
  });

  ble.reset(g_characteristic, function(err, obj){
    appendDom('output', utility.prettyError(obj));
  });
};

var stat = function(event) {
  var input = document.getElementById('input');
  if(input.value){
    ble.stat(g_characteristic, input.value, function(err, obj){
      appendDom('output', utility.prettyError(obj));
      input.value = "";
    });
  }else{
    ble.stat(g_characteristic, function(err, obj){
      appendDom('output', utility.prettyError(obj));
    });
  }
};

var taskstats = function(event) {
  ble.taskstats(g_characteristic, function(err, obj){
    taskGraph(obj);
    appendDom('output', utility.prettyError(obj));
  });
};

var mpstats = function(event) {
  ble.mpstats(g_characteristic, function(err, obj){
    appendDom('output', utility.prettyError(obj));
  });
};

var logShow = function(event) {
  var input = document.getElementById('input');
  if(input.value){
    ble.log.show(g_characteristic, input.value, function(err, obj){
      appendDom('output', JSON.stringify(utility.prettyError(obj)));
      input.value = "";
    });
  }else{
    ble.log.show(g_characteristic, function(err, obj){
      appendDom('output', JSON.stringify(utility.prettyError(obj)));
    });
  }
};

var list = function(event) {
  console.log("list");
  ble.image.list(g_characteristic, function(err, obj){
    appendDom('output', utility.prettyList(obj));
  });
};

var test = function(event) {
  var input = document.getElementById('input');
  var testHashBuffer = Buffer.from(input.value, "hex");
  ble.image.test(g_characteristic, testHashBuffer, function(err, obj){
    appendDom('output', utility.prettyError(obj));
    input.value = "";
  });
};

var confirm = function(event) {
  var input = document.getElementById('input');
  var testHashBuffer = Buffer.from(input.value, "hex");
  ble.image.confirm(g_characteristic, testHashBuffer, function(err, obj){
    appendDom('output', utility.prettyError(obj));
    input.value = "";
  });
};

var upload = function(event) {
  var bar = new ProgressBar.Line('#progress', {easing: 'easeInOut'});

  var firmwareUpload = function(err, fileBuffer){
    var onStatus = function(obj){
      bar.animate(obj.off/fileBuffer.length);
    };

    var status;
    status = ble.image.upload(g_characteristic, fileBuffer, function(err, obj){
      appendDom('output', utility.prettyError(obj));
      status.removeListener('status', onStatus);
      bar.animate(0);
    });
    status.on('status', onStatus);
  };

  getFile(firmwareUpload);
};

var erase = function(event) {
  ble.image.erase(g_characteristic, function(err, obj){
    appendDom('output', utility.prettyError(obj));
  });
};

var appendDom = function(elementName, data){
  var output = document.getElementById(elementName);
  var charDiv = document.createElement("div");
  charDiv.innerHTML = JSON.stringify(data);
  output.appendChild(charDiv);
};

var getFile = function(cb){
  var inputDialog = document.getElementById("fileUpload");
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
  };
  inputDialog.click();
};

var enable = function(){
  document.getElementById("scanBtn").disabled = true;
  document.getElementById("logShowBtn").disabled = false;
  document.getElementById("resetBtn").disabled = false;
  document.getElementById("statBtn").disabled = false;
  document.getElementById("taskstatsBtn").disabled = false;
  document.getElementById("mpstatsBtn").disabled = false;
  document.getElementById("listBtn").disabled = false;
  document.getElementById("testBtn").disabled = false;
  document.getElementById("confirmBtn").disabled = false;
  document.getElementById("uploadBtn").disabled = false;
  document.getElementById("eraseBtn").disabled = false;
};

var disable = function(){
  document.getElementById("scanBtn").disabled = false;
  document.getElementById("logShowBtn").disabled = true;
  document.getElementById("resetBtn").disabled = true;
  document.getElementById("statBtn").disabled = true;
  document.getElementById("taskstatsBtn").disabled = true;
  document.getElementById("mpstatsBtn").disabled = true;
  document.getElementById("listBtn").disabled = true;
  document.getElementById("testBtn").disabled = true;
  document.getElementById("confirmBtn").disabled = true;
  document.getElementById("uploadBtn").disabled = true;
  document.getElementById("eraseBtn").disabled = true;
};

var taskGraph = function(data){
  var labels = [];
  var usedData = [];
  var freeData = [];
  for (var prop in data.tasks) {
    labels.push(prop);
    usedData.push(data.tasks[prop].stkuse);
    freeData.push(data.tasks[prop].stksiz-data.tasks[prop].stkuse);
  }

  new Chart(document.getElementById('chart-area'), {
    type: 'horizontalBar',
    data: {
      labels: labels,
      datasets: [
        { label: "used", data: usedData, backgroundColor: "rgba(48,63,159, 1.0)" },
        { label: "free",   data: freeData,  backgroundColor: "rgba(64,196,255, 1.0)" }
      ]
    },
    options: {
      scales: {
        xAxes: [{
          ticks: {
            display: false
          },
          gridLines: {
            display: false
          },
          scaleLabel: {
            display: false
          }
        }],
        yAxes: [{
          //  ticks: {
          //   display: false
          // },
          // gridLines: {
          //   display: false
          // },
          // scaleLabel: {
          //   display: false
          // }
        }]
      },
      legend: {
          display: false
      },
      plugins: {
        stacked100: { enable: true }
      }
    }
  });
};

document.getElementById("scanBtn").addEventListener("click", scan, false);
document.getElementById("logShowBtn").addEventListener("click", logShow, false);
document.getElementById("resetBtn").addEventListener("click", reset, false);
document.getElementById("eraseBtn").addEventListener("click", erase, false);
document.getElementById("statBtn").addEventListener("click", stat, false);
document.getElementById("taskstatsBtn").addEventListener("click", taskstats, false);
document.getElementById("mpstatsBtn").addEventListener("click", mpstats, false);
document.getElementById("listBtn").addEventListener("click", list, false);
document.getElementById("testBtn").addEventListener("click", test, false);
document.getElementById("confirmBtn").addEventListener("click", confirm, false);
document.getElementById("uploadBtn").addEventListener("click", upload, false);
