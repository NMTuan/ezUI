var log = {
    log: function () {
        if ($.ezaConfig && $.ezaConfig.debug) {
            console.log.apply(this, arguments);
        }
    }
};

$.extend({
    log: function () {
        log.log.apply(this, arguments);
    }
});

module.exports = log.log;
