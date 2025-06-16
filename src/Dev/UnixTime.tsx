import { useEffect, useState } from "react";
import { Button } from "~/Components";

export default function UnixTime() {
    const [time, setTime] = useState(Date.now());
    useEffect(() => {
        setInterval(() => {
            setTime(Date.now());
        }, 100);
    }, []);

    return <Button onClick={() => navigator.clipboard.writeText(time.toString())}>{time.toString()}</Button>;
}
