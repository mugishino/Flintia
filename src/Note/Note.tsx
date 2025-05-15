import { getAppdataDirFile, notExists } from "~/util";
import css from "./Note.module.css";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { useEffect, useState } from "react";

const NOTE_PATH = await getAppdataDirFile("note.txt");

async function load() {
    if (await notExists(NOTE_PATH)) return "";
    return await readTextFile(NOTE_PATH);
}

async function save(data: string) {
    await writeTextFile(NOTE_PATH, data);
}



export default function Note() {
    const [text, setText] = useState("");
    useEffect(() => {
        load().then(setText);
    }, []);

    return (
        <textarea onChange={e => save(e.target.value)} className={css.note} defaultValue={text}/>
    );
}
