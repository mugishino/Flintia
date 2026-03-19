import Section from "~/components/Section";
import Setting from "~/components/Setting";
import { WInvoke } from "~/InvokeWrapper";

const ALL_DISK_INFO = await WInvoke.getAllDiskInfo();
const GB = 1024*1024*1024;

export default function DiskHalfwayStatus() {
    return (
        <Section title="Disk Halfway Status" toolTip="ディスク容量の半分まで残り何GBかを示します">
            {ALL_DISK_INFO.map(disk => <Setting title={disk.name} key={disk.name}>{Math.floorEx((disk.available_space - (disk.total_size/2))/GB, 1)}GB</Setting>)}
        </Section>
    );
}
