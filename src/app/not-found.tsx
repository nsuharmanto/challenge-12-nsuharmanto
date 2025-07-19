import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-4">404 - Page not Found</h1>
      <p className="text-gray-600 mb-6">The page you are looking for was not found.</p>
      <Link href="/" className="text-primary-400 hover:underline">Back to Home</Link>
    </main>
  );
}