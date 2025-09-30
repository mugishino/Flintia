import { Section } from "~/Components";
import KeyFrameExtraction from "./CmdGen/KeyFrameExtraction";
import Video from "./CmdGen/FFmpegVideo/FFmpegVideo";
import RealEsrgan from "./CmdGen/RealEsrgan";

export default function CmdGen() {
    return (
        <>
            <Section title="FFmpeg - Video [NVEnc]" children={<Video/>}/>
            <Section title="FFmpeg - Export Key Frame" children={<KeyFrameExtraction/>}/>
            <Section title="Real-ESRGAN [ncnn Vulkan] - Image" children={<RealEsrgan/>}/>
        </>
    );
}
