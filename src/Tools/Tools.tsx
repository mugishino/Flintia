import UnixTime from "./UnixTime";
import MinMaxValue from "./MinMaxValue";
import UUIDGenerator from "./UUIDGenerator";
import SaveClipImage from "./SaveClipImage";
import HexConverter from "./HexConverter";
import { Section } from "~/Components";

export default function Tools() {
    return (
        <>
            <Section title="Save Clipboard Image" children={<SaveClipImage/>}/>
            <Section title="UUID Generator" children={<UUIDGenerator/>}/>
            <Section title="MIN_MAX_VALUE" children={<MinMaxValue/>}/>
            <Section title="UnixTime" children={<UnixTime/>}/>
            <Section title="HexConverter" children={<HexConverter/>}/>
        </>
    );
}
