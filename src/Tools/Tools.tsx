import UnixTime from "./UnixTime";
import MinMaxValue from "./MinMaxValue";
import UUIDGenerator from "./UUIDGenerator";
import SaveClipImage from "./SaveClipImage";
import HexConverter from "./HexConverter";
import { Section, EvenlyDividedRow } from "~/Components";
import RatioCalc from "./RatioCalc";

export default function Tools() {
    return (
        <>
            <EvenlyDividedRow>
                <Section title="Save Clipboard Image" children={<SaveClipImage/>}/>
                <Section title="UnixTime" children={<UnixTime/>}/>
            </EvenlyDividedRow>
            <Section title="UUID Generator" children={<UUIDGenerator/>}/>
            <Section title="MIN_MAX_VALUE" children={<MinMaxValue/>}/>
            <Section title="HexConverter" children={<HexConverter/>}/>
            <Section title="Aspect Ratio Calc" children={<RatioCalc/>}/>
        </>
    );
}
