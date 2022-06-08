const tesseract = require('tesseract.js');
const { log } = require('./utils.js');

let worker;

async function parse(buffer, rect) {
	log('parse', rect);
	let options = {};
	if (rect) options.rectangle = {
		left: rect[0],
		top: rect[1],
		width: rect[2],
		height: rect[3],
	}
	const result = await worker.recognize(buffer, options);
	return result.data.text;
}

async function start() {
	worker = tesseract.createWorker({ cachePath: './traineddata' });
	await worker.load();
	await worker.loadLanguage('rus+eng');
	await worker.initialize('rus+eng');
}
async function stop() {
	await worker.terminate();
}

module.exports.parse = parse;
module.exports.start = start;
module.exports.stop = stop;
