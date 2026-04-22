import { Event, listen, TauriEvent } from "@tauri-apps/api/event";

export enum DragType {
    Enter,
    Leave,
    Over,
    Drop
}

interface DragDropPayload {
    paths: string[];
    position: { x: number; y: number };
}

type DragEventListener = (e: Event<DragDropPayload>) => void;

export namespace DragProvider {
    const data = new Map<string, Map<DragType, DragEventListener>>();
    const fallback: Map<DragType, DragEventListener> = new Map();

    /**
     * 現在のlocation.pathnameのドラッグイベントをリスナーします
     * @param type リスナーするイベントのタイプ
     * @param fun コールバック
     */
    export function setListener(type: DragType, fun: DragEventListener) {
        const eventmap = data.getOrPut(location.pathname, () => new Map());
        eventmap.set(type, fun);
    }

    export function setDefaultListener(type: DragType, fun: DragEventListener) {
        fallback.set(type, fun);
    }

    function call(type: DragType, e: Event<DragDropPayload>) {
        const eventmap = data.get(location.pathname);
        if (eventmap) {
            const method = eventmap.get(type);
            if (method) return method(e);
        }

        const fallMethod = fallback.get(type);
        if (fallMethod) return fallMethod(e);
    }

    listen<DragDropPayload>(TauriEvent.DRAG_ENTER, e => call(DragType.Enter, e));
    listen<DragDropPayload>(TauriEvent.DRAG_LEAVE, e => call(DragType.Leave, e));
    listen<DragDropPayload>(TauriEvent.DRAG_OVER , e => call(DragType.Over , e));
    listen<DragDropPayload>(TauriEvent.DRAG_DROP , e => call(DragType.Drop , e));
}
