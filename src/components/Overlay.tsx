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
}: {
    children: React.ReactNode,
    /** useState\<boolean>の値 */
    show: boolean,
    /** useState\<boolean>の値変更メソッド */
    setShow: React.Dispatch<React.SetStateAction<boolean>>
    /** バックグラウンドをグレーにするかどうか */
    grayBackground?: boolean
}) {
    return <div className={`absolute left-0 top-0 z-50 h-full w-full flex ${"hidden".where(!show)} ${grayBackground ? "bg-overlay-bg" : "bg-transparent"}`} onClick={() => setShow(false)}>{children}</div>;
}
