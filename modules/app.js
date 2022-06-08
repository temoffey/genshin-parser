const { click, esc, drag, isColor: isColScreen, setDiff, shot } = require('./nut.js');
const { getImage, getBuffer, isColor: isColImage, saveImage } = require('./jimp.js');
const { parse, start, stop } = require('./tesseract.js');
const { log, shift, sleep } = require('./utils.js');
const { saveJSON } = require('./format.js');
const { focusPos } = require('./ffi.js');

const poss = require('../configs/positions.js');
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
	await sleep(1000);
	setDiff(rect);
	let resolution = rect[2] + 'x' + rect[3];
	if (!poss[resolution])throw new Error('Установлено недопустимое разрешение "' + resolution + '". ' +
		'Допустимые разрешения: ' + Object.keys(poss).join(', '));
	pos = poss[resolution];
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
	await click(pos.arts.menu);
	await sleep(2000);
	await click(pos.arts.tab);
	await sleep(1000);
	let bitmap = await shot(pos.arts.count);
	let image = await getImage(bitmap);
	await saveImage(image, 'count', col.arts.count);
	let buffer = await getBuffer(image, col.arts.count);
	let result = await parse(buffer);
	let count = parseInt(result);
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
		let x = i % pos.arts.columns;
		let y = Math.floor(i / pos.arts.columns);
		while (y - scroll >= pos.arts.rows) {
			await drag(
				shift(pos.arts.first, pos.arts.shift, [ 0, pos.arts.rows - 1 - step ]),
				shift(pos.arts.first, pos.arts.shift, [ 0, pos.arts.rows - 1 ]),
			);
			scroll += step;
			await sleep(200);
		}
		results.push(await scanOne(shift(pos.arts.first, pos.arts.shift, [ x, y - scroll ])));
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

	await saveImage(image, 'shot');
	for (let key in pos.art.parse)
		await saveImage(image, key, col.art.parse[key], pos.art.parse[key]);

	result.stars = 0;
	for (let i = 0; i < pos.art.stars.columns; i++)
		if (await isColImage(image, shift(pos.art.stars.first, pos.art.stars.shift, i), col.art.stars))
			result.stars++;

	result.lock = await isColImage(image, pos.art.lock, col.art.lock);

	result.stats = 0;
	for (let i = 0; i < pos.art.stats.rows; i++)
		if (await isColImage(image, shift(pos.art.stats.first, pos.art.stats.shift, i), col.art.stats))
			result.stats++;

	let buffer = await getBuffer(image);
	for (let key in pos.art.parse)
		if (!col.art.parse[key])
			result[key] = await parse(buffer, pos.art.parse[key]);

	if (result.stats) {
		await saveImage(image, 'stats', false, shift(pos.art.bottom.first, pos.art.bottom.shift, result.stats));
		result.bottom = await parse(buffer, shift(pos.art.bottom.first, pos.art.bottom.shift, result.stats));
	}

	await saveImage(image, 'set', false, shift(pos.art.set.first, pos.art.set.shift, result.stats));
	result.set = await parse(buffer, shift(pos.art.set.first, pos.art.set.shift, result.stats));

	buffer = await getBuffer(image, true);
	for (let key in pos.art.parse)
		if (col.art.parse[key])
			result[key] = await parse(buffer, pos.art.parse[key]);

	return result;
}

module.exports.go = go;
