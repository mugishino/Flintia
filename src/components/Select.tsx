import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { ViewGroup } from "./ViewGroup";
import { useOutsideClick } from "~/hooks/useOutsideClick";

interface Props<T> {
    /** 内部値: 表示名 */
    list: Map<T, string> | T[],
    /** 現在選択中のもの */
    select: T,
    /**
     * 値の変更があった際に実行されるコールバック。
     * @param value 内部値
     * @param index 選択された値のindex
     */
    onSelectChange: (value: T, index: number) => void,

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
        list: rawList, select, onSelectChange,
        className, dropdownClassName, itemClassName,
        ...rest
    } = props;

    const data = useMemo(() => {
        const result = new Map<T, string>();
        if (rawList instanceof Array) {
            rawList.forEach(v => result.set(v, String(v)));
        } else {
            rawList.forEach((v, k) => result.set(k, v));
        }
        return result;
    }, [rawList]);
    const [open, setOpen] = useState(false);
    const [isOverflowX, setIsOverflowX] = useState(false);
    const [isOverflowY, setIsOverflowY] = useState(false);
    const outside = useOutsideClick(() => open && setOpen(false));
    const itemsRef = useRef<HTMLDivElement>(null);



    const itemClassNameCache = twMerge("hover:bg-layerC pl-1", itemClassName);

    useLayoutEffect(() => {
        // 位置計算
        if (!itemsRef.current) return;
        const rect = itemsRef.current.getBoundingClientRect();
        setIsOverflowX(rect.right > window.innerWidth);
        setIsOverflowY(rect.bottom > window.innerHeight);
    }, [open]);

    return (
            <div
            className={twMerge(`border interactives flex flex-row justify-between relative cursor-pointer`, className)}
            onClick={() => setOpen(v => !v)}
            {...rest}
            ref={outside}
            >
                {select && data.get(select)}
                <div className={`${open ? "rotate-270" :"rotate-90"} scale-x-50 absolute right-2`}>{">"}</div>

                <ViewGroup show={open}>
                    <div ref={itemsRef} className={twMerge(
                        `absolute
                        min-w-[calc(100%+2px)] w-max max-h-[50vh]
                        overflow-y-scroll overflow-x-hidden
                        border bg-layerB z-50 text-left
                        ${isOverflowY ? "bottom-full" : "top-full"} ${isOverflowX ? "-right-px" : "-left-px"}`,
                        dropdownClassName,
                    )}>
                        {data.map((key, view, i) =>
                            <div className={itemClassNameCache} key={view+key} onClick={e => {
                                setOpen(false);
                                onSelectChange(key, i);
                                e.stopPropagation();
                            }}>{view}</div>
                        )}
                    </div>
                </ViewGroup>
            </div>
    );
}
