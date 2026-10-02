import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { useState } from "react";
import { Search } from "~/components/Search";
import { useEffectAsync } from "~/hooks/useEffectAsync";
import { getAppdataDirFile, Paths } from "~/util/path";
import { searchFilter } from "~/util/util";

const savefile = await getAppdataDirFile("todo.json");
async function saveToDoList(data: string[]) {
    const json = JSON.stringify(data.filter(v => v != String.empty));
    await writeTextFile(savefile, json);
}

export function ToDo() {
    const [search, setSearch] = useState(String.empty);

    const [move, setMove] = useState<number|null>(null);
    const [todoList, setTodoList] = useState<string[]>([]);

    // ファイル読み込み
    useEffectAsync(async () => {
        if (await Paths.notExists(savefile)) return setTodoList([]);
        const read = await readTextFile(savefile);
        const list: string[] = JSON.parse(read);
        setTodoList(list);
    }, []);

    /** 状態を更新して保存します。 */
    function update(list: string[]) {
        setTodoList(list);
        saveToDoList(list);
    }

    /**
     * リスト内で位置を移動させます。
     * @param index 移動元・移動先のindex
     * @param start このindexで移動を開始するか
     */
    function moveProcess(index: number, start: boolean) {
        if (move == null) return start ? setMove(index) : undefined;
        const list = [...todoList];
        const data = list.remove(move);
        list.insert(index, data);
        setMove(null);
        update(list);
    }

    const elems = todoList.map((v, i) => {
        if (!searchFilter(search, v)) return;
        return (
            <textarea
                key={i}
                className={`field-sizing-content border-b resize-none overflow-clip ${
                    move == null ? "focus:bg-layerA" : `cursor-pointer ${move == i ? "bg-todo-sort-before" : "bg-todo-sort-after"}`
                }`}
                value={v}
                autoFocus={v == String.empty}
                onBlur={e => {
                    if (e.currentTarget.value != String.empty) return;
                    const list = [...todoList];
                    list.remove(i);
                    update(list);
                }}
                onInput={e => {
                    const list = [...todoList];
                    list[i] = e.currentTarget.value;
                    update(list);
                }}
                onClick   ={() => moveProcess(i, false)}
                onAuxClick={() => moveProcess(i, true )}
            />
        );
    });

    return (
        <>
            <Search className="border-0 border-b" value={search} onUpdate={v => setSearch(v)} autoFocus/>
            <div className="grow flex flex-col overflow-y-scroll">
                {elems}
            </div>
            <button className="border-0 border-t" onClick={() => setTodoList([...todoList, String.empty])}>New ToDo</button>
        </>
    );
}
