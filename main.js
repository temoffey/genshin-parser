const { openWindow, addHandlers } = require('./modules/electron.js');
const handlers = require('./modules/app.js');

openWindow('Genshin Parser');
addHandlers(handlers);
