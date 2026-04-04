import { useState } from "react";

export function Roulette() {
    const [text, setText] = useState(String.empty);
    const [choice, setChoice] = useState<string|undefined>(undefined);
    const [streak, setStreak] = useState(0);

    // 抽選候補
    const candidate = text.trim().split("\n").filter(v => !!v);

    function spin() {
        // ルーレット
        const rand = Math.random() * candidate.length;
        const result = candidate[rand.toInt()];
        setChoice(result);
        // 連続していれば記録を更新
        setStreak(result == choice ? streak+1 : 0);
    }

    return (
        <div className="flex flex-col h-full w-full">
            <button className="border-0 border-b active:text-green-400 active:bg-layerA" disabled={candidate.length <= 1} onClick={spin}>{choice ?? "SPIN"}{streak == 0 ? undefined : " x"+streak}</button>
            <textarea value={text} onChange={e => {
                setText(e.currentTarget.value);
                setChoice(undefined);
                setStreak(0);
            }} className="h-full resize-none overflow-y-scroll" placeholder="改行で区切り"/>
        </div>
    );
}
