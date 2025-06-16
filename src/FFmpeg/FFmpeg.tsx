import { open, save } from "@tauri-apps/plugin-dialog";
import css from "./FFmpeg.module.css";
import React, { useEffect, useState } from "react";
import { WInvoke } from "~/InvokeWrapper";
import { AudioCodec, BuildFFmpegCommand, Preset, QualityMode, VideoCodec } from "./CommandBuilder";
import { copyText } from "~/util";

/**
 * EnumをOptionの配列で返します
 * @param arg 非型安全なので注意。Enumを渡してください
 * @returns Option要素の配列
 */
function EnumToOptions<T extends object>(arg: T) {
    let elems: React.JSX.Element[] = [];
    Object.entries(arg).forEach((k, i) => {
        elems.push(<option key={i} value={k[1]}>{k[0]}</option>);
    });
    return elems;
}

export default function FFmpeg() {
    const [sInputFile, setInputFile] = useState<string|null>(null);
    const [sVideoCodec, setVideoCodec] = useState(VideoCodec.hevc);
    const [sPreset, setPreset] = useState(Preset.medium);
    const [sAudioCodec, setAudioCodec] = useState(AudioCodec.aac);
    const [sQualityMode, setQualityMode] = useState(QualityMode.CQP);
    const [sQualityValue, setQualityValue] = useState(0);
    const [sOutputFile, setOutputFile] = useState<string|null>(null);

    function Selector<Enum extends object>(props: {
        title: string,
        defaultValue: string | number | readonly string[] | undefined,
        onChange: (v: string) => void,
        options: Enum,
        hide?: boolean,
    }) {
        return (
            <div className={css.setting} style={{display: props.hide?"none":""}}>
                <span>{props.title}</span>
                <select className={css.selector} defaultValue={props.defaultValue} onChange={v => props.onChange(v.target.value)}>
                    {EnumToOptions(props.options)}
                </select>
            </div>
        );
    }

    return (
        <>
            <div style={{textAlign: "center", borderBottom: "thin solid gray"}}>動画にのみ対応しています。NVENCを使用します。</div>
            <div className={css.setting}>
                <span>InputFile</span>
                <button className={css.button} onClick={
                    async() => {
                        open({
                            directory: false,
                            multiple: false,
                            title: "Select input file",
                            filters: [{
                                name: "movie file",
                                extensions: ["mp4", "mkv", "mov", "webm"]
                            }]
                        }).then(f => {
                            if (f != null) setInputFile(f);
                            WInvoke.show();
                        });
                    }}>{sInputFile?.split("\\").slice(-1)[0] ?? "Browse..."}
                </button>
            </div>
            <Selector title="VideoCodec"    defaultValue={sVideoCodec   } onChange={v => setVideoCodec  (v as VideoCodec    )} options={VideoCodec  }/>
            <Selector title="Preset"        defaultValue={sPreset       } onChange={v => setPreset      (v as Preset        )} options={Preset      } hide={sVideoCodec == VideoCodec.copy}/>
            <Selector title="AudioCodec"    defaultValue={sAudioCodec   } onChange={v => setAudioCodec  (v as AudioCodec    )} options={AudioCodec  }/>
            <Selector title="QualityMode"   defaultValue={sQualityMode  } onChange={v => setQualityMode (v as QualityMode   )} options={QualityMode } hide={sVideoCodec == VideoCodec.copy}/>
            {(() => {
                useEffect(() => setQualityValue(sQualityMode == QualityMode.CBR ? 4096 : 20), [sQualityMode]);
                return (
                <div className={css.setting} style={{display: sVideoCodec == VideoCodec.copy?"none":undefined}}>
                    <span>{sQualityMode == QualityMode.CBR ? "Bitrate" : "QualityLevel"}</span>
                    <input className={css.button} type="number"
                        value={sQualityValue}
                        step={sQualityMode == QualityMode.CBR ? 1024 : 1}
                        min={sQualityMode == QualityMode.CBR ? 1024 : 15}
                        max={sQualityMode == QualityMode.CBR ? 65536 : 28}
                        onChange={v => setQualityValue(v.target.valueAsNumber)}/>
                </div>);
            })()}
            <div className={css.setting}>
                <span>OutputFile</span>
                <button className={css.button} onClick={() => {
                    save({
                        filters: [
                            {name: "", extensions: ["webm"]},
                            {name: "", extensions: ["mkv" ]},
                            {name: "", extensions: ["mp4" ]},
                            {name: "", extensions: ["mov" ]},
                        ],
                        title: "Output file",
                    }).then(f => {
                        if (f != null) setOutputFile(f);
                        WInvoke.show();
                    });
                }}>{sOutputFile?.split("\\").slice(-1)[0] ?? "Browse..."}</button>
            </div>
            {(() => {
                let [copied, setCopied] = useState(false);
                return <button style={{fontSize: "1.2rem"}} className={css.button} disabled={(() => {
                    // ボタン無効化条件
                    if (sInputFile == null) return true;
                    if (sOutputFile == null) return true;
                    return false;
                })()} onClick={() => {
                    // @ts-ignore
                    const cmd = BuildFFmpegCommand(sInputFile, sVideoCodec, sPreset, sAudioCodec, sQualityMode, sQualityValue, sOutputFile);
                    copyText(cmd);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1000);
                }}>{copied ? "Copied!" : "Copy FFmpeg command"}</button>
            })()}
        </>
    );
}
