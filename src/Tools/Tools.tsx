import UnixTime from "./UnixTime";
import MinMaxValue from "./MinMaxValue";
import UUIDGenerator from "./UUIDGenerator";
import SaveClipImage from "./SaveClipImage";
import HexConverter from "./HexConverter";
import { Tool } from "~/Components";

export default function Tools() {
    return (
        <>
            <Tool title="Save Clipboard Image" children={<SaveClipImage/>}/>
            <Tool title="UUID Generator" children={<UUIDGenerator/>}/>
            <Tool title="MIN_MAX_VALUE" children={<MinMaxValue/>}/>
            <Tool title="UnixTime" children={<UnixTime/>}/>
            <Tool title="HexConverter" children={<HexConverter/>}/>
        </>
    );
}
