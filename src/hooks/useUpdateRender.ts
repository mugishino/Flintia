import { useState } from "react";

/**
 * 強制的にレンダリングを更新する関数を返します。
 * @returns 更新関数
 */
export function useUpdateRender() {
    const [value, setValue] = useState(false);
    return (callback?: () => void) => {
        setValue(!value);
        if (callback) setTimeout(callback, 1);
    };
}
