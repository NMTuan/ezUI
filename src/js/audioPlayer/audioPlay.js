var jQueryBridget = require('jquery-bridget');
var Draggabilly = require('draggabilly');   //鼠标拖拽
jQueryBridget('draggabilly', Draggabilly, $);
var dayjs = require('dayjs');
var audioPlayer = {
    defaults: {},
    params: {},
    player: null,   //播放器
    template: function () {
        var el = $("<div>");
        var html = '' +
            '<div class="ez audio-player">' +
            '<div class="ez audio-player-header layui-clear">' +
            '<div id="audio_title" class="ez audio-player-title">播放器</div>' +
            '</div>' +
            '<table class="ez audio-player-wave">' +
            '<tr>' +
            '<td width="12"></td>' +
            '<td class="waveform"></td>' +
            '<td width="12"></td>' +
            '</tr>' +
            '</table>' +
            '<div class="ez audio-player-ctrl">' +
            '<div id="audio_play" class="ez audio-player-play"><i class="fa fa-play"></i></div>' +
            '<div id="audio_pause" class="ez audio-player-pause"><i class="fa fa-pause"></i></div>' +
            '<div id="audio_refresh" class="ez audio-player-refresh"><i class="fa fa-sync-alt"></i></div>' +
            '<div id="audio_loading" class="ez audio-player-loading"><i class="fas fa-spinner fa-pulse"></i></div>' +
            '<div id="audio_volume" class="ez audio-player-volume">' +
            '<i class="fa fa-volume-down"></i>' +
            '<span>100%</span>' +
            '<i class="fa fa-volume-up"></i>' +
            '</div>' +
            // '<div id="audio_volume" class="ez audio-player-volume"><i class="fa fa-volume-up"></i></div>' +
            // '<div id="audio_volume-bar" class="ez audio-player-volume-bar demo-slider"></div>' +
            '<div class="ez audio-player-time">' +
            '<span id="audio_time_current" class="ez audio-player-time_current">00:00</span>/ <span id="audio_time_duration" class="ez audio-player-time_duration">00:00</span>' +
            '</div>' +
            '</div>' +
            '<i id="audio_close" class="ez audio-player-close remixicon-close-line"></i>' +
            '</div>' +
            '' +
            '';
        el.append(html);
        audioPlayer.player = el;
        return el;
    },
    //格式化时间
    formatTime: function (second) {
        if (typeof dayjs != 'function') {
            return second;
        } else {
            return dayjs(second * 1000).format('mm:ss');
        }
    },
    //显示播放器
    showState: false,
    show: function () {
        //没播放器，生成并插入，初始化频谱，绑定事件
        if (audioPlayer.showState === false) {
            audioPlayer.showState = true;
            $('body').append(audioPlayer.template());
            audioPlayer.player.draggabilly({
                handle: '.audio-player-header',
                // containment: 'html'
            });
            //初始位置
            audioPlayer.player.draggabilly('setPosition', 100, 100);

            audioPlayer.waveInit();
            audioPlayer.waveEvent();
        }
        return audioPlayer.wave;
    },
    //初始化播放器
    wave: '',
    waveInit: function () {
        var container = audioPlayer.player.find('.waveform')[0] || '.waveform';
        audioPlayer.wave = WaveSurfer.create({
            autoCenter: true,   //如果存在滚动条，则将波形置于进度的中心。
            barWidth: 1,
            container: container,
            cursorColor: '#1e88e5',
            height: 32,
            hideScrollbar: true,    //是否在通常显示水平滚动条时隐藏水平滚动条。
            normalize: true,    //最大峰值算100%
            progressColor: '#1e88e5',   //播放过的颜色
            // partialRender: true, //缓存，提高速度，实际使用，发现有时候音谱会不显示。
            scrollParent: true, //波形图超出容器宽度，是否滚动
            splitChannels: true,    //分音轨
            waveColor: '#93959b'   //默认颜色
        });
    },
    waveEvent: function () {
        var wave = audioPlayer.wave;
        var el = audioPlayer.player;
        var dt;
        var playBtn = el.find('#audio_play');
        var pauseBtn = el.find('#audio_pause');
        var refreshBtn = el.find('#audio_refresh');
        var loadingBtn = el.find('#audio_loading');
        var closeBtn = el.find('#audio_close');
        var volumeBtn = el.find('#audio_volume');
        var currentVolume = 1;
        var volumeStep = 0.1;
        var msgId;
        //播放
        playBtn.on('click', function () {
            wave.play();
        });
        //暂停
        pauseBtn.on('click', function () {
            wave.pause();
        });
        //重试
        refreshBtn.on('click', function () {
            if (layer) {
                layer.close(msgId);
            }
            play(fileSrc);
        });
        //关闭
        closeBtn.on('click', function () {
            el.remove();
            audioPlayer.showState = false;
            clearInterval(dt);
            if (wave) {
                wave.destroy();
            }
        });
        //音量
        volumeBtn.on('click', 'i', function () {
            var step = volumeStep;
            if ($(this).hasClass('fa-volume-down')) {
                step = 0 - volumeStep;
            }
            currentVolume = currentVolume + step;
            if (currentVolume <= 0) {
                currentVolume = 0;
            }
            if (currentVolume >= 2) {
                currentVolume = 2;
            }
            wave.setVolume(currentVolume.toFixed(1));
            var p = currentVolume.toFixed(1) * 100;
            p = parseInt(p);
            volumeBtn.find('span').text(p + '%');
        });

        //监听
        wave.on('play', function () {
            playBtn.hide();
            pauseBtn.show();
            loadingBtn.hide();
            refreshBtn.hide();
            dt = setInterval(function () {
                $('#audio_time_current').text(audioPlayer.formatTime(wave.getCurrentTime().toFixed(0)));
            }, 300);
        });
        wave.on('pause', function () {
            playBtn.show();
            pauseBtn.hide();
            loadingBtn.hide();
            refreshBtn.hide();
            clearInterval(dt);
        });
        wave.on('ready', function () {
            $('#audio_time_duration').text(audioPlayer.formatTime(wave.getDuration().toFixed(0)));
            wave.play();
        });
        wave.on('loading', function () {
            playBtn.hide();
            pauseBtn.hide();
            loadingBtn.show();
            refreshBtn.hide();
            clearInterval(dt);
        });
        wave.on('error', function (string) {
            if (layer) {
                msgId = layer.msg('音频加载异常，请稍后重试！');
            }
            playBtn.hide();
            pauseBtn.hide();
            loadingBtn.hide();
            refreshBtn.show();
        });
    },
    play: function (src, title) {
        var wave = audioPlayer.show();
        wave.load(src);
        audioPlayer.titleSet(title);
    },
    titleSet: function (title) {
        audioPlayer.player.find('#audio_title').text(title);
    }
};

$.fn.audioPlayer = function (src, title) {
    src = src || $(this).data('src');
    title = title || $(this).data('title') || '播放器';
    $(this).on('click', function () {
        audioPlayer.play(src, title);
    });
    return this;
};

module.exports = audioPlayer.play;
