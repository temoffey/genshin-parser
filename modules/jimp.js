const jimp = require('jimp');
const { diffColor, now, log } = require('./utils.js');

async function getImage(bitmap, copy) {
	if (bitmap instanceof jimp) {
		if (copy) return await jimp.create(bitmap);
		return bitmap;
	}
	const image = await jimp.create(bitmap.width, bitmap.height);
	image.bitmap.data = bitmap.data;
	return image;
}

async function getColor(bitmap, point) {
	let image = await getImage(bitmap);
	const color = image.getPixelColor(point[0], point[1]);
	return '#' + color.toString(16).substr(0, 6);
}

async function isColor(bitmap, point, color, diff) {
	let image = await getImage(bitmap);
	let pixel = await getColor(image, point);
	log('isColor', point, color, pixel);
	return diffColor(pixel, color, diff);
}

async function saveImage(bitmap, file, invert, rect) {
	let image = await getImage(bitmap, invert || rect);
	if (invert) image.invert();
	if (rect) image.crop(rect[0], rect[1], rect[2], rect[3]);
	await image.write('./shots/' + file + now() + '.png');
}

async function getBuffer(bitmap, invert, rect) {
	let image = await getImage(bitmap, invert || rect);
	if (invert) image.invert();
	if (rect) image.crop(rect[0], rect[1], rect[2], rect[3]);
	return await image.getBufferAsync(jimp.MIME_PNG);
}

module.exports.isColor = isColor;
module.exports.getImage = getImage;
module.exports.getColor = getColor;
module.exports.saveImage = saveImage;
module.exports.getBuffer = getBuffer;
