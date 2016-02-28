var options = JSON.parse(localStorage.getItem('options'));

Pebble.addEventListener('showConfiguration', function() {
  var url = 'https://rawgit.com/ghys/pebble-yamaha-remote/master/config/index.html';
  console.log('Showing configuration page: ' + url);

  Pebble.openURL(url);
});

function basicNodeValue(xml, node) {
  var start = xml.indexOf("<" + node + ">");
  var end = xml.indexOf("</" + node + ">");
  return xml.substring(start + node.length + 2, end);
}

function sendRequest(cmd, payload, callback) {
    var req = new XMLHttpRequest();
    req.onload = function (e) {
   
      if (req.readyState == 4 && req.status == 200) {
        callback(null, req.responseText);
        //console.log("responseText: " + req.responseText.substring(1, 4)); 
      } else {
        callback(req.status, null);
      }
  
        
    };
    
    req.open('POST', "http://" + options['yamaha_ip'] + "/YamahaRemoteControl/ctrl");
    req.send('<YAMAHA_AV cmd="' + cmd + '">' + payload + '</YAMAHA_AV>');
    
}

var send = function (dict) {
  // Send to watchapp
  //console.log(JSON.stringify(dict));
  Pebble.sendAppMessage(dict, function() {
    //console.log('Send successful: ' + JSON.stringify(dict));
  }, function(e) {
    console.log('Send failed! ' + JSON.stringify(e));
  });
}      


var getBasicMainZoneInfo = function(noaddlinfo) {
  if (!options || !options['yamaha_ip']) return;
  sendRequest("GET", "<Main_Zone><Basic_Status>GetParam</Basic_Status></Main_Zone>", function (err, data) {
    var dict = {};
    if (data) {
      var power_control = basicNodeValue(data, "Power_Control");
      var power = basicNodeValue(power_control, "Power");
      var volume = basicNodeValue(data, "Volume");
      var volume_level = basicNodeValue(volume, "Lvl");
      var volume_val = basicNodeValue(volume_level, "Val");
      var volume_unit = basicNodeValue(volume_level, "Unit");
      var mute = basicNodeValue(volume, "Mute");
      var input_name = basicNodeValue(data, "Input_Sel");
      var input_title = basicNodeValue(data, "Title");
      var dsp_program = basicNodeValue(data, "Sound_Program");
      
      dict = {
        "POWER": power,
        "VOLUME": (parseInt(volume_val)/10).toString() + " " + volume_unit,
        "MUTE": mute,
        "INPUT_NAME": input_name,
        "INPUT_TITLE": input_title,
        "DSP_PROGRAM": dsp_program
      };
      
      if (!noaddlinfo && input_name == "NET RADIO") {
        sendRequest("GET", "<NET_RADIO><Play_Info>GetParam</Play_Info></NET_RADIO>", function (playerr, playdata) {
          if (playdata) {
            dict["PLAYBACK_MAIN"] = basicNodeValue(playdata, "Station");
            dict["PLAYBACK_SUB"] = basicNodeValue(playdata, "Song");
            dict["PLAYBACK_ELAPSED"] = basicNodeValue(playdata, "Elapsed");
            dict["PLAYBACK_STATUS"] = basicNodeValue(playdata, "Playback_Info");
            send(dict);
          }
        });
      } else if (!noaddlinfo && input_name == "SERVER") {
        sendRequest("GET", "<SERVER><Play_Info>GetParam</Play_Info></SERVER>", function (playerr, playdata) {
          if (playdata) {
            dict["PLAYBACK_MAIN"] = basicNodeValue(playdata, "Song");
            dict["PLAYBACK_SUB"] = basicNodeValue(playdata, "Artist");
            dict["PLAYBACK_ELAPSED"] = basicNodeValue(playdata, "Elapsed");
            dict["PLAYBACK_STATUS"] = basicNodeValue(playdata, "Playback_Info");
            send(dict);
          }
        });
      } else if (!noaddlinfo && input_name == "Spotify") {
        sendRequest("GET", "<Spotify><Play_Info>GetParam</Play_Info></Spotify>", function (playerr, playdata) {
          if (playdata) {
            dict["PLAYBACK_MAIN"] = basicNodeValue(playdata, "Track");
            dict["PLAYBACK_SUB"] = basicNodeValue(playdata, "Artist");
            dict["PLAYBACK_ELAPSED"] = '';
            dict["PLAYBACK_STATUS"] = basicNodeValue(playdata, "Playback_Info");
            send(dict);
          }
        });
      } else if (!noaddlinfo && input_name == "Napster") {
        sendRequest("GET", "<Napster><Play_Info>GetParam</Play_Info></Napster>", function (playerr, playdata) {
          if (playdata) {
            dict["PLAYBACK_MAIN"] = basicNodeValue(playdata, "Track");
            dict["PLAYBACK_SUB"] = basicNodeValue(playdata, "Artist");
            dict["PLAYBACK_ELAPSED"] = '';
            dict["PLAYBACK_STATUS"] = basicNodeValue(playdata, "Playback_Info");
            send(dict);
          }
        });
      } else if (!noaddlinfo && input_name == "JUKE") {
        sendRequest("GET", "<JUKE><Play_Info>GetParam</Play_Info></JUKE>", function (playerr, playdata) {
          if (playdata) {
            dict["PLAYBACK_MAIN"] = basicNodeValue(playdata, "Track");
            dict["PLAYBACK_SUB"] = basicNodeValue(playdata, "Artist");
            dict["PLAYBACK_ELAPSED"] = '';
            dict["PLAYBACK_STATUS"] = basicNodeValue(playdata, "Playback_Info");
            send(dict);
          }
        });
      } else if (!noaddlinfo && input_name == "Pandora") {
        sendRequest("GET", "<Pandora><Play_Info>GetParam</Play_Info></Pandora>", function (playerr, playdata) {
          if (playdata) {
            dict["PLAYBACK_MAIN"] = basicNodeValue(playdata, "Track");
            dict["PLAYBACK_SUB"] = basicNodeValue(playdata, "Artist");
            dict["PLAYBACK_ELAPSED"] = '';
            dict["PLAYBACK_STATUS"] = basicNodeValue(playdata, "Playback_Info");
            send(dict);
          }
        });
      } else if (!noaddlinfo && input_name == "Bluetooth") {
        sendRequest("GET", "<Bluetooth><Play_Info>GetParam</Play_Info></Bluetooth>", function (playerr, playdata) {
          if (playdata) {
            dict["PLAYBACK_MAIN"] = basicNodeValue(playdata, "Song");
            dict["PLAYBACK_SUB"] = basicNodeValue(playdata, "Artist");
            dict["PLAYBACK_ELAPSED"] = basicNodeValue(playdata, "Elapsed");
            dict["PLAYBACK_STATUS"] = basicNodeValue(playdata, "Playback_Info");
            send(dict);
          }
        });
      } else if (!noaddlinfo && input_name == "MusicCast Link") {
        sendRequest("GET", "<MusicCast_Link><Play_Info>GetParam</Play_Info></MusicCast_Link>", function (playerr, playdata) {
          if (playdata) {
            dict["PLAYBACK_MAIN"] = basicNodeValue(playdata, "Song");
            dict["PLAYBACK_SUB"] = basicNodeValue(playdata, "Artist");
            dict["PLAYBACK_ELAPSED"] = basicNodeValue(playdata, "Elapsed");
            dict["PLAYBACK_STATUS"] = basicNodeValue(playdata, "Playback_Info");
            send(dict);
          }
        });
      } else if (!noaddlinfo && input_name == "AirPlay") {
        sendRequest("GET", "<AirPlay><Play_Info>GetParam</Play_Info></AirPlay>", function (playerr, playdata) {
          if (playdata) {
            dict["PLAYBACK_MAIN"] = basicNodeValue(playdata, "Song");
            dict["PLAYBACK_SUB"] = basicNodeValue(playdata, "Artist");
            dict["PLAYBACK_ELAPSED"] = basicNodeValue(playdata, "Elapsed");
            dict["PLAYBACK_STATUS"] = basicNodeValue(playdata, "Playback_Info");
            send(dict);
          }
        });
      } else if (!noaddlinfo && input_name == "USB") {
        sendRequest("GET", "<USB><Play_Info>GetParam</Play_Info></USB>", function (playerr, playdata) {
          if (playdata) {
            dict["PLAYBACK_MAIN"] = basicNodeValue(playdata, "Song");
            dict["PLAYBACK_SUB"] = basicNodeValue(playdata, "Artist");
            dict["PLAYBACK_ELAPSED"] = basicNodeValue(playdata, "Elapsed");
            dict["PLAYBACK_STATUS"] = basicNodeValue(playdata, "Playback_Info");
            send(dict);
          }
        });
      } else {
        send(dict);
      }

    } else {
      dict['ERROR'] = "Error " + err;
      send(dict);
    }
  });
}

var getScenes = function () {
  sendRequest("GET", "<Main_Zone><Scene><Scene_Sel_Item>GetParam</Scene_Sel_Item></Scene></Main_Zone>", function (err, data) {
    if (data) {
      var lastid = parseInt(data.substring(data.lastIndexOf("Item_") + 5, data.lastIndexOf("Item_") + 7));
      var nbscenes = 0;
      var nbinputs = 0;
      dict = {};
      
      for(var i = 1; i <= lastid; i++) {
        var item = basicNodeValue(data, "Item_" + i);
        var param = basicNodeValue(item, "Param");
        var rw = basicNodeValue(item, "RW");
        var title = basicNodeValue(item, "Title");
        
        if (rw === 'W') {
          // it is a scene
          nbscenes++;
          dict[(100 + nbscenes).toString()] = param;
          dict[(150 + nbscenes).toString()] = title;
        } else {
          // it is an input
          nbinputs++;
          dict[(200 + nbinputs).toString()] = param;
          dict[(250 + nbinputs).toString()] = title;
        }
        
        dict["SCENE_COUNT"] = nbscenes;
        dict["INPUT_COUNT"] = nbinputs;
        
      }
      
      console.log("Scenes & inputs: " + JSON.stringify(dict));
      send(dict);
    }
  });
}

var powerToggle = function () {
  sendRequest("PUT", "<Main_Zone><Power_Control><Power>On/Standby</Power></Power_Control></Main_Zone>", function (err, data) {
    if (data) {
      console.log(data);
      getBasicMainZoneInfo(true);
    }
  });
}

var setVolume = function (value) {
  sendRequest("PUT", "<Main_Zone><Volume><Lvl><Val>" + value + "</Val><Exp></Exp><Unit></Unit></Lvl></Volume></Main_Zone>", function (err, data) {
    if (data) {
      console.log(data);
      getBasicMainZoneInfo(true);
    }
  });
}

var muteToggle = function (value) {
  sendRequest("PUT", "<Main_Zone><Volume><Mute>On/Off</Mute></Volume></Main_Zone>", function (err, data) {
    if (data) {
      console.log(data);
      getBasicMainZoneInfo();
    }
  });
}

var setScene = function (value) {
  sendRequest("PUT", "<Main_Zone><Scene><Scene_Sel>" + value + "</Scene_Sel></Scene></Main_Zone>", function (err, data) {
    if (data) {
      console.log(data);
      getBasicMainZoneInfo();
    }
  });
}

var switchInput = function (value) {
  sendRequest("PUT", "<Main_Zone><Input><Input_Sel>" + value + "</Input_Sel></Input></Main_Zone>", function (err, data) {
    if (data) {
      console.log(data);
      getBasicMainZoneInfo();
    }
  });
}

var setDSPProgram = function (value) {
  sendRequest("PUT", "<Main_Zone><Surround><Program_Sel><Current><Sound_Program>" + value + "</Sound_Program></Current></Program_Sel></Surround></Main_Zone>", function (err, data) {
    if (data) {
      console.log(data);
      getBasicMainZoneInfo();
    }
  });
}

var playbackControl = function (value) {
  sendRequest("PUT", "<Main_Zone><Play_Control><Playback>" + value + "</Playback></Play_Control></Main_Zone>", function (err, data) {
    if (data) {
      console.log(data);
      getBasicMainZoneInfo();
    }
  });
}

Pebble.addEventListener("appmessage", function(e) {
  console.log("message received: " + JSON.stringify(e.payload));
  if (e.payload['DATA_REQUEST']) {
    if (e.payload['DATA_REQUEST'] == 1)
      getBasicMainZoneInfo();
    else if (e.payload['DATA_REQUEST'] == 2)
      getScenes();
  } else if (e.payload['POWER_TOGGLE']) {
    powerToggle();
  } else if (e.payload['VOLUME_UP']) {
    setVolume('Up');
  } else if (e.payload['VOLUME_DOWN']) {
    setVolume('Down');
  } else if (e.payload['VOLUME_UP_LONG']) {
    setVolume('Up 5 dB');
  } else if (e.payload['VOLUME_DOWN_LONG']) {
    setVolume('Down 5 dB');
  } else if (e.payload['MUTE_TOGGLE']) {
    muteToggle();
  } else if (e.payload['SET_SCENE']) {
    setScene(e.payload['SET_SCENE']);
  } else if (e.payload['SWITCH_INPUT']) {
    switchInput(e.payload['SWITCH_INPUT']);
  } else if (e.payload['SET_DSP_PROGRAM']) {
    setDSPProgram(e.payload['SET_DSP_PROGRAM']);
  } else if (e.payload['SKIP_REV']) {
    playbackControl('Skip Rev');
  } else if (e.payload['SKIP_FWD']) {
    playbackControl('Skip Rev');
  } else if (e.payload['PAUSE']) {
    playbackControl('Pause');
  } else if (e.payload['PLAY']) {
    playbackControl('Play');
  }
});


Pebble.addEventListener('webviewclosed', function(e) {
  if (e.response) { 
    options = JSON.parse(decodeURIComponent(e.response)); 
    localStorage.setItem('options', JSON.stringify(options)); 

    getBasicMainZoneInfo();
    
    /*var dict = {};
    dict['YAMAHA_IP'] = options['yamaha_ip'] ? options['yamaha_ip'] : "";
    
    sendRequest("GET", "<System><Config>GetParam</Config></System>", function (err, data) {
      if (data) {
        //dict['BASIC_CONFIG'] = data.substring(data.indexOf("<Model_Name>"), data.indexOf("<Feature_Existence>"));
        dict['BASIC_CONFIG'] = basicNodeValue(data, "Model_Name");
        
        // Send to watchapp
        Pebble.sendAppMessage(dict, function() {
          console.log('Send successful: ' + JSON.stringify(dict));
        }, function() {
          console.log('Send failed!');
        });
      }
    })*/
  }
  
});


Pebble.addEventListener('ready', function() {
  console.log('PebbleKit JS ready!');
  console.log('options:' + JSON.stringify(options));
  
  if (!options || !options['yamaha_ip']) {
    send({'ERROR': 'Please set up\nIP address\nin app settings'});
  }
  
  setInterval(getBasicMainZoneInfo, 3000);
  getBasicMainZoneInfo();
  
});
