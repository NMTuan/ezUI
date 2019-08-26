var random = function (min, max) {
    min = min || 0;
    max = max || 0;
    var diff = max - min;
    return Math.round(Math.random() * diff + min);
};

module.exports = random;
