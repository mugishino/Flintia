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



    public onFailure(call: (err: E) => void) {
        if (this.isErr) call(this.error!);
        return this;
    }

    public async onFailureAsync(call: (err: E) => Promise<void>) {
        if (this.isErr) await call(this.error!);
        return this;
    }

    public onSuccess(call: (value: R) => void) {
        if (!this.isErr) call(this.value!);
        return this;
    }

    public async onSuccessAsync(call: (value: R) => Promise<void>) {
        if (!this.isErr) await call(this.value!);
        return this;
    }

    public map<N>(call: (value: R) => N): Result<N, E> {
        if (this.isErr) return Result.Err<E, N>(this.error!);
        return Result.Ok<N, E>(call(this.value!));
    }

    public map_err<N>(call: (err: E) => N): Result<R, N> {
        if (this.isErr) return Result.Err(call(this.error!));
        return Result.Ok<R, N>(this.value!);
    }

    public unwrap() {
        return this.value;
    }

    public unwrap_err() {
        return this.error;
    }

    public inspect(fn: (v: R) => void) {
        if (!this.isErr) fn(this.value!);
        return this;
    }

    public inspect_err(fn: (e: E) => void) {
        if (this.isErr) fn(this.error!);
        return this;
    }
}
