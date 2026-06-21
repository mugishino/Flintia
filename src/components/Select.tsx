import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";
import { ViewGroup } from "./ViewGroup";
import { useOutsideClick } from "~/hooks/useOutsideClick";

interface Props<T> {
    /** 表示名: 内部値 */
    value: Map<string, T> | T[],
    /**
     * 値の変更があった際に実行されるコールバック。
     * @param value 内部値
     */
    onSelectChange: (value: T) => void,
    /** デフォルトの値を設定します。表示名で指定してください。 */
    defaultSelect?: T,

    /** ドロップダウン全体のclassNameを制御します。 */
    dropdownClassName?: string,
    /** アイテム自体のclassNameを制御します。 */
    itemClassName?: string,
}

/**
 * select要素の代替コンポーネント。
 * onChangeを型付きで戻せます。
 */
export function Select<T>(props: React.PropsWithChildren<Props<T>> & React.ComponentPropsWithoutRef<"div">) {
    const {
        value: rawValue, onSelectChange, defaultSelect,
        className, dropdownClassName, itemClassName,
        ...rest
    } = props;

    const [data, setData] = useState<Map<string, T>>(new Map());
    const [selected, setSelected] = useState<string|undefined>(undefined);
    const [open, setOpenRaw] = useState(false);
    const outside = useOutsideClick(() => open && setOpenRaw(false));


    useEffect(() => {
        // valueには配列とMapどちらでも渡せるようになっているため、それの展開
        const newData = new Map<string, T>();
        if (rawValue instanceof Array) {
            rawValue.forEach(v => newData.set(String(v), v));
        } else {
            rawValue.forEach((v, k) => newData.set(k, v));
        }
        setData(newData);
    }, [rawValue]);

    useEffect(() => {
        if (selected != undefined) return;
        // defaultSelectがある場合、dataからキーを逆引きしてSelectedにいれる
        if (defaultSelect != undefined) {
            const key = data.reverseLookup(defaultSelect);
            if (key != undefined) setSelected(key);
        } else {
            setSelected(data.keys().toArray().get(0));
        }
    }, [data]);

    const itemClassNameCache = twMerge("hover:bg-layerC pl-1", itemClassName);

    return (
        <div className="relative cursor-pointer" ref={outside}>
            <div
            className={twMerge("border interactives flex flex-row justify-between", className)}
            onClick={() => setOpenRaw(v => !v)}
            {...rest}>
                {selected}
                <div className={`${open ? "rotate-270" :"rotate-90"} scale-x-50 absolute right-2`}>{">"}</div>
            </div>
            <ViewGroup show={open}>
                <div className={twMerge("absolute top-full w-full border bg-layerB z-50 text-left", dropdownClassName)}>
                    {data.map((k, v) =>
                        <div className={itemClassNameCache} key={k} onClick={() => {
                            setSelected(k);
                            setOpenRaw(false);
                            onSelectChange(v);
                        }}>{k}</div>
                    )}
                </div>
            </ViewGroup>
        </div>
    );
}
