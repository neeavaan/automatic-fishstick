import React, { useState } from 'react';
import { UploadTab } from './components/UploadTab.js';
import { ReviewTab } from './components/ReviewTab.js';
import { ExportTab } from './components/ExportTab.js';
import { cn } from './utils/cn.js';

type Tab = 'upload' | 'review' | 'export';

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'upload', label: 'Upload' },
  { id: 'review', label: 'Review' },
  { id: 'export', label: 'Export' },
];

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('upload');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 md:px-6">
        <h1 className="text-lg font-semibold text-gray-900 md:text-xl">CSV Importer</h1>
      </header>

      {/* Tab bar — bottom on mobile, top on md+ */}
      <nav className="order-last md:order-none bg-white border-t md:border-t-0 md:border-b border-gray-200">
        <ul className="flex md:px-6">
          {TABS.map(({ id, label }) => (
            <li key={id} className="flex-1 md:flex-none">
              <button
                type="button"
                onClick={() => setActiveTab(id)}
                className={cn(
                  'w-full md:w-auto px-4 py-3 text-sm font-medium text-center transition-colors',
                  'min-h-[44px] md:min-h-0',
                  activeTab === id
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700',
                )}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-6 max-w-5xl w-full mx-auto">
        {activeTab === 'upload' && <UploadTab />}
        {activeTab === 'review' && <ReviewTab />}
        {activeTab === 'export' && <ExportTab />}
      </main>
    </div>
  );
};
