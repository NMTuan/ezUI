var iframeTabs = {
    defaults: {
        el: '', //菜单元素，不是容器，jquery选择器
        parentEl: '',   //父级菜单元素，不是容器，jquery选择器
        headerEl: '', //页签容器，jquery选择器
        contentEl: '',  //内容容器，jquery选择器
        leftArrow: '',  //左滚按钮
        rightArrow: '',  //右滚按钮
        refreshEl: ''   //刷新按钮
    },
    index: 0,   //计数器
    closeBtn: $('<i>').attr('class', 'fa fa-times'),    //关闭按钮
    urls: [],   //记录所有打开url
    //打开新页面
    open: function (url, title, backgroundModel) {
        //如果内页使用，需要提升
        if (window.top !== window) {
            window.top.eza.iframeTabs.open(url, title, backgroundModel);
            return;
        }
        //先检测是否打开
        var isCreated = iframeTabs.checkCreated(url);
        if (!isCreated) { //如果没创建，先创建
            iframeTabs.create(url, title);
            if (!backgroundModel) {   //非后台模式，切换过去
                iframeTabs.switch(url);
            }
        } else {    //如果已创建，则切换过去，不考虑是否为后台模式
            iframeTabs.switch(url);
        }
    },
    //创建页面
    create: function (url, title) {
        iframeTabs.urls.push(url);  //记录已打开页面
        iframeTabs.index++;

        //构建标签头
        var tabHeader = $('<li>');
        tabHeader.data('url', url);
        tabHeader.html(title || '新开窗口' + iframeTabs.index);
        iframeTabs.closeBtn.clone(true).appendTo(tabHeader);
        iframeTabs.params.headerEl.append(tabHeader);

        //构建标签内容
        var tabContent = $('<iframe>');
        tabContent.attr('src', url);
        tabContent.attr('frameborder', '0');
        tabContent.attr('name', url);
        iframeTabs.params.contentEl.append(tabContent);

        if (typeof NProgress !== 'undefined') {
            NProgress.configure({parent: '#iframeTabsContent'});
            NProgress.start();
            tabContent[0].onload = function () {
                NProgress.done();
            };
        }
    },
    //切换到页面
    switch: function (url) {
        var index = $.inArray(url, iframeTabs.urls);
        var tabs = iframeTabs.params.headerEl;
        var current = tabs.find('li').eq(index);
        current.addClass('current').siblings().removeClass('current');
        //滚动到合适位置，显示出高亮的tabs
        //高亮元素左边+元素宽度，大于，可视区域宽度+已滚动区域
        if(current.position().left + current.width() > tabs.parent().scrollLeft() + tabs.parent().width()){
            iframeTabs.scrollTabs(current.position().left + current.width());
        }
        //高亮元素左侧，小于，已滚动区域
        if(current.position().left < tabs.parent().scrollLeft()){
            iframeTabs.scrollTabs(tabs.parent().scrollLeft() + current.position().left);
        }

        var iframe = iframeTabs.params.contentEl.find('iframe').eq(index);
        iframe.show().siblings('iframe').hide();
        iframe.renderHeight();

        iframeTabs.highLight(url);
    },
    //高亮当前菜单
    highLight: function (url) {
        iframeTabs.params.el.filter('.current').removeClass('current');
        iframeTabs.params.el.each(function (i, item) {
            if ($(item).data('url') === url) {
                $(item).addClass('current');
                return false;
            }
        });
    },
    //高亮父级菜单，只有在点击tabs的时候才会需要。
    highLightParent: function (url) {
        iframeTabs.params.el.each(function (i, item) {
            if ($(item).data('url') === url) {
                //父级
                var dl = $(item).closest('dl');
                if (!dl.hasClass('current')) {
                    dl.addClass('current').siblings('dl').removeClass('current');
                }
                //顶级
                var id = $(item).closest('.sub-nav-item').attr('id');
                var current = iframeTabs.params.parentEl.filter('.current');
                if (current.attr('href') !== '#' + id) {   //判断当前高亮是否为已高亮。
                    current.removeClass('current');
                    iframeTabs.params.parentEl.each(function (i, item) {
                        if ($(item).attr('href') === '#' + id) {
                            $(item).click();
                            return false;
                        }
                    });
                }
                return false;
            }
        });
    },
    //关闭页面
    close: function (confirm, url, index) {
        //如果内页使用，需要提升
        if (window.top !== window && window.name) {
            url = url || window.name;   //如果没url，则关闭当前iframe。
            window.top.eza.iframeTabs.close(confirm, url, index);
            return;
        }
        if (!url) {
            return;
        }
        if ($.inArray(url, iframeTabs.urls) < 0) {
            return;
        }
        var close = function () {
            //没下标，先找下标
            if (typeof index === 'undefined') {
                iframeTabs.params.headerEl.find('li').each(function (i, item) {
                    if ($(item).data('url') === url) {
                        index = i;
                        return false;
                    }
                });
            }
            if (typeof index === 'undefined') {
                return;
            }
            var li = iframeTabs.params.headerEl.find('li').eq(index);
            li.remove();
            iframeTabs.params.contentEl.find('iframe').eq(index).remove();
            iframeTabs.urls.splice($.inArray(url, iframeTabs.urls), 1); //移除urls里的记录。
            //如果关闭高亮标签，则高亮上一个
            if (li.hasClass('current')) {
                var prev = index === 0 ? 0 : index - 1;
                iframeTabs.params.headerEl.find('li').eq(prev).click();
            }
        };
        if(typeof confirm === 'boolean' && confirm === true){
            if(typeof top.layer !== 'undefined'){
                top.layer.confirm('确定要关闭么？', function (index) {
                    close();
                    top.layer.close(index);
                });
            } else {
                var cfm = top.confirm('确定要关闭么');
                if(cfm){
                    close();
                }
            }
        } else {
            close();
        }
    },
    //刷新页面
    refresh: function(){
        var index = iframeTabs.params.headerEl.find('li.current').index();
        var iframe = iframeTabs.params.contentEl.find('iframe').eq(index);
        if(iframe.length === 0){
            return;
        }
        var src = iframe[0].contentWindow.document.location.href;
        // var src = iframe.attr('src');
        iframe.attr('src', src);

        if (typeof NProgress !== 'undefined') {
            NProgress.configure({parent: '#iframeTabsContent'});
            NProgress.start();
            iframe[0].onload = function () {
                NProgress.done();
            };
        }
    },
    //监测是否已经创建
    checkCreated: function (url) {
        return $.inArray(url, iframeTabs.urls) < 0 ? false : true;
    },
    //初始化，绑定事件
    iframeTabs: function (el, params) {
        if (el.length < 0) {
            return;
        }
        iframeTabs.params = $.extend({}, iframeTabs.defaults, params);
        iframeTabs.params.el = el;

        //菜单绑定
        el.on('click', function () {
            var url = $(this).data('url') || '';
            var title = $(this).data('title') || $.trim($(this).text());
            if (url !== '#' && url !== '###' && url !== '') {
                iframeTabs.open(url, title);
            }
        });

        //tabs绑定
        iframeTabs.params.headerEl.on('click', 'li', function () {
            if ($(this).hasClass('current')) {
                return;
            }
            var url = $(this).data('url');
            iframeTabs.switch(url);
            iframeTabs.highLightParent(url);
        });

        //close
        iframeTabs.closeBtn.on('click', function () {
            var li = $(this).closest('li');
            iframeTabs.close(false, li.data('url'), li.index());
        });

        //arrow
        var ul = iframeTabs.params.headerEl;
        var scrollBox = ul.parent();
        iframeTabs.params.leftArrow.on('click', function () {
            var step = scrollBox.scrollLeft() -200;
            iframeTabs.scrollTabs(step);
        });
        iframeTabs.params.rightArrow.on('click', function () {
            var step = scrollBox.scrollLeft() + 200;
            iframeTabs.scrollTabs(step);
        });

        //刷新
        iframeTabs.params.refreshEl.on('click', function () {
            iframeTabs.refresh();
        });
    },
    //滚动tabs
    scrollTabs: function (step) {
        iframeTabs.params.headerEl.parent().animate({
            scrollLeft: step
        }, 150);
    }
};

$.fn.iframeTabs = function (params) {
    iframeTabs.iframeTabs(this, params);
    return this;
};

module.exports = {
    iframeTabs: iframeTabs.iframeTabs,
    open: iframeTabs.open,
    close: iframeTabs.close
};
