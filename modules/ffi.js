const ffi = require('ffi-napi');

const user32 = new ffi.Library('user32', {
    'FindWindowA': ['long', ['string', 'string']],
    'GetClientRect': ['bool', ['int', 'pointer']],
    'GetWindowRect': ['bool', ['int', 'pointer']],
    'GetSystemMetrics': ['int', ['int']],
    'SetForegroundWindow': ['bool', ['long']],
    'SetWindowPos': ['bool', ['long', 'long', 'int', 'int', 'int', 'int', 'uint']],
    'ShowWindow': ['bool', ['long', 'int']],
});

function focusPos(title, point) {
	const HWND = getHWND(title);
	if (!HWND) throw new Error('Удалось найти окна с заголовком "' + title + '"');
	setFocus(HWND);
	setPos(HWND, point);
	return getPos(HWND);
}

function getHWND(title) {
	return user32.FindWindowA(null, title);
}

function setFocus(HWND) {
	user32.ShowWindow(HWND, 9);
	user32.SetForegroundWindow(HWND);
}

function setPos(HWND, point) {
	if (point)
		user32.SetWindowPos(winToSetOnTop, 0, point[0], point[1], 0, 0, 1);
}

function getPos(HWND) {
	const rect = getRect(HWND, 'Window');
	const client = getRect(HWND, 'Client');
	const border = (rect[2] - client[2]) / 2;
	const header = rect[3] - client[3] - border;
	return [
		rect[0] + border,
		rect[1] + header,
		client[2],
		client[3],
	];
}

function getRect(HWND, type) {
	const pointer = Buffer.alloc(16)
	const getWindowRect = user32['Get' + type + 'Rect'](HWND, pointer);
	return [
		pointer.readInt16LE(0),
		pointer.readInt16LE(4),
		pointer.readInt16LE(8) - pointer.readInt16LE(0),
		pointer.readInt16LE(12) - pointer.readInt16LE(4),
	];
}

module.exports.focusPos = focusPos;
