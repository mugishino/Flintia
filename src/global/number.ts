export {};

declare global {
    interface Number {
        /**
         * 数値を整数にします。
         */
        toInt(): number;
        /**
         * 数値がNaNだった場合にデフォルトの値を返します。
         */
        orDefault(default_: number): number;
        /**
         * 数値を文字列にゼロ埋めして変換します。
         * @param size ゼロ埋め後の文字列長
         * @param includeMinus マイナスを文字数に含むか
         */
        toStringZero(size: number, includeMinus?: boolean): string;
        /**
         * 数値を範囲内に収めます。
         * @param min 最低値
         * @param max 最大値
         */
        keepRange(min: number, max: number): number;
    }
}

Number.prototype.toInt = function() {
    return Math.trunc(this.valueOf());
}

Number.prototype.orDefault = function(default_) {
    const num = this.valueOf()
    return isNaN(num) ? default_ : num;
}

Number.prototype.toStringZero = function(size, includeMinus=false) {
    const num = this.valueOf();
    const numStr = num.toString();
    const isMinus = num < 0;
    const zeroSize = size - numStr.length - (includeMinus&&isMinus?1:0);
    return numStr.insert("0".repeat(zeroSize < 0 ? 0 : zeroSize), isMinus?1:0).slice(0, size + (!includeMinus&&isMinus?1:0));
}

Number.prototype.keepRange = function(min, max) {
    return Math.max(min, Math.min(max, this.valueOf()))
}
