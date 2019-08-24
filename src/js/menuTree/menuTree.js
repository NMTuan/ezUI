var menuTree = {
    nodeIcon: function(){
        return $('<i>').addClass('menuTree-node-icon fa fa-fw');
    },
    //展开节点事件
    change_open: function (icon, li) {
        $(icon).removeClass('fa-caret-right').addClass('fa-caret-down');
        if (li && li.length > 0) {
            li.addClass('menuTree-open');
        }
    },
    //关闭节点事件
    change_close: function (icon, li) {
        $(icon).removeClass('fa-caret-down').addClass('fa-caret-right');
        if (li && li.length > 0) {
            li.removeClass('menuTree-open');
        }
    },
    menuTree: function (el, params) {
        el.find('li').each(function (i, li) {
            //初始化属性节点控制图标
            var className = 'fa-genderless text-gray';
            if ($(li).children('ul').length > 0) {
                if ($(li).hasClass('menuTree-open')) {
                    className = 'fa-caret-down';
                } else {
                    className = 'fa-caret-right';
                }
            }
            $(li).children('.menuTree-item').prepend(menuTree.nodeIcon().addClass(className));
        });

        //点击节点事件
        el.on('click', '.fa-caret-down, .fa-caret-right', function () {
            var s = $(this);
            var li = s.closest('li');
            var status = li.hasClass('menuTree-open') ? 'open' : 'close';
            if (status === 'open') {
                menuTree.change_close(s, li);
            } else {
                menuTree.change_open(s, li);
            }
        });

    }
};

$.fn.extend({
    menuTree: function (params) {
        menuTree.menuTree(this, params);
        return this;
    }
});

module.exports = menuTree.menuTree;
