var panaPtzCommands = [
    {commandResponse : 'axf', commandRegex : /(^ax\w)(.*)/, commandName : 'Focus Position' },
    {commandResponse : 'axz', commandRegex : /(^ax\w)(.*)/, commandName : 'Zoom Position' },
    {commandResponse : 'CGI_TIME:', commandRegex : /(^.+):(.*)/, commandName : 'CGI send interval' },
    {commandResponse : 'd1', commandRegex : /(^d\d)([01])/, commandName : 'Auto focus On/Off' },
    {commandResponse : 'd2', commandRegex : /(^d\d)([01])/, commandName : '' },
    {commandResponse : 'd3', commandRegex : /(^d\d)([01])/, commandName : 'Auto Iris On/Off' },
    {commandResponse : 'd4', commandRegex : /(^d\d)([01])/, commandName : '' },
    {commandResponse : 'd6', commandRegex : /(^d\d)([01])/, commandName : 'Option SW' },
    {commandResponse : 'iNS', commandRegex : /(^iNS)([01])/, commandName : 'Installation position' },
    {commandResponse : 'lC1', commandRegex : /(^lC\d)([01])/, commandName : 'Movement range limit On/Off up' },
    {commandResponse : 'lC2', commandRegex : /(^lC\d)([01])/, commandName : 'Movement range limit On/Off down' },
    {commandResponse : 'lC3', commandRegex : /(^lC\d)([01])/, commandName : 'Movement range limit On/Off left' },
    {commandResponse : 'lC4', commandRegex : /(^lC\d)([01])/, commandName : 'Movement range limit On/Off right' },
    {commandResponse : 'OAW:', commandRegex : /(^.+):(.*)/, commandName : 'AWB (AWC) Mode' },
    {commandResponse : 'OBI:', commandRegex : /(^.+):(.*)/, commandName : 'B gain' },
    {commandResponse : 'OBP:', commandRegex : /(^.+):(.*)/, commandName : 'B pedestal' },
    {commandResponse : 'OBR:', commandRegex : /(^.+):(.*)/, commandName : 'Color bar/Camera' },
    {commandResponse : 'ODT:', commandRegex : /(^.+):(.*)/, commandName : 'Detail' },
    {commandResponse : 'OER:', commandRegex : /(^.+):(.*)/, commandName : 'Error Notice' },
    {commandResponse : 'OGU:', commandRegex : /(^.+):(.*)/, commandName : 'Gain' },
    {commandResponse : 'OID:', commandRegex : /(^.+):(.*)/, commandName : 'Model number' },
    {commandResponse : 'ORI:', commandRegex : /(^.+):(.*)/, commandName : 'R gain' },
    {commandResponse : 'ORP:', commandRegex : /(^.+):(.*)/, commandName : 'R pedestal' },
    {commandResponse : 'OSA:30:', commandRegex : /(^.+):(.*)/, commandName : 'Master Detail' },
    {commandResponse : 'OSA:87:', commandRegex : /(^.+):(.*)/, commandName : 'Format' },
    {commandResponse : 'OSD:4F:', commandRegex : /(^.+):(.*)/, commandName : 'Iris volume' },
    {commandResponse : 'OSE:71:', commandRegex : /(^.+):(.*)/, commandName : 'Preset playback range' },
    {commandResponse : 'OSF:', commandRegex : /(^.+):(.*)/, commandName : 'Scene file' },
    {commandResponse : 'OSH:', commandRegex : /(^.+):(.*)/, commandName : 'Shutter' },
    {commandResponse : 'OTP:', commandRegex : /(^.+):(.*)/, commandName : 'Pedestal' },
    {commandResponse : 'OUS:', commandRegex : /(^.+):(.*)/, commandName : '' },
    {commandResponse : 'p', commandRegex : /(^p)([01fn])/, commandName : 'Power On/ Standby' },
    {commandResponse: 'pE0',
        commandRegex: /(^pE0)([012])([0-9a-fA-F]+)/,
        commandName: 'Preset Entry',
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
    {commandResponse : 'rER', commandRegex : /(^rER)([0-9a-fA-F]+)/, commandName : 'Error information' },
    {commandResponse : 'rt', commandRegex : /(^rt)(.*)/, commandName : '' },
    {commandResponse : 's', commandRegex : /(^s)(.*)/, commandName : '' },
    {commandResponse : 'sWZ', commandRegex : /(^sWZ)(.*)/, commandName : 'Zoom position-linked pan/tilt speed adjustment On/Off' },
    {commandResponse : 'TITLE:', commandRegex : /(^.+):(.*)/, commandName : 'Camera name' },
    {commandResponse : 'uPVS', commandRegex : /(^uPVS)(.*)/, commandName : 'Preset Speed'},
]