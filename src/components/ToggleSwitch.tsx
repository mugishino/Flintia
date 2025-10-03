export default function ToggleSwitch({value, label, onChange, className}: {value: boolean, label?: string, onChange: (v: boolean) => void, className?: string}) {
    return (
        <button
            onClick={() => onChange(!value)}
            className={`${value ? "text-enable" : "text-disable"} ${className ?? String.empty}`}
        >{label ?? (value ? "Enabled" : "Disabled")}</button>
    );
}
