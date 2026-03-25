import { useEffect } from "react";
import { Routing, useFlintiaNavigate } from "~/Routing";

export default function LandingPage() {
    const navigate = useFlintiaNavigate();
    useEffect(() => {
        // useEffect後にしないと正常に動作しない
        navigate(Routing.DEFAULT_PAGE);
    }, []);
    return <></>;
}
