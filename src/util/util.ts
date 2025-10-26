/**
 * setIntervalのラッパー。呼び出し時にもコールバックが実行される。
 * @param callback 実行する関数
 * @param delay ディレイ時間
 */
export function startInterval(callback: () => void, delay?: number) {
    callback();
    setInterval(callback, delay);
}
