import React, { useState } from 'react';
import ScenarioCRUD from './Scenario';
import EntriesCRUD from './Entries';
import CategoryCRUD from './Category';
import { useScenario } from '../../utils/ScenarioContext';

export default function CRMPage() {
  const { scenarioId } = useScenario();

  return (
    <div className="w-full  grid grid-cols-1 lg:grid-cols-2 gap-6">
     

      {/* Scenarios */}
      <div className="bg-gray-900 p-6 rounded-2xl shadow-lg overflow-auto max-h-[420px]">
        <h1 className="text-2xl font-bold text-blue-400 mb-4">Scenarios</h1>
        <ScenarioCRUD />
      </div>

        {/* Categories */}
      <div className="bg-gray-900 p-6 rounded-2xl shadow-lg overflow-auto max-h-[420px]">
        <h1 className="text-2xl font-bold text-pink-400 mb-4">Categories</h1>
        <CategoryCRUD />
      </div>



      {/* Entries */}
      <div className="bg-gray-900 p-6 rounded-2xl shadow-lg overflow-auto max-h-[420px] col-span-2">
        <h1 className="text-2xl font-bold text-green-400 mb-4">Entries</h1>
        <EntriesCRUD scenarioId={scenarioId} />
      </div>

    
    </div>
  );
}
