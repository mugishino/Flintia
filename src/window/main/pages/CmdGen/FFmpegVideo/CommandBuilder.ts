export type VideoCodec = "h264_nvenc"|"hevc_nvenc"|"av1_nvenc"|"copy";
export type AudioCodec = "auto"|"aac"|"libopus"|"libvorbis"|"flac"|"libmp3lame"|"copy";
// p1になるほど高品質低速、p7になるほど低品質高速。p4が中間
export type Preset = "auto"|"p1"|"p2"|"p3"|"p4"|"p5"|"p6"|"p7";
export type QualityMode =
    "constqp" // CQP 一定画質 15~28が推奨 値が小さくなるほど高品質
    |"cbr" // CBR 固定ビットレート
    |"cq" // CQVBR 品質優先可変ビットレート
;

export function BuildFFmpegCommand(
    i: string,
    videoCodec: VideoCodec,
    preset: Preset,
    audioCodec: AudioCodec,
    qualityMode: QualityMode,
    qualityValue: number,
    outputFileName: string,
) {
    function packQuate(text: string) {return "\""+text+"\"";}

    let command = ["ffmpeg"];
    command.push("-i", packQuate(i)); // input file
    // video codec
    command.push("-c:v", videoCodec);
    if (videoCodec == "hevc_nvenc") {
        // iOS対応: https://zenn.dev/ysktake/articles/1f71c5df8e5f69
        command.push("-tag:v", "hvc1");
    }

    if (audioCodec != "auto") {
        command.push("-c:a", audioCodec); // audio codec
    }

    if (videoCodec != "copy") {
        if (preset != "auto") {
            command.push("-preset", preset); // preset
        }

        // quality mode
        command.push("-rc", qualityMode);
        // qualityValue = 0 でビットレート固定を無効化
        switch (qualityMode) {
            case "constqp":
                command.push("-qp", qualityValue.toString());
                break;
            case "cbr":
                command.push("-b:v", qualityValue+"K");
                break;
            case "cq":
                command.push("-rc", "vbr");
                command.push("-cq", qualityValue.toString());
                command.push("-b:v", "0");
                break;
        }
    }

    // その他
    command.push("-movflags", "+faststart"); // メタ情報を先頭に配置

    // output file
    command.push(packQuate(outputFileName));
    return command.join(String.space);
}
