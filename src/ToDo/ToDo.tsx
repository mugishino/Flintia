import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { useState } from "react";
import { Button } from "~/Components";
import { getAppdataDirFile, notExists, useUpdateRender } from "~/util";

const file = await getAppdataDirFile("todo.json");
async function loadToDoList() {
    if (await notExists(file)) return [];
    const read = await readTextFile(file);
    const list: string[] = JSON.parse(read);
    return list;
}

async function saveToDoList(data: string[]) {
    const json = JSON.stringify(data.filter(v => v != ""));
    await writeTextFile(file, json);
}



function TodoColumn({
    defaultText,
    onInput,
    removeTodo,
}: {
    defaultText: string,
    onInput: (v: string) => void,
    removeTodo: () => void,
}) {
    const [text, setText] = useState(defaultText);
    return (
        <textarea
            className="field-sizing-content border-border border-b-1 resize-none focus:bg-layerA overflow-clip" value={text}
            onBlur={e => e.currentTarget.value == "" ? removeTodo() : null}
            onInput={e => {
                setText(e.currentTarget.value);
                onInput(e.currentTarget.value);
            }}
        />
    );
}

const data = await loadToDoList();
export default function ToDo() {
    const updateRendering = useUpdateRender();
    let todoList = data;

    const elems = todoList.map((v, i) =>
        <TodoColumn key={i} defaultText={v} onInput={v => {
            todoList[i] = v;
            saveToDoList(todoList);
        }} removeTodo={() => {
            todoList.splice(i, 1); // 自身を削除
            updateRendering();
        }}/>);

    return (
        <>
            <div className="grow flex flex-col overflow-y-scroll">
                {elems}
            </div>
            <Button onClick={() => {
                todoList.push("");
                updateRendering();
            }}>New ToDo</Button>
        </>
    );
}
