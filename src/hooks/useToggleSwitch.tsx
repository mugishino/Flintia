import { useState } from "react";

/**
 * トグルスイッチを返します。
 * @param defaultValue 初期値
 * @returns [トグルスイッチ要素, 値, 値変更関数]
 */
export default function useToggleSwitch(defaultValue: boolean): [
    ({onChange, label, className}: {onChange?: (v: boolean) => void, label?: string, className?: string}) => React.JSX.Element,
    boolean,
    (v: boolean) => void,
] {
    const [value, setValue] = useState(defaultValue);

    return [
        ({onChange, label, className}) =>
        <button
            onClick={() => {
                setValue(!value);
                if (onChange) onChange(!value)
            }}
            className={`${value ? "text-enable" : "text-disable"} ${className ?? String.empty}`}
        >{label ?? (value ? "Enabled" : "Disabled")}</button>,
        value,
        v => setValue(v),
    ];
}
