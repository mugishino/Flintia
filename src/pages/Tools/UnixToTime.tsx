import { useState } from "react";
import { copyText } from "~/util/clipboard";

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
    `${date.getUTCMilliseconds()}${zone>=0?"+":String.empty}${zone}00`;



    return (
        <div className="flex flex-col">
            <div className="flex flex-row">
                <input type="number" className="w-full" placeholder="UnixTime(ms)" value={time} onChange={e => setTime(e.currentTarget.valueAsNumber.orDefault(0))}/>
                <div className="flex flex-row">
                    <button className="w-10" onClick={() => setZone(zone-1)}>{"<"}</button>
                    <input type="number" placeholder="TimeZone" value={zone} onChange={e => setZone(e.currentTarget.valueAsNumber.orDefault(0))}/>
                    <button className="w-10" onClick={() => setZone(zone+1)}>{">"}</button>
                </div>
            </div>
            <button onClick={() => {
                copyText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 1000);
            }}>{copied ? "Copied!" : text}</button>
        </div>
    );
}
