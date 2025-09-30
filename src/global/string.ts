export {};

declare global {
    interface StringConstructor {
        empty: string;
        space: string;
    }

    interface String {
        inject: (text: string, pos: number) => string;
    }
}

String.empty = "";
String.space = " ";

String.prototype.inject = function(text: string, pos: number) {
    const x = this.slice(0, pos);
    const y = this.slice(pos);
    return x + text + y;
}
