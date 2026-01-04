import { readTextFile } from "@tauri-apps/plugin-fs";
import { TOTP } from "otpauth";
import { useRef, useState } from "react";
import Config from "~/Config";
import { Paths } from "~/util/path";
import { Clipboards } from "~/util/clipboard";
import { useEffectAsync } from "~/hooks/useEffectAsync";

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
        const isHover = useRef(false);

        setTimeout(() => {
            setTime(time-10);
            if (time <= 0) {
                const data = secretToNumber(props.secret);
                setCode(data.number);
                setTime(data.remaining);
            }
        }, 10);

        const colorLeft  = isHover.current ? "var(--color-auth-accent-hover)" : "var(--color-auth-accent)";
        const colorRight = isHover.current ? "var(--color-auth-hover)" : "var(--color-auth)";

        return (
            <div
            className="flex flex-row h-10 border-b px-2 justify-between cursor-pointer"
            style={{background: `linear-gradient(to right, ${colorLeft} ${time / 300}%, ${colorRight} 0)`}}
            onMouseOver ={() => isHover.current = true }
            onMouseLeave={() => isHover.current = false}
            onClick={() => {
                if (code == null) return;
                Clipboards.copyText(code, true);
            }}>
                <div className="flex items-center">{props.title}</div>
                <div className="my-auto text-3xl">{(code ?? String.empty).insert(String.space, 3)}</div>
            </div>
        );
    }



    const [errMsg, setErrMsg] = useState<string>(String.empty);
    const [loadData, setLoadData] = useState(new Map<string, string>());
    useEffectAsync(async() => {
        setErrMsg(String.empty);
        const file = (await Config.load()).authfile;
        if (await Paths.notExists(file)) return setErrMsg("Auth file not found");
        const read = await readTextFile(file);
        try {
            const map = JSON.toMap<string, string>(read);
            setLoadData(map);
        } catch (err) {
            setErrMsg(String(err));
        }
    }, []);

    return (
        <>
            <div className="text-center text-2xl border-b">Authentication</div>
            <div className="h-full overflow-y-scroll">
                <div className="text-fail">{errMsg}</div>
                {loadData.map((k, v) => <CodeView key={k} secret={v} title={k}/>)}
            </div>
        </>
    );
}
