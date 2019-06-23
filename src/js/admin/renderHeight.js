var renderHeight = {
    defaults: {
        correct: 0,   //修正高度
    },
    render: function () {
        var winHeight = $(window).height();
        $.each(renderHeight.el, function () {  //涉及到el，都要循环，兼容jquery
            var height = winHeight - $(this).offset().top + renderHeight.params.correct;
            $(this).height(height);
        });
    },
    renderHeight: function (el, params) {
        if (el.length <= 0) {
            return;
        }
        renderHeight.el = el;
        renderHeight.params = $.extend({}, renderHeight.defaults, params);

        renderHeight.render();
        $(window).on('resize', function () {
            renderHeight.render();
        });
    }
};

$.fn.renderHeight = function (params) {
    renderHeight.renderHeight(this, params);
    return this;
};

module.exports = renderHeight.renderHeight;

