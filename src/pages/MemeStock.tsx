import MemeStock_Image from "./MemeStock/Image";
import useSearch from "~/hooks/useSearch";
import useToggleSwitch from "~/hooks/useToggleSwitch";

export default function MemeStock() {
    const [PasteSwitch, paste] = useToggleSwitch(true);
    const [EnterSwitch, enter] = useToggleSwitch(true);
    const [searchElem, search] = useSearch({className: "border-0 border-r-1 w-1/3"});

    return (
        <div className="flex flex-col overflow-y-hidden h-full w-full">
            <div className="flex flex-row h-7 justify-between border-b-1">
                {searchElem}
                <div className="grow-3 text-[0px]">MARGIN</div>
                <div className="flex flex-row grow">
                    <EnterSwitch label="AutoEnter" className="border-0 border-l-1"/>
                    <PasteSwitch label="Paste" className="border-0 border-l-1"/>
                </div>
            </div>
            <MemeStock_Image paste={paste} enter={enter} search={search}/>
        </div>
    );
}
