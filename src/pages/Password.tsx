import { useState } from "react";
import Config from "~/Config";
import { Clipboards } from "~/util/clipboard";
import { readTextFile } from "@tauri-apps/plugin-fs";
import yaml from "js-yaml";
import { Paths } from "~/util/path";
import useSearch from "~/hooks/useSearch";
import { useEffectAsync } from "~/hooks/useEffectAsync";
import useToggleSwitch from "~/hooks/useToggleSwitch";

class PassRecord {
    title       = String.empty;
    username    = String.empty;
    mail        = String.empty;
    password    = String.empty;
    note        = String.empty;
    hide        = false;
}

async function getPassRecords() {
    const path = (await Config.load()).passfile;
    if (path == String.empty || await Paths.notExists(path)) {
        return null;
    }

    const raw = await readTextFile(path);
    return yaml.load(raw) as PassRecord[];
}



export default function Password() {
    const [view, setView] = useState<PassRecord[]>([]);
    const [searchElem, search] = useSearch({className: "border-0 border-b-1", autofocus: true});
    const [errMsg, setErrMsg] = useState(String.empty);

    // setting
    const [ShowHideSwitch, showHide] = useToggleSwitch(false);
    const [PasteSwitch, paste] = useToggleSwitch(true);



    useEffectAsync(async () => {
        setErrMsg(String.empty);
        try {
            const data = await getPassRecords();
            if (data == null) return setErrMsg("Password file not found");
            const sorted = data.sort((a, b) => a.title.localeCompare(b.title)) // A-Zでソート
            setView(sorted);
        } catch (err) {
            setErrMsg(String(err));
        }
    }, [search, showHide]);

    function PasswordPasteableData({value, label}: {value: string, label: string}) {
        return !value || <div className="cursor-pointer duration-100 hover:bg-layerA active:bg-green-800" title="Click To Copy" onClick={() => Clipboards.copyText(value, paste)}>{label}</div>;
    }

    const result = view.map((v, i) => {
        if (v.hide && !showHide) return;
        if (search != String.empty && !v.title.toLowerCase().startsWith(search.toLowerCase())) return;
        return (
            <details className="cursor-pointer open:text-center open:border-y-1 not-open:hover:bg-layerA" key={i} tabIndex={-1}>
                <summary className={`in-open:bg-layerA list-none ${v.hide ? "text-text-gray" : undefined}`}>{v.title}</summary>
                <PasswordPasteableData value={v.username} label="UserName"/>
                <PasswordPasteableData value={v.mail    } label="Mail Address"/>
                <PasswordPasteableData value={v.password} label="Password"/>
                {!v.note ||
                <details className="cursor-pointer hover:bg-layerA open:border-t-1 [&:open_summary]:bg-layerA">
                    <summary>[Note]</summary>
                    <div className="select-text">{v.note}</div>
                </details>}
            </details>
        );
    });



    return (
        <>
            {searchElem}
            <div className="grow overflow-x-hidden overflow-y-scroll">
                <div className="text-fail">{errMsg}</div>
                {result}
            </div>
            <div className="border-t-1 flex flex-row [&>*]:border-0 [&>*]:not-last:border-r-1">
                <ShowHideSwitch label="ShowHide"/>
                <PasteSwitch label="Paste"/>
            </div>
        </>
    );
}
