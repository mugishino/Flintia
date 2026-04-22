import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { getAppdataDirFile } from "~/util/path";
import { useRef, useState } from "react";
import { useStaticOverlay } from "~/hooks/useOverlay";
import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification";
import SVGButton from "~/components/SVGButton";
import Overlay from "~/components/Overlay";
import { OverlayWindow } from "~/components/OverlayWindow";

interface ReminderData {
    time: number,
    title: string,
    description?: string,
    notified: boolean,
}

const SAVE_FILE = await getAppdataDirFile("reminder.json");

export async function getReminders() {
    const json = JSON.parse(await readTextFile(SAVE_FILE));
    return json as ReminderData[];
}

async function saveReminders() {
    const json = JSON.stringify(reminders);
    await writeTextFile(SAVE_FILE, json);
}



// 起動時にトップレベルは読み込まれるので動きます
let reminders = await getReminders().catch(() => [] as ReminderData[]);
setInterval(() => {
    const nowTime = Date.now();
    reminders.forEach(async v => {
        if (v.notified) return;
        if (v.time > nowTime) return;
        v.notified = true;
        saveReminders();

        // 権限確認後、通知を送信
        let permission = await isPermissionGranted();
        if (!permission) {
            permission = await requestPermission() === 'granted';
        }
        if (permission) {
            sendNotification({ title: v.title, body: v.description });
        }
    });
}, 1000);



export default function Reminder() {
    const [showOverlay, setShowOverlay] = useState(false);
    const [deleteOverlay, showDeleteOverlay] = useStaticOverlay();

    const [time, setTime] = useState(Date.now());
    const [title, setTitle] = useState(String.empty);
    const [description, setDescription] = useState<string|undefined>(String.empty);

    const refEditIndex = useRef<undefined|number>(undefined);

    /**
     * リマインダー登録画面を表示します。
     * @param time 通知時刻(デフォルト:現在時刻)
     * @param title タイトル
     * @param description 説明
     * @param editIndex リマインダー編集時のみ使用。編集するリマインダーの登録インデックス
     */
    function showRegister(time?: number, title?: string, description?: string, editIndex?: number) {
        setTime(time ?? Date.now());
        setTitle(title ?? String.empty);
        setDescription(description);
        refEditIndex.current = editIndex;
        setShowOverlay(true);
    }

    return (
        <>
            <Overlay show={showOverlay} setShow={setShowOverlay}>
                <OverlayWindow className="w-3/4 flex flex-col gap-1 max-h-100">
                    <input type="datetime-local" min={time} value={Date.format(time, "YYYY-MM-DDTHH:mm")} onChange={v => setTime(new Date(v.currentTarget.value).getTime())}></input>
                    <input type="text" value={title} onChange={v => setTitle(v.currentTarget.value)} placeholder="タイトル"></input>
                    <textarea value={description} onChange={v => setDescription(v.currentTarget.value)} placeholder="説明" className="resize-none border bg-layerB p-1 min-h-[1.5lh] overflow-y-scroll field-sizing-content"></textarea>
                    <button disabled={!title || time<Date.now()} onMouseEnter={v => {
                        v.currentTarget.disabled = time<Date.now();
                    }} onClick={() => {
                        if (refEditIndex.current != undefined) {
                            reminders.remove(refEditIndex.current);
                        }
                        reminders = [...reminders, {time: time, title: title, description: description, notified: false} as ReminderData].sort((a, b) => a.time - b.time);
                        saveReminders();
                        setShowOverlay(false);
                    }}>リマインダーを{refEditIndex.current == undefined ? "作成" : "編集"}</button>
                </OverlayWindow>
            </Overlay>
            {deleteOverlay}
            <button className="border-0 border-b" onClick={() => showRegister()}>リマインダーを作成</button>
            <div className="grow overflow-y-scroll">
                {reminders.map((v, i) =>
                    <div key={v.time+v.title} className={`border-b flex flex-row h-1/12 justify-between ${"bg-reminder-notified".where(Date.now() > v.time)}`} title={v.description}>
                        <div className="flex flex-col p-1 min-w-0">
                            <h1 className="text-2xl truncate">{v.title}</h1>
                            <div className="text-xs">{Date.format(v.time, "YYYY年MM月DD日 HH時mm分")}</div>
                        </div>
                        <div className="flex flex-row">
                            <SVGButton src="edit.svg" className="h-full border-0 border-l" onClick={() => {
                                showRegister(v.time, v.title, v.description, i);
                            }}/>
                            <SVGButton src="trash_can.svg" className="h-full border-0 border-l" onClick={() => {
                                showDeleteOverlay(
                                    <OverlayWindow error>
                                        <h1 className="text-2xl">本当に削除しますか？</h1>
                                        <button className="text-red-400" onClick={() => {
                                            reminders.remove(i);
                                            saveReminders();
                                        }}>削除</button>
                                    </OverlayWindow>
                                );
                            }}/>
                        </div>
                    </div>
                )}
                {reminders.length == 0 && <div className="text-center text-2xl text-text-gray pt-4">リマインダーはありません</div>}
            </div>
        </>
    );
}
