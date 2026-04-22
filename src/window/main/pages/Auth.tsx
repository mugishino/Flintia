import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { TOTP } from "otpauth";
import { useEffect, useRef, useState } from "react";
import { Config } from "~/Config";
import { Paths } from "~/util/path";
import { Clipboards } from "~/util/clipboard";
import { useEffectAsync } from "~/hooks/useEffectAsync";
import { AppStorage } from "~/AppStorage";
import { Overlay } from "~/components/Overlay";
import { OverlayWindow } from "~/components/OverlayWindow";
import { Line } from "~/components/Line";
import { useMapState } from "~/hooks/useMapState";
import { useStaticOverlay } from "~/hooks/useOverlay";
import { Pair } from "~/util/clazz";
import { readClipboardQRCode } from "~/module/QRCode";
import { Search } from "~/components/Search";

type AuthData = {
    label: string,
    code: string,
    disable?: boolean,
};

const UPDATE_RATE = 1000/60; // 60FPS

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

function CodeView(props: {
    secret: string,
    title: string,
    onAuxClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
}) {
    const [code, setCode] = useState<string|null>(null);
    const [time, setTime] = useState(0);
    const isHover = useRef(false);

    setTimeout(() => {
        setTime(time-UPDATE_RATE);
        if (time <= 0) {
            const data = secretToNumber(props.secret);
            setCode(data.number);
            setTime(data.remaining);
        }
    }, UPDATE_RATE);

    const colorLeft  = isHover.current ? "var(--color-auth-accent-hover)" : "var(--color-auth-accent)";
    const colorRight = isHover.current ? "var(--color-auth-hover)" : "var(--color-auth)";

    return (
        <div
        className="flex flex-row h-10 border-b px-2 justify-between cursor-pointer"
        style={{background: `linear-gradient(to right, ${colorLeft} ${time / 300}%, ${colorRight} 0)`}}
        onMouseOver ={() => isHover.current = true }
        onMouseLeave={() => isHover.current = false}
        onAuxClick={e => props.onAuxClick(e)}
        onClick={() => {
            if (code == null) return;
            Clipboards.copyText(code, true);
        }}>
            <div className="flex items-center">{props.title}</div>
            <div className="my-auto text-3xl">{(code ?? String.empty).insert(String.space, 3)}</div>
        </div>
    );
}


export function Auth() {
    const [errMsg, setErrMsg] = useState<string>(String.empty);
    const [search, setSearch] = useState(String.empty);
    // Label : Code
    const [loadData, setLoadData] = useMapState<string, AuthData>();
    const [viewData, setViewData] = useMapState<string, AuthData>();

    // add 2fa window
    const [addOverlay, showAddOverlay] = useState(false);
    const [label, setLabel] = useState(String.empty);
    const [code, setCode] = useState(String.empty);
    const [readQRMsg, setReadQRMsg] = useState<string|undefined>(undefined);

    // Edit overlay
    const [editData, setEditData] = useState<Pair<string, AuthData>|undefined>(undefined);

    // delete overlay
    const [staticOverlay, setStaticOverlay] = useStaticOverlay();



    // load
    useEffectAsync(async() => {
        setErrMsg(String.empty);
        const file = (await AppStorage.load(new Config())).authfile;
        if (await Paths.notExists(file)) return setErrMsg("Auth file not found");
        const read = await readTextFile(file);
        try {
            const map = JSON.toMap<string, AuthData>(read);
            setLoadData(map);
        } catch (err) {
            setErrMsg(String(err));
        }
    }, []);

    // save
    useEffectAsync(async() => {
        if (loadData.size == 0) return;
        const file = (await AppStorage.load(new Config())).authfile;
        const json = loadData.toJson(4);
        await writeTextFile(file, json);
    }, [loadData]);

    // update rendering
    useEffect(() => {
        const data = loadData.filter((_, v) => {
            // 無効データなら表示しない
            if (v.disable) return false;
            // 検索入力なしなら全て返す
            if (!search) return true;
            // 検索に合致すれば返す
            if (v.label.toLocaleLowerCase().includes(search.toLocaleLowerCase())) return true;
            return false;
        }).sort((a, b) => a.right.label.localeCompare(b.right.label));
        setViewData(data);
    }, [search, loadData]);




    return (
        <>
            {staticOverlay}
            <Search value={search} onUpdate={v => setSearch(v)} className="border-0 border-b"/>
            <div className="h-full overflow-y-scroll">
                <div className="text-fail">{errMsg}</div>
                {viewData.map((k, v) => <CodeView key={k} secret={v.code} title={v.label} onAuxClick={() => {
                    setLabel(v.label);
                    setEditData(new Pair(k, v));
                }}/>)}
            </div>
            <button className="border-0 border-t" onClick={() => {
                setLabel(String.empty);
                showAddOverlay(true);
            }}>Add 2FA</button>
            <Overlay show={addOverlay} setShow={showAddOverlay}>
                <OverlayWindow className="w-2/3 gap-1">
                    <button className={"text-fail".where(!!readQRMsg)} onClick={async () => {
                        const read = await readClipboardQRCode();
                        read.map_err(e => setReadQRMsg(e))
                            .map(r => {
                                const uri = new URL(r);
                                if (uri.protocol != "otpauth:") return setReadQRMsg("TOTPのQRコードではありません。");
                                const label = uri.pathname.substring(1);
                                const secret = uri.searchParams.get("secret");
                                if (!secret) return setReadQRMsg("データの取得に失敗しました。");
                                setLoadData(prev => prev.set(crypto.randomUUID(), {label: label, code: secret}))
                                showAddOverlay(false);
                            });
                        setTimeout(() => setReadQRMsg(undefined), 1500);
                    }}>{readQRMsg ?? "QRで追加"}</button>
                    <Line/>
                    <input placeholder="Label" value={label} onChange={e => setLabel(e.currentTarget.value)}/>
                    <input placeholder="Code" value={code} onChange={e => setCode(e.currentTarget.value)}/>
                    <button disabled={!label || !code} onClick={() => {
                        if (!loadData) return;
                        setLoadData(prev => prev.set(crypto.randomUUID(), {label: label, code: code}));
                        showAddOverlay(false);
                    }}>コードから追加</button>
                </OverlayWindow>
            </Overlay>
            <Overlay show={!!editData} setShow={() => setEditData(undefined)}>
                <OverlayWindow className="w-2/3 gap-1">
                    <div className="flex-row flex justify-between">
                        <span>編集</span>
                        <button className="w-fit text-fail" onClick={() => {
                            if (!editData) return;
                            setEditData(undefined);
                            setStaticOverlay(
                                <OverlayWindow error>
                                    <span>{editData.right.label}を削除しますか？</span>
                                    <button className="text-fail" onClick={() => setLoadData(prev => {
                                        setStaticOverlay(undefined);
                                        return prev.set(editData.left, {...editData.right, disable: true});
                                    })}>削除する</button>
                                </OverlayWindow>
                            );
                        }}>削除</button>
                    </div>
                    <input placeholder="Label" value={label} onChange={e => setLabel(e.currentTarget.value)}/>
                    <button onClick={() => {
                        if (!editData) return;
                        setLoadData(prev => prev.set(editData.left, {...editData.right, label: label}));
                        setEditData(undefined);
                    }}>保存</button>
                </OverlayWindow>
            </Overlay>
        </>
    );
}
