import { twMerge } from "tailwind-merge";
import { orDefault } from "~/util/util";

export default function Search(props: {
    value: string,
    onUpdate: (value: string) => void,
    placeholder?: string,
} & React.ComponentPropsWithoutRef<"div">) {
    const {value, autoFocus, placeholder, onUpdate, className, ...rest} = props;
    const onChangeW = orDefault(onUpdate, () => {});

    return (
        <div className={twMerge("flex flex-row border", className)} {...rest}>
            <input className="border-0 bg-layerA focus:bg-layerB" placeholder={placeholder ?? "Search..."} value={value} onChange={e => onChangeW(e.currentTarget.value)} autoFocus={autoFocus}/>
            <button onClick={() => onChangeW(String.empty)} className="w-16 border-0 border-l">削除</button>
        </div>
    );
}
