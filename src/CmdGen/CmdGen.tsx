import { Section } from "~/Components";
import ExportKeyFrame from "./FFmpeg/ExportKeyFrame/ExportKeyFrame";
import Video from "./FFmpeg/Video/Video";

export default function CmdGen() {
    return (
        <>
            <Section title="FFmpeg - Video [NVEnc]" children={<Video/>}/>
            <Section title="FFmpeg - Export Key Frame" children={<ExportKeyFrame/>}/>
        </>
    );
}
