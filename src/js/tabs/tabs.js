var tabs = {
    defaults: {
        currentClass: 'current'
    },
    contents: [],   //所有容器
    init: function () {
        //找到所有容器
        $.each(tabs.el, function (i, item) {
            var id = $(item).attr('href');
            if (id) {
                tabs.contents.push(id);
            }
        });
    },
    change: function (clickObj) {
        var id = clickObj.attr('href');
        if (!id) {
            return;
        }
        tabs.el.removeClass(tabs.params.currentClass);
        $.each(tabs.contents, function (i, item) {
            if (id === item) {
                clickObj.addClass(tabs.params.currentClass);
                $(id).show();
            } else {
                $(item).hide();
            }
        });
    },
    tabs: function (el, params) {
        if (el.length <= 0) {
            return;
        }
        tabs.el = el;
        tabs.params = $.extend({}, tabs.defaults, params);

        tabs.init();

        el.on('click', function () {
            tabs.change($(this));
        });
    }
};

$.fn.extend({
    tabs: function (params) {
        tabs.tabs(this, params);
        return this;
    }
});

module.exports = tabs.tabs;
