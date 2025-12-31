import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { getAppdataDirFile } from "~/util/path";
import { useState } from "react";
import { formatDate } from "~/util/util";
import { Overlay } from "~/hooks/useOverlay";
import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification";

type ReminderData = {
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
let reminders = await getReminders();
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

    const [time, setTime] = useState(Date.now());
    const [title, setTitle] = useState(String.empty);
    const [description, setDescription] = useState<string|undefined>(String.empty);

    function showRegister(time?: number, title?: string, description?: string) {
        setTime(time ?? Date.now());
        setTitle(title ?? String.empty);
        setDescription(description);
        setShowOverlay(true);
    }

    return (
        <>
            <Overlay show={showOverlay} setShow={setShowOverlay}>
                <div className="m-auto w-3/4">
                    <div className="bg-neutral-900 p-4 flex flex-col gap-1 max-h-100" onClick={e => e.stopPropagation()}>
                        <input type="datetime-local" min={time} value={formatDate(time, "YYYY-MM-DDTHH:mm")} onChange={v => setTime(new Date(v.currentTarget.value).getTime())}></input>
                        <input type="text" value={title} onChange={v => setTitle(v.currentTarget.value)} placeholder="タイトル"></input>
                        <textarea value={description} onChange={v => setDescription(v.currentTarget.value)} placeholder="説明" className="resize-none border bg-layerB p-1 min-h-[1.5lh] overflow-y-scroll field-sizing-content"></textarea>
                        <button disabled={!title || time<Date.now()} onMouseEnter={v => {
                            v.currentTarget.disabled = time<Date.now();
                        }} onClick={() => {
                            reminders = [...reminders, {time: time, title: title, description: description, notified: false} as ReminderData].sort((a, b) => a.time - b.time);
                            saveReminders();
                            setShowOverlay(false);
                        }}>リマインダーを登録</button>
                    </div>
                </div>
            </Overlay>
            <button className="border-0 border-b" onClick={() => showRegister()}>リマインダーを作成</button>
            <div className="grow overflow-y-scroll">
                {reminders.map(v =>
                    <div key={v.time+v.title} className={`border-b p-1 ${"bg-red-950".where(Date.now() > v.time)}`} title={v.description}>
                        <h1 className="text-2xl">{v.title}</h1>
                        <div className="text-xs">{formatDate(v.time, "YYYY年MM月DD日 HH時mm分")}</div>
                    </div>
                    // TODO: 編集・削除(確認画面あり)
                )}
            </div>
        </>
    );
}
