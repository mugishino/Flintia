import { Button } from "~/Components";
import { WInvoke } from "~/InvokeWrapper";
import { getAppdataDirFile } from "~/util";

export default function System() {
    return (
        <>
            <Button onClick={() => getAppdataDirFile("").then(dir => WInvoke.openExplorer(dir))}>Open AppData directory</Button>
        </>
    );
}
