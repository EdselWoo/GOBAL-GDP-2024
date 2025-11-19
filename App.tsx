import React, { useEffect, useState } from 'react';
import Globe from './components/Globe';
import InfoPanel from './components/InfoPanel';
import { fetchGlobalGDPData } from './services/gemini';
import { GDPData } from './types';

const App: React.FC = () => {
  const [data, setData] = useState<GDPData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<GDPData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const result = await fetchGlobalGDPData();
        setData(result);
        if (result.length > 0) {
          // Default selection to top 1
          setSelectedCountry(result[0]);
        }
      } catch (err) {
        setError("Failed to load GDP data.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  return (
    <div className="flex h-screen w-screen bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* Mobile Warning/Layout adjustment */}
      <div className="lg:hidden absolute inset-0 z-50 flex items-center justify-center bg-slate-900 p-8 text-center">
        <p className="text-slate-400">For the best interactive experience, please view this application on a larger screen (Tablet/Desktop).</p>
      </div>

      {/* Left: 3D Globe Visualization */}
      <div className="flex-grow relative hidden lg:block">
        <div className="absolute top-6 left-6 z-10 pointer-events-none">
          <h1 className="text-4xl font-black tracking-tighter text-white drop-shadow-lg">
            GLOBAL <span className="text-blue-500">GDP</span> 2024
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xs">
            Interactive visualization of estimated nominal GDP data powered by Gemini 2.5 Flash.
          </p>
        </div>
        
        {/* Globe Component */}
        <div className="w-full h-full">
            <Globe 
              data={data} 
              selectedCountry={selectedCountry} 
              onSelectCountry={setSelectedCountry} 
            />
        </div>

        {/* Overlay Legend */}
        <div className="absolute bottom-8 right-8 bg-slate-900/80 backdrop-blur px-4 py-3 rounded-lg border border-slate-700 text-xs pointer-events-none">
          <div className="mb-2 text-slate-300 font-semibold">GDP Scale</div>
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Low</span>
            <div className="w-32 h-2 bg-gradient-to-r from-[#000004] via-[#a3305e] to-[#fcfdbf] rounded-full"></div>
            <span className="text-slate-500">High</span>
          </div>
        </div>
      </div>

      {/* Right: Information Panel */}
      <div className="w-full lg:w-[450px] border-l border-slate-800 bg-slate-900/95 backdrop-blur-xl z-20 flex-shrink-0 shadow-2xl">
        <InfoPanel 
          data={data} 
          loading={loading} 
          selectedCountry={selectedCountry} 
          onSelectCountry={setSelectedCountry}
        />
      </div>

      {/* Error Toast */}
      {error && (
        <div className="absolute top-4 right-4 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-bounce">
          {error}
        </div>
      )}
    </div>
  );
};

export default App;