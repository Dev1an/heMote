const panaPtzCommands = [
    {commandResponse : 'axf', commandRegex : /(^axf)(.*)/gm, commandName : 'Focus Position' },
    {commandResponse : 'axz', commandRegex : /(^axz)(.*)/gm, commandName : 'Zoom Position' },
    {commandResponse : 'CGI_TIME:', commandRegex : /(^CGI_TIME):(.*)/gm, commandName : 'CGI send interval' },
    {commandResponse : 'd1', commandRegex : /(^d1)([01])/gm, commandName : 'Auto focus On/Off' },
//    {commandResponse : 'd2', commandRegex : /(^d\d)([01])/gm, commandName : '' },
    {commandResponse : 'd3', commandRegex : /(^d3)([01])/gm, commandName : 'Auto Iris On/Off' },
//    {commandResponse : 'd4', commandRegex : /(^d\d)([01])/gm, commandName : '' },
    {commandResponse : 'd6', commandRegex : /(^d6)([01])/gm, commandName : 'Day/Night' },
    {commandResponse : 'iNS', commandRegex : /(^iNS)([01])/gm, commandName : 'Installation position' },
    {commandResponse : 'lC', commandRegex : /(^lC)([1234])([01])/gm, commandName : 'Movement range limit On/Off' },
    {commandResponse : 'OAW:', commandRegex : /(^OAW):(.*)/gm, commandName : 'AWB (AWC) Mode' },
    {commandResponse : 'OBI:', commandRegex : /(^OBI):(.*)/gm, commandName : 'B gain' },
    {commandResponse : 'OBP:', commandRegex : /(^OBP):(.*)/gm, commandName : 'B pedestal' },
    {commandResponse : 'OBR:', commandRegex : /(^OBR):(.*)/gm, commandName : 'Color bar/Camera' },
    {commandResponse : 'ODT:', commandRegex : /(^ODT):(.*)/gm, commandName : 'Detail' },
    {commandResponse : 'OER:', commandRegex : /(^OER):(.*)/gm, commandName : 'Error Notice' },
    {commandResponse : 'OGU:', commandRegex : /(^OGU):(.*)/gm, commandName : 'Gain' },
    {commandResponse : 'OID:', commandRegex : /(^OID):(.*)/gm, commandName : 'Model number' },
    {commandResponse : 'ORI:', commandRegex : /(^ORI):(.*)/gm, commandName : 'R gain' },
    {commandResponse : 'ORP:', commandRegex : /(^ORP):(.*)/gm, commandName : 'R pedestal' },
    {commandResponse : 'OSA:30:', commandRegex : /(^OSA:30):(.*)/gm, commandName : 'Master Detail' },
    {commandResponse : 'OSA:87:', commandRegex : /(^OSA:87):(.*)/gm, commandName : 'Format' },
    {commandResponse : 'OSD:4F:', commandRegex : /(^OSD:4F):(.*)/gm, commandName : 'Iris volume' },
    {commandResponse : 'OSE:71:', commandRegex : /(^OSE:71):(.*)/gm, commandName : 'Preset playback range' },
    {commandResponse : 'OSF:', commandRegex : /(^OSF):(.*)/gm, commandName : 'Scene file' },
    {commandResponse : 'OSH:', commandRegex : /(^OSH):(.*)/gm, commandName : 'Shutter' },
    {commandResponse : 'OTP:', commandRegex : /(^OTP):(.*)/gm, commandName : 'Pedestal' },
    {commandResponse : 'OUS:', commandRegex : /(^OUS):(.*)/gm, commandName : 'Menu On/Off' },
    {commandResponse : 'p', commandRegex : /(^p)([01fn])/gm, commandName : 'Power On/Standby' },
    {commandResponse: 'pE0', commandRegex: /(^pE0)([012])([0-9a-fA-F]+)/gm, commandName: 'Preset Entry',
        updatePresets: function (set, hex) {
            // This function is used to convert a hex preset string to a JSON Object.
            var zeros = (set == 2) ? "00000000000000000000" : "0000000000000000000000000000000000000000";
            var newBinArr = parseInt(hex, 16).toString(2).split("").reverse().join("");
            newBinArr += zeros.slice(newBinArr.length);
            camera.information.presetsBin[set] = newBinArr;
            newBinArr = newBinArr.split("");
            for (var i = 0; i < newBinArr.length; i++) {
                var matches = 0;
                for (var j = 0; j < camera.information.presets.length; j++) {
                    if ((i + 40 * set) == camera.information.presets[j].number) {
                        if (newBinArr[i] == "0") { camera.information.presets.splice(j, 1); }
                        matches += 1;
                    }
                }
                if (matches == 0 && newBinArr[i] == "1") {
                    camera.information.presets.push({ number: i + 40 * set, name: "Naamloos", rank: 0 });
                }
            }
            camera.information.presets.sort(function (a, b) { return a.number + a.rank - b.number - b.rank });
            /*console.log(camera.information.presets);*/
        }
    },
    {commandResponse : 'rER', commandRegex : /(^rER)([0-9a-fA-F]+)/gm, commandName : 'Error information' },
    {commandResponse : 'rt', commandRegex : /(^rt)(.*)/gm, commandName : 'rt' },
    {commandResponse : 's', commandRegex : /(^s)(.*)/gm, commandName : 's' },
    {commandResponse : 'sWZ', commandRegex : /(^sWZ)(.*)/gm, commandName : 'Zoom position-linked pan/tilt speed adjustment On/Off' },
    {commandResponse : 'TITLE:', commandRegex : /(^TITLE):(.*)/gm, commandName : 'Camera name' },
    {commandResponse : 'uPVS', commandRegex : /(^uPVS)(.*)/gm, commandName : 'Preset Speed'},
]

exampleData = `p1
OID:AW-HE2
CGI_TIME:0
OSA:87:11
TITLE:dPro-AW-HE2
OAW:4
OBR:0
OUS:0
d30
s01
OSD:4F:7F
rt1
axz555
axf555
pE000000000007
pE010000000000
pE020000000000`

function parse (data) {
    const status = {};
    panaPtzCommands.forEach(command => {
        const matches = [...data.matchAll(command.commandRegex)]
        if (matches.length) status[command.commandName] = matches.map(match => [...match].slice(2))
    });
    return status;
}

console.log(parse(exampleData));