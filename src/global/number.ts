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
    }
}

Number.prototype.toInt = function() {
    return Math.trunc(this.valueOf());
}

Number.prototype.orDefault = function(default_: number) {
    return isNaN(this.valueOf()) ? default_ : this.valueOf();
}
