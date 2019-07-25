var mousewheel = require('jquery-mousewheel')($);   //鼠标滚轮

var scrollWheel = {
    scrollWheel: function (el, params) {
        $(el).on('mousewheel', function (e) {
            $.log(e.deltaY);
            if (e.deltaY > 0) {
                var step = $(el).scrollTop() - 200;

            } else {
                var step = $(el).scrollTop() + 200;
            }
            $(el).stop(true).animate({
                scrollTop: step
            }, 100)
        });
    }
};

$.fn.extend({
    scrollWheel: function (params) {
        scrollWheel.scrollWheel(this, params);
        return this;
    }
});

module.exports = scrollWheel.scrollWheel;
