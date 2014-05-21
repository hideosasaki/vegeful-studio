/**
 * fswebcamから標準入力経由でWebカメラのJPEG画像を受けとり、それをTweetする。
 * 画像はそのまま標準出力へ⇒ファイル保存のため
 * @author veeplant http://twilog.org/veeplant
 */

var Temperature = require('VegefulStudioTemperature');
var Twitter = require('Twitter');

// 取得したキーを設定してください
var _twit = new Twitter({
     consumer_key:       'xxxxxxxxxxxxxxxxxxxx',
     consumer_secret:    'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
     access_token_key:   'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
     access_token_secret:'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
});

// Twitter投稿オプション
var _opt;
// Twitter投稿文章
var _msg;

// 計測器を定義
var _temperature = new Temperature();
var _metres = [];
_metres[0]  = _temperature.outer; // 外部気温・湿度
_metres[1]  = _temperature.inner; // 内部気温・湿度
_metres[2]  = _temperature.water; // 水温

// 最初の計測器の開始
read();

// 標準入力からの画像データを蓄えるバッファ
var _mediaBuffer = [];

process.stdin.resume();

// 標準入力がくると発生するイベント
process.stdin.on('data', function (chunk) {
    process.stdout.write(chunk);
    _mediaBuffer.push(chunk);
});

// EOFがくると発生するイベント
process.stdin.on('end', function() {
    _opt = {'media[]': concatBuffer.apply(this, _mediaBuffer)};
    tweet();
});

// 計測サブルーチン
function read() {
    if (0 == _metres.length) {
        // 全計測器が完了した
        _msg =  'バジル・コリアンダー・パセリの現在の様子です。\n';
        _msg += '箱外の気温 ' + _temperature.outer.celsius.toFixed(1) + '℃ ' + ' 湿度 ' + _temperature.outer.humidity + '%\n';
        _msg += '箱内の気温 ' + _temperature.inner.celsius.toFixed(1) + '℃ ' + ' 湿度 ' + _temperature.inner.humidity + '%\n';
        _msg += '培地の水温 ' + _temperature.water.celsius.toFixed(1) + '℃\n';
        _msg += '☆毎日22:30に自動撮影・計測・ツイートしています。\n#ライブカメラ';
        tweet();
        return;
    }
    // 今回の計測器を実施
    var metre = _metres.shift();
    metre.measure(function(err) {
        if (err) {
            // エラーであればその内容を標準エラー出力
            console.warn('temperature error:', err);
        }
        // 次の計測器を開始(再帰)
        read();
    });
}

// ツイート実行
function tweet() {
    if (!_opt || !_msg) {
        // 画像または計測が終わってなければ次のタイミングを待つ
        return;
    } 
    _twit.updateStatus(_msg, _opt, function(err, res) {
        if (err) {
            console.warn('twitter post error:\n', err);
        } else {
            res.setEncoding('utf8');
            var data = JSON.parse(res.body);
            console.warn('twitter post success:\n');
            console.warn(data);
        }
    });
}

// バッファの連結
function concatBuffer(src1 /* , src2, ... */) {
    var i, buf, start;
    var len = 0;

    for (i = 0; i < arguments.length; ++i) {
        len += arguments[i].length;
    }

    buf = new Buffer(len);
    start = 0;
    for (i = 0; i < arguments.length; ++i) {
        var chunk = arguments[i];
        chunk.copy(buf, start, 0);
        start += chunk.length;
    }
    return buf;
}
