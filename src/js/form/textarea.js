var textarea = {
    defaults: {
        max: 0, //限制长度
        rule: function (str) {  //长度计算规则, 默认是清除两头空格, 可以自定义清除所有空白? 等等
            return $.trim(str);
        }
    },
    textarea: function (els, params) {
        $.each(els, function () {
            new textarea.Textarea($(this), params);
        });
    },
    Textarea: function (el, params) {
        var s = this;
        s.el = $(el);
        s.el.addClass('ez-form-textarea');
        s.params = $.extend(true, {}, textarea.defaults, params);

        if (s.params.max > 0) {
            s.el.addClass('ez-form-textarea_counter');
            textarea.renderCounter.call(s);
            textarea.counterPosition.call(s);
        }
        textarea.events.call(s);
    },
    events: function () {
        var s = this;
        if (s.params.max > 0) {
            s.el.on('keyup', function () {
                textarea.renderCounter.call(s);
                textarea.counterPosition.call(s);
            });
            $(window).on('resize', function () {
                textarea.counterPosition.call(s);
            });
        }
    },
    //渲染计数器
    renderCounter: function () {
        var s = this;
        if (typeof s.counter === 'undefined') {
            textarea.initCounter.call(s);
        }
        var max = s.params.max;
        // var total = $.trim(s.el.val()).length;
        var val = s.params.rule(s.el.val());
        var total = val.length;
        if (total > max) {    //超出, 截断
            s.el.val(s.el.val().substring(0, s.params.max));
            total = $.trim(s.el.val()).length;
        }
        s.counter.html(total + ' / ' + max);
    },
    counterPosition: function () {
        var s = this;
        var prevs = s.el.prevAll();
        var width = 0;
        var content = s.el.closest('.ez-form-content');
        $.each(prevs, function () {
            width += $(this).outerWidth();
        });
        s.el.css({
            marginBottom: s.el.css('lineHeight'),
        });
        s.counter.css({
            lineHeight: s.el.css('lineHeight'),
            left: s.el.outerWidth() + width - s.counter.outerWidth() - parseFloat(content.css('paddingLeft')),
            top: s.el.outerHeight() + parseFloat(content.css('paddingTop'))// - s.counter.outerHeight()
        });

    },
    initCounter: function () {
        var s = this;
        s.counter = $('<div>').addClass('ez-form-textarea-counter');
        s.el.after(s.counter);
    }

};

$.fn.extend({
    ez_form_textarea: function (params) {
        textarea.textarea($(this), params);
        return this;
    }
});

module.exports = new textarea.Textarea;
