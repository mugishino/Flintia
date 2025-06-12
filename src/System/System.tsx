import { WInvoke } from "~/InvokeWrapper";
import { getAppdataDirFile } from "~/util";

export default function System() {
    function Button(props: {
        onClick: () => void,
        children: string,
    }) {
        return <button className="border-b-1 border-border bg-layerA hover:bg-layerB cursor-pointer" onClick={props.onClick}>{props.children}</button>
    }

    return (
        <>
            <Button onClick={() => getAppdataDirFile("").then(dir => WInvoke.openExplorer(dir))}>Open AppData directory</Button>
        </>
    );
}
