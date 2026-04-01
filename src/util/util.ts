import { Falsy } from "./type";

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
 * 値がFalsyの場合、undefinedを返します。
 * 違う場合、callbackを実行します。
 * @param value null, undefinedの可能性がある値
 * @param callback 非nullの場合に実行されるコールバック
 * @returns undefinedまたはコールバックの返り値
 */
export function ifPresent<T, R>(value: T|Falsy, callback: (it: T) => R): R|undefined {
    return !!value ? callback(value as T) : undefined;
}

/**
 * Canvas要素を作成します。contextのモードは2dです。
 * @param width Canvasの横幅
 * @param height Canvasの縦幅
 * @returns Canvas要素など
 */
export function createCanvas(
    width: number,
    height: number,
) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;

    return {
        width,
        height,
        canvas,
        ctx,
    };
}
