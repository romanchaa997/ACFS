
import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  ShieldAlert, 
  BarChart3, 
  Settings, 
  Globe, 
  Database, 
  CreditCard,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileSearch,
  Users,
  Calendar,
  History,
  Lock,
  Clock,
  ShieldCheck,
  Scale,
  ArrowUpRight,
  TrendingUp,
  Download,
  AlertCircle,
  ChevronRight,
  Filter,
  Layers,
  Activity,
  X,
  CalendarDays,
  ShieldX,
  Fingerprint,
  Wallet,
  Coins,
  Cpu,
  Info,
  RotateCcw,
  CheckCircle,
  Hash,
  Binary,
  FileCheck,
  Flame,
  ArrowRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CasinoAnalysis, RegulatoryStatus, UserPlan, RiskLevel, PaymentMethod } from './types';
import { analyzeCasinoWithGemini } from './services/geminiService';

const presetData = {
  '7D': [
    { name: 'Mon', scans: 450 }, { name: 'Tue', scans: 520 }, { name: 'Wed', scans: 890 },
    { name: 'Thu', scans: 1100 }, { name: 'Fri', scans: 1450 }, { name: 'Sat', scans: 1200 }, { name: 'Sun', scans: 950 },
  ],
  '30D': [
    { name: 'Week 1', scans: 4200 }, { name: 'Week 2', scans: 5100 }, { name: 'Week 3', scans: 4800 }, { name: 'Week 4', scans: 6200 },
  ],
  '12M': [
    { name: 'Jan', scans: 15000 }, { name: 'Feb', scans: 18000 }, { name: 'Mar', scans: 22000 }, { name: 'Apr', scans: 21000 },
    { name: 'May', scans: 25000 }, { name: 'Jun', scans: 28000 }, { name: 'Jul', scans: 31000 }, { name: 'Aug', scans: 34000 },
    { name: 'Sep', scans: 32000 }, { name: 'Oct', scans: 38000 }, { name: 'Nov', scans: 42000 }, { name: 'Dec', scans: 45000 },
  ]
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'scans' | 'api' | 'regulatory'>('dashboard');
  const [urlInput, setUrlInput] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [analyses, setAnalyses] = useState<CasinoAnalysis[]>([]);
  const [chartRange, setChartRange] = useState<'7D' | '30D' | '12M' | 'Custom'>('7D');
  const [scanSearch, setScanSearch] = useState('');
  
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'ALL'>('ALL');
  const [scansStartDate, setScansStartDate] = useState('');
  const [scansEndDate, setScansEndDate] = useState('');

  const [customStartDate, setCustomStartDate] = useState('2023-11-01');
  const [customEndDate, setCustomEndDate] = useState('2023-11-15');
  const [isApplyingCustomRange, setIsApplyingCustomRange] = useState(false);

  const [plan, setPlan] = useState<UserPlan>({
    name: 'Enterprise Pro',
    scansUsed: 2492,
    scansLimit: 2500, 
    apiEnabled: true,
    tier: 'Enterprise'
  });

  const isLimitReached = plan.scansUsed >= plan.scansLimit;

  // Generate deterministic pseudo-random chart data based on dates to prevent flickering
  const currentChartData = useMemo(() => {
    if (chartRange === 'Custom') {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
      const count = Math.min(Math.max(daysDiff, 2), 20); // Limit count for chart readability
      
      const data = [];
      for (let i = 0; i < count; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        // Deterministic scan count based on date string
        const seed = d.getTime();
        const pseudoRandom = (Math.sin(seed) + 1) / 2;
        data.push({
          name: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          scans: Math.floor(700 + pseudoRandom * 800)
        });
      }
      return data;
    }
    return presetData[chartRange];
  }, [chartRange, customStartDate, customEndDate]);

  const filteredAnalyses = useMemo(() => {
    return analyses.filter(a => {
      const matchesUrl = a.url.toLowerCase().includes(scanSearch.toLowerCase());
      const matchesRisk = riskFilter === 'ALL' || a.riskLevel === riskFilter;
      let matchesDate = true;
      if (scansStartDate) matchesDate = matchesDate && new Date(a.timestamp) >= new Date(scansStartDate);
      if (scansEndDate) {
        const end = new Date(scansEndDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && new Date(a.timestamp) <= end;
      }
      return matchesUrl && matchesRisk && matchesDate;
    });
  }, [analyses, scanSearch, riskFilter, scansStartDate, scansEndDate]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput || isLimitReached) return;
    setIsScanning(true);
    try {
      const result = await analyzeCasinoWithGemini(urlInput);
      setAnalyses(prev => [result, ...prev]);
      setPlan(prev => ({ ...prev, scansUsed: prev.scansUsed + 1 }));
      setUrlInput('');
      setActiveTab('scans');
    } catch (err) {
      console.error(err);
      alert("Analysis engine failure. Please retry or contact technical support.");
    } finally {
      setIsScanning(false);
    }
  };

  const resetFilters = () => {
    setScanSearch('');
    setRiskFilter('ALL');
    setScansStartDate('');
    setScansEndDate('');
  };

  const handleSyncTimeline = () => {
    setIsApplyingCustomRange(true);
    // Simulate sync lag
    setTimeout(() => {
      setIsApplyingCustomRange(false);
    }, 600);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617] text-slate-100 selection:bg-emerald-500/20">
      {/* Sidebar */}
      <aside className="w-72 glass border-r border-slate-800/60 flex flex-col z-40">
        <div className="p-8">
          <div className="flex items-center gap-3 text-emerald-500 mb-10 group cursor-pointer">
            <div className="p-2.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all duration-500 shadow-lg shadow-emerald-500/5">
              <ShieldAlert size={28} />
            </div>
            <div>
              <span className="text-xl font-black tracking-tighter text-white uppercase italic block leading-tight">Audityzer</span>
              <span className="text-[9px] text-emerald-500 font-black tracking-[0.3em] uppercase opacity-70">Forensic AI</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Control Unit' },
              { id: 'scans', icon: History, label: 'Forensic Log' },
              { id: 'regulatory', icon: Globe, label: 'Regional Sync' },
              { id: 'api', icon: Database, label: 'API / Nodes' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                  activeTab === item.id 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-xl' 
                    : 'text-slate-500 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                <item.icon size={20} className={activeTab === item.id ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'} />
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 space-y-6">
          <div className={`p-6 rounded-[32px] border transition-all duration-500 ${isLimitReached ? 'bg-rose-950/30 border-rose-500/40 shadow-2xl shadow-rose-900/10' : 'bg-slate-900/60 border-slate-800 shadow-xl'}`}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Unit Quota</span>
              <span className={`text-[10px] font-black ${isLimitReached ? 'text-rose-500' : 'text-emerald-500 animate-pulse'}`}>
                {Math.round((plan.scansUsed / plan.scansLimit) * 100)}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden mb-3">
              <div 
                className={`h-full transition-all duration-1000 ${isLimitReached ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`} 
                style={{ width: `${Math.min(100, (plan.scansUsed / plan.scansLimit) * 100)}%` }}
              ></div>
            </div>
            <p className="text-[11px] text-slate-400 font-mono text-center font-black">
              {plan.scansUsed.toLocaleString()} / {plan.scansLimit.toLocaleString()} UNITS
            </p>
          </div>
          <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl active:scale-95 shadow-white/5">
            <Zap size={16} fill="currentColor" />
            Upgrade Tier
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[140px] rounded-full pointer-events-none -mr-48 -mt-48"></div>

        {/* Global Header */}
        <header className="h-24 border-b border-slate-800/50 flex items-center justify-between px-10 z-30 bg-[#020617]/50 backdrop-blur-2xl">
          <div className="flex items-center gap-6 flex-1 max-w-3xl">
            <form onSubmit={handleScan} className="relative w-full group">
              <input
                type="text"
                disabled={isLimitReached}
                placeholder={isLimitReached ? "SYSTEM LOCKED" : "Input domain for forensic verification..."}
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className={`w-full bg-slate-900/40 border-2 rounded-[24px] px-6 py-4 pl-16 text-sm font-semibold transition-all outline-none ${
                  isLimitReached 
                    ? 'border-rose-900/40 text-rose-300/40 cursor-not-allowed bg-rose-500/5' 
                    : 'border-slate-800 focus:border-emerald-500/50 focus:ring-8 focus:ring-emerald-500/5'
                }`}
              />
              <Search className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${isLimitReached ? 'text-rose-900' : 'text-slate-500 group-focus-within:text-emerald-500'}`} size={22} />
              <button 
                type="submit"
                disabled={isScanning || isLimitReached}
                className={`absolute right-3.5 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  isScanning ? 'bg-slate-800 text-slate-500' : isLimitReached ? 'bg-rose-900/50 text-rose-500 border border-rose-500/30' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl'
                }`}
              >
                {isScanning ? 'SCANNING...' : isLimitReached ? <Lock size={14} /> : 'RUN AUDIT'}
              </button>
            </form>
          </div>

          <div className="flex items-center gap-8 pl-10 border-l border-slate-800/50">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shadow-inner">
                   <Users size={20} />
                </div>
                <div>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Active Link</p>
                   <p className="text-sm font-black text-white">{plan.tier} Pipeline</p>
                </div>
             </div>
          </div>
        </header>

        {/* Viewport Content */}
        <div className="flex-1 overflow-y-auto p-12 z-20 custom-scrollbar space-y-12">
          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in duration-700">
               {/* Dashboard Main Component */}
               <div className="glass p-12 rounded-[60px] border border-white/5 shadow-2xl relative overflow-visible">
                  <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
                     <div>
                        <h3 className="text-3xl font-black text-white italic tracking-tighter flex items-center gap-4">
                           <Activity className={`transition-colors duration-500 ${isApplyingCustomRange ? 'text-amber-500 animate-spin' : 'text-emerald-500'}`} size={32} />
                           FORENSIC THROUGHPUT MATRIX
                        </h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2 opacity-60">
                           Target: {chartRange === 'Custom' ? `${customStartDate} → ${customEndDate}` : `${chartRange} GLOBAL AGGREGATE`}
                        </p>
                     </div>
                     
                     <div className="relative flex flex-col items-end">
                        <div className="flex bg-slate-950/80 p-1.5 rounded-[24px] border border-slate-800 backdrop-blur-xl shadow-2xl">
                           {['7D', '30D', '12M', 'Custom'].map((range) => (
                              <button 
                                 key={range} 
                                 onClick={() => setChartRange(range as any)} 
                                 className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative overflow-hidden group ${
                                    chartRange === range 
                                       ? 'bg-emerald-600 text-white shadow-[0_10px_30px_rgba(16,185,129,0.3)] scale-105' 
                                       : 'text-slate-500 hover:text-white hover:bg-slate-900'
                                 }`}
                              >
                                 {range}
                                 {range === 'Custom' && chartRange === 'Custom' && (
                                    <div className="absolute top-0 right-0 p-1 opacity-50">
                                       <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                                    </div>
                                 )}
                              </button>
                           ))}
                        </div>

                        {/* HIGH-FIDELITY DATE PICKER PANEL */}
                        {chartRange === 'Custom' && (
                           <div className="absolute top-full mt-5 right-0 z-50 glass p-8 rounded-[40px] border border-slate-700 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] w-[360px] animate-in slide-in-from-top-6 duration-500 overflow-hidden">
                              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"></div>
                              <div className="flex justify-between items-center mb-8">
                                 <h4 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                                    <CalendarDays size={18} className="text-emerald-500" />
                                    Forensic Range
                                 </h4>
                                 <button onClick={() => setChartRange('7D')} className="text-slate-500 hover:text-white transition-colors"><X size={18}/></button>
                              </div>
                              
                              <div className="space-y-6">
                                 <div className="flex items-center gap-4">
                                    <div className="flex-1 space-y-2">
                                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 opacity-70 italic">Start Ledger</label>
                                       <div className="relative group/input">
                                          <input 
                                             type="date" 
                                             value={customStartDate}
                                             onChange={(e) => setCustomStartDate(e.target.value)}
                                             className="w-full bg-slate-900/80 border-2 border-slate-800 rounded-2xl px-5 py-3.5 text-xs font-black text-emerald-400 outline-none focus:border-emerald-500 transition-all hover:border-slate-700 font-mono"
                                          />
                                          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none group-focus-within/input:opacity-100 transition-opacity"><ArrowRight size={14}/></div>
                                       </div>
                                    </div>
                                    <div className="flex-1 space-y-2">
                                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 opacity-70 italic">End Ledger</label>
                                       <div className="relative group/input">
                                          <input 
                                             type="date" 
                                             value={customEndDate}
                                             onChange={(e) => setCustomEndDate(e.target.value)}
                                             className="w-full bg-slate-900/80 border-2 border-slate-800 rounded-2xl px-5 py-3.5 text-xs font-black text-emerald-400 outline-none focus:border-emerald-500 transition-all hover:border-slate-700 font-mono"
                                          />
                                          <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none group-focus-within/input:opacity-100 transition-opacity"><ArrowRight size={14}/></div>
                                       </div>
                                    </div>
                                 </div>

                                 <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-center gap-4">
                                    <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-500"><Info size={14}/></div>
                                    <p className="text-[9px] font-bold text-slate-400 leading-tight">Selecting a broad custom range enables multi-node historical verification across all regional hubs.</p>
                                 </div>

                                 <button 
                                    onClick={handleSyncTimeline}
                                    disabled={isApplyingCustomRange}
                                    className={`w-full py-5 rounded-[24px] text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 relative overflow-hidden ${
                                       isApplyingCustomRange 
                                          ? 'bg-slate-800 text-slate-500 cursor-wait' 
                                          : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_15px_40px_-10px_rgba(16,185,129,0.5)] active:scale-95'
                                    }`}
                                 >
                                    {isApplyingCustomRange ? (
                                       <>
                                          <RotateCcw size={14} className="animate-spin" />
                                          Synchronizing...
                                       </>
                                    ) : (
                                       <>
                                          Synchronize Timeline
                                          <ArrowUpRight size={14} />
                                       </>
                                    )}
                                 </button>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>

                  <div className={`h-[440px] w-full transition-all duration-700 ${isApplyingCustomRange ? 'opacity-30 blur-md grayscale scale-[0.98]' : 'opacity-100 blur-0 grayscale-0 scale-100'}`}>
                     <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={currentChartData}>
                           <defs>
                              <linearGradient id="forensicGlow" x1="0" y1="0" x2="0" y2="1">
                                 <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                 <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                           </defs>
                           <CartesianGrid strokeDasharray="8 8" stroke="#1e293b" vertical={false} opacity={0.3} />
                           <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dy={20} fontStyle="italic" fontWeight="800" />
                           <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dx={-20} fontWeight="800" />
                           <Tooltip 
                              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '24px', padding: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                              itemStyle={{ color: '#10b981', fontWeight: '900', fontSize: '16px' }}
                              cursor={{ stroke: '#10b981', strokeWidth: 2, strokeDasharray: '5 5' }}
                           />
                           <Area 
                              type="monotone" 
                              dataKey="scans" 
                              stroke="#10b981" 
                              fillOpacity={1} 
                              fill="url(#forensicGlow)" 
                              strokeWidth={5} 
                              animationDuration={1500}
                              animationEasing="ease-out"
                           />
                        </AreaChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               {/* Snapshot KPIs */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-12">
                  {[
                    { label: 'Risk Correlation', val: '0.84', trend: '+4.2%', color: 'text-blue-400', icon: TrendingUp },
                    { label: 'Audit Latency', val: '142ms', trend: '-18ms', color: 'text-emerald-400', icon: Zap },
                    { label: 'Threat Blocks', val: '4,281', trend: '+122', color: 'text-rose-400', icon: ShieldAlert },
                    { label: 'Node Health', val: '14/14', trend: 'STABLE', color: 'text-amber-400', icon: Activity },
                  ].map((stat, i) => (
                    <div key={i} className="glass p-8 rounded-[40px] border border-white/5 hover:border-slate-700 transition-all group cursor-default shadow-xl">
                       <div className="flex justify-between items-start mb-8">
                         <div className={`p-4 rounded-2xl bg-slate-900 shadow-inner group-hover:${stat.color} transition-colors border border-slate-800`}>
                            <stat.icon size={22} />
                         </div>
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none mt-1">{stat.label}</span>
                       </div>
                       <div className="flex items-end gap-3">
                          <h4 className={`text-4xl font-black text-white tracking-tighter leading-none ${stat.color}`}>{stat.val}</h4>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pb-1 opacity-50">{stat.trend}</span>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'scans' && (
            <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
              <div className="space-y-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                  <div>
                    <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase flex items-center gap-6 leading-none">
                        <FileSearch size={48} className="text-emerald-500" />
                        FORENSIC ARCHIVE
                    </h2>
                    <p className="text-slate-500 mt-4 text-2xl font-bold max-w-2xl leading-snug italic">Deep-level audit history featuring granular ML intelligence breakdowns.</p>
                  </div>
                </div>

                {/* ADVANCED FILTERING SUITE */}
                <div className="glass p-8 rounded-[40px] border border-slate-800/60 shadow-2xl flex flex-col md:flex-row gap-8 items-center justify-between">
                   <div className="flex flex-col md:flex-row items-center gap-8 w-full md:w-auto">
                      <div className="relative group w-full md:w-80">
                        <input type="text" placeholder="Filter domain..." value={scanSearch} onChange={(e) => setScanSearch(e.target.value)} className="w-full bg-slate-900/60 border-2 border-slate-800 rounded-2xl px-6 py-4 pl-14 text-xs font-black focus:ring-8 focus:ring-emerald-500/5 transition-all outline-none" />
                        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500 transition-colors" />
                      </div>
                      <div className="flex items-center gap-2 bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800">
                         {(['ALL', ...Object.values(RiskLevel)] as const).map((level) => (
                           <button key={level} onClick={() => setRiskFilter(level as any)} className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${riskFilter === level ? 'bg-slate-100 text-[#020617]' : 'text-slate-500 hover:text-slate-300'}`}>{level}</button>
                         ))}
                      </div>
                   </div>
                   <div className="flex items-center gap-8 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-800/80 pt-8 md:pt-0 md:pl-8">
                      <div className="flex items-center gap-4">
                         <div className="flex items-center gap-3"><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">From</span><input type="date" value={scansStartDate} onChange={(e) => setScansStartDate(e.target.value)} className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2 text-[10px] font-black text-white outline-none" /></div>
                         <div className="flex items-center gap-3"><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">To</span><input type="date" value={scansEndDate} onChange={(e) => setScansEndDate(e.target.value)} className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2 text-[10px] font-black text-white outline-none" /></div>
                      </div>
                      <button onClick={resetFilters} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-600 hover:text-rose-500 transition-all active:scale-95 group shadow-xl"><RotateCcw size={20} className="group-hover:rotate-[-180deg] transition-transform duration-500" /></button>
                   </div>
                </div>
              </div>

              {filteredAnalyses.length === 0 ? (
                <div className="glass rounded-[70px] p-48 text-center border-dashed border-4 border-slate-800/40 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full opacity-20 -m-32 group-hover:scale-150 transition-transform duration-1000"></div>
                  <div className="w-32 h-32 rounded-[40px] bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto mb-10 text-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]"><Layers size={64} /></div>
                  <h3 className="text-4xl font-black text-white mb-6 italic tracking-tight uppercase">NO MATCHING AUDITS</h3>
                  <p className="text-slate-500 max-w-xl mx-auto leading-relaxed font-bold text-xl opacity-70 uppercase tracking-widest">Submit a target domain or adjust filter parameters to view the investigative archive.</p>
                </div>
              ) : (
                <div className="space-y-16">
                  {filteredAnalyses.map((report) => (
                    <div key={report.id} className="glass rounded-[60px] overflow-hidden border border-slate-800/60 hover:border-emerald-500/40 transition-all group shadow-[0_50px_100px_-30px_rgba(0,0,0,0.6)]">
                      {/* Analysis Header */}
                      <div className="bg-slate-900/50 px-16 py-12 border-b border-slate-800/80 flex flex-wrap justify-between items-center gap-12">
                        <div className="flex items-center gap-10">
                          <div className={`w-24 h-24 rounded-[36px] flex items-center justify-center border-2 shadow-2xl ${report.riskLevel === RiskLevel.CRITICAL ? 'bg-rose-500/10 border-rose-500/40 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'}`}>
                            <Globe size={48} className="group-hover:rotate-12 transition-transform duration-700" />
                          </div>
                          <div>
                            <h3 className="text-5xl font-black text-white tracking-tighter italic leading-none mb-3">{report.url}</h3>
                            <div className="flex items-center gap-6">
                               <span className="text-xs text-slate-500 font-black uppercase tracking-[0.2em] flex items-center gap-2"><Clock size={18} className="text-slate-600" />{new Date(report.timestamp).toLocaleString()}</span>
                               <span className="text-xs text-slate-600 font-black uppercase tracking-[0.2em]">AUDIT_ID: {report.id}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-12">
                           <div className="text-right">
                              <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.5em] mb-2 leading-none">FRAUD_SCORE</p>
                              <p className={`text-7xl font-black tracking-tighter leading-none ${report.riskScore > 75 ? 'text-rose-500' : 'text-emerald-400'}`}>{report.riskScore}</p>
                           </div>
                           <div className={`px-12 py-5 rounded-[28px] font-black tracking-[0.3em] text-xs uppercase border-2 ${report.riskLevel === RiskLevel.CRITICAL ? 'bg-rose-600 border-rose-400 text-white animate-pulse' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                             {report.riskLevel} VERDICT
                           </div>
                        </div>
                      </div>

                      <div className="p-16 grid grid-cols-1 lg:grid-cols-12 gap-20 bg-slate-950/20 relative">
                        {/* Forensic sections content - as previously defined */}
                        <div className="lg:col-span-12 border-b border-slate-800/60 pb-16">
                           <div className="flex items-center gap-4 mb-10">
                              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-500"><Cpu size={24}/></div>
                              <div>
                                 <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase">ML Intelligence Forensic Core</h4>
                                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Deep Learning Analysis & Summary</p>
                              </div>
                           </div>
                           <div className="p-12 bg-slate-900/60 rounded-[50px] border border-slate-800/80 shadow-2xl relative overflow-hidden group/intel">
                              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/intel:opacity-20 transition-all duration-1000"><Fingerprint size={120} /></div>
                              <p className="text-2xl text-slate-300 leading-relaxed font-bold italic selection:bg-emerald-500/40">"{report.summary}"</p>
                           </div>
                        </div>

                        {/* Feature sections... */}
                        <div className="lg:col-span-6 space-y-16">
                           <div className="space-y-10">
                              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] flex items-center gap-4">
                                <Activity size={20} className="text-blue-400" />
                                FEATURE ANALYSIS: INFRASTRUCTURE
                              </h4>
                              <div className="grid grid-cols-1 gap-6">
                                 <div className="bg-slate-900/50 p-10 rounded-[40px] border border-slate-800 flex items-start gap-8 shadow-xl">
                                    <div className={`p-5 rounded-2xl ${report.features.sslValid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}><Lock size={32}/></div>
                                    <div className="flex-1">
                                       <div className="flex items-center justify-between mb-2">
                                          <p className="text-xl font-black text-white tracking-tighter uppercase">SSL Certificate Monitor</p>
                                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${report.features.sslValid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>{report.features.sslValid ? 'ENCRYPTED' : 'UNSECURED'}</span>
                                       </div>
                                       <div className="space-y-1 mt-4">
                                          <p className="text-xs font-bold text-slate-500">Expiration Ledger:</p>
                                          <p className="text-sm font-black text-slate-200 font-mono italic">{report.features.sslExpiry}</p>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="lg:col-span-6 space-y-16">
                           <div className="space-y-10">
                              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] flex items-center gap-4">
                                <CreditCard size={20} className="text-blue-400" />
                                FINANCIAL VECTOR: PAYMENT CHANNELS
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 {report.features.paymentMethods.map((pm: PaymentMethod, idx: number) => (
                                   <div key={idx} className={`relative flex flex-col p-8 rounded-[40px] border-2 transition-all duration-500 group/pm hover:scale-[1.05] overflow-hidden ${pm.isHighRisk ? 'bg-[#1a0c0e] border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.15)] text-rose-400' : 'bg-slate-900/40 border-slate-800 text-slate-400'}`}>
                                      <div className="flex items-center justify-between mb-8 relative z-10">
                                         <div className={`p-5 rounded-[22px] flex items-center justify-center transition-all ${pm.isHighRisk ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' : 'bg-slate-800 text-slate-500'}`}>
                                            {pm.name.toLowerCase().includes('crypto') ? <Coins size={28}/> : <Wallet size={28}/>}
                                         </div>
                                         {pm.isHighRisk && (
                                           <div className="bg-rose-500 text-white p-2 rounded-full animate-bounce shadow-xl">
                                              <Flame size={18} fill="currentColor" />
                                           </div>
                                         )}
                                      </div>
                                      <div className="relative z-10">
                                         <span className="text-base font-black uppercase tracking-wider italic leading-none">{pm.name}</span>
                                      </div>
                                   </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'api' && (
            <div className="max-w-5xl mx-auto py-20 animate-in zoom-in-95 duration-700 text-center">
               <div className="inline-flex items-center gap-4 px-10 py-4 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black border border-emerald-500/30 uppercase tracking-[0.5em] shadow-2xl mb-12"><Database size={18} />INSTITUTIONAL API NODE</div>
               <h2 className="text-8xl font-black text-white tracking-tighter italic uppercase leading-none mb-10">Automate Integrity.</h2>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
