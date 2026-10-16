import Sidebar from './Sidebar.jsx';

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-background flex flex-row text-gray-100">
      <Sidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}