var subNav = {
    defaults: {},
    switch: function(el){
        subNav.el.each(function (i, item) {
            var dl = $(item).closest('dl');
            if(dl.hasClass('current')){
                dl.removeClass('current');
            }
        });
        el.closest('dl').addClass('current');
    },
    init: function(){
        //清理一下空dd容器。
        subNav.el.each(function (i, item) {
            var dd = $(item).closest('dl').find('dd');
            if($.trim(dd.html()) == ''){
                dd.remove();
            }
        });
    },
    subNav: function (el, params) {
        if(el.length <= 0){
            return;
        }
        subNav.el = el;
        subNav.params = $.extend({}, subNav.defaults, params);

        subNav.init();

        el.on('click', function () {
            var state = $(this).closest('dl').hasClass('current');
            if(!state){
                subNav.switch($(this));
            } else {
                $(this).closest('dl').removeClass('current');
            }
        });
    }
};

$.fn.extend({
    subNav: function (params) {
        subNav.subNav(this, params);
        return this;
    }
});

module.exports = subNav.subNav;
