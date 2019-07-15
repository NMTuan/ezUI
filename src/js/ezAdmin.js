$.extend({
    ezaConfig: {
        debug: false
    }
});

global.eza = {};

eza.log = require('./log/log');
eza.renderHeight = require('./admin/renderHeight');
eza.tabs = require('./tabs/tabs');
eza.iframeTabs = require('./admin/iframeTabs');
