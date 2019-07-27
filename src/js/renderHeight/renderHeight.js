var renderHeight = {
    defaults: {
        correct: 0,   //修正高度
    },
    render: function (el) {
        var winHeight = $(window).height();
        $.each(el, function () {  //涉及到el，都要循环，兼容jquery
            if($(this).is(':hidden')){  //隐藏元素，无需处理
                return;
            }
            var height = winHeight - $(this).offset().top + renderHeight.params.correct;
            $(this).height(height);
        });
    },
    renderHeight: function (el, params) {
        if (el.length <= 0) {
            return;
        }
        if(el.data('renderHeight')){    //防止重复执行。
            renderHeight.render(el);
            return;
        }
        el.data('renderHeight', 'true');
        renderHeight.params = $.extend({}, renderHeight.defaults, params);

        renderHeight.render(el);
        $(window).on('resize', function () {
            renderHeight.render(el);
        });
    }
};

$.fn.renderHeight = function (params) {
    renderHeight.renderHeight(this, params);
    return this;
};

module.exports = renderHeight.renderHeight;

