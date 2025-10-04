import MemeStock_Image from "./MemeStock/Image";
import useSearch from "~/hooks/useSearch";
import useToggleSwitch from "~/hooks/useToggleSwitch";

export default function MemeStock() {
    const [PasteSwitch, paste] = useToggleSwitch(true);
    const [searchElem, search] = useSearch({className: "border-0 border-r-1 w-1/3"});

    return (
        <div className="flex flex-col overflow-y-hidden h-full w-full">
            <div className="flex flex-row h-7 justify-between border-b-1">
                {searchElem}
                <PasteSwitch className="border-0 border-l-1 w-1/8"/>
            </div>
            <MemeStock_Image paste={paste} search={search}/>
        </div>
    );
}
