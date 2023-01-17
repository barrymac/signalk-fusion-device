const {exec} = require('child_process');
var lastMute = false;
var desiredZone = 0; // define desired zone here
var soundCardId = 0; // define sound card id here

// Define local constants for the PGNs
const PGN_VOLUME_COMMAND = 0xF004;  //126993;
const PGN_MUTE_COMMAND = 0xF005;    //126995;
const PGN_SOURCE_COMMAND = 0xF006;  //126998;

function sendProductInformation(app, productInformation) {
    app.signalk.emit('nmea2000out', {
        pgn: PGN.ProductInformation,
        fields: productInformation
    });
}

module.exports = function (app) {
// send a product information message to identify the plugin as a Fusion audio device
    sendProductInformation(app, {
        PIDIL: 0x10, // 16 - change this to a unique address on your network
        PIDIH: 0x00, // 0
        DF: [0x06, 0x08, 0x09, 0x0A, 0x0B], // 6, 8, 9, 10, 11 - audio function, remote control function, equalization function, tone control function, balance and fader function
        DC: [0x14, 0x15, 0x17], // 20, 21, 23 - audio device class, multi-zone audio device class, audio processor device class
        FirmwareVersion: 0x01, // 1
        ModelId: "SK-AUDIO-PLUGIN",
        ModelVersion: "1.0",
    });

// Listen for volume command PGN
    app.on(nmea2000out, (n2k) => {
        if (n2k.pgn === PGN_VOLUME_COMMAND) {
// check if the command is for the desired zone
            if (n2k.fields.Zone === desiredZone) {
// change the volume for the specific sound card
                exec(`amixer -c ${soundCardId} set PCM ${n2k.fields.Volume}%`, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        return;
                    }
                    console.log(`stdout: ${stdout}`);
                });
            }
        }
    });

// Listen for mute command PGN
    app.on(nmea2000out, (n2k) => {
        if (n2k.pgn === PGN_MUTE_COMMAND) {
            lastMute = n2k.fields.Mute;
            console.log(`Mute changed to: ${lastMute}`);
// check if the command is for the desired zone
            if (n2k.fields.Zone === desiredZone) {
// mute or unmute the specific sound card
                if (lastMute) {
                    exec(`amixer -c ${soundCardId} set PCM mute`, (error, stdout, stderr) => {
                        if (error) {
                            console.log(`error: ${error.message}`);
                            return;
                        }
                        if (stderr) {
                            console.log(`stderr: ${stderr}`);
                            return;
                        }
                        console.log(`stdout: ${stdout}`);
                    });
                } else {
                    exec(`amixer -c ${soundCardId} set PCM unmute`, (error, stdout, stderr) => {
                        if (error) {
                            console.log(`error: ${error.message}`);
                            return;
                        }
                        if (stderr) {
                            console.log(`stderr: ${stderr}`);
                            return;
                        }
                        console.log(`stdout: ${stdout}`)
                        ;
                    });
                }
            }
        }
    });

    app.on("nmea2000out", function (data) {
        if (data.pgn === PGN_SOURCE_COMMAND) {
            // check if the command is for the desired zone
            if (data.fields.Zone === desiredZone) {
                // change the audio source input
                exec(`amixer -c ${soundCardId} set '${data.fields.Source}'`, (error, stdout, stderr) => {
                    if (error) {
                        console.log(`error: ${error.message}`);
                        return;
                    }
                    if (stderr) {
                        console.log(`stderr: ${stderr}`);
                        return;
                    }
                    console.log(`stdout: ${stdout}`);
                });
            }
        }
    });
};