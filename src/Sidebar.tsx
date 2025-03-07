import { useLocation, useNavigate } from "react-router";
import css from "./Sidebar.module.css";

export default function Sidebar() {
    const navigate = useNavigate();
    const locate = useLocation();

    function PageButton(props: {title: string, navi: string}) {
        return <button
            className={props.navi == locate.pathname ? css.inpage : undefined}
            onClick={() => navigate(props.navi)}
        >{props.title}</button>
    }

    return (
        <div className={css.sidebar}>
            <PageButton title="Pass" navi="/"/>
            <PageButton title="Tools" navi="/Tools"/>
        </div>
    );
}
