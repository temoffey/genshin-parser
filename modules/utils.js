const { compare } = require('color-difference');

const START = new Date().getTime();

function time() {
    return (new Date().getTime() - START) / 1000;
}

function log(key, ...args) {
    return console.log(time(), key, ...args);
}

function now() {
    let now = new Date();
    return '.' + [
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
        now.getSeconds()
    ].map(item => item < 10 ? '0' + item : item).join('-');
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function shift(rect, shift, diff) {
    if (typeof diff === 'number') diff = [ diff, diff, diff, diff ];
    if (typeof rect[2] === 'number' && typeof rect[3] === 'number') {
        return [
            rect[0] + Math.round(shift[0] * diff[0]),
            rect[1] + Math.round(shift[1] * diff[1]),
            rect[2] + Math.round(shift[2] * diff[2]),
            rect[3] + Math.round(shift[3] * diff[3]),
        ];
    } else {
        return [
            rect[0] + Math.round(shift[0] * diff[0]),
            rect[1] + Math.round(shift[1] * diff[1]),
        ];
    }
}

function diffColor(pixel, color, diff) {
    return compare(pixel, color) < (diff || 5);
}

module.exports.diffColor = diffColor;
module.exports.log = log;
module.exports.now = now;
module.exports.shift = shift;
module.exports.sleep = sleep;
