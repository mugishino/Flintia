import { Falsy, Nullable } from "./type";

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
 * @param callback 非nullの場合に実行されるコールバック。未指定の場合はそのまま返す
 * @returns undefinedまたはコールバックの返り値
 */
export function ifPresent<T, R>(value: T|Falsy, callback?: (it: T) => R): R|undefined {
    if (!value) return undefined;
    return callback ? callback(value as T) : value as R;
}

/**
 * 値がnullableの場合はデフォルトを返し、存在する場合はそのまま返します。
 * @param value Nullableか検証する値
 * @param fallback デフォルトの値
 * @returns デフォルトまたはそのまま
 */
export function orDefault<T>(value: Nullable<T>, fallback: T) {
    return value ? value : fallback;
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
