import { openUrl } from "@tauri-apps/plugin-opener";
import { ReactNode, useState } from "react";
import Overlay from "~/components/Overlay";
import Section from "~/components/Section";
import { WInvoke } from "~/InvokeWrapper";

export default function Other() {
    const [hotfixOverlay, setHotfixOverlay] = useState(false);
    const [hotfixData, setHotfixData] = useState<ReactNode>(undefined);

    return (
        <Section title="Other">
            <button onClick={async() => {
                setHotfixOverlay(true);
                // 読み込み済みだったらReturn
                if (hotfixData != null) return;
                const hotfix = await WInvoke.getWindowsHotfix()
                setHotfixData(
                    hotfix.sort((a, b) => a.HotFixID.localeCompare(b.HotFixID)).map(q =>
                        <button onClick={async() => await openUrl(`https://www.google.com/search?q=${q.HotFixID}`)}>{q.HotFixID}</button>
                    )
                );
            }}>Show Windows Hotfix List</button>
            <Overlay show={hotfixOverlay} setShow={setHotfixOverlay}>
                <div className="flex flex-col w-1/2 mx-auto my-auto" onClick={e => e.stopPropagation()}>
                    <h1>インストール済みのWindows Hotfix</h1>
                    {hotfixData ?? "読み込み中..."}
                </div>
            </Overlay>
        </Section>
    );
}
