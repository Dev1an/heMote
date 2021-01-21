const data = require('./datamap')
const fs = require('fs')

const panaPtzCommands = [
    { commandResponse: 'axf', commandRegex: /(^axf)(.*)/gm, commandName: 'Focus Position',
        convert: function (command) {
            return (parseInt(command,16) - parseInt('555',16))/parseInt('AAA',16)
        }
    },
    { commandResponse: 'axz', commandRegex: /(^axz)(.*)/gm, commandName: 'Zoom Position',
        convert: function (command) {
            return (parseInt(command,16) - parseInt('555',16))/parseInt('AAA',16)
        }
    },
    { commandResponse: 'CGI_TIME:', commandRegex: /(^CGI_TIME):(.*)/gm, commandName: 'CGI send interval' },
    { commandResponse: 'd1', commandRegex: /(^d1)([01])/gm, commandName: 'Auto focus On/Off' },
    { commandResponse: 'd3', commandRegex: /(^d3)([01])/gm, commandName: 'Auto Iris On/Off' },
    { commandResponse: 'd6', commandRegex: /(^d6)([01])/gm, commandName: 'Day/Night' },
    {
        commandResponse: 'iNS', commandRegex: /(^iNS)([01])/gm, commandName: 'Installation position',
        convert: function (command) {
            return data.installation[command]
        }
    },
    { commandResponse: 'lC', commandRegex: /(^lC)([1234])([01])/gm, commandName: 'Movement range limit On/Off' },
    { commandResponse: 'OAW:', commandRegex: /(^OAW):(.*)/gm, commandName: 'AWB (AWC) Mode' },
    { commandResponse: 'OBI:', commandRegex: /(^OBI):(.*)/gm, commandName: 'B gain' },
    { commandResponse: 'OBP:', commandRegex: /(^OBP):(.*)/gm, commandName: 'B pedestal' },
    { commandResponse: 'OBR:', commandRegex: /(^OBR):(.*)/gm, commandName: 'Color bar/Camera' },
    { commandResponse: 'ODT:', commandRegex: /(^ODT):(.*)/gm, commandName: 'Detail' },
    { commandResponse: 'OER:', commandRegex: /(^OER):(.*)/gm, commandName: 'Error Notice' },
    { commandResponse: 'OGU:', commandRegex: /(^OGU):(.*)/gm, commandName: 'Gain' ,
        convert: function (command) {
            if (command.indexOf('0x') == 0) command = command.slice(2)
            return parseInt(command,16) - 8
        }
    },
    { commandResponse: 'OID:', commandRegex: /(^OID):(.*)/gm, commandName: 'Model number' },
    { commandResponse: 'ORI:', commandRegex: /(^ORI):(.*)/gm, commandName: 'R gain' },
    { commandResponse: 'ORP:', commandRegex: /(^ORP):(.*)/gm, commandName: 'R pedestal' },
    { commandResponse: 'OSA:30:', commandRegex: /(^OSA:30):(.*)/gm, commandName: 'Master Detail' },
    { commandResponse: 'OSA:87:', commandRegex: /(^OSA:87):(.*)/gm, commandName: 'Format',
        convert: function (command) {
            if (command.indexOf('0x') == 0) command = command.slice(2)
            return data.format[command]
        }
    },
    { commandResponse: 'OSD:4F:', commandRegex: /(^OSD:4F):(.*)/gm, commandName: 'Iris volume' },
    { commandResponse: 'OSE:71:', commandRegex: /(^OSE:71):(.*)/gm, commandName: 'Preset playback range' },
    { commandResponse: 'OSF:', commandRegex: /(^OSF):(.*)/gm, commandName: 'Scene file' },
    { commandResponse: 'OSH:', commandRegex: /(^OSH):(.*)/gm, commandName: 'Shutter' },
    { commandResponse: 'OTP:', commandRegex: /(^OTP):(.*)/gm, commandName: 'Pedestal' },
    { commandResponse: 'OUS:', commandRegex: /(^OUS):(.*)/gm, commandName: 'Menu On/Off' },
    { commandResponse: 'p', commandRegex: /(^p)([01fn])/gm, commandName: 'Power On',
        convert: function (command) {
            return data.powerOn[command]
        }
    },
    {
        commandResponse: 'pE0', commandRegex: /(^pE0)([012])([0-9a-fA-F]+)/gm, commandName: 'Preset Entry',
        convert: function (set, hex) {
            var camInfo = { presets: [], presetsBin: ["", "", ""] };
            // This function is used to convert a hex preset string to a JSON Object.
            var zeros = (set == 2) ? "00000000000000000000" : "0000000000000000000000000000000000000000";
            var newBinArr = parseInt(hex, 16).toString(2).split("").reverse().join("");
            newBinArr += zeros.slice(newBinArr.length);
            camInfo.presetsBin[set] = newBinArr;
            newBinArr = newBinArr.split("");
            for (var i = 0; i < newBinArr.length; i++) {
                var matches = 0;
                for (var j = 0; j < camInfo.presets.length; j++) {
                    if ((i + 40 * set) == camInfo.presets[j].number) {
                        if (newBinArr[i] == "0") { camInfo.presets.splice(j, 1); } // remove element from array
                        matches += 1;
                    }
                }
                if (matches == 0 && newBinArr[i] == "1") {
                    camInfo.presets.push({ number: i + 40 * set, name: `Preset ${i + 40 * set + 1}`, rank: 0 });
                }
            }
            camInfo.presets.sort(function (a, b) { return a.number + a.rank - b.number - b.rank });
            /*console.log(camInfo.presets);*/
            return camInfo.presets
        }
    },
    { commandResponse: 'rER', commandRegex: /(^rER)([0-9a-fA-F]+)/gm, commandName: 'Error information' },
    { commandResponse: 'rt', commandRegex: /(^rt)(.*)/gm, commandName: 'rt' },
    { commandResponse: 's', commandRegex: /(^s)(.*)/gm, commandName: 's' },
    { commandResponse: 'sWZ', commandRegex: /(^sWZ)(.*)/gm, commandName: 'Zoom position-linked pan/tilt speed adjustment On/Off' },
    { commandResponse: 'TITLE:', commandRegex: /(^TITLE):(.*)/gm, commandName: 'Camera name' },
    { commandResponse: 'uPVS', commandRegex: /(^uPVS)(.*)/gm, commandName: 'Preset Speed' },
]

var exampleData = fs.readFileSync('../examples/data/camdataHE130_121.txt', 'utf8')

function parse(data) {
    const status = {};
    panaPtzCommands.forEach(command => {
        const matches = [...data.matchAll(command.commandRegex)]
        if (matches.length) {
            const rawStatus = matches.map(match => [...match].slice(2))
            if (command.convert) {
                var result = []
                rawStatus.forEach(element => {
                    call = command.convert(...element)
                    result = result.concat(call)
                })
                status[command.commandName] = result
            } else status[command.commandName] = rawStatus
        }
    });
    return status;
}
exports.parse = parse
console.log(parse(exampleData));