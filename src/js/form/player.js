var player = {
    defaults: {
        loadingIcon: '<i class="remixicon-loader-2-line fa fa-spin"></i>',
        playIcon: '<i class="remixicon-play-fill"></i>',
        pauseIcon: '<i class="remixicon-pause-fill"></i>',
        retryIcon: '<i class="remixicon-refresh-line"></i>',
        autoPlay: true, //加载完毕自动播放
    },
    playWave: '',   //播放器
    playUrl: '',    //当前播放地址
    currentEl: '',  //当前播放按钮, 如果不同, 即使是playUrl一样, 也要重新处理.
    Play: function (el, params) {
        var s = this;
        s.el = $(el);
        s.params = $.extend(true, {}, player.defaults, params);
        s.target = $(s.el.data('target'));

        player.events.call(s);
        s.el.on('click', function () {
            var url = s.el.data('src') || s.el.attr('src') || s.el.attr('href');
            if (s.target.length > 0) {
                if (s.target.is('select')) {
                    url = s.target.find(':selected').data('src');
                }
            }
            if (!url) {
                return;
            }
            //判断是否重载
            if (player.currentEl == s.el && player.playUrl === url) {
                player.playWave.playPause();
            } else {
                player.initWavesurfer.call(s);
                player.changeIcon.call(s, 'loading');
                player.playWave.load(url);
                player.currentEl = s.el;
                player.playUrl = url;
            }
        });
    },

    initWavesurfer: function () {
        var s = this;
        player.destroyWavesurfer.call(s);
        var container = player.renderWavesurferContainer.call(s);
        var height = s.el.outerHeight();
        player.playWave = WaveSurfer.create({
            container: container,
            interact: false,    //开启鼠标交互
            autoCenter: true,   //如果存在滚动条，则将波形置于进度的中心。
            barWidth: 1,
            height: height * 2,
            hideScrollbar: true,    //是否在通常显示水平滚动条时隐藏水平滚动条。
            normalize: true,    //最大峰值算100%
            waveColor: '#eeeeee',   //频谱颜色
            progressColor: '#e0e0e0',   //播放后的频谱颜色
            cursorColor: '#e0e0e0', //指针颜色
            // partialRender: true, //缓存，提高速度，实际使用，发现有时候音谱会不显示。
            // scrollParent: true, //波形图超出容器宽度，是否滚动
            // splitChannels: true,    //分音轨

        });
        player.playWave.on('ready', function () {
            player.changeIcon.call(s, 'pause');
            if (s.params.autoPlay) {
                player.playWave.play();
            }
        });
        player.playWave.on('play', function () {
            player.changeIcon.call(s, 'pause');
        });
        player.playWave.on('pause', function () {
            player.changeIcon.call(s, 'play');
        });
        player.playWave.on('destroy', function () {
            player.changeIcon.call(s, 'play');
        });
        player.playWave.on('error', function () {
            s.el.one('click', function () {
                player.changeIcon.call(s, 'loading');
                player.playWave.load(player.playUrl);
            });
            player.changeIcon.call(s, 'retry');
        });
    },

    renderWavesurferContainer: function () {
        var s = this;
        var content = s.el.closest('.ez-form-content');
        var container = $('<div>').addClass('ez-form-wave').css({
            marginTop: content.css('paddingTop'),
            marginRight: parseInt(content.css('paddingRight')) + s.el.outerWidth(),
            marginLeft: content.css('paddingLeft'),
            height: content.height() - 1,
        });
        content.find('.ez-form-control').css('z-index', 1);
        content.find('.ez-form-flex').prepend(container);
        return container[0];
    },

    destroyWavesurfer: function () {
        if (player.playWave) {
            player.playWave.destroy();
            player.playWave = '';
        }
    },

    events: function () {
        var s = this;
        //切换select
        if (s.target && s.target.is('select')) {
            s.target.on('change', function () {
                if (!player.playWave) {
                    return;
                }
                player.playWave.pause();
            });
        }

    },
    changeIcon: function (icon) {
        var el = this.el;
        if (icon === 'loading') {
            el.html(this.params.loadingIcon);
        }
        if (icon === 'play') {
            el.html(this.params.playIcon);
        }
        if (icon === 'pause') {
            el.html(this.params.pauseIcon);
        }
        if (icon === 'retry') {
            el.html(this.params.retryIcon);
        }
    },

    play: function (els, params) {
        $.each(els, function () {
            new player.Play(this, params);
        });
    },
};
$.fn.extend({
    ez_form_play: function (params) {
        player.play(this, params);
        return this;
    }
});
module.exports = player.Play;

