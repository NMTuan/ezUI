var mousewheel = require('jquery-mousewheel')($);   //鼠标滚轮
var jQueryBridget = require('jquery-bridget');
var Draggabilly = require('draggabilly');   //鼠标拖拽
jQueryBridget('draggabilly', Draggabilly, $);

var imageView = {
    defaults: {
        index: 0, //默认显示第几个
        zIndex: 10,
        width: 640, //默认宽度
        height: 480,    //默认高度
    },
    windowTpl: function () {
        var el = $('<div>').attr('class', 'ez image-view');
        var html = '' +
            // '<div class="ez image-view-head"></div>' +
            // '<div class="ez image-view-body"></div>' +
            // '<div class="ez image-view-foot"></div>' +
            '';
        el.append(html);
        return el;
    },
    //实例化
    create: function (data, params) {
        params = $.extend({}, imageView.defaults, params);
        new imageView.ImageView(data, params);
    },
    //异步加载图片
    createImage: function (src, callback) {
        callback = callback || function (img) {
            $.log(img);
        };
        var img = new Image();
        img.src = src;
        if (img.complete) {
            callback(img);
        } else {
            img.onload = function () {
                callback(img);
            };
        }
    },
    //创建窗口
    createView: function (data, params) {
        var el = imageView.windowTpl();
        el.css({zIndex: params.zIndex+1});
        $('body').append(el);
        imageView.createImage(data[params.index].src, function (img) {
            el.append(img);
            imageView.imageResize(img, params);
        });
        return el;
    },
    //重置大小
    imageResize: function (img, params) {
        var p1 = params.width / params.height;
        var p2 = img.width / img.height;
        if (p1 > p2) {
            img.width = p2 * params.height;
        } else {
            img.width = params.width;
        }
        $(img).data('width', img.width);
        $(img).data('zoom', 0);
        // $(img).parent().css({
        //     marginTop: -$(img).height()/2,
        //     marginLeft: -$(img).width()/2
        // });
    },
    //缩放
    imageZoom: function (img, whellDir) {
        img = $(img);
        whellDir = whellDir || 0;
        var step = 0.1; //缩放倍数
        if (whellDir < 0) {   //向下滚动
            step = 0 - step;
        }
        var zoom = img.data('zoom') + step;
        img.data('zoom', zoom);
        img.width(img.data('width') + img.data('width') * zoom);
    },
    //类
    ImageView: function (data, params) {
        data = data || [];
        if (data.length === 0) {
            return;
        }
        if (data[params.index] && data[params.index].src) {
            var el = imageView.createView(data, params);
            //滚动缩放
            el.mousewheel(function (e) {
                e.preventDefault();
                e.stopPropagation();
                imageView.imageZoom(el.find('img'), e.deltaY);
            });
            //拖拽
            el.draggabilly({

            });
            el.draggabilly('setPosition', 100, 100);    //初始位置
            el.on('pointerDown', function () {
                $('.image-view').css('z-index', params.zIndex);
                $(this).css('z-index', params.zIndex+1);
            });
        }
    }
};

module.exports = imageView.create;
