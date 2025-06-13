import { useLocation, useNavigate } from "react-router";

export default function Sidebar() {
    const navigate = useNavigate();
    const locate = useLocation();

    function PageButton(props: {title: string, navi: string}) {
        return <button
            className={`text-text-gray border-b-1 border-black px-1 cursor-pointer ${props.navi == locate.pathname ? "bg-layerB text-white" : "bg-layerA"}`}
            onClick={() => navigate(props.navi)}
        >{props.title}</button>
    }

    return (
        <div className="flex justify-between bg-layerA border-r-1 border-border [writing-mode:vertical-lr]">
            <div>
                {Object.entries({
                    "Pass"  : "/",
                    "Dev"   : "/Dev",
                    "FFmpeg": "/FFmpeg",
                    "Note"  : "/Note",
                    "QRCode": "/QRCode",
                    "Auth"  : "/Auth",
                }).map(([k, v]) => <PageButton key={k} title={k} navi={v}/>)}
            </div>
            <div>
                {Object.entries({
                    "System": "/System",
                }).map(([k, v]) => <PageButton key={k} title={k} navi={v}/>)}
            </div>
        </div>
    );
}
