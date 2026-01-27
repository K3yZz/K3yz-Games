export default function Spinner() {
    return (
        <div className="flex flex-col justify-center items-center h-100">
            <div className="border-2 border-white border-t-transparent rounded-full w-16 h-16 animate-spin"></div>
            <p className="text-white mt-1">Loading...</p>
        </div>
    )
}