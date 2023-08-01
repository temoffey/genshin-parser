const { Button, Key, keyboard, mouse, screen, straightTo } = require('@nut-tree/nut-js');
const { diffColor, log, sleep } = require('./utils.js');

mouse.config.autoDelayMs = 10;
mouse.config.mouseSpeed = 500;
keyboard.config.autoDelayMs = 10;
screen.config.highlightDurationMs = 1000;

function calcPoint(point) {
	return {
		x: point[0],
		y: point[1],
	};
}

function calcRect(rect) {
	return {
		left: rect[0],
		top: rect[1],
		width: rect[2],
		height: rect[3],
	};
}

async function setPos(point) {
	if (point)
		await mouse.setPosition(calcPoint(point));
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
	await mouse.move(straightTo(calcPoint(to)));
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
	const color = await screen.colorAt(calcPoint(point));
	return color.toHex().substr(0, 7);
}

async function isColor(point, color, diff) {
	let pixel = await getColor(point);
	log('isColor', point, color, pixel);
	return diffColor(pixel, color, diff);
}

async function shot(rect) {
	log('shot', rect);
	const image = await screen.grabRegion(calcRect(rect));
	return image.toRGB();
}

async function view(rect) {
	log('view', rect);
	await screen.highlight(calcRect(rect));
}

module.exports.click = click;
module.exports.drag = drag;
module.exports.esc = esc;
module.exports.getColor = getColor;
module.exports.isColor = isColor;
module.exports.setPos = setPos;
module.exports.shot = shot;
module.exports.tap = tap;
module.exports.view = view;
