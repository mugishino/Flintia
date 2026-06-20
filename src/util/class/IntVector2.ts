import { Integer } from "./Integer";

export class IntVector2 {
    public constructor(public x: Integer, public y: Integer) {}

    public getDistanceFromXY(x: number, y: number) {
        return Math.sqrt(Math.pow(x - this.x.get(), 2) + Math.pow(y - this.y.get(), 2));
    }
}
