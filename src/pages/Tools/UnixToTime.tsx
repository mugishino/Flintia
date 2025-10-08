import { useState } from "react";
import { Clipboards } from "~/util/clipboard";

export default function UnixToTime() {
    const [copied, setCopied] = useState(false);

    // Time Data
    const [time, setTime] = useState<number>(0);
    const date = new Date(time);

    const [zone, setZone] = useState<number>(date.getTimezoneOffset() / -60);
    date.setUTCHours(date.getUTCHours()+zone);



    // view
    const text =
    `${date.getUTCFullYear()}年${date.getUTCMonth()+1}月${date.getUTCDate()}日 `+
    `${date.getUTCHours()}時${date.getUTCMinutes()}分${date.getUTCSeconds()}秒`+
    `${date.getUTCMilliseconds()} UTC${zone>=0?"+":String.empty}${zone}`;



    return (
        <div className="flex flex-col">
            <div className="flex flex-row">
                <input type="number" className="w-full" placeholder="UnixTime(ms)" value={time} onChange={e => setTime(e.currentTarget.valueAsNumber.orDefault(0))}/>
                <select value={zone} onChange={v => setZone(parseInt(v.currentTarget.value))}>{
                    [
                        "UTC+12より1日遅い",
                        "ミッドウェー島, UTC+13より1日遅い",
                        "ハワイ",
                        "アラスカ",
                        "太平洋標準時(米, カナダ), バハカリフォルニア",
                        "山岳標準時(米, カナダ), アリゾナ",
                        "中部標準時(米, カナダ), 中央メキシコ",
                        "東部標準時(米, カナダ), ニューヨーク",
                        "ニューヨーク(夏時間), チリ",
                        "アルゼンチン",
                        "ブラジル(フェルナンド・デ・ノローニャ)",
                        "アゾレス諸島, カーボベルデ",
                        "協定世界時, イギリス", // UTC+0000
                        "アムステルダム",
                        "ウクライナ, ギリシャ",
                        "モスクワ, サウジアラビア, ベラルーシ",
                        "アゼルバイジャン, アラブ首長国連邦",
                        "パキスタン",
                        "カザフスタン, バングラデシュ",
                        "タイ, ベトナム, インドネシア西部",
                        "香港, 北京",
                        "東京, 韓国, パラオ",
                        "グアム",
                        "ソロモン諸島",
                        "ニュージーランド",
                        "トンガ, サモア, UTC-11より1日早い",
                        "キリバス(ライン諸島), UTC-10より1日早い"
                    ].map((v, i) => {
                        const t = i-12;
                        return <option key={t+v} value={t}>UTC{t>=0?"+":String.empty}{t.toStringZero(2)} {v}</option>
                    })
                }</select>
            </div>
            <button onClick={() => {
                Clipboards.copyText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 1000);
            }}>{copied ? "Copied!" : text}</button>
        </div>
    );
}
