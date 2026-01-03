/**
 * オーバーレイを表示します。textareaなどの入力に対応しています。
 * 使用側で表示管理のuseState<boolean>を用意してください。
 * @returns オーバーレイ要素
 */
export default function Overlay({
    children,
    show,
    setShow
}: {
    children: React.ReactNode,
    /** useState\<boolean>の値 */
    show: boolean,
    /** useState\<boolean>の値変更メソッド */
    setShow: React.Dispatch<React.SetStateAction<boolean>>
}) {
    return <div className={`absolute left-0 top-0 z-50 h-full w-full bg-[#000d] flex ${"hidden".where(!show)}`} onClick={() => setShow(false)}>{children}</div>;
}
