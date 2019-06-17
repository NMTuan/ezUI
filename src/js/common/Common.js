class Common {
    log() {
        console.log.apply(this, arguments);
    };
}

module.exports = Common;
