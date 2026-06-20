export class Pair<L, R> {
    constructor(public left: L, public right: R) {}

    public clone() {
        return new Pair(this.left, this.right);
    }
}

export class Result<R, E> {
    private constructor(private value: R|undefined, private error: E|undefined, public isErr: boolean) {}

    public static Ok<R, E=any>(value: R) {
        return new Result<R, E>(value, undefined, false);
    }

    public static Err<E, R=any>(value: E) {
        return new Result<R, E>(undefined, value, true);
    }

    /** Promiseのthen, catchでいいと思うかもしれないが、型補完が弱い */
    public static async fromPromise<R, E>(value: Promise<R>) {
        return await value.then(v => Result.Ok<R, E>(v)).catch(v => Result.Err<E, R>(v as E));
    }



    public map_err(call: (err: E) => void) {
        if (this.isErr) call(this.error!);
        return this;
    }

    public map(call: (value: R) => void) {
        if (!this.isErr) call(this.value!);
        return this;
    }

    public unwrap() {
        return this.value;
    }

    public inspect() {
        return this.value;
    }

    public inspect_err() {
        return this.error;
    }
}

export class IntVector2 {
    public constructor(public x: Integer, public y: Integer) {}

    public getDistanceFromXY(x: number, y: number) {
        return Math.sqrt(Math.pow(x - this.x.get(), 2) + Math.pow(y - this.y.get(), 2));
    }
}

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
