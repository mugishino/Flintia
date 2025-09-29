import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { useState } from "react";
import { getAppdataDirFile, notExists, useUpdateRender } from "~/util";

const file = await getAppdataDirFile("todo.json");
async function loadToDoList() {
    if (await notExists(file)) return [];
    const read = await readTextFile(file);
    const list: string[] = JSON.parse(read);
    return list;
}

async function saveToDoList(data: string[]) {
    const json = JSON.stringify(data.filter(v => v != String.empty));
    await writeTextFile(file, json);
}



function TodoColumn({
    defaultText,
    onInput,
    removeTodo,
    focus,
    onClick,
    onAuxClick,
    className,
}: {
    defaultText: string,
    onInput: (v: string) => void,
    removeTodo: () => void,
    focus?: boolean,
    onClick: () => void,
    onAuxClick: () => void,
    className?: string,
}) {
    const [text, setText] = useState(defaultText);
    return (
        <textarea
            className={`field-sizing-content border-b-1 resize-none overflow-clip ${className}`} value={text}
            onBlur={e => e.currentTarget.value == String.empty ? removeTodo() : null}
            onInput={e => {
                setText(e.currentTarget.value);
                onInput(e.currentTarget.value);
            }}
            autoFocus={focus}
            onClick={onClick}
            onAuxClick={onAuxClick}
        />
    );
}

const data = await loadToDoList();
export default function ToDo() {
    const [search, setSearch] = useState(String.empty);

    const [move, setMove] = useState<number|null>(null);
    const updateRendering = useUpdateRender();
    let todoList = data;

    /**
     * リスト内で位置を移動させます。
     * @param index 移動元・移動先のindex
     * @param start このindexで移動を開始するか
     */
    function moveProcess(index: number, start: boolean) {
        if (move == null) return start ? setMove(index) : undefined;
        const data = todoList.remove(move);
        todoList.insert(index, data);
        setMove(null);
        saveToDoList(todoList);
    }

    const elems = todoList.map((v, i) => {
        if (search.length > 0 && !v.toLowerCase().includes(search.toLowerCase())) return;
        return <TodoColumn
            key={i+v}
            defaultText={v}
            onInput={v => {
                todoList[i] = v;
                saveToDoList(todoList);
            }} removeTodo={() => {
                todoList.remove(i);
                updateRendering();
            }}
            onClick   ={() => moveProcess(i, false)}
            onAuxClick={() => moveProcess(i, true )}
            className={move == null ? "focus:bg-layerA" : `cursor-pointer ${move == i ? "bg-red-950" : "bg-green-950"}`}
        />
    });

    return (
        <>
            <div className="flex flex-row">
                <input className="grow border-0 border-b-1 bg-layerA focus:bg-layerB" placeholder="search" autoFocus value={search} onChange={e => setSearch(e.currentTarget.value)}/>
                <button className="w-1/8 border-0 border-l-1 border-b-1" onClick={() => setSearch(String.empty)}>削除</button>
            </div>
            <div className="grow flex flex-col overflow-y-scroll">
                {elems}
            </div>
            <button className="border-0 border-t-1" onClick={() => {
                todoList.push(String.empty);
                updateRendering();
            }}>New ToDo</button>
        </>
    );
}
