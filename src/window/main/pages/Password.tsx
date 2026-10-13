import { useCallback, useMemo, useRef, useState } from "react";
import { flintiaConfig } from "~/Config";
import { Clipboards } from "~/util/clipboard";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { Paths } from "~/util/path";
import { ToggleSwitch } from "~/components/ToggleSwitch";
import { useEffectAsync } from "~/hooks/useEffectAsync";
import { SVGButton } from "~/components/SVGButton";
import { Overlay } from "~/components/Overlay";
import { OverlayWindow } from "~/components/OverlayWindow";
import { Line } from "~/components/Line";
import { useMapState } from "~/hooks/useMapState";
import { useStaticOverlay } from "~/hooks/useOverlay";
import { Search } from "~/components/Search";
import { UUIDGenerator } from "./Tools/UUIDGenerator";
import { useFlintiaNavigate } from "~/Routing";
import { Setting } from "~/components/Setting";
import { CheckBox } from "~/components/CheckBox";

interface PassRecord {
    title   ?: string;
    username?: string;
    mail    ?: string;
    password?: string;
    note    ?: string;
    archive ?: boolean;
}

function PasswordSVGButton({src, value, onClick}: {src: string, value?: string, onClick?: () => void}) {
    return <SVGButton src={src} disabled={!value} onClick={onClick}/>;
}

function DataRow(props: {data: PassRecord, onAuxClick?: () => void, paste: boolean}) {
    const data = props.data;
    function pasteClick(value?: string) {
        Clipboards.copyText(value ?? String.empty, props.paste);
    }

    return (
        <div className="flex flex-row h-10 border-b hover:[&>span]:bg-layerA">
            <div
                className={`grow pl-1 text-2xl truncate flex items-center hover:bg-button-hover ${"text-text-gray".where(!!data.archive)} ${"underline".where(!!data.note)}`}
                title={data.note}
                onAuxClick={props.onAuxClick}
            >{data.title}</div>
            <PasswordSVGButton src="user.svg" value={data.username} onClick={() => pasteClick(data.username)}/>
            <PasswordSVGButton src="mail.svg" value={data.mail} onClick={() => pasteClick(data.mail)}/>
            <PasswordSVGButton src="password.svg" value={data.password} onClick={() => pasteClick(data.password)}/>
        </div>
    );
}

function EditUI(props: {
    initEditData: PassRecord,
    isEdit: boolean,
    onConfirmed: (data: PassRecord) => void,
    key: React.Key
}) {
    const [editData, setEditDataRaw] = useState<PassRecord>(props.initEditData);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [staticOverlay, setStaticOverlay] = useStaticOverlay();

    /**
     * setEditDataRawのラッパー。一部の値の上書きが簡潔に。
     * @param key 値を設定するキー
     * @param value 設定する値
     */
    function setEditData<K extends keyof PassRecord>(key: K, value: PassRecord[K]) {
        setEditDataRaw(prev => ({...prev, [key]: value}));
    }
    const isArchive = editData.archive;

    return (
        <>
            {staticOverlay}
            <div className="flex flex-row justify-between">
                <span className="m-auto">{props.isEdit ? "データ編集" : "新規追加"}</span>
                <button className={`w-auto text-fail ${"hidden".where(!props.isEdit)}`} onClick={() => {
                    setStaticOverlay(
                        <OverlayWindow error>
                            <span>本当に{editData?.title}をアーカイブ{isArchive ? "から戻" : "化"}しますか？</span>
                            <button className="text-fail" onClick={() => {
                                // setEditDataをしてもeditDataは次のレンダリングまで書き換わらないので新しく作る
                                const data: PassRecord = {...editData, archive: !isArchive};
                                props.onConfirmed(data);
                                // close overlay
                                setStaticOverlay(undefined);
                            }}>はい</button>
                        </OverlayWindow>
                    );
                }}>{isArchive ? "アーカイブから戻す" : "アーカイブ化"}</button>
            </div>
            <input placeholder="Title"       value={editData?.title     ?? String.empty} onChange={e => setEditData("title"   , e.currentTarget.value)}/>
            <input placeholder="Username"    value={editData?.username  ?? String.empty} onChange={e => setEditData("username", e.currentTarget.value)}/>
            <input placeholder="MailAddress" value={editData?.mail      ?? String.empty} onChange={e => setEditData("mail"    , e.currentTarget.value)}/>
            <div className="flex flex-row gap-1">
                <input placeholder="Password" type={passwordVisible ? "text" : "password"} value={editData?.password  ?? String.empty} onChange={e => setEditData("password", e.currentTarget.value)}/>
                <SVGButton src={passwordVisible ? "visibility.svg" : "visibility_off.svg"} className="grow aspect-square" onClick={() => setPasswordVisible(prev => !prev)}/>
            </div>
            <textarea className="h-20 border resize-none" placeholder="Note" value={editData?.note ?? String.empty} onChange={e => setEditData("note", e.currentTarget.value)}/>
            <Line/>
            <button disabled={!editData?.title} onClick={() => {
                if (!editData) return;
                props.onConfirmed(editData);
            }}>保存</button>
        </>
    );
}

function PassGenerator() {
    const [seed, setSeed] = useState(0);
    const [size, setSize] = useState(16);
    const [enableUpper, setEnableUpper] = useState(false);
    const [enableNumber, setEnableNumber] = useState(true);
    const [enableMarks, setEnableMarks] = useState(false);

    const WrapSetting = useCallback((props: {title: string, children: React.ReactNode}) => {
        return <Setting title={props.title} titleClassName="content-center" childClassName="flex justify-end w-16">{props.children}</Setting>;
    }, []);

    /** 暗号論的に安全な 0 以上 max 未満の乱数（剰余バイアスを避ける） */
    function randomInt(max: number): number {
        const range = 0x100000000; // 2^32
        const limit = range - (range % max);
        const buf = new Uint32Array(1);
        do {
            crypto.getRandomValues(buf);
        } while (buf[0] >= limit);
        return buf[0] % max;
    }

    function pick(chars: string): string {
        return chars[randomInt(chars.length)];
    }

    /** Fisher-Yates シャッフル */
    function shuffle<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = randomInt(i + 1);
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    const LOWER = "abcdefghijklmnopqrstuvwxyz";
    const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const NUMBER = "0123456789";
    const MARKS = "!@#$%^&*()-_=+[]{};:,.?";
    function generatePassword(): string {
        // 小文字は常に有効
        const sets: string[] = [LOWER];
        if (enableUpper) sets.push(UPPER);
        if (enableNumber) sets.push(NUMBER);
        if (enableMarks) sets.push(MARKS);

        if (!Number.isInteger(size) || size < sets.length) {
            throw new RangeError(
            `size は ${sets.length} 以上の整数を指定してください`
            );
        }

        const all = sets.join("");

        // 有効な各文字種から最低1文字ずつ選ぶ
        const chars: string[] = sets.map(pick);

        // 残りは全体からランダムに選ぶ
        while (chars.length < size) {
            chars.push(pick(all));
        }

        // 先頭に必須文字が偏らないようシャッフル
        return shuffle(chars).join("");
    }

    const pass = useMemo(() => generatePassword(), [enableNumber, enableUpper, enableMarks, size, seed]);

    return (
        <div className="flex flex-col">
            <div className="flex flex-row">
                <button onClick={() => Clipboards.copyText(pass)}>{pass}</button>
                <SVGButton onClick={() => setSeed(seed+1)} src="refresh" className="border-l-0"/>
            </div>
            <div className="flex flex-row flex-wrap gap-y-1 mt-1 *:w-1/2 *:flex-row *:flex">
                <WrapSetting title="Size">
                    <input type="number" value={size} onChange={e => setSize(e.currentTarget.valueAsNumber.orDefault(8).keepRange(4, 32))}/>
                </WrapSetting>
                <WrapSetting title="Number">
                    <CheckBox checked={enableNumber} onClick={() => setEnableNumber(!enableNumber)}/>
                </WrapSetting>
                <WrapSetting title="Uppercase">
                    <CheckBox checked={enableUpper} onClick={() => setEnableUpper(!enableUpper)}/>
                </WrapSetting>
                <WrapSetting title="Marks">
                    <CheckBox checked={enableMarks} onClick={() => setEnableMarks(!enableMarks)}/>
                </WrapSetting>
            </div>
        </div>
    );
}



export function Password() {
    const [passwordData, setPasswordData] = useMapState<string, PassRecord>();
    const [search, setSearch] = useState(String.empty);
    const [archiveMode, setArchiveMode] = useState(false);
    const [paste, setPaste] = useState(true);

    // render
    const [view, setView] = useMapState<string, PassRecord>();
    const [errorMessage, setErrorMessage] = useState<string|undefined>(undefined);

    // edit overlay
    const [editOverlay, showEditOverlay] = useState(false);
    const editDataKey = useRef<string|undefined>(undefined);
    const editSession = useRef(0);

    const navi = useFlintiaNavigate();



    /**
     * データ編集UIを開きます。
     * @param editDataKey 編集するデータのキー。新規追加の場合undefinedを指定してください。
     */
    function openEditUI(datakey: string|undefined) {
        showEditOverlay(true);
        editDataKey.current = datakey;
        editSession.current += 1;
    }



    // load
    useEffectAsync(async() => {
        const path = flintiaConfig.read().passfile;
        if (path == String.empty || await Paths.notExists(path)) {
            setErrorMessage("Password file not found");
            return;
        }

        const raw = await readTextFile(path);
        const data = JSON.toMap<string, PassRecord>(raw);

        setPasswordData(data);
    }, []);

    // save
    useEffectAsync(async() => {
        if (passwordData.isEmpty()) return;

        const path = flintiaConfig.read().passfile;
        const json = passwordData.toJson(4);
        try {
            await writeTextFile(path, json);
        } catch {
            setErrorMessage("Failed write file.");
        }
    }, [passwordData]);

    // rendering update
    useEffectAsync(async () => {
        if (passwordData.isEmpty()) return;

        // 表示フィルタ
        const result = passwordData.filter((_, v) => {
            if (!!v.archive != archiveMode) return false;
            if (search != String.empty && !v.title?.toLowerCase().includes(search.toLowerCase())) return false;
            return true;
        }).sort((a, b) => (a.right.title??String.empty).localeCompare(b.right.title??String.empty));
        setView(result);
    }, [search, archiveMode, passwordData]);



    return (
        <>
            <div className="flex flex-row">
                <Search value={search} onUpdate={v => setSearch(v)} className="border-0 border-b grow" autoFocus/>
                <button className="w-1/2" onClick={() => navi("/Auth")}>TOTP</button>
            </div>
            <div className="overflow-y-scroll grow">
                <span className="text-fail">{errorMessage}</span>
                {view.map((k, v) => <DataRow data={v} key={v.title} onAuxClick={() => openEditUI(k)} paste={paste}/>)}
            </div>
            <div className="flex flex-row border-t *:border-0 *:not-last:border-r">
                <ToggleSwitch label="View Archive" value={archiveMode} onChange={() => setArchiveMode(!archiveMode)}/>
                <button onClick={() => openEditUI(undefined)}>Add Password</button>
                <ToggleSwitch label="Paste" value={paste} onChange={() => setPaste(!paste)}/>
            </div>
            <Overlay show={editOverlay} setShow={showEditOverlay} className="flex-col justify-center items-center gap-4">
                <OverlayWindow className="flex flex-col gap-1 w-2/3 m-0">
                    <EditUI
                    initEditData={passwordData.getAny(editDataKey.current) ?? {}}
                    isEdit={!!editDataKey.current}
                    onConfirmed={res => {
                        setPasswordData(prev => prev?.set(editDataKey.current ?? crypto.randomUUID(), res));
                        showEditOverlay(false);
                    }}
                    key={editSession.current}
                    />
                </OverlayWindow>
                <OverlayWindow className="m-0 w-2/3">
                    <p className="text-center">UUID</p>
                    <UUIDGenerator/>
                    <p className="text-center mt-2">Generator</p>
                    <PassGenerator/>
                </OverlayWindow>
            </Overlay>
        </>
    );
}
