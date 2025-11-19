import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { GDPData } from '../types';

interface InfoPanelProps {
  data: GDPData[];
  selectedCountry: GDPData | null;
  onSelectCountry: (c: GDPData) => void;
  loading: boolean;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ data, selectedCountry, onSelectCountry, loading }) => {
  
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center text-slate-400 animate-pulse">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p>Analyzing Global Economy...</p>
        </div>
      </div>
    );
  }

  // Show top 15 in chart to utilize space better with more data
  const chartData = data.slice(0, 15).map(d => ({
    name: d.isoCode,
    gdp: d.gdpTrillions,
    full: d
  }));

  return (
    <div className="h-full flex flex-col gap-6 p-6 overflow-y-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">2024 GDP Rankings</h2>
        <p className="text-sm text-slate-400">Nominal GDP estimates (Trillions USD)</p>
      </div>

      {/* Chart */}
      <div className="h-80 w-full bg-slate-800/50 rounded-xl p-4 border border-slate-700 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={30} />
            <Tooltip 
              cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f1f5f9' }}
              itemStyle={{ color: '#38bdf8' }}
              formatter={(value: number) => [`$${value}T`, 'GDP']}
            />
            <Bar dataKey="gdp" radius={[0, 4, 4, 0]} barSize={12}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={selectedCountry?.isoCode === entry.name ? '#38bdf8' : '#64748b'} 
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  onClick={() => onSelectCountry(entry.full)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Selected Country Details */}
      {selectedCountry ? (
        <div className="bg-slate-800/80 rounded-xl p-6 border border-blue-500/30 shadow-[0_0_15px_rgba(56,189,248,0.15)] backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300 flex-shrink-0">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-3xl font-bold text-white">{selectedCountry.countryName}</h3>
              <span className="text-blue-400 font-mono text-sm">{selectedCountry.isoCode}</span>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-400">${selectedCountry.gdpTrillions}T</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider">2024 Est. GDP</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-900/50 p-3 rounded-lg">
              <div className="text-xs text-slate-500 mb-1">Global Rank</div>
              <div className="text-xl font-semibold text-white">#{selectedCountry.rank}</div>
            </div>
            <div className="bg-slate-900/50 p-3 rounded-lg">
              <div className="text-xs text-slate-500 mb-1">Growth Rate</div>
              <div className={`text-xl font-semibold ${selectedCountry.growthRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {selectedCountry.growthRate > 0 ? '+' : ''}{selectedCountry.growthRate}%
              </div>
            </div>
          </div>

          <p className="text-slate-300 text-sm leading-relaxed border-t border-slate-700/50 pt-4">
            {selectedCountry.description}
          </p>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-500 text-sm text-center border-2 border-dashed border-slate-800 rounded-xl min-h-[200px]">
          Select a country from the list<br/>or map to view details
        </div>
      )}

      {/* Country List */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3 sticky top-0 bg-slate-900 py-2 z-10">Full List ({data.length})</h3>
        <div className="flex-1 overflow-y-auto pr-2 space-y-2">
          {data.map((country) => (
            <button
              key={country.isoCode}
              onClick={() => onSelectCountry(country)}
              className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all duration-200 ${
                selectedCountry?.isoCode === country.isoCode 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'bg-slate-800/30 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-xs font-mono w-6 text-center ${selectedCountry?.isoCode === country.isoCode ? 'text-blue-200' : 'text-slate-500'}`}>
                  {country.rank}
                </span>
                <span className="font-medium text-sm">{country.countryName}</span>
              </div>
              <div className="text-sm font-semibold">${country.gdpTrillions}T</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;