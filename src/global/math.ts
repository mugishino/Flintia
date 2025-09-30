export {};

declare global {
    interface Math {
        /**
         * 小数点台digit位以下の値を切り捨てます。
         * @param value 切り捨て元の数字
         * @param digit 残す小数点桁数
         */
        floorEx(value: number, digit: number): void;
    }
}

Math.floorEx = function(value: number, digit: number) {
    const x = 10**digit;
    return Math.floor(value*x)/x;
}
