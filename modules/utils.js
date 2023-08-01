const { compare } = require('color-difference');

const positions = require('../configs/positions.js');

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

function shift(obj, x, y) {
    return [
        obj.first[0] + Math.round(obj.shift[0] * x),
        obj.first[1] + Math.round(obj.shift[0] * y),
    ];
}

function diffColor(pixel, color, diff) {
    return compare(pixel, color) < (diff || 5);
}

function calcPosRect(arr, rect, diff) {
    arr[0] = rect[0] * diff + Math.round(rect[2] * arr[0]);
    arr[1] = rect[1] * diff + Math.round(rect[3] * arr[1]);
    if (arr[2] && arr[3]) {
        arr[2] = Math.round(rect[2] * arr[2]);
        arr[3] = Math.round(rect[3] * arr[3]);
    }
    return arr;
}

function calcPosShift(obj) {
    return [
        (pos[frame][field].last[0] - pos[frame][field].first[0]) / (pos[frame][field].cols - 1),
        (pos[frame][field].last[1] - pos[frame][field].first[1]) / (pos[frame][field].rows - 1),
    ]; 
}

function calcPos(pos, rect) {
    for (let frame in pos) {
        let diff = frame != 'art';
        for (let field in pos[frame]) {
            if (Array.isArray(pos[frame][field])) {
                pos[frame][field] = calcPosRect(pos[frame][field], rect, diff);
            } else {
                for (let key in pos[frame][field]) {
                    if (Array.isArray(pos[frame][field][key])) {
                        pos[frame][field][key] = calcPosRect(pos[frame][field][key], rect, diff);
                    }
                }
                if (pos[frame][field].first && pos[frame][field].last && pos[frame][field].cols && pos[frame][field].rows) {
                    pos[frame][field].shift = calcPosShift(pos[frame][field]);
                }
            }
        }
    }
    return pos;
}

function getPos(rect) {
    let resolution = rect[2] + 'x' + rect[3];
    let aspectratio = Math.round(100 * rect[2] / rect[3]) / 100;
    if (!positions[aspectratio]) throw new Error('Установлено недопустимое разрешение "' + resolution + '".');
    return calcPos(positions[aspectratio], rect);
}

module.exports.diffColor = diffColor;
module.exports.log = log;
module.exports.now = now;
module.exports.shift = shift;
module.exports.sleep = sleep;
module.exports.getPos = getPos;
