import { getAppdataDirFile, notExists } from "~/util";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { useEffect, useState } from "react";

const NOTE_PATH = await getAppdataDirFile("note.txt");

async function load() {
    if (await notExists(NOTE_PATH)) return String.empty;
    return await readTextFile(NOTE_PATH);
}

async function save(data: string) {
    await writeTextFile(NOTE_PATH, data);
}



export default function Note() {
    const [text, setText] = useState(String.empty);
    useEffect(() => {
        load().then(setText);
    }, []);

    return <textarea
        onInput={e => save(e.currentTarget.value)}
        defaultValue={text}
        style={{}}
        className="scrollbar-default-cursor grow resize-none overflow-y-scroll"
    />
}
