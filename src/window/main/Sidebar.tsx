import { useLocation } from "react-router";
import { Page, Routing, useFlintiaNavigate } from "../../Routing";
import { twMerge } from "tailwind-merge";

function PageButton(props: {active: boolean, label: string, onClick: () => void}) {
    return <button
        className={twMerge(
            "cursor-pointer border-sidebar-border-tab p-1 border-0 rounded",
            props.active ? "bg-sidebar-tab-active text-sidebar-tab-text-active" : "not-hover:bg-transparent text-sidebar-tab-text"
        )}
        onClick={() => {
            if (!props.active) props.onClick();
        }}
    >{props.label}</button>;
}

type SidebarState = Page & {active: boolean};

export function Sidebar() {
    const navigate = useFlintiaNavigate();
    const locate = useLocation();

    function AutoSideButton(data: Map<string, SidebarState>) {
        return data.map((path, data) =>
            <PageButton key={path} active={data.active} label={data.sidebar?.label ?? "???"} onClick={async () => await navigate(path)}/>
        );
    }

    const top = new Map<string, SidebarState>();
    const bot = new Map<string, SidebarState>();

    const pathname = Routing.Data.get(locate.pathname)?.option?.parentPage ?? locate.pathname;
    Routing.Data.forEach((data, path) => {
        const active = path == pathname;
        if (data.sidebar?.pos == "Top"   ) top.set(path, {...data, active});
        if (data.sidebar?.pos == "Bottom") bot.set(path, {...data, active});
    });

    return (
        <div className="flex flex-col justify-between bg-sidebar-bg border-r w-28 shrink-0 border-sidebar-border">
            <div className="flex flex-col m-1 gap-1">{AutoSideButton(top)}</div>
            <div className="flex flex-col m-1 gap-1">{AutoSideButton(bot)}</div>
        </div>
    );
}
