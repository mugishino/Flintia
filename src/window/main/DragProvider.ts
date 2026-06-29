import { Event, listen, TauriEvent } from "@tauri-apps/api/event";
import { Logger } from "~/module/Logger";

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

// listen開始
listen<DragDropPayload>(TauriEvent.DRAG_ENTER, e => DragProvider.call(DragType.Enter, e)).catch(e => Logger.warning("DragProvider - LISTEN-DRAG_ENTER: " + e));
listen<DragDropPayload>(TauriEvent.DRAG_LEAVE, e => DragProvider.call(DragType.Leave, e)).catch(e => Logger.warning("DragProvider - LISTEN-DRAG_LEAVE: " + e));
listen<DragDropPayload>(TauriEvent.DRAG_OVER , e => DragProvider.call(DragType.Over , e)).catch(e => Logger.warning("DragProvider - LISTEN-DRAG_OVER: " + e));
listen<DragDropPayload>(TauriEvent.DRAG_DROP , e => DragProvider.call(DragType.Drop , e)).catch(e => Logger.warning("DragProvider - LISTEN-DRAG_DROP: " + e));

export class DragProvider {
    private static readonly data = new Map<string, Map<DragType, DragEventListener>>();
    private static readonly fallback: Map<DragType, DragEventListener> = new Map();

    /**
     * 現在のlocation.pathnameのドラッグイベントをリスナーします
     * @param type リスナーするイベントタイプ
     * @param fun コールバック。未指定の場合は何もしませんが、DefaultListenerは呼び出されなくなります。
     */
    public static setListener(type: DragType, fun?: DragEventListener) {
        const eventmap = this.data.getOrPut(location.pathname, () => new Map());
        eventmap.set(type, fun ?? (() => {}));
    }

    /**
     * 全ての画面でデフォルトとなるリスナーを登録します。
     * @param type リスナーを登録するイベントタイプ
     * @param fun イベント発生時のコールバック
     */
    public static setDefaultListener(type: DragType, fun: DragEventListener) {
        this.fallback.set(type, fun);
    }

    /**
     * リスナーを呼び出します。
     * @param type 呼び出すリスナーのイベントタイプ
     * @param e ドラッグイベントの情報
     */
    public static call(type: DragType, e: Event<DragDropPayload>) {
        const eventmap = this.data.get(location.pathname);
        if (eventmap) {
            const method = eventmap.get(type);
            if (method) return method(e);
        }

        const fallMethod = this.fallback.get(type);
        if (fallMethod) return fallMethod(e);
    }
}
