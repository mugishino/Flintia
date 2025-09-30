export {};

declare global {
    interface JSON {
        /**
         * JSON文字列をMapにします。
         * 内部でJSON.parseを使用しています。
         * 正確な型は保証されません。
         * @param stringJson 変換するJSON文字列
         */
        toMap<KT, VT>(stringJson: string): Map<KT, VT>;
    }
}

JSON.toMap = function<KT, VT>(stringJson: string) {
    const raw = JSON.parse(stringJson);
    const obj = Object.entries(raw);
    return new Map<KT, VT>(obj as any);
}
