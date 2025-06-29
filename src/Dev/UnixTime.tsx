import { useEffect, useState } from "react";

export default function UnixTime() {
    const [time, setTime] = useState(Date.now());
    useEffect(() => {
        setInterval(() => {
            setTime(Date.now());
        }, 100);
    }, []);

    return <button onClick={() => navigator.clipboard.writeText(time.toString())}>{time.toString()}</button>;
}
