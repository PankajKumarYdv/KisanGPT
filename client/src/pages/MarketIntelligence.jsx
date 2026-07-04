import React, { useState } from 'react';
import { mockMarketData } from '../mock/market.js';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Minus, ShoppingBag, MapPin, BarChart3, HelpCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export default function MarketIntelligence() {
  const [selectedCommodity, setSelectedCommodity] = useState(mockMarketData.commodities[0]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-xl shadow-lg text-xs font-semibold text-foreground">
          <p className="font-bold border-b border-border pb-1 mb-1">{label}</p>
          <p className="text-primary">Price: ₹{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 text-foreground text-left">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Market Intelligence</h1>
        <p className="text-sm text-muted-foreground font-semibold">
          Real-time commodity price tracking across regional APMC mandis and AI predictions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Commodities Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-base border-b border-border pb-3 mb-4">Mandi Price Index</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-bold">
                    <th className="py-3 px-2">Commodity</th>
                    <th className="py-3 px-2">Current Price</th>
                    <th className="py-3 px-2">Daily Change</th>
                    <th className="py-3 px-2">MSP Guard</th>
                    <th className="py-3 px-2">Active Mandi</th>
                  </tr>
                </thead>
                <tbody>
                  {mockMarketData.commodities.map((comm) => {
                    const isSelected = selectedCommodity.name === comm.name;
                    return (
                      <tr
                        key={comm.name}
                        onClick={() => setSelectedCommodity(comm)}
                        className={`border-b border-border cursor-pointer transition-all hover:bg-muted/40 ${
                          isSelected ? 'bg-primary/5 hover:bg-primary/5 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3.5 px-2 flex items-center gap-2">
                          {isSelected && <span className="w-1.5 h-3.5 bg-primary rounded-full"></span>}
                          {comm.name}
                        </td>
                        <td className="py-3.5 px-2 font-bold">₹{comm.currentPrice}</td>
                        <td className="py-3.5 px-2">
                          {comm.direction === 'up' && (
                            <span className="text-green-600 dark:text-green-400 bg-green-500/10 px-2 py-0.5 rounded-lg text-xs font-bold inline-flex items-center gap-0.5">
                              <ArrowUpRight className="w-3 h-3" /> +₹{comm.dailyChange}
                            </span>
                          )}
                          {comm.direction === 'down' && (
                            <span className="text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-lg text-xs font-bold inline-flex items-center gap-0.5">
                              <ArrowDownRight className="w-3 h-3" /> -₹{Math.abs(comm.dailyChange)}
                            </span>
                          )}
                          {comm.direction === 'stable' && (
                            <span className="text-muted-foreground bg-muted px-2 py-0.5 rounded-lg text-xs font-bold inline-flex items-center gap-0.5">
                              <Minus className="w-3 h-3" /> Stable
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-2 text-muted-foreground">
                          {comm.msp > 0 ? `₹${comm.msp}` : 'N/A'}
                        </td>
                        <td className="py-3.5 px-2 text-xs text-muted-foreground truncate max-w-[150px]">
                          {comm.mandi.split(',')[0]}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historical Area Graph */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base border-b border-border pb-3">Price Trend: {selectedCommodity.name}</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={mockMarketData.trends}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="mandiGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey={selectedCommodity.name.toLowerCase().includes('wheat') ? 'wheat' : selectedCommodity.name.toLowerCase().includes('paddy') ? 'paddy' : 'sugarcane'}
                    name="Current Price"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#mandiGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Predictive Details & Mandi specs */}
        <div className="lg:col-span-1 space-y-6">
          {/* Mandi detail card */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
            <div className="pb-3 border-b border-border flex justify-between items-center">
              <h3 className="font-extrabold text-base">APMC Mandi Profile</h3>
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>

            <div className="space-y-4 text-sm">
              <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Trading center</span>
                <p className="font-bold flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary" />
                  {selectedCommodity.mandi}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Arrival Volume today</span>
                <p className="font-bold text-foreground">{selectedCommodity.volume}</p>
              </div>
            </div>
          </div>

          {/* Pricing Predictions Scenarios */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
            <div className="pb-3 border-b border-border flex justify-between items-center">
              <h3 className="font-extrabold text-base">Predictive Price Scenarios</h3>
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>

            <div className="space-y-4">
              {selectedCommodity.predictions.map((pred, idx) => (
                <div key={idx} className="p-3 border border-border bg-muted/20 rounded-2xl flex justify-between items-center text-sm">
                  <div className="space-y-0.5">
                    <p className="font-bold">{pred.scenario}</p>
                    <p className="text-xs text-muted-foreground">Likelihood: <strong>{pred.likelihood}</strong></p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-primary">₹{pred.price}</p>
                    <p className="text-[10px] text-muted-foreground">per Quintal</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
