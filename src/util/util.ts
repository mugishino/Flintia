/**
 * setIntervalのラッパー。呼び出し時にもコールバックが実行される。
 * @param callback 実行する関数
 * @param delay ディレイ時間
 */
export function startInterval(callback: () => void, delay?: number) {
    callback();
    setInterval(callback, delay);
}

/**
 * 時刻をフォーマットして返します。
 * @param unixtime Unix時間
 * @param timezone タイムゾーン
 * @param format フォーマット形式 (YYYY MM DD HH mm SS ss)
 */
export function formatDate(unixtime: number, format: string) {
    const date = new Date(unixtime);
    return format
        .replace("YYYY", date.getFullYear().toString())
        .replace("MM", (date.getMonth()+1).toStringZero(2))
        .replace("DD", date.getDate().toStringZero(2))
        .replace("HH", date.getHours().toStringZero(2))
        .replace("mm", date.getMinutes().toStringZero(2))
        .replace("SS", date.getSeconds().toStringZero(2))
        .replace("ss", date.getMilliseconds().toStringZero(2))
        ;
}

/**
 * 値がFalsyの場合、undefinedを返します。
 * 違う場合、callbackを実行します。
 * @param value null, undefinedの可能性がある値
 * @param callback 非nullの場合に実行されるコールバック
 * @returns undefinedまたはコールバックの返り値
 */
export function ifPresent<T, R>(value: T, callback: (it: T) => R): R|undefined {
    return !!value ? callback(value) : undefined;
}
