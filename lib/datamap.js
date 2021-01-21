const format = {
    '01': '720/59.94p',
    '02': '720/50p',
    '04': '1080/59.94i',
    '05': '1080/50i',
    '07': '1080/29.97psF',
    '08': '1080/25psF',
    '0A': '1080/23.98psF',
    '10': '1080/59.94p',
    '11': '1080/50p',
    '14': '1080/29.97p',
    '15': '1080/25p',
    '16': '1080/23.98p',
    '17': '2160/29.97p',
    '18': '2160/25p',
    '19': '2160/59.94p',
    '1A': '2160/50p',
    '1B': '2160/23.98p',
    '21': '2160/24p',
    '22': '1080/24p',
    '23': '1080/23.98p'
}
exports.format = format

const installation = {
    0: 'Desktop',
    1: 'Hanging'
}
exports.installation = installation

const powerOn = {
    0: false,
    'f': false,
    1: true,
    'n': true
}
exports.powerOn = powerOn