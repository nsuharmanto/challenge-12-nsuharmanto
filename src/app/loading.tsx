export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center w-full py-24">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mb-6"></div>
      <p className="text-gray-600 text-lg">Loading...</p>
    </div>
  );
}