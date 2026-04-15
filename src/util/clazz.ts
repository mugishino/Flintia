export class Pair<L, R> {
    constructor(public left: L, public right: R) {}

    public clone() {
        return new Pair(this.left, this.right);
    }
}

export class Result<R, E> {
    private constructor(private value: R, private error: E, public isErr: boolean) {}

    public static Ok<R>(value: R) {
        return new Result<R, any>(value, undefined, false);
    }

    public static Err<E>(value: E) {
        return new Result<any, E>(undefined, value, true);
    }



    public map_err(call: (err: E) => void) {
        if (this.isErr) call(this.error);
        return this;
    }

    public map(call: (value: R) => void) {
        if (!this.isErr) call(this.value);
        return this;
    }

    public unwrap() {
        return this.value;
    }
}
