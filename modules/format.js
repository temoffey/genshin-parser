const { homedir } = require('os');
const { writeFile } = require('fs').promises;
const { now } = require('./utils.js');

function formatCount(str) {
	let matches = str.match(/(\d+)\/\d+/);
	return matches ? parseInt(matches[1]) : 0;
}

function format(arr) {
	return arr.map(formatOne);
}

function formatOne(obj) {
	return {
		name: formatString(obj.name),
		type: formatString(obj.type),
		set: formatString(obj.set),
		stars: obj.stars,
		level: formatNumber(obj.level),
		lock: obj.lock,
		stats: obj.stats,
		states: formatStates(obj.main, obj.state, obj.bottom),
	}
}

function isPersent(str) {
	return /%/.test(str);
}

function formatNumber(str) {
	return parseFloat(str.trim().replace(',', '.'));
}

function formatString(str) {
	return str.replace('\n', ' ').replace(':', '').trim();
}

function formatStates(main, state, bottom) {
	bottom = bottom || '';
	stats = bottom.split('\n').map(str => str.trim()).filter(str => str);
	stats.unshift(main + ' +' + state);
	return stats.map(formatState);
}

function formatState(str) {
	let i = str.indexOf('+');
	return {
		name: formatString(str.substr(0, i)),
		value: formatNumber(str.substr(i)),
		persent: isPersent(str.substr(i)),
	};
}

function prettyJSON(data) {
	return JSON.stringify(data, null, 4);
}

function saveJSON(file, data) {
	let json = prettyJSON(format(data));
	writeFile('./logs/' + file + now() + '.json', json);
	return writeFile(homedir() + '/Desktop/' + file + '.json', json);
}

module.exports.formatCount = formatCount;
module.exports.saveJSON = saveJSON;
