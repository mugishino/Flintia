import MainSetting from "./MainSetting";
import SystemInfo from "./SystemInfo";
import DiskHalfwayStatus from "./DiskHalfwayStatus";
import Other from "./Other";

export default function System() {
    return (
        <>
            <MainSetting/>
            <SystemInfo/>
            <DiskHalfwayStatus/>
            <Other/>
        </>
    );
}
