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

    public async map_err_async(call: (err: E) => Promise<void>) {
        if (this.isErr) await call(this.error!);
        return this;
    }

    public map(call: (value: R) => void) {
        if (!this.isErr) call(this.value!);
        return this;
    }

    public async map_async(call: (value: R) => Promise<void>) {
        if (!this.isErr) await call(this.value!);
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
