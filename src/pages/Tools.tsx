import UnixTime from "./Tools/UnixTime";
import MinMaxValue from "./Tools/MinMaxValue";
import UUIDGenerator from "./Tools/UUIDGenerator";
import SaveClipImage from "./Tools/SaveClipImage";
import HexConverter from "./Tools/HexConverter";
import AspectRatioCalc from "./Tools/AspectRatioCalc";
import UnixToTime from "./Tools/UnixToTime";
import EvenlyDividedRow from "~/components/EvenlyDividedRow";
import Section from "~/components/Section";
import BitrateCalc from "./Tools/BitrateCalc";

export default function Tools() {
    return (
        <div className="overflow-y-scroll">
            <EvenlyDividedRow>
                <Section title="Save Clipboard Image" children={<SaveClipImage/>}/>
                <Section title="UnixTime" children={<UnixTime/>}/>
            </EvenlyDividedRow>
            <Section title="Unix To Time" children={<UnixToTime/>}/>
            <Section title="UUID Generator" children={<UUIDGenerator/>}/>
            <Section title="MIN_MAX_VALUE" children={<MinMaxValue/>}/>
            <Section title="HexConverter" children={<HexConverter/>}/>
            <Section title="Aspect Ratio Calc" children={<AspectRatioCalc/>}/>
            <Section title="BitrateCalc" children={<BitrateCalc/>}/>
        </div>
    );
}
