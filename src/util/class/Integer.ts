export class Integer {
    public constructor(private value: number) {
        this.set(value);
    }

    public get() {
        return this.value.toInt();
    }

    public set(value: number) {
        this.value = value.toInt();
    }

    /**
     * 計算を行います。
     * @param fn 計算を行う関数
     */
    public calc(fn: (value: number) => number) {
        const result = fn(this.value);
        this.set(result);
    }
}
