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
            '<i class="ez image-view-close image-view-icon remixicon-close-line"></i>' +
            '<i class="ez image-view-rotate-left image-view-icon remixicon-anticlockwise-line"></i>' +
            '<i class="ez image-view-rotate-right image-view-icon remixicon-clockwise-line"></i>' +
            '<i class="ez image-view-prev image-view-icon remixicon-skip-back-line"></i>' +
            '<i class="ez image-view-next image-view-icon remixicon-skip-forward-line"></i>' +
            '<div class="ez image-view-head"></div>' +
            '<div class="ez image-view-body"></div>' +
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
        el.css({zIndex: params.zIndex + 1});
        $('body').append(el);
        imageView.createImage(data[params.index].src, function (img) {
            el.find('.image-view-body').append(img);
            imageView.imageResize(img, params);
        });
        return el;
    },
    closeView: function (el) {
        el.remove();
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
        // $(img).parent().css({
        //     marginTop: -$(img).height()/2,
        //     marginLeft: -$(img).width()/2
        // });
    },
    //【scale缩放x=a,y=d】
    scale: function (obj, step) {
        var scale = obj.data('scale') || 1;
        scale = parseFloat(scale);
        scale = scale + parseFloat(step)
        if (scale <= 0) {
            scale = 0.1;
        }
        obj.data('scale', scale.toFixed(1));
        imageView.transform(obj);
    },
    //【rotate旋转】
    rotate: function (obj, dir) {
        var rotate = obj.data('rotate') || 0;
        rotate = parseInt(rotate);
        if (dir === 'right') {
            rotate = rotate + 90;
        } else {
            rotate = rotate - 90;
        }
        rotate = rotate % 360;
        obj.data('rotate', rotate);
        imageView.transform(obj);
    },
    //计算transform值
    transform: function (obj) {
        var scale = obj.data('scale') || 1;
        var scaleArr = [scale, 0, 0, scale, 0, 0]; //缩放矩阵
        var rotate = obj.data('rotate') || 0;
        var r = Math.PI / 180 * rotate; //半径
        var sin = Math.sin(r);
        var cos = Math.cos(r);
        var rotateArr = [cos, sin, -sin, cos, 0, 0];   //旋转矩阵
        var matrix = [];    //最终矩阵
        matrix.push(scaleArr[0] * rotateArr[0] + scaleArr[2] * rotateArr[1]);
        matrix.push(scaleArr[1] * rotateArr[0] + scaleArr[3] * rotateArr[1]);
        matrix.push(scaleArr[0] * rotateArr[2] + scaleArr[2] * rotateArr[3]);
        matrix.push(scaleArr[1] * rotateArr[2] + scaleArr[3] * rotateArr[3]);
        matrix.push(scaleArr[0] * rotateArr[4] + scaleArr[2] * rotateArr[5]);
        matrix.push(scaleArr[1] * rotateArr[4] + scaleArr[3] * rotateArr[5]);
        imageView.setMatrix(obj, matrix);
    },
    //取2d变形的值,【scale缩放x=a,y=d】【translate平移x=e,y=f】【rotate旋转】
    // getMatrix: function (obj) {
    //     var matrix = obj.css('transform');
    //     $.log(matrix);
    //     if (matrix === 'none') {
    //         return ["1", "0", "0", "1", "0", "0"];
    //     }
    //     matrix = matrix.split(/matrix\((.*?)\)/)[1];
    //     matrix = matrix.split(', ');
    //     return matrix;
    // },
    setMatrix: function (obj, matrix) {
        matrix = matrix.join(',');
        matrix = 'matrix(' + matrix + ')';
        obj.css('transform', matrix);
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
            el.find('img').mousewheel(function (e) {
                e.preventDefault();
                e.stopPropagation();
                imageView.scale($(this), e.deltaY > 0 ? 0.1 : -0.1);
            });
            //窗口拖拽
            el.draggabilly({
                handle: '.image-view-head'
            });
            //图片拖拽
            el.find('.image-view-body').draggabilly({
                contrainment: true
            });
            el.draggabilly('setPosition', 100, 100);    //初始位置
            el.on('mousedown pointerDown', function () {    //鼠标按下，调整当前窗口层级。
                $('.image-view').css('z-index', params.zIndex);
                $(this).css('z-index', params.zIndex + 1);
            });
            // el.on('pointerDown', function () {
            //     $('.image-view').css('z-index', params.zIndex);
            //     $(this).css('z-index', params.zIndex+1);
            // });

            //关闭
            el.find('.image-view-close').on('click', function () {
                imageView.closeView(el);
            });
            //旋转
            el.find('.image-view-rotate-right').on('click', function () {
                imageView.rotate(el.find('img'), 'right');
            });
            el.find('.image-view-rotate-left').on('click', function () {
                imageView.rotate(el.find('img'), 'left');
            });
            //翻页
            el.find('.image-view-next').on('click', function () {
                imageView.createImage(data[params.index + 1].src, function (img) {
                    el.find('img').remove();
                    el.find('.image-view-body').append(img);
                    el.find('.image-view-body').draggabilly('setPosition', 0, 0);
                    imageView.imageResize(img, params);
                });
            });
        }
    }
};

module.exports = imageView.create;
