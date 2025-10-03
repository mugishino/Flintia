import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { useState } from "react";
import { useEffectAsync } from "~/hooks/useEffectAsync";
import { getAppdataDirFile, Paths } from "~/util/path";

const NOTE_PATH = await getAppdataDirFile("note.txt");

async function load() {
    if (await Paths.notExists(NOTE_PATH)) return String.empty;
    return await readTextFile(NOTE_PATH);
}

async function save(text: string) {
    await writeTextFile(NOTE_PATH, text);
}

export default function Note() {
    const [text, setText] = useState(String.empty);
    useEffectAsync(async () => {
        setText(await load());
    }, []);

    return <textarea
        onChange={async e => {
            const text = e.currentTarget.value;
            setText(text);
            await save(text);
        }}
        value={text}
        autoFocus={true}
        placeholder="Typing..."
        className="scrollbar-default-cursor grow resize-none overflow-y-scroll pl-[0px]"
    />
}
