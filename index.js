const plugin = require('@signalk/signalk-plugin-fusion-audio');
const { PGN } = plugin;
const { PGN, sendCommand, sendProductInformation } = require('@signalk/signalk-plugin-fusion-audio');
var lastVolume = 0;
var lastMute = false;
var lastSource = '';


module.exports = function(app) {
// send a product information message to identify the plugin as a Fusion audio device
  sendProductInformation(app, {
    PIDIL: 0x10, // change this to a unique address on your network
    PIDIH: 0x00,
    DF: 0x06, // audio function
    DC: 0x14, // audio device class
    FirmwareVersion: 0x01,
    ModelId: "SK-AUDIO-PLUGIN",
    ModelVersion: "1.0",
    DF: 0x08, // remote control function
    DF: 0x09, // equalization function
    DF: 0x0A, // tone control function
    DF: 0x0B, // balance and fader function
    DC: 0x15, // multi-zone audio device class
    DC: 0x17, // audio processor device class
   });

  subscribe(app, function(msg) {
    // other logic here to handle other PGN's like volume control
  });
};


// Listen for volume command PGN
server.on(`nmea2000out`, (n2k) => {
  if (n2k.pgn === PGN.VolumeCommand) {
    lastVolume = n2k.fields.Volume;
    console.log(`Volume changed to: ${lastVolume}`);
  }
});

// Listen for mute command PGN
server.on(`nmea2000out`, (n2k) => {
  if (n2k.pgn === PGN.MuteCommand) {
    lastMute = n2k.fields.Mute;
    console.log(`Mute changed to: ${lastMute}`);
  }
});

// Listen for source command PGN
server.on(`nmea2000out`, (n2k) => {
  if (n2k.pgn === PGN.SourceCommand) {
    lastSource = n2k.fields.Source;
    console.log(`Source changed to: ${lastSource}`);
  }
});

