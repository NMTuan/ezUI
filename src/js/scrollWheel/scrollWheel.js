var mousewheel = require('jquery-mousewheel')($);   //鼠标滚轮

var scrollWheel = {
    scrollWheel: function (el, params) {
        // var lock = false;
        $(el).on('mousewheel', function (e) {
            e.preventDefault();
            e.stopPropagation();
            // if(lock){
            //     return;
            // }
            // lock = true;
            if (e.deltaY > 0) {
                var step = $(el).scrollTop() - 100;

            } else {
                var step = $(el).scrollTop() + 100;
            }
            $(el).stop(false, true).animate({
                scrollTop: step
            }, 200, function () {
                // lock = false;
            });
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
