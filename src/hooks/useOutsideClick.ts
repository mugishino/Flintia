import { useEffect, useRef } from "react";

/**
 * 要素の外側をクリックしたことを検知するフック
 * @param callback 外側をクリックした際に実行するコールバック
 * @returns 内側の中で一番外側の要素にこの値をrefで渡してください。
 */
export function useOutsideClick(callback: () => void) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handle(event: MouseEvent) {
            if (!ref.current) return;
            // クリックされた要素(event.target)が内側(ref)の場合
            if (ref.current.contains(event.target as Node)) return;
            callback();
        }

        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, [callback]);
    return ref;
}
