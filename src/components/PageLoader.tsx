export function PageLoader({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-4">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-gray-700"></div>
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-pitch-500 animate-spin"></div>
      </div>
      <p className="text-gray-500 text-sm font-display">{label}</p>
    </div>
  );
}
