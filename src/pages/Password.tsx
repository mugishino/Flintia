import { useState } from "react";
import Config from "~/Config";
import { Clipboards } from "~/util/clipboard";
import { readTextFile } from "@tauri-apps/plugin-fs";
import yaml from "js-yaml";
import { Paths } from "~/util/path";
import useSearch from "~/hooks/useSearch";
import ToggleSwitch from "~/components/ToggleSwitch";
import { useEffectAsync } from "~/hooks/useEffectAsync";
import SVGButton from "~/components/SVGButton";

type PassRecord = {
    title   : string;
    username?: string;
    mail    ?: string;
    password?: string;
    note    ?: string;
    hide    ?: boolean;
}

async function getPassRecords() {
    const path = (await Config.load()).passfile;
    if (path == String.empty || await Paths.notExists(path)) {
        return null;
    }

    const raw = await readTextFile(path);
    return yaml.load(raw) as PassRecord[];
}

const PASSWORD_DATA = await getPassRecords();

export default function Password() {
    const [searchElem, search] = useSearch({className: "border-0 border-b", autofocus: true});
    const [showHide, setShowHide] = useState(false);
    const [paste, setPaste] = useState(true);

    const [view, setView] = useState<PassRecord[]>([]);
    const [errorMessage, setErrorMessage] = useState<string|undefined>(undefined);



    function DataRow({data}: {data: PassRecord}) {
        const SVGButtonPW = ({src, value}: {src: string, value?: string}) => <SVGButton src={src} disabled={!value} onClick={() => Clipboards.copyText(value??String.empty, paste)}/>

        return (
            <div className="flex flex-row h-10 border-b hover:[&>span]:bg-layerA">
                <span className={`grow pl-1 flex items-center text-2xl ${"text-text-gray".where(!!data.hide)} ${"underline".where(!!data.note)}`} title={data.note}>{data.title}</span>
                <SVGButtonPW src="user.svg" value={data.username}/>
                <SVGButtonPW src="mail.svg" value={data.mail}/>
                <SVGButtonPW src="password.svg" value={data.password}/>
            </div>
        );
    }



    useEffectAsync(async () => {
        if (PASSWORD_DATA == null) {
            setErrorMessage("Password file not found");
            return;
        }

        // 表示フィルタ
        const result: PassRecord[] = [];
        PASSWORD_DATA.forEach(v => {
            if (v.hide && !showHide && search == String.empty) return;
            if (search != String.empty && !v.title.toLowerCase().includes(search.toLowerCase())) return;
            result.push(v);
        });
        setView(result);
    }, [search, showHide]);



    return (
        <>
            {searchElem}
            <div className="overflow-y-scroll grow">
                <span className="text-fail">{errorMessage}</span>
                {view.sort().map(v => <DataRow data={v} key={v.title}/>)}
            </div>
            <div className="flex flex-row">
                <ToggleSwitch label="ShowHide" value={showHide} onChange={() => setShowHide(!showHide)} className="border-0 border-t border-r"/>
                <ToggleSwitch label="Paste" value={paste} onChange={() => setPaste(!paste)} className="border-0 border-t"/>
            </div>
        </>
    );
}
