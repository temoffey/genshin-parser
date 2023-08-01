const { click, esc, drag, isColor: isColScreen, setDiff, shot } = require('./nut.js');
const { getImage, getBuffer, isColor: isColImage, saveImage } = require('./jimp.js');
const { parse, start, stop } = require('./tesseract.js');
const { log, shift, sleep, getPos } = require('./utils.js');
const { formatCount, saveJSON } = require('./format.js');
const { focusPos } = require('./ffi.js');

const col = require('../configs/colors.js');
let pos;

async function go() {
	log('go');
	await start();
	await focus('Genshin Impact');
	await menu();
	let count = await arts();
	let data = await scan(0, 8);
	await saveJSON('arts', data);
	await stop();
	log('end');
};

async function focus(title) {
	log('focus', title);
	const rect = focusPos(title);
	pos = getPos(rect);
	await sleep(1000);
}

async function menu() {
	log('menu');
	let i = 5;
	while (!(await isColScreen(pos.menu, col.menu))) {
		if (i-- < 0) throw new Error('Не удалось открыть меню');
		await esc();
		await sleep(2000);
	}
}

async function arts() {
	await click(pos.menu.arts);
	await sleep(2000);
	await click(pos.arts.tab);
	await sleep(1000);
	let bitmap = await shot(pos.arts.count);
	let image = await getImage(bitmap);
	await saveImage(image, 'count', col.arts.count);
	let buffer = await getBuffer(image, col.arts.count);
	let result = await parse(buffer);
	let count = formatCount(result);
	if (!count) throw new Error('Не удалось прочитать количество Артефактов');
	log('arts', count);
	return count;
}

async function scan(start, count) {
	log('scan', start, count);
	let results = [];
	let scroll = 0;
	let step = pos.arts.rows - 1;
	for (let i = start; i < count; i++) {
		let x = i % pos.arts.cols;
		let y = Math.floor(i / pos.arts.columns);
		while (y - scroll >= pos.arts.rows) {
			await drag(
				shift(pos.arts, 1, 1),
				shift(pos.arts, 1, pos.arts.rows),
			);
			scroll += step;
			await sleep(200);
		}
		results.push(await scanOne(shift(pos.arts, x, y - scroll)));
	}
	return results;
}

async function scanOne(point) {
	log('scanOne', point);
	await click(point);
	await sleep(300);
	let result = {};
	let bitmap = await shot(pos.art.shot);
	let image = await getImage(bitmap);
	let fields = [ 'main', 'level', 'bottom' ];

	await saveImage(image, 'shot');

	result.stars = 0;
	while (await isColImage(image, shift(pos.art.stars, result.stars, 0), col.art.stars))
		result.stars++;

	result.lock = await isColImage(image, pos.art.lock, col.art.lock);

	let buffer = await getBuffer(image);
	for (let field in fields) {
		await saveImage(image, field, false, pos.art[field]);
		result[field] = await parse(buffer, pos.art[field]);
	}

	result.owner = '';
	if (await isColImage(image, pos.art.owner.check, col.art.owner)) {
		await saveImage(image, field, false, pos.art[field]);
		result.owner = await parse(buffer, pos.art.owner.name);
	}

	return result;
}

module.exports.go = go;
