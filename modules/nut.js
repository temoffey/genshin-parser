const { Button, Key, keyboard, mouse, screen, straightTo } = require('@nut-tree/nut-js');
const { diffColor, log, sleep } = require('./utils.js');

const DIFF = [ 0, 0 ];

mouse.config.autoDelayMs = 10;
mouse.config.mouseSpeed = 500;
keyboard.config.autoDelayMs = 10;
screen.config.highlightDurationMs = 1000;

function setDiff(point) {
	DIFF[0] = point[0];
	DIFF[1] = point[1];
}

async function setPos(point) {
	if (point)
		await mouse.setPosition({
			x: point[0] + DIFF[0],
			y: point[1] + DIFF[1],
		});
}

async function getPos() {
	const point = await mouse.getPosition();
	return [
		point.x - DIFF[0],
		point.y - DIFF[1],
	];
}

async function click(point) {
	log('click', point);
	await setPos(point);
	await mouse.leftClick();
}

async function drag(to, from) {
	log('drag', from, to);
	await setPos(from);
	await sleep(200);
	await mouse.pressButton(Button.LEFT);
	await sleep(100);
	await mouse.move(straightTo({
		x: to[0] + DIFF[0],
		y: to[1] + DIFF[1],
	}));
	await sleep(500);
	await mouse.releaseButton(Button.LEFT);
}

async function tap(key) {
	log('tap', key);
	switch (key) {
		case 'esc':
			await keyboard.type(Key.Escape);
			break;
		default:
			await keyboard.type(Key[key.toUpperCase()]);
	}
}

async function esc() {
	log('esc');
	await keyboard.type(Key.Escape);
}

async function getColor(point) {
	const color = await screen.colorAt({
		x: point[0] + DIFF[0],
		y: point[1] + DIFF[1],
	});
	return color.toHex().substr(0, 7);
}

async function isColor(point, color, diff) {
	let pixel = await getColor(point);
	log('isColor', point, color, pixel);
	return diffColor(pixel, color, diff);
}

async function shot(rect) {
	log('shot', rect);
	const image = await screen.grabRegion({
		left: rect[0] + DIFF[0],
		top: rect[1] + DIFF[1],
		width: rect[2],
		height: rect[3],
	});
	return image.toRGB();
}

async function view(rect) {
	log('view', rect);
	await screen.highlight({
		left: rect[0] + DIFF[0],
		top: rect[1] + DIFF[1],
		width: rect[2],
		height: rect[3],
	});
}

module.exports.click = click;
module.exports.drag = drag;
module.exports.esc = esc;
module.exports.getColor = getColor;
module.exports.getPos = getPos;
module.exports.isColor = isColor;
module.exports.setDiff = setDiff;
module.exports.setPos = setPos;
module.exports.shot = shot;
module.exports.tap = tap;
module.exports.view = view;
