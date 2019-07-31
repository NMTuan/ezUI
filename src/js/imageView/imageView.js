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
            '<i class="ez image-view-loading remixicon-loader-2-line ri-3x fa-spin"></i>' +
            '<i class="ez image-view-error remixicon-landscape-line ri-3x"> <span>未找到图片</span></i>' +
            '<table class="ez image-view-body"><tr><td align="center" valign="middle"></td></tr></table>' +
            '<div class="ez image-view-foot">' +
            '<i class="ez image-view-resize"></i>' +
            '</div>' +
            '';
        el.append(html);
        return el;
    },
    //在iframe元素上面进行拖动，会明显卡顿，遮一层透明元素就没问题了。
    fixedIframe: function () {
        var html = $('<div>');
        html.css({
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 5
        });
        return html;
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
        if (localStorage) {
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
        var fixed = imageView.fixedIframe();
        var width, height, x, y;
        var down = function (e) {
            width = el.width();
            height = el.height();
            x = e.clientX;
            y = e.clientY;
            fixed.appendTo('body');
        };
        var move = function (e) {
            var newX = e.clientX >= $(window).width() ? $(window).width() - x - 2 : e.clientX - x;
            var newY = e.clientY >= $(window).height() ? $(window).height() - y - 2 : e.clientY - y;
            imageView.viewResize(el, width + newX, height + newY);
        };
        var up = function () {
            $(document).off('mousemove');
            $(document).off('mouseup');
            fixed.remove();
        };
        resizeBtn
            .on('mousedown', function (e) {
                down(e);
                $(document)
                    .on('mousemove', function (e) {
                        move(e);
                    })
                    .on('mouseup', function () {
                        up();
                    })
                ;
            })
        ;
    },
    viewResize: function (el, width, height) {
        width = width < 200 ? 200 : width;
        height = height < 200 ? 200 : height;
        el.css({
            width: width,
            height: height
        });
        if (localStorage) {
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
            callback(false, img);
        } else {
            img.onload = function () {
                callback(false, img);
            };
            img.onerror = function () {
                callback(true);
            }
        }
    },
    //插入图片
    imageInsert: function (el, imgObj, params) {
        var src = imgObj.src || '';
        var title = imgObj.title || '';
        if (!src) {
            return;
        }
        //1.清除原图, 清楚error
        el.find('img').remove();
        el.find('.image-view-error').hide();
        //2.显示loading
        el.find('.image-view-loading').show();
        //3.loading img
        imageView.imageCreate(src, function (error, img) {
            el.find('.image-view-loading').hide();
            if (title) {
                el.find('.image-view-head').html(title);
            }
            if (error) {
                el.find('.image-view-error').show();
                return;
            }
            el.find('.image-view-body td').append(img);
            el.find('.image-view-body').css({top: 0, left: 0});
            imageView.imageResize(el, img);
        });
        //4.移除loading
        //5.显示图片
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
        if (dir === 'left') {
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
        imageView.imageInsert(el, data[params.index], params);

        //修复iframe下拖动卡顿
        var fixed = imageView.fixedIframe();
        el.on('dragStart', function () {
            fixed.appendTo('body');
        });
        el.on('dragEnd', function () {
            fixed.remove();
        });

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
            var dir = $(this).data('dir') ? $(this).data('dir') : 'right';
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
            imageView.imageInsert(el, data[index], params);
        });

        //缩放窗口
        imageView.viewResizeDrag(el);
    }
};

module.exports = imageView.create;
