import { useLocation, useNavigate } from "react-router";

export default function Sidebar() {
    const navigate = useNavigate();
    const locate = useLocation();

    function PageButton(props: {title: string, navi: string, borderTop: boolean}) {
        const border = props.borderTop ? "border-t-1": "border-b-1";
        const active = props.navi == locate.pathname ? "bg-layerB" : "bg-layerA text-text-gray";

        return <button
            className={`cursor-pointer border-black border-0 ${border} ${active}`}
            onClick={() => navigate(props.navi)}
        >{props.title}</button>
    }

    function AutoSideButton(map: {[_:string]:string}, borderTop: boolean) {
        return Object.entries(map).map(([k, v]) => <PageButton key={k} title={k} navi={v} borderTop={borderTop}/>);
    }

    return (
        <div className="flex flex-col justify-between bg-layerA border-r-1 w-1/6 shrink-0">
            <div className="flex flex-col">
                {AutoSideButton({
                    "Password"  : "/Password",
                    "Tools"     : "/Tools",
                    "Command"   : "/CmdGen",
                    "Note"      : "/Note",
                    "ToDo"      : "/ToDo",
                    "QRCode"    : "/QRCode",
                    "Auth"      : "/Auth",
                }, false)}
            </div>
            <div className="flex flex-col">
                {AutoSideButton({
                    "System": "/System",
                }, true)}
            </div>
        </div>
    );
}
