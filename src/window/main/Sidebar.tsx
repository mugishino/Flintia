import { useLocation } from "react-router";
import { Routing, useFlintiaNavigate } from "../../Routing";

export function Sidebar() {
    const navigate = useFlintiaNavigate();
    const locate = useLocation();

    function PageButton(props: {title: string, navi: string, borderTop: boolean}) {
        const active = props.navi == locate.pathname ? "bg-sidebar-tab-active text-sidebar-tab-text-active" : "not-hover:bg-transparent text-sidebar-tab-text";

        return <button
            className={`cursor-pointer border-sidebar-border-tab p-1 border-0 rounded ${active}`}
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
        <div className="flex flex-col justify-between bg-sidebar-bg border-r w-28 shrink-0 border-sidebar-border">
            <div className="flex flex-col m-1 gap-1">{AutoSideButton(sidebar_top, false)}</div>
            <div className="flex flex-col m-1 gap-1">{AutoSideButton(sidebar_bot, true )}</div>
        </div>
    );
}
