import { WInvoke } from "~/InvokeWrapper";
import { getAppdataDirFile } from "~/util";

export default function System() {
    return (
        <>
            <button onClick={() => getAppdataDirFile(String.empty).then(dir => WInvoke.openExplorer(dir))}>Open AppData directory</button>
        </>
    );
}
