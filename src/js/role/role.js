var role = {
    //返回深度
    deep: function (el, index) {
        // if(el.children('li').children('ul').length > 0){
        //     index++;
        //     role.deep(el.children('li').children('ul'), index);
        // } else {
        //     return index;
        // }
    },
    role: function (el, params) {
        var max = 0;
        el.find('li').each(function () {
            var i = $(this).parents('ul').length;
            if (i > max) {
                max = i;
            }
        });

        $.log(max);
        var width = $(window).width() / max;
        el.find('label').width(width);
    }
};

$.fn.extend({
    role: function (params) {
        role.role(this, params);
        return this;
    }
});

module.exports = role.role;
