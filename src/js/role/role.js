var role = {
    defaults: {},
    params: null,
    //返回深度
    deep: function (el) {
        var max = 0;
        el.find('li').each(function () {
            var i = $(this).parents('ul').length;
            if (i > max) {
                max = i;
            }
        });
        return max;
    },
    //勾选父级
    checkParents: function(input){
        var check = function (input) {
            var ul = input.closest('ul');
            var parentLabel = ul.prev('label');
            if(parentLabel.length > 0){
                var input = parentLabel.find('input');
                if(!input.prop('checked')){
                    input.prop('checked', true).change();
                }
                check(input);
            }
        };
        check(input);
    },
    //取消子集
    checkChilds: function(input){
        var label = input.closest('label');
        var ul = label.next('ul');
        var childs = ul.find('input:checked');
        if(childs.length > 0){
            childs.prop('checked', false).change();
        }
    },
    role: function (el, params) {
        role.params = $.extend({}, role.defaults, params);

        //初始化每项宽度
        var max = role.deep(el);
        var width = el.width() / max;
        el.find('label').width(width - max*2 - 1);
        $(window).on('resize', function () {
            var width = el.width() / max;
            el.find('label').width(width - max*2 - 1);
        });

        //已勾高亮
        el.find('label').each(function (i, item) {
            var s = $(this);
            if(s.find('input:checked').length > 0){
                s.addClass('active');
            }
        });
        //操作项不触发勾选操作
        el.find('.role-bar').on('click', function (e) {
            e.preventDefault();
        });
        //勾选操作
        el.find('input').on('change', function () {
            var checked = $(this).prop('checked');
            if(checked){
                $(this).closest('label').addClass('active');
                //向上勾选
                role.checkParents($(this));
            } else {
                $(this).closest('label').removeClass('active');
                //向下取消
                role.checkChilds($(this));
            }
        });
    }
};

$.fn.extend({
    role: function (params) {
        role.role(this, params);
        return this;
    }
});

module.exports = role.role;
