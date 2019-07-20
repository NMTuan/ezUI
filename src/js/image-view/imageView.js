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
            '<div class="ez image-view-head"></div>' +
            '<i class="ez image-view-close image-view-icon remixicon-close-line"></i>' +
            '<div class="ez image-view-bar">' +
            '<i class="ez image-view-prev image-view-icon remixicon-skip-back-line"></i>' +
            '<i class="ez image-view-rotate image-view-icon remixicon-anticlockwise-line" data-dir="right"></i>' +
            '<i class="ez image-view-rotate image-view-icon remixicon-clockwise-line" data-dir="left"></i>' +
            '<i class="ez image-view-next image-view-icon remixicon-skip-forward-line"></i>' +
            '</div>' +
            '<table class="ez image-view-body"><tr><td align="center" valign="middle"></td></tr></table>' +
            '<div class="ez image-view-foot">' +
            '<i class="ez image-view-resize"></i>' +
            '</div>' +
            '';
        el.append(html);
        return el;
    },
    //实例化
    create: function (data, params) {
        params = $.extend({}, imageView.defaults, params);
        new imageView.ImageView(data, params);
    },
    //创建窗口
    viewCreate: function (data, params) {
        var el = imageView.windowTpl();
        var width, height;
        width = params.width;
        height = params.height;
        if(localStorage){
            width = localStorage.getItem('resize.width');
            height = localStorage.getItem('resize.height');
            width = width < 100 ? params.width : width;
            height = height < 100 ? params.height : height;
        }
        el.css({
            width: width,
            height: height,
            zIndex: params.zIndex + 1
        });
        $('body').append(el);
        return el;
    },
    //设置窗口大小
    viewResizeDrag: function (el) {
        var resizeBtn = el.find('.image-view-resize');
        resizeBtn.draggabilly();
        var width, height, right, bottom;
        resizeBtn.on('dragStart', function (e, pointer, moveVector) {
            width = el.width();
            height = el.height();
            right = $(this).css('right');
            bottom = $(this).css('bottom');
        });
        resizeBtn.on('dragMove', function (e, pointer, moveVector) {
            $(this).css('display', 'none');
            imageView.viewResize(el, width + moveVector.x, height+moveVector.y);
        });
        resizeBtn.on('dragEnd', function (e, pointer, moveVector) {
            resizeBtn.css({
                display: 'block',
                top: '',
                right: right,
                bottom: bottom,
                left: ''
            });
        });
    },
    viewResize: function(el, width, height){
        el.css({
            width: width,
            height: height
        });
        if(localStorage){
            localStorage.setItem('resize.width', width);
            localStorage.setItem('resize.height', height);
        }
    },
    viewClose: function (el) {
        el.remove();
    },
    //异步加载图片
    imageCreate: function (src, callback) {
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
    //插入图片
    imageInsert: function (el, src, params) {
        imageView.imageCreate(src, function (img) {
            el.find('img').remove();
            el.find('.image-view-body td').append(img);
            el.find('.image-view-body').css({top: 0, left: 0});
            imageView.imageResize(el, img);
        });
    },
    //重置大小
    imageResize: function (el, img) {
        var viewSize = {width: el.width(), height: el.height()};
        var p1 = viewSize.width / viewSize.height;
        var p2 = img.width / img.height;
        if (p1 > p2) {
            img.width = p2 * viewSize.height;
        } else {
            img.width = viewSize.width;
        }
        $(img).data('width', img.width);
    },
    //【scale缩放x=a,y=d】
    scale: function (obj, step) {
        var scale = obj.data('scale') || 1;
        scale = parseFloat(scale);
        scale = scale + parseFloat(step);
        if (scale <= 0) {
            scale = 0.1;
        }
        obj.data('scale', scale.toFixed(1));
        if (scale <= 1) { //如果缩放小于等于原比例
            var body = obj.closest('.image-view-body');
            body.css({top: 0, left: 0});
        } else {
        }
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
        if (!data[params.index] || !data[params.index].src) {
            return;
        }
        var el = imageView.viewCreate(data, params);
        el.data('index', params.index);
        imageView.imageInsert(el, data[params.index].src, params);

        //窗口拖拽
        el.draggabilly({
            handle: '.image-view-head',
            containment: 'html'
        });

        //初始位置
        el.draggabilly('setPosition', 100, 100);

        //图片拖拽
        el.find('.image-view-body').draggabilly({
            contrainment: true
        });

        //鼠标按下，调整当前窗口在其它窗口上面
        el.on('mousedown pointerDown', function () {
            $('.image-view').css('z-index', params.zIndex);
            $(this).css('z-index', params.zIndex + 1);
        });

        //关闭
        el.find('.image-view-close').on('click', function () {
            imageView.viewClose(el);
        });

        //滚动缩放
        el.on('mousewheel', 'img', function (e) {
            e.preventDefault();
            e.stopPropagation();
            imageView.scale($(this), e.deltaY > 0 ? 0.2 : -0.2);
        });

        //旋转
        el.find('.image-view-rotate').on('click', function () {
            var dir = $(this).data('dir') ? $(this).data('rotate-dir') : 'right';
            imageView.rotate(el.find('img'), dir);
        });
        //翻页
        el.find('.image-view-next, .image-view-prev').on('click', function () {
            var index = el.data('index');
            if ($(this).hasClass('image-view-next')) {
                index++;
            } else {
                index--;
                index = index + data.length;
            }
            index = index % data.length;
            el.data('index', index);
            imageView.imageInsert(el, data[index].src, params);
        });

        //缩放窗口
        imageView.viewResizeDrag(el);
    }
};

module.exports = imageView.create;
