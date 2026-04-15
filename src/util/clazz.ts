export class Pair<L, R> {
    constructor(public left: L, public right: R) {}

    public clone() {
        return new Pair(this.left, this.right);
    }
}
