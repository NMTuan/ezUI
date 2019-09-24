var fixedContainer = {
    defaults: {
        leftClass: '.ez-sidebar-left',
        rightClass: '.ez-sidebar-right',
        // topClass: '.sidebar-top',
        // bottomClass: '.sidebar-bottom'
    },
    params: null,
    fixedContainer: function (el, params) {
        fixedContainer.params = $.extend(true, fixedContainer.defaults, params);
        var left = el.siblings(fixedContainer.params.leftClass);
        var right = el.siblings(fixedContainer.params.rightClass);
        // var top = el.siblings(fixedContainer.params.topClass);
        // var bottom = el.siblings(fixedContainer.params.bottomClass);

        var leftWidth = left.outerWidth() || 0;
        var rightWidth = right.outerWidth() || 0;
        // var topHeight = top.outerHeight() || 0;
        // var bottomHeight = bottom.outerHeight() || 0;

        el.css({
            // marginTop: topHeight,
            marginRight: rightWidth,
            // marginBottom: bottomHeight,
            marginLeft: leftWidth,
        });
    }
};

$.fn.extend({
    fixedContainer: function (params) {
        fixedContainer.fixedContainer(this, params);
        return this;
    }
});

module.exports = fixedContainer.fixedContainer;
