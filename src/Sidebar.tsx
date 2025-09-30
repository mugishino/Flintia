import { useLocation } from "react-router";
import { Routing, useFlintiaNavigate } from "./Routing";

export default function Sidebar() {
    const navigate = useFlintiaNavigate();
    const locate = useLocation();

    function PageButton(props: {title: string, navi: string, borderTop: boolean}) {
        const border = props.borderTop ? "border-t-1": "border-b-1";
        const active = props.navi == locate.pathname ? "bg-layerB" : "bg-layerA text-text-gray";

        return <button
            className={`cursor-pointer border-black border-0 ${border} ${active}`}
            onClick={async () => {
                await navigate(props.navi);
            }}
        >{props.title}</button>
    }

    function AutoSideButton(map: {[_:string]:string}, borderTop: boolean) {
        return Object.entries(map).map(([k, v]) => <PageButton key={k} title={k} navi={v} borderTop={borderTop}/>);
    }

    const sidebar_top: {[_:string]:string} = {};
    const sidebar_bot: {[_:string]:string} = {};
    Object.entries(Routing.Data).forEach(([k, v]) => {
        if (v.sidebar == undefined) return;
        if (v.sidebar.pos == "Top"   ) sidebar_top[v.sidebar.label] = k;
        if (v.sidebar.pos == "Bottom") sidebar_bot[v.sidebar.label] = k;
    });

    return (
        <div className="flex flex-col justify-between bg-layerA border-r-1 w-24 shrink-0">
            <div className="flex flex-col">{AutoSideButton(sidebar_top, false)}</div>
            <div className="flex flex-col">{AutoSideButton(sidebar_bot, true )}</div>
        </div>
    );
}
