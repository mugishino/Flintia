import { useCallback, useMemo, useState } from "react";
import { CheckBox } from "~/components/CheckBox";
import { Setting } from "~/components/Setting";
import { SVGButton } from "~/components/SVGButton";
import { Clipboards } from "~/util/clipboard";

export function PassGenerator() {
    const [seed, setSeed] = useState(0);
    const [size, setSize] = useState(16);
    const [enableUpper, setEnableUpper] = useState(false);
    const [enableNumber, setEnableNumber] = useState(true);
    const [enableMarks, setEnableMarks] = useState(false);

    const WrapSetting = useCallback((props: {title: string, children: React.ReactNode}) => {
        return <Setting title={props.title} titleClassName="content-center" childClassName="flex justify-end w-16">{props.children}</Setting>;
    }, []);

    /** 暗号論的に安全な 0 以上 max 未満の乱数（剰余バイアスを避ける） */
    function randomInt(max: number): number {
        const range = 0x100000000; // 2^32
        const limit = range - (range % max);
        const buf = new Uint32Array(1);
        do {
            crypto.getRandomValues(buf);
        } while (buf[0] >= limit);
        return buf[0] % max;
    }

    function pick(chars: string): string {
        return chars[randomInt(chars.length)];
    }

    /** Fisher-Yates シャッフル */
    function shuffle<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = randomInt(i + 1);
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    const LOWER = "abcdefghijklmnopqrstuvwxyz";
    const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const NUMBER = "0123456789";
    const MARKS = "!@#$%^&*()-_=+[]{};:,.?";
    function generatePassword(): string {
        // 小文字は常に有効
        const sets: string[] = [LOWER];
        if (enableUpper) sets.push(UPPER);
        if (enableNumber) sets.push(NUMBER);
        if (enableMarks) sets.push(MARKS);

        if (!Number.isInteger(size) || size < sets.length) {
            throw new RangeError(
            `size は ${sets.length} 以上の整数を指定してください`
            );
        }

        const all = sets.join("");

        // 有効な各文字種から最低1文字ずつ選ぶ
        const chars: string[] = sets.map(pick);

        // 残りは全体からランダムに選ぶ
        while (chars.length < size) {
            chars.push(pick(all));
        }

        // 先頭に必須文字が偏らないようシャッフル
        return shuffle(chars).join("");
    }

    const pass = useMemo(() => generatePassword(), [enableNumber, enableUpper, enableMarks, size, seed]);

    return (
        <div className="flex flex-col">
            <div className="flex flex-row">
                <button onClick={() => Clipboards.copyText(pass)}>{pass}</button>
                <SVGButton onClick={() => setSeed(seed+1)} src="refresh" className="border-l-0"/>
            </div>
            <div className="flex flex-row flex-wrap gap-y-1 mt-1 *:w-1/2 *:flex-row *:flex">
                <WrapSetting title="Size">
                    <input type="number" value={size} onChange={e => setSize(e.currentTarget.valueAsNumber.orDefault(8).keepRange(4, 32))}/>
                </WrapSetting>
                <WrapSetting title="Number">
                    <CheckBox checked={enableNumber} onClick={() => setEnableNumber(!enableNumber)}/>
                </WrapSetting>
                <WrapSetting title="Uppercase">
                    <CheckBox checked={enableUpper} onClick={() => setEnableUpper(!enableUpper)}/>
                </WrapSetting>
                <WrapSetting title="Marks">
                    <CheckBox checked={enableMarks} onClick={() => setEnableMarks(!enableMarks)}/>
                </WrapSetting>
            </div>
        </div>
    );
}
