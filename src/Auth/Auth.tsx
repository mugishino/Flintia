import { readTextFile } from "@tauri-apps/plugin-fs";
import { TOTP } from "otpauth";
import React, { useState } from "react";
import { loadConfig } from "~/Config";
import { copyText, notExists, stringInject, useEffectAsync } from "~/util";

function secretToNumber(secret: string) {
    const res = new TOTP({
        secret: secret,
        digits: 6,
        period: 30,
        algorithm: "SHA1",
    });
    return {
        number: res.generate(),
        remaining: res.remaining(),
    };
}



export default function Auth() {
    function CodeView(props: {
        secret: string,
        title: string,
    }) {
        const res = secretToNumber(props.secret);
        const [code, setCode] = useState<string|null>(null);
        const [time, setTime] = useState(0);

        setTimeout(() => {
            setTime(time-100);
            if (time <= 0) {
                const data = secretToNumber(props.secret);
                setCode(data.number);
                setTime(data.remaining);
            }
        }, 100);

        return (
            <div className="flex flex-row border-b-1 border-border px-2 justify-between bg-layerA hover:bg-layerB cursor-pointer" onClick={() => {
                if (code == null) return;
                copyText(code, true);
            }}>
                <div>
                    <div className="">{props.title}</div>
                    <div>{(Math.floor(res.remaining/100)/10).toFixed(1)}</div>
                </div>
                <div className="my-auto text-3xl">{stringInject(code ?? "", " ", 3)}</div>
            </div>
        );
    }



    const [loadData, setLoadData] = useState(new Map<string, string>());
    useEffectAsync(async() => {
        const file = (await loadConfig()).authfile;
        if (await notExists(file)) return;
        const read = await readTextFile(file);
        const json = JSON.parse(read);
        setLoadData(new Map(Object.entries(json)));
    }, []);

    const result: React.JSX.Element[] = [];
    loadData.forEach((v, k) => {
        result.push(<CodeView key={k} secret={v} title={k}/>);
    });

    return (
        <>
            <div className="text-center text-2xl border-b-1 border-border">Authentication</div>
            <div className="h-full overflow-y-scroll">{result}</div>
        </>
    );
}
