import { useEffect, useState } from "react";

export function useEffectAsync(effect: () => Promise<void>, deps?: React.DependencyList) {
    useEffect(() => {effect()}, deps);
}
export function useUpdateRender() {
    const [value, setValue] = useState(false);
    return () => setValue(!value);
}
