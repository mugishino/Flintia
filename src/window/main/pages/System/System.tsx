import { MainSetting } from "./MainSetting";
import { SystemInfo } from "./SystemInfo";
import { DiskStatus } from "./DiskStatus";
import { Other } from "./Other";

export function System() {
    return (
        <>
            <MainSetting/>
            <SystemInfo/>
            <DiskStatus/>
            <Other/>
        </>
    );
}
