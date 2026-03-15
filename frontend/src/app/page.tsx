import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">SalesCRM</h1>
        <p className="text-lg text-gray-400 mb-8">
          Simple, powerful CRM for small teams. Powered by Google Sheets.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center px-8 py-3 rounded-lg bg-blue-600 text-white font-medium text-lg hover:bg-blue-700 transition-colors"
        >
          Open Dashboard
        </Link>
      </div>
    </div>
  );
}
