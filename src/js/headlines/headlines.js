var headlines = {
    defaults: {
        title: '',  //标题
        time: '',   //时间
        content: '',    //内容
        // url: '',    //新开页签地址
        // name: '',   //新开页签标题, 默认取title
        close: true //关闭按钮
    },
    params: null,
    el: null,
    tpl: function(){
        var dl = $("<dl>");
        var time = headlines.params.time ? '<span>'+ headlines.params.time +'</span>' : '';
        var html = '' +
            '<dt>'+ headlines.params.title + time + '</dt>' +
            '<dd>'+ headlines.params.content +'</dd>' +
            '';
        dl.append(html);
        return dl;
    },
    headlines: function (el, params) {
        if(el.length === 0){
            return;
        }
        headlines.el = el;
        headlines.params = $.extend({}, headlines.defaults, params);
        $.log(headlines.params);

        el.html(headlines.tpl());
        if(headlines.params.close){
            el.prepend('<i class="eza headlines-close remixicon-close-circle-fill"></i>');
        }
        headlines.show();

        headlines.el.find('.headlines-close').on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            headlines.hide();
        });

        // if(headlines.params.url){
        //     headlines.el.on('click', function () {
        //         ez.iframeTabs.open(headlines.params.url, headlines.params.name || headlines.params.title);
        //     });
        // }
    },
    show: function () {
        headlines.el.slideDown(function () {
            $(window).resize();
        });
    },
    hide: function () {
        headlines.el.slideUp(function () {
            $(window).resize();
        });
    }
};

module.exports = {
    show: headlines.headlines,
    close: headlines.hide
};
