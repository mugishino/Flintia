export enum VideoCodec {
    h264 = "h264_nvenc",
    hevc = "hevc_nvenc",
    av1 = "av1_nvenc",
    copy = "copy",
}

export enum AudioCodec {
    aac = "aac",
    opus = "libopus",
    ogg = "libvorbis",
    mp3 = "libmp3lame",
    copy = "copy",
}

export enum Preset {
    ultraslow = "1",
    veryslow = "p2",
    slow = "p3",
    medium = "p4",
    fast = "p5",
    veryfast = "p6",
    ultrafast = "p7",
}

export enum QualityMode {
    CQP = "constqp", // 一定画質 15~28が推奨 値が小さくなるほど高品質
    CBR = "cbr", // 固定ビットレート
    CQVBR = "cq", // 品質優先可変ビットレート
}

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
    command.push("-c:v", videoCodec); // video codec
    command.push("-c:a", audioCodec); // audio codec

    if (videoCodec != VideoCodec.copy) {
        command.push("-preset", preset); // preset
        // quality mode
        command.push("-rc", qualityMode);
        // qualityValue = 0 でビットレート固定を無効化
        switch (qualityMode) {
            case QualityMode.CQP:
                command.push("-qp", qualityValue.toString());
                qualityValue = 0;
                break;
            case QualityMode.CQVBR:
                command.push("-cq", qualityValue.toString());
                qualityValue = 0;
                break;
        }
        command.push("-b:v", qualityValue+"K");
    }

    // その他
    command.push("-movflags", "+faststart"); // メタ情報を先頭に配置

    // output file
    command.push(packQuate(outputFileName));
    return command.join(" ");
}
