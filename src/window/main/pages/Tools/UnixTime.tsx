import { useEffect, useState } from "react";
import { Clipboards } from "~/util/clipboard";

export default function UnixTime() {
    const [time, setTime] = useState(Date.now());
    useEffect(() => {
        setInterval(() => {
            setTime(Date.now());
        }, 100);
    }, []);

    return <button onClick={() => Clipboards.copyText(time.toString())}>{time.toString()}</button>;
}
