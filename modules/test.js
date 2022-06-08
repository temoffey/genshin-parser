const { click, esc, drag, isColor: isColScreen, setDiff, shot } = require('./nut.js');
const { getImage, getBuffer, isColor: isColImage, saveImage } = require('./jimp.js');
const { parse, start, stop } = require('./tesseract.js');
const { log, shift, sleep } = require('./utils.js');
const { saveJSON } = require('./format.js');
const { focusPos } = require('./ffi.js');

const poss = require('../configs/positions.js');
const col = require('../configs/colors.js');
let pos;

let OLD = [ 0, 0 ];

async function go() {
	await focus('Genshin Impact');
	setInterval(mouse, 100);
}

async function focus(title) {
	log('go');
	log('focus', title);
	const rect = focusPos(title);
	await sleep(1000);
	setDiff(rect);
}

async function mouse() {
	let mouse = await getPos();
	if (OLD[0] === mouse[0] && OLD[1] === mouse[1]) return;
	OLD[0] = mouse[0];
	OLD[1] = mouse[1];
	log('mouse', mouse, await getColor(mouse));
}

go();
