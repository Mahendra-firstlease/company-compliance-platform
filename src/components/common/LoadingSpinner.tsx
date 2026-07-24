export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />

      <p className="text-sm text-gray-500">
        Loading...
      </p>
    </div>
  );
}