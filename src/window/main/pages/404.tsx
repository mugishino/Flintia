import { Link } from "react-router";

export function NotFoundPage() {
    return (
        <div className="bg-[#0077D6] grow flex flex-col p-8 text-2xl">
            <span className="text-8xl pb-8">:(</span>
            <span>The page you are trying to access cannot be found.</span>
            <span>This appears to be due to a bug.</span>
            <span className="py-4">404% Complete</span>
            <Link className="underline" to="/">{">Return Home<"}</Link>
        </div>
    );
}
