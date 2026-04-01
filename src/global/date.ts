export {};

declare global {
    interface Date {
        /**
         * 時刻をフォーマットして返します。
         * @param format フォーマット形式 (YYYY MM DD HH mm SS ss)
         */
        format(format: string, millisecondLength?: number): string;
    }

    interface DateConstructor {
        /**
         * 時刻をフォーマットして返します。
         * @param unixtime Unix時間
         * @param format フォーマット形式 (YYYY MM DD HH mm SS ss)
         */
        format(unixtime: number, format: string, millisecondLength?: number): string;
    }
}



Date.format = function(unixtime: number, format: string, millisecondLength?: number) {
    return new Date(unixtime).format(format, millisecondLength);
}

Date.prototype.format = function(format: string, millisecondLength?: number) {
    const date = this;
    const msLength = millisecondLength ?? 2;
    return format
        .replace("YYYY", date.getFullYear().toString())
        .replace("MM", (date.getMonth()+1).toStringZero(2))
        .replace("DD", date.getDate().toStringZero(2))
        .replace("HH", date.getHours().toStringZero(2))
        .replace("mm", date.getMinutes().toStringZero(2))
        .replace("SS", date.getSeconds().toStringZero(2))
        .replace("ss", date.getMilliseconds().toString().substring(0, msLength).padEnd(msLength, "0"))
        ;
}
