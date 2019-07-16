$.extend({
    ezaConfig: {
        debug: true
    }
});

global.eza = {};

eza.log = require('./log/log');
eza.renderHeight = require('./admin/renderHeight');
eza.tabs = require('./tabs/tabs');
eza.subNav = require('./admin/subNav');
eza.iframeTabs = require('./admin/iframeTabs');
