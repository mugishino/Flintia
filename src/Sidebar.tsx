import { useLocation, useNavigate } from "react-router";

export default function Sidebar() {
    const navigate = useNavigate();
    const locate = useLocation();

    function PageButton(props: {title: string, navi: string, borderTop: boolean}) {
        const border = props.borderTop ? "border-t-1": "border-b-1";
        const active = props.navi == locate.pathname ? "bg-layerB text-white" : "bg-layerA";

        return <button
            className={`text-text-gray px-1 cursor-pointer border-black border-0 ${border} ${active}`}
            onClick={() => navigate(props.navi)}
        >{props.title}</button>
    }

    function AutoSideButton(map: {[_:string]:string}, borderTop: boolean) {
        return Object.entries(map).map(([k, v]) => <PageButton key={k} title={k} navi={v} borderTop={borderTop}/>);
    }

    return (
        <div className="flex justify-between bg-layerA border-r-1 border-border [writing-mode:vertical-lr]">
            <div>
                {AutoSideButton({
                    "Pass"  : "/",
                    "Tools" : "/Tools",
                    "CmdGen": "/CmdGen",
                    "Note"  : "/Note",
                    "ToDo"  : "/ToDo",
                    "QRCode": "/QRCode",
                    "Auth"  : "/Auth",
                }, false)}
            </div>
            <div>
                {AutoSideButton({
                    "System": "/System",
                }, true)}
            </div>
        </div>
    );
}
