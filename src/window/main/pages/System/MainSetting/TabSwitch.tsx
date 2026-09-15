import { useState } from "react";
import { Overlay } from "~/components/Overlay";
import { OverlayWindow } from "~/components/OverlayWindow";
import { ToggleSwitch } from "~/components/ToggleSwitch";
import { flintiaConfig } from "~/Config";
import { Routing } from "~/Routing";

export function TabSwitch(props: {
    show: boolean,
    setShow: () => void
}) {
    const [disables, setDisables] = useState(() => new Set<string>(flintiaConfig.read().disableTabs));

    function changeActive(key: string, toActive: boolean) {
        const array = new Set(disables);
        toActive ? array.delete(key) : array.add(key);
        setDisables(array);

        flintiaConfig.edit(c => c.disableTabs = [...array]);
    }

    return (
        <Overlay show={props.show} setShow={() => {
            props.setShow();
            flintiaConfig.save();
        }}>
            <OverlayWindow className="w-1/2 max-h-4/5 flex flex-col gap-1 overflow-y-scroll">
                {Routing.Data.map((k, v) => {
                    if (k == "/System") return;
                    if (v.sidebar == undefined) return;
                    const isActive = disables.has(k);

                    return <ToggleSwitch
                    value={!isActive}
                    label={v.sidebar?.label}
                    key={k}
                    className="box-border"
                    onChange={() => changeActive(k, isActive)}/>;
                })}
            </OverlayWindow>
        </Overlay>
    );
}
