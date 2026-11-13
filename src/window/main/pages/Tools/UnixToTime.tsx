import { useState } from "react";
import { Select } from "~/components/Select";
import { BUTTON_MSG_TIMEOUT } from "~/Data";
import { Clipboards } from "~/util/clipboard";

export function UnixToTime() {
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
                <Select list={new Map([
                    "UTC-12 UTC+12より1日遅い",
                    "UTC-11 ミッドウェー島, UTC+13より1日遅い",
                    "UTC-10 ハワイ",
                    "UTC-09 アラスカ",
                    "UTC-08 太平洋標準時(米, カナダ), バハカリフォルニア",
                    "UTC-07 山岳標準時(米, カナダ), アリゾナ",
                    "UTC-06 中部標準時(米, カナダ), 中央メキシコ",
                    "UTC-05 東部標準時(米, カナダ), ニューヨーク",
                    "UTC-04 ニューヨーク(夏時間), チリ",
                    "UTC-03 アルゼンチン",
                    "UTC-02 ブラジル(フェルナンド・デ・ノローニャ)",
                    "UTC-01 アゾレス諸島, カーボベルデ",
                    "UTC+00 協定世界時, イギリス", // UTC+0000
                    "UTC+01 アムステルダム",
                    "UTC+02 ウクライナ, ギリシャ",
                    "UTC+03 モスクワ, サウジアラビア, ベラルーシ",
                    "UTC+04 アゼルバイジャン, アラブ首長国連邦",
                    "UTC+05 パキスタン",
                    "UTC+06 カザフスタン, バングラデシュ",
                    "UTC+07 タイ, ベトナム, インドネシア西部",
                    "UTC+08 香港, 北京",
                    "UTC+09 東京, 韓国, パラオ",
                    "UTC+10 グアム",
                    "UTC+11 ソロモン諸島",
                    "UTC+12 ニュージーランド",
                    "UTC+13 トンガ, サモア, UTC-11より1日早い",
                    "UTC+14 キリバス(ライン諸島), UTC-10より1日早い",
                ].map((v, i) => [-12+i, v]))} select={zone} onSelectChange={v => setZone(v)} className="w-1/2" labelClassName="truncate"/>
            </div>
            <button onClick={() => {
                Clipboards.copyText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), BUTTON_MSG_TIMEOUT);
            }}>{copied ? "Copied!" : text}</button>
        </div>
    );
}
