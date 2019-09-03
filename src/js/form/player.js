var player = {
    defaults: {
        loadingIcon: '<i class="remixicon-loader-2-line"></i>',
        playIcon: '<i class="remixicon-play-fill"></i>',
        pauseIcon: '<i class="remixicon-pause-fill"></i>',
        retryIcon: '<i class="remixicon-refresh-line"></i>',
    },
    playWave: '',   //播放器
    playUrl: '',    //当前播放地址
    Play: function (el, params) {
        var s = this;
        s.el = $(el);
        s.params = $.extend(true, {}, player.defaults, params);
        player.events.call(s);
    },
    initWavesurfer: function () {
        var s = this;
        if (player.playWave) {
            player.playWave.destroy();
            player.playWave = '';
        }
        var container = s.el.closest('.ez-form-flex').find('.ez-form-wave')[0];
        var height = s.el.outerHeight();
        player.playWave = WaveSurfer.create({
            container: container,
            autoCenter: true,   //如果存在滚动条，则将波形置于进度的中心。
            barWidth: 1,
            height: height,
            hideScrollbar: true,    //是否在通常显示水平滚动条时隐藏水平滚动条。
            normalize: true,    //最大峰值算100%
            // partialRender: true, //缓存，提高速度，实际使用，发现有时候音谱会不显示。
            // scrollParent: true, //波形图超出容器宽度，是否滚动
            // splitChannels: true,    //分音轨

        });
        // player.playWave.on('loading', function () {
        //     console.log('loading');
        // });
        player.playWave.on('ready', function () {
            console.log('ready');
            player.changeIcon.call(s, 'pause');
            player.playWave.play();
        });
        player.playWave.on('play', function () {
            console.log('play');
            player.changeIcon.call(s, 'pause');
        });
        player.playWave.on('pause', function () {
            console.log('pause');
            player.changeIcon.call(s, 'play');
        });
        player.playWave.on('destroy', function () {
            console.log('destroy');
            player.changeIcon.call(s, 'play');
        });
        player.playWave.on('error', function () {
            console.log('error');
            player.changeIcon.call(s, 'retry');
        });
    },

    events: function () {
        var s = this;
        var el = s.el;
        el.on('click', function () {
            var url = el.data('src') || el.attr('src') || el.attr('href');
            if(!url){
                return;
            }
            //判断状态
            if(player.playUrl === url){ //要播放的就是当前播放的, 则切换播放状态
                player.playWave.playPause();
            } else {    //否则, 重新加载
                console.log('loading');
                player.initWavesurfer.call(s);
                player.changeIcon.call(s, 'loading');
                player.playWave.load(url);
                player.playUrl = url;
            }
        });
    },
    // position: function () {
    //
    // },
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

