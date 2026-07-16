import { twMerge } from "tailwind-merge";

/**
 * オーバーレイを表示します。textareaなどの入力に対応しています。
 * 使用側で表示管理のuseState<boolean>を用意してください。
 * @returns オーバーレイ要素
 */
export function Overlay({
    children,
    show,
    setShow,
    grayBackground = true,
    className,
}: {
    children: React.ReactNode,
    /** useState\<boolean>の値 */
    show: boolean,
    /** useState\<boolean>の値変更メソッド */
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    /** バックグラウンドをグレーにするかどうか */
    grayBackground?: boolean,
    className?: string,
}) {
    return <div className={twMerge(`absolute left-px top-px z-50 h-[calc(100%-2px)] w-[calc(100%-2px)] flex ${"hidden".where(!show)} ${grayBackground ? "bg-overlay-bg" : "bg-transparent"}`, className)} onClick={() => setShow(false)}>{children}</div>;
}
