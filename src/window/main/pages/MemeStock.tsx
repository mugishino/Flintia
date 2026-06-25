import { useMemo, useState } from "react";
import { ToggleSwitch } from "~/components/ToggleSwitch";
import { Search } from "~/components/Search";
import { PageSelect } from "~/components/PageSelect";
import { useEffectAsync } from "~/hooks/useEffectAsync";
import { AppStorage } from "~/module/AppStorage";
import { Paths } from "~/util/path";
import { useStaticOverlay } from "~/hooks/useOverlay";
import { Config } from "~/Config";
import { readDir } from "@tauri-apps/plugin-fs";
import { searchFilter } from "~/util/util";
import { convertFileSrc } from "@tauri-apps/api/core";
import { WInvoke } from "~/InvokeWrapper";
import { Logger } from "~/module/Logger";

const SUPPORT_EXTENSION = "png,jpg,jpeg,bmp,webp,avif,gif".split(",");
const MAX_RENDER_COUNT = 100;

export function MemeStock() {
    // header
    const [paste, setPaste] = useState(true);
    const [enter, setAutoEnter] = useState(true);
    const [search, setSearch] = useState(String.empty);
    const [page, setPage] = useState(0);

    // main
    const [imageList, setImageList] = useState<string[]>([]);
    const [errMsg, setErrMsg] = useState<string|undefined>(undefined);

    const [overlay, setOverlay] = useStaticOverlay();



    useEffectAsync(async() => {
        const config = await AppStorage.load(new Config());
        const imagedirNotFound = await Paths.notExists(config.imagedir);
        if (imagedirNotFound) return setErrMsg("Directory not found");

        const data = (await readDir(config.imagedir)).map(v => {
            if (!v.isFile) return;
            if (!SUPPORT_EXTENSION.includes(Paths.splitExt(v.name).ext)) return;
            return `${config.imagedir}/${v.name}`;
        });
        setImageList(data.filter(v => v != undefined));
    }, []);

    // render
    const renderImages = useMemo(() => {
        if (search.length == 0) return imageList;
        return imageList.filter(v => {
            const basename = Paths.getBasename(v);
            return searchFilter(search, basename);
        });
    }, [search, imageList]);



    const sliceStart = MAX_RENDER_COUNT * page;
    const maxPage = renderImages.length / MAX_RENDER_COUNT;

    return (
        <div className="flex flex-col overflow-y-hidden h-full w-full">
            <div className="flex flex-row justify-between border-b">
                <Search value={search} onUpdate={v => {
                    setSearch(v);
                    setPage(0);
                }} className="border-0 w-1/3 border-r"/>
                <div className="grow"/>
                <PageSelect page={page} max={maxPage} onChange={setPage} className="*:border-y-0"/>
                <div className="grow"/>
                <div className="flex flex-row grow">
                    <ToggleSwitch label="AutoEnter" value={enter} onChange={() => setAutoEnter(!enter)} className="border-0 border-l"/>
                    <ToggleSwitch label="Paste" value={paste} onChange={() => setPaste(!paste)} className="border-0 border-l"/>
                </div>
            </div>

            <div className="overflow-y-scroll flex flex-wrap justify-center content-start h-full">
                <span className="text-2xl text-fail">{errMsg}</span>
                {page > 0 && <button className="w-auto h-1/6 aspect-square border-0" onClick={() => setPage(page-1)}>前のページ</button>}
                {renderImages.slice(sliceStart, sliceStart+MAX_RENDER_COUNT).map(rawFilePath => {
                    const fileSrc = convertFileSrc(rawFilePath);
                    return (
                        <img key={rawFilePath} src={fileSrc} onClick={async() => {
                            (await WInvoke.clipboardCopyfile(rawFilePath))
                            .onFailure(v => Logger.warning(v))
                            .onSuccessAsync(async() => {
                                if (paste) await WInvoke.paste(enter);
                            });
                        }} onAuxClick={() => {
                            setOverlay(<img className="m-auto h-4/5" src={fileSrc}/>);
                        }} decoding="async" loading="lazy" className={[
                            `cursor-pointer object-cover min-h-1/6 max-h-1/6 grow outline-memestock-hover-image-outline`,
                            `not-hover:opacity-80 hover:outline-2 hover:z-10`
                        ].join(String.space)}/>
                    );
                })}
                {page < maxPage-1 && <button className="w-auto h-1/6 aspect-square border-0" onClick={() => setPage(page+1)}>次のページ</button>}
                <div className="grow-100 min-h-px text-[0px]">最終行の余白と検索時の画像サイズ調整用</div>
                {overlay}
            </div>
        </div>
    );
}
