import { useEffect, useState } from 'react';
import { useAuth } from '../../utils/AuthContext';
import apiClient from '../../utils/apiClient';
import CategoryCRUD from './Category';
import ScenarioCRUD from './Scenario';
import EntriesCRUD from './Entries';

export default function CRM() {
  const [activeTab, setActiveTab] = useState('categories');

  const tabs = [
    { id: 'categories', label: 'Categories' },
    { id: 'scenarios', label: 'Scenarios' },
    { id: 'entries', label: 'Entries' },
  ];

  return (
    <div className="w-1/2 mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">CRM</h1>

      <div className="border-b mb-6 w-full">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div>
        {activeTab === 'categories' && <CategoryCRUD />}
        {activeTab === 'scenarios' && <ScenarioCRUD />}
        {activeTab === 'entries' && <EntriesCRUD />}
      </div>
    </div>
  );
}