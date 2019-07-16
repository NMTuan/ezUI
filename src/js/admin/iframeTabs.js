var iframeTabs = {
    defaults: {
        el: '', //菜单元素，不是容器，jquery选择器
        parentEl: '',   //父级菜单元素，不是容器，jquery选择器
        headerEl: '', //页签容器，jquery选择器
        contentEl: ''  //内容容器，jquery选择器
    },
    urls: [],   //记录所有打开url
    //打开新页面
    open: function(url, title){
        //先检测是否打开
        var isCreated = iframeTabs.checkCreated(url);
        if(!isCreated){
            iframeTabs.create(url, title);
        }
        iframeTabs.switch(url);
    },
    //创建页面
    create: function(url, title){
        iframeTabs.urls.push(url);  //记录已打开页面

        //构建标签头
        var tabHeader = $('<li>');
        tabHeader.data('url', url);
        tabHeader.html(title);
        iframeTabs.params.headerEl.append(tabHeader);

        //构建标签内容
        var tabContent = $('<iframe>');
        tabContent.attr('src', url);
        tabContent.attr('frameborder', '0');
        iframeTabs.params.contentEl.append(tabContent);

        if(typeof NProgress !== 'undefined'){
            NProgress.configure({ parent: '#iframeTabsContent' });
            NProgress.start();
            tabContent[0].onload = function () {
                NProgress.done();
            };
        }
    },
    //切换到页面
    switch: function(url, highLightParent){
        var index = $.inArray(url, iframeTabs.urls);
        iframeTabs.params.headerEl.find('li').eq(index).addClass('current').siblings().removeClass('current');

        var iframe = iframeTabs.params.contentEl.find('iframe').eq(index);
        iframe.show().siblings('iframe').hide();
        iframe.renderHeight();

        iframeTabs.highLight(url, highLightParent);
    },
    //高亮当前菜单
    highLight: function(url, highLightParent){
        iframeTabs.params.el.filter('.current').removeClass('current');
        iframeTabs.params.el.each(function (i, item) {
            if($(item).data('url') === url){
                $(item).addClass('current');
                if(highLightParent){    //高亮父级菜单，一般只有在点击tabs的时候才会处理
                    var parentId = $(item).closest('.sub-nav-item').attr('id');
                    iframeTabs.highLightParent(parentId);
                }
                return false;
            }
        });
    },
    //高亮父级菜单，只有在点击tabs的时候才会需要。
    highLightParent: function(id){
        var current = iframeTabs.params.parentEl.filter('.current');
        if(current.attr('href') !== '#' + id){   //判断当前高亮是否为已高亮。
            current.removeClass('current');
            iframeTabs.params.parentEl.each(function (i, item) {
                if($(item).attr('href') === '#' + id){
                    $(item).click();
                    return false;
                }
            });
        }
    },
    //关闭页面
    //刷新页面
    //监测是否已经创建
    checkCreated: function(url){
        return $.inArray(url, iframeTabs.urls) < 0 ? false : true;
    },

    //初始化，绑定事件
    iframeTabs: function (el, params) {
        if(el.length < 0){
            return;
        }
        iframeTabs.params = $.extend({}, iframeTabs.defaults, params);
        iframeTabs.params.el = el;

        //菜单绑定
        el.on('click', function () {
            var url = $(this).data('url') || '';
            var title = $(this).data('title') || $.trim($(this).text());
            if(url !== '#' && url !== '###' && url !== ''){
                iframeTabs.open(url, title);
            }
        });

        //tabs绑定
        iframeTabs.params.headerEl.on('click', 'li', function () {
            if($(this).hasClass('current')){
                return;
            }
            var url = $(this).data('url');
            iframeTabs.switch(url, true);
        });
    }
};

$.fn.iframeTabs = function(params){
    iframeTabs.iframeTabs(this, params);
    return this;
};

module.exports = iframeTabs.iframeTabs;
