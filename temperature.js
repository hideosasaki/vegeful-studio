/**
 * Beaglebone Blackで温度、湿度を測る。
 * @author veeplant http://twilog.org/veeplant
 */

require('date-utils');
var Temperature = require('VegefulStudioTemperature');

// 開始を標準エラー出力
console.warn(new Date().toFormat('YYYY/MM/DD HH24:MI:SS'), 'process start');
// date,"outer temperature(c)","outer humidity(%)","inner temperature(c)","inner humidity(%)","water temperature(c)"

// 計測器を定義
var _temperature = new Temperature();
var _metres = [];
_metres[0]  = _temperature.outer; // 外部気温・湿度
_metres[1]  = _temperature.inner; // 内部気温・湿度
_metres[2]  = _temperature.water;  

// ログ(CSV形式)の最初の列である日付
var _logLine = new Date().toFormat('YYYY/MM/DD HH24:MI');
// 最初の計測器の開始
_read();
// 計測サブルーチン
function _read() {
    if (0 == _metres.length) {
        // 全計測器が完了したらCSVを標準出力
        console.log(_logLine);
        // 全完了を標準エラー出力
        console.warn(new Date().toFormat('YYYY/MM/DD HH24:MI:SS'), 'process end');
        return;
    }
    // 今回の計測器を実施
    var metre = _metres.shift();
    metre.measure(function(err) {
        if (err) {
            // エラーであればその内容を標準エラー出力
            console.warn(new Date().toFormat('YYYY/MM/DD HH24:MI:SS'), 'err:' + err);
        } else {
            // 読み取れたらCSVを追記
            _logLine += metre.toString();
        }
        // 次の計測器を開始(再帰)
        _read();
    });
}

