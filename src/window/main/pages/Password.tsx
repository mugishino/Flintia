import { useState } from "react";
import { Config } from "~/Config";
import { Clipboards } from "~/util/clipboard";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { Paths } from "~/util/path";
import { ToggleSwitch } from "~/components/ToggleSwitch";
import { useEffectAsync } from "~/hooks/useEffectAsync";
import { SVGButton } from "~/components/SVGButton";
import { AppStorage } from "~/module/AppStorage";
import { Overlay } from "~/components/Overlay";
import { OverlayWindow } from "~/components/OverlayWindow";
import { ifPresent } from "~/util/util";
import { Line } from "~/components/Line";
import { useMapState } from "~/hooks/useMapState";
import { useStaticOverlay } from "~/hooks/useOverlay";
import { Search } from "~/components/Search";

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
    const [editData, setEditData] = useState<PassRecord|undefined>(undefined);
    const [editDataKey, setEditDataKey] = useState<string|undefined>(undefined);
    const [passwordVisible, setPasswordVisible] = useState(false);

    // util
    const [staticOverlay, setStaticOverlay] = useStaticOverlay();



    /**
     * データ編集UIを開きます。
     * @param editDataKey 編集するデータのキー。新規追加の場合undefinedを指定してください。
     */
    function openEditUI(editDataKey: string|undefined) {
        showEditOverlay(true);
        setEditDataKey(editDataKey);
        const data = ifPresent(editDataKey, it => passwordData?.get(it));
        setEditData(data ?? {});
        setPasswordVisible(false);
    }



    function DataRow({data, onAuxClick}: {data: PassRecord, onAuxClick?: () => void}) {
        const pasteClick = (value?: string) => {
            Clipboards.copyText(value ?? String.empty, paste);
        };

        return (
            <div className="flex flex-row h-10 border-b hover:[&>span]:bg-layerA">
                <div
                    className={`grow pl-1 text-2xl truncate flex items-center hover:bg-button-hover ${"text-text-gray".where(!!data.archive)} ${"underline".where(!!data.note)}`}
                    title={data.note}
                    onAuxClick={onAuxClick}
                >{data.title}</div>
                <PasswordSVGButton src="user.svg" value={data.username} onClick={() => pasteClick(data.username)}/>
                <PasswordSVGButton src="mail.svg" value={data.mail} onClick={() => pasteClick(data.mail)}/>
                <PasswordSVGButton src="password.svg" value={data.password} onClick={() => pasteClick(data.password)}/>
            </div>
        );
    }



    // load
    useEffectAsync(async() => {
        const path = (await AppStorage.load(new Config())).passfile;
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

        const path = (await AppStorage.load(new Config())).passfile;
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
    }, [search, archiveMode, passwordData, editData]);



    return (
        <>
            {staticOverlay}
            <Search value={search} onUpdate={v => setSearch(v)} className="border-0 border-b" autoFocus/>
            <div className="overflow-y-scroll grow">
                <span className="text-fail">{errorMessage}</span>
                {view.map((k, v) => <DataRow data={v} key={v.title} onAuxClick={() => openEditUI(k)}/>)}
            </div>
            <div className="flex flex-row border-t *:border-0 *:not-last:border-r">
                <ToggleSwitch label="View Archive" value={archiveMode} onChange={() => setArchiveMode(!archiveMode)}/>
                <button onClick={() => openEditUI(undefined)}>Add Password</button>
                <ToggleSwitch label="Paste" value={paste} onChange={() => setPaste(!paste)}/>
            </div>
            <Overlay show={editOverlay} setShow={showEditOverlay}>
                <OverlayWindow className="flex flex-col gap-1 w-2/3">
                    <div className="flex flex-row justify-between">
                        <span className="m-auto">{editDataKey ? "データ編集" : "新規追加"}</span>
                        <button className={`w-auto text-fail ${"hidden".where(!editDataKey)}`} onClick={() => {
                            showEditOverlay(false);
                            setStaticOverlay(
                                <OverlayWindow error>
                                    <span>本当に{editData?.title}をアーカイブ{archiveMode ? "から戻" : "化"}しますか？</span>
                                    <button className="text-fail" onClick={() => {
                                        // setEditDataをしてもeditDataは次のレンダリングまで書き換わらないので新しく作る
                                        const data: PassRecord = {...editData, archive: !archiveMode};
                                        if (!editDataKey) return;
                                        setPasswordData(prev => prev?.set(editDataKey, data));
                                        // close overlay
                                        setStaticOverlay(undefined);
                                    }}>アーカイブ化する</button>
                                </OverlayWindow>
                            );
                        }}>{archiveMode ? "アーカイブから戻す" : "アーカイブ化"}</button>
                    </div>
                    <input placeholder="Title"       value={editData?.title     ?? String.empty} onChange={e => setEditData(prev => ifPresent(prev, it => ({...it, title    : ifPresent(e.currentTarget.value)})))}/>
                    <input placeholder="Username"    value={editData?.username  ?? String.empty} onChange={e => setEditData(prev => ifPresent(prev, it => ({...it, username : ifPresent(e.currentTarget.value)})))}/>
                    <input placeholder="MailAddress" value={editData?.mail      ?? String.empty} onChange={e => setEditData(prev => ifPresent(prev, it => ({...it, mail     : ifPresent(e.currentTarget.value)})))}/>
                    <div className="flex flex-row gap-1">
                        <input placeholder="Password" type={passwordVisible ? "text" : "password"} value={editData?.password  ?? String.empty} onChange={e => setEditData(prev => ifPresent(prev, it => ({...it, password : ifPresent(e.currentTarget.value)})))}/>
                        <SVGButton src={passwordVisible ? "visibility.svg" : "visibility_off.svg"} className="grow aspect-square" onClick={() => setPasswordVisible(prev => !prev)}/>
                    </div>
                    <textarea className="h-20 border resize-none" placeholder="Note" value={editData?.note ?? String.empty} onChange={e => setEditData(prev => ifPresent(prev, it => ({...it, note: ifPresent(e.currentTarget.value)})))}/>
                    <Line/>
                    <button disabled={!editData?.title} onClick={() => {
                        if (!editData) return;
                        setPasswordData(prev => prev?.set(editDataKey ?? crypto.randomUUID(), editData));
                        // close edit window
                        showEditOverlay(false);
                    }}>保存</button>
                </OverlayWindow>
            </Overlay>
        </>
    );
}
