var watermark = {
    defaults: {
        watermark: '',
        watermark2: '',
        canvasClass: 'ez-watermark',
        repeatCanvasClass: 'ez-watermark-repeat',
        fontStyle: "16px 微软雅黑", //水印字体设置
        rotateAngle: -20 * Math.PI / 180, //水印字体倾斜角度设置
        fontColor: "rgba(120, 120, 120, 0.1)", //水印字体颜色设置
        firstLinePositionX: -20, //canvas第一行文字起始X坐标
        firstLinePositionY: 80, //Y
        SecondLinePositionX: 20, //canvas第二行文字起始X坐标
        SecondLinePositionY: 150 //Y
    },
    watermark: function (els, params) {
        // $(function () {
            $.each(els, function () {
                new watermark.Watermark($(this), params);
            });
        // });
    },
    Watermark: function (el, params) {
        var s = this;
        if (typeof params === 'string') {
            params = {watermark: params};
        }
        s.el = el;
        s.params = $.extend(true, {}, watermark.defaults, params);

        el.css('position', 'relative');

        el.append(watermark.canvas(s.params.canvasClass));
        el.append(watermark.canvas(s.params.repeatCanvasClass));
        watermark.draw.call(s);
        watermark.events.call(s);
    },
    canvas: function (cls) {
        var canvas = $('<canvas>');
        canvas.attr('class', cls || '');
        return canvas;
    },
    draw: function () {
        var s = this;
        var cw = s.el.find('.' + s.params.canvasClass)[0];
        var crw = s.el.find('.' + s.params.repeatCanvasClass)[0];

        crw.width = s.el.width();
        crw.height = s.el.height();
        //
        // if(s.el.is('body')){
        //     if(s.el.height() < $(window).height()){
        //         crw.height = $(window).height();
        //     }
        // }

        var ctx = cw.getContext("2d");
        //清除小画布
        ctx.clearRect(0, 0, 160, 100);
        ctx.font = s.params.fontStyle;
        //文字倾斜角度
        ctx.rotate(s.params.rotateAngle);

        ctx.fillStyle = s.params.fontColor;
        //第一行文字
        ctx.fillText(s.params.watermark, s.params.firstLinePositionX, s.params.firstLinePositionY);
        //第二行文字
        ctx.fillText(s.params.watermark2, s.params.SecondLinePositionX, s.params.SecondLinePositionY);
        //坐标系还原
        ctx.rotate(-s.params.rotateAngle);

        var ctxr = crw.getContext("2d");
        //清除整个画布
        ctxr.clearRect(0, 0, crw.width, crw.height);
        //平铺--重复小块的canvas
        var pat = ctxr.createPattern(cw, "repeat");
        ctxr.fillStyle = pat;

        ctxr.fillRect(0, 0, crw.width, crw.height);
    },
    events: function () {
        var s = this;
        $(window).on('resize', function () {
            s.el.find('canvas').remove();
            s.el.append(watermark.canvas(s.params.canvasClass));
            s.el.append(watermark.canvas(s.params.repeatCanvasClass));
            watermark.draw.call(s);
        });
    }
};

$.fn.extend({
    ez_watermark: function (params) {
        watermark.watermark(this, params);
        return this;
    }
});

module.exports = watermark.watermark;
