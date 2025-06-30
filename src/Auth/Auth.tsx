import { readTextFile } from "@tauri-apps/plugin-fs";
import { TOTP } from "otpauth";
import React, { useState } from "react";
import Config from "~/Config";
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
        const [code, setCode] = useState<string|null>(null);
        const [time, setTime] = useState(0);

        setTimeout(() => {
            setTime(time-10);
            if (time <= 0) {
                const data = secretToNumber(props.secret);
                setCode(data.number);
                setTime(data.remaining);
            }
        }, 10);

        return (
            <div
            className="flex flex-row h-10 border-b-1 border-border px-2 justify-between hover:bg-layerB cursor-pointer hover:brightness-150"
            style={{background: `linear-gradient(to right, #08f3 ${time / 300}%, #181818 0)`}}
            onClick={() => {
                if (code == null) return;
                copyText(code, true);
            }}>
                <div className="flex items-center">{props.title}</div>
                <div className="my-auto text-3xl">{stringInject(code ?? String.empty, String.space, 3)}</div>
            </div>
        );
    }



    const [errMsg, setErrMsg] = useState<string>(String.empty);
    const [loadData, setLoadData] = useState(new Map<string, string>());
    useEffectAsync(async() => {
        setErrMsg(String.empty);
        const file = (await Config.load()).authfile;
        if (await notExists(file)) return;
        const read = await readTextFile(file);
        try {
            const json = JSON.parse(read);
            setLoadData(new Map(Object.entries(json)));
        } catch (err) {
            setErrMsg(String(err));
        }
    }, []);

    const result: React.JSX.Element[] = [];
    loadData.forEach((v, k) => {
        result.push(<CodeView key={k} secret={v} title={k}/>);
    });

    return (
        <>
            <div className="text-center text-2xl border-b-1 border-border">Authentication</div>
            <div className="h-full overflow-y-scroll">
                <div className="text-fail">{errMsg}</div>
                {result}
            </div>
        </>
    );
}
