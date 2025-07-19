type ErrorMessageProps = {
  message?: string;
};

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <h2 className="text-2xl font-bold text-red-500 mb-2">Error Fetching Data</h2>
      <p className="text-gray-700 mb-4">
        {message || "Sorry, we couldn't retrieve data from the server. Please try again later."}
      </p>
    </div>
  );
}