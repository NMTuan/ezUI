var mousewheel = require('jquery-mousewheel')($);   //鼠标滚轮

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
    open: function (url, title, backgroundModel, parentName, noClose) {
        //如果内页使用，需要提升
        if (window.top !== window) {
            window.top.ez.iframeTabs.open(url, title, backgroundModel, window.name, noClose);
            return;
        }
        //先检测是否打开
        var isCreated = iframeTabs.checkCreated(url);
        if (!isCreated) { //如果没创建，先创建
            iframeTabs.create(url, title, parentName, noClose);
            if (!backgroundModel) {   //非后台模式，切换过去
                iframeTabs.switch(url);
            }
        } else {    //如果已创建，则切换过去，不考虑是否为后台模式
            iframeTabs.switch(url);
        }
    },
    //创建页面
    create: function (url, title, parentName, noClose) {
        iframeTabs.urls.push(url);  //记录已打开页面
        iframeTabs.index++;

        //构建标签头
        var tabHeader = $('<li>');
        tabHeader.data('url', url);
        tabHeader.data('parent', parentName);   //记录哪个tabs打开的我
        tabHeader.html(title || '新开窗口' + iframeTabs.index);
        if(!noClose) {
            iframeTabs.closeBtn.clone(true).appendTo(tabHeader);
        }
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
        var tabs = iframeTabs.params.headerEl;  //tabs标签区域
        var current = tabs.find('li').eq(index);    //当前标签
        current.addClass('current').siblings().removeClass('current');
        iframeTabs.highLight(url);  //高亮侧边相应栏目
        //滚动到合适位置，显示出高亮的tabs
        // var log = [];
        // log.push('可视区域宽度：' + tabs.parent().width());
        // log.push('滚动容器宽度：' + tabs.width());
        // log.push('高亮元素左上角距离父级：' + current.position().left);
        // log.push('高亮元素宽度：' + current.width());
        // log.push('已滚动距离：' + tabs.parent().scrollLeft());
        var leftSide = tabs.parent().scrollLeft();  //左侧边界
        var rightSide = tabs.parent().scrollLeft() + tabs.parent().width(); //右侧边界
        var currentLeft = current.position().left;  //高亮元素左边
        var currentRight = current.position().left + current.outerWidth();   //高亮元素右边
        // log.push('当前可视范围：' + leftSide + ' ~ ' + rightSide);
        // log.push('实际可视宽度：' + (rightSide - leftSide));
        var leftIn = (currentLeft >= leftSide) && (currentLeft <= rightSide);   //左侧可见
        var rightIn = (currentRight >= leftSide) && (currentRight <= rightSide);    //右侧可见
        // log.push('左侧可见：' + leftIn);
        // log.push('右侧可见：' + rightIn);
        // $.log(log.join('\n'))
        //在右侧，滚到高亮元素的右侧
        if (currentLeft >= leftSide && !(currentRight <= rightSide)) {
            iframeTabs.scrollTabs(currentRight - tabs.parent().outerWidth());
        }
        //在左边，滚到高亮元素的左侧
        if (!(currentLeft >= leftSide) && currentRight <= rightSide) {
            iframeTabs.scrollTabs(currentLeft);
        }

        //每次切换，重置当前iframe高度。
        var iframe = iframeTabs.params.contentEl.find('iframe, .ez').eq(index);
        iframe.show().siblings('iframe, .ez').hide();
        iframe.renderHeight();

    },
    //高亮当前菜单
    highLight: function (url) {
        //取消老高亮
        iframeTabs.params.el.filter('.current').removeClass('current');
        //不传参，则取消高亮后就结束了。
        if (typeof url === 'undefined') {
            return;
        }
        //高亮当前
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
                var id = $(item).closest('.ez-sub-nav-item').attr('id');
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
    //关闭页面，确认框，关闭tabs的url，关闭tabs的index
    close: function (confirm, refreshParent, url, index) {
        //如果内页使用，需要提升
        if (window.top !== window && window.name) {
            url = url || window.name;   //如果没url，则关闭当前iframe。
            window.top.ez.iframeTabs.close(confirm, refreshParent, url, index);
            return;
        }
        // if (!url) {
        //     return;
        // }
        // if ($.inArray(url, iframeTabs.urls) < 0) {
        //     return;
        // }
        var close = function () {
            //没下标，先找下标
            if (typeof index === 'undefined') {
                index = $.inArray(iframeTabs.params.headerEl.find('.current').data('url'), iframeTabs.urls);
            }
            if (index === -1) {
                return;
            }
            var li = iframeTabs.params.headerEl.find('li').eq(index);
            var parentName = li.data('parent');
            li.remove();
            iframeTabs.params.contentEl.find('iframe, .ez').eq(index).remove();
            iframeTabs.urls.splice($.inArray(url, iframeTabs.urls), 1); //移除urls里的记录。
            //如果关闭高亮标签，如果有父窗口，则高亮父窗口，否则高亮上一个，
            if (li.hasClass('current')) {
                if (parentName) {
                    var prev = $.inArray(parentName, iframeTabs.urls);
                } else {
                    var prev = index === 0 ? 0 : index - 1;
                }
                iframeTabs.params.headerEl.find('li').eq(prev).click();
            }
            //如果有加载条，结束
            if (typeof NProgress !== 'undefined') {
                NProgress.done();
            }
            //如果要刷新父级
            if (refreshParent && parentName) {
                iframeTabs.refresh();
            }
            //如果窗口全部关闭，左侧菜单的高亮取消，否则没法再次点击
            if (iframeTabs.urls.length === 0) {
                iframeTabs.highLight();
            }
        };
        if (typeof confirm === 'boolean' && confirm === true) {
            if (typeof top.layer !== 'undefined') {
                top.layer.confirm('确定要关闭么？', function (index) {
                    close();
                    top.layer.close(index);
                });
            } else {
                var cfm = top.confirm('确定要关闭么');
                if (cfm) {
                    close();
                }
            }
        } else {
            close();
        }
    },
    //刷新页面
    refresh: function (url) {
        //统一由url找到index，然后再找到iframe
        if (iframeTabs.checkCreated(url)) {
            var index = $.inArray(url, iframeTabs.urls);
        } else {
            var index = iframeTabs.params.headerEl.find('li.current').index();
        }
        var iframe = iframeTabs.params.contentEl.find('iframe, .ez').eq(index);
        if (iframe.length === 0) {
            return;
        }
        if(!iframe[0].contentWindow){   //不是iframe的固定页签
            return;
        }
        var src = iframe[0].contentWindow.document.location.href;
        // var src = iframe.attr('src');
        //过滤掉hash
        src = src.replace('###', '');
        src = src.replace('#', '');
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

        //初始化固定标签
        iframeTabs.params.headerEl.find('li').each(function (i, item) {
            var url = $(item).data('url');
            if(url){
                iframeTabs.urls.push(url);
            }
        });
        iframeTabs.params.contentEl.find('iframe, .ez').renderHeight();

        //菜单绑定
        el.on('click', function () {
            //已高亮，退出
            if ($(this).hasClass('current')) {
                return;
            }
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
            iframeTabs.close(false, false, li.data('url'), li.index());
        });

        //arrow
        var ul = iframeTabs.params.headerEl;
        var scrollBox = ul.parent();
        iframeTabs.params.leftArrow.on('click', function () {
            var step = scrollBox.scrollLeft() - 200;
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
        //鼠标滚轮，滚动
        iframeTabs.params.headerEl.on('mousewheel', function (e) {
            if (e.deltaY > 0) {
                var step = scrollBox.scrollLeft() - 200;

            } else {
                var step = scrollBox.scrollLeft() + 200;
            }
            iframeTabs.scrollTabs(step);
        });
    },
    //滚动tabs
    scrollTabs: function (step, time) {
        time = time || 100;
        iframeTabs.params.headerEl.parent().stop(true).animate({
            scrollLeft: step
        }, time);
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
