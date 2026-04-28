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
}

export class IntVector2 {
    public constructor(private x: number, private y: number) {}

    public setX(value: number) {
        this.x = value;
    }

    public getX() {
        return this.x.toInt();
    }

    public setY(value: number) {
        this.y = value;
    }

    public getY() {
        return this.y.toInt();
    }

    public getDistanceFromXY(x: number, y: number) {
        return Math.sqrt(Math.pow(x - this.getX(), 2) + Math.pow(y - this.getY(), 2));
    }
}
