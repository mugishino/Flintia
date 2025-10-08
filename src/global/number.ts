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
         * @param includeMinus マイナスを文字数に含むか
         */
        toStringZero(size: number, includeMinus?: boolean): string;
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
    const minus = num < 0;
    const abs = Math.abs(num).toString();
    const numLength = abs.length;
    return (
        (minus?"-":String.empty)
        + "0".repeat(size - numLength - (includeMinus&&minus?1:0))
        + abs
    );
}
