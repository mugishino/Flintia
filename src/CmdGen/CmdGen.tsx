import { Tool } from "~/Components";
import FFmpeg from "./FFmpeg/FFmpeg";

export default function CmdGen() {
    return (
        <>
            <Tool title="FFmpeg - Video" children={<FFmpeg/>}/>
        </>
    );
}
