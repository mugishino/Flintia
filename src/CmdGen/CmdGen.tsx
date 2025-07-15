import { Tool } from "~/Components";
import ExportKeyFrame from "./FFmpeg/ExportKeyFrame/ExportKeyFrame";
import Video from "./FFmpeg/Video/Video";

export default function CmdGen() {
    return (
        <>
            <Tool title="FFmpeg - Video [NVEnc]" children={<Video/>}/>
            <Tool title="FFmpeg - Export Key Frame" children={<ExportKeyFrame/>}/>
        </>
    );
}
