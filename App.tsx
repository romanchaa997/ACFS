
import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, Search, ShieldAlert, Database, CreditCard, Zap, 
  CheckCircle2, AlertTriangle, FileSearch, Users, History, Lock, 
  Clock, ShieldCheck, Globe, Download, AlertCircle, Layers, 
  Activity, X, CalendarDays, ShieldX, Fingerprint, Wallet, Coins, 
  Cpu, Info, RotateCcw, Flame, ArrowRight, BookOpenCheck, 
  Network, Server
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CasinoAnalysis, UserPlan, RiskLevel, PaymentMethod, RedFlag } from './types';
import { analyzeCasinoWithGemini } from './services/geminiService';

const presetData = {
  '7D': [
    { name: 'Mon', scans: 450 }, { name: 'Tue', scans: 520 }, { name: 'Wed', scans: 890 },
    { name: 'Thu', scans: 1100 }, { name: 'Fri', scans: 1450 }, { name: 'Sat', scans: 1200 }, { name: 'Sun', scans: 950 },
  ],
  '30D': [
    { name: 'W1', scans: 4200 }, { name: 'W2', scans: 5100 }, { name: 'W3', scans: 4800 }, { name: 'W4', scans: 6200 },
  ],
  '12M': [
    { name: 'Jan', scans: 15000 }, { name: 'Feb', scans: 18000 }, { name: 'Mar', scans: 22000 }, { name: 'Dec', scans: 45000 },
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

  const [plan, setPlan] = useState<UserPlan>({
    name: 'Enterprise Pro',
    scansUsed: 2492,
    scansLimit: 2500, 
    apiEnabled: true,
    tier: 'Enterprise'
  });

  const isLimitReached = plan.scansUsed >= plan.scansLimit;

  const currentChartData = useMemo(() => {
    return presetData[chartRange === 'Custom' ? '7D' : chartRange];
  }, [chartRange]);

  const filteredAnalyses = useMemo(() => {
    return analyses.filter(a => {
      const matchesUrl = a.url.toLowerCase().includes(scanSearch.toLowerCase());
      const matchesRisk = riskFilter === 'ALL' || a.riskLevel === riskFilter;
      return matchesUrl && matchesRisk;
    });
  }, [analyses, scanSearch, riskFilter]);

  // 5x5 Heatmap Distribution
  const heatmapData = useMemo(() => {
    const grid = Array(5).fill(0).map(() => Array(5).fill(0));
    analyses.forEach(a => {
      const p = Math.min(Math.max(a.probability || 1, 1), 5) - 1;
      const i = Math.min(Math.max(a.impact || 1, 1), 5) - 1;
      grid[p][i]++;
    });
    return grid;
  }, [analyses]);

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
      alert("Analysis engine failure.");
    } finally {
      setIsScanning(false);
    }
  };

  const resetFilters = () => {
    setScanSearch('');
    setRiskFilter('ALL');
  };

  const getHeatmapColor = (count: number, p: number, i: number) => {
    if (count === 0) return 'bg-slate-900/40';
    const score = (p + 1) * (i + 1);
    if (score > 15) return 'bg-rose-600/60 border-rose-500 text-white';
    if (score > 8) return 'bg-amber-600/60 border-amber-500 text-white';
    return 'bg-emerald-600/60 border-emerald-500 text-white';
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
              { id: 'scans', icon: History, label: 'Forensic Archive' },
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
          <div className={`p-6 rounded-[32px] border transition-all duration-500 ${isLimitReached ? 'bg-rose-950/30 border-rose-500/40' : 'bg-slate-900/60 border-slate-800 shadow-xl'}`}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Unit Quota</span>
              <span className={`text-[10px] font-black ${isLimitReached ? 'text-rose-500' : 'text-emerald-500 animate-pulse'}`}>
                {Math.round((plan.scansUsed / plan.scansLimit) * 100)}%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden mb-3">
              <div 
                className={`h-full transition-all duration-1000 ${isLimitReached ? 'bg-rose-500' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`} 
                style={{ width: `${Math.min(100, (plan.scansUsed / plan.scansLimit) * 100)}%` }}
              ></div>
            </div>
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
                  isScanning ? 'bg-slate-800 text-slate-500 animate-pulse' : isLimitReached ? 'bg-rose-950/50 text-rose-500' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl'
                }`}
              >
                {isScanning ? 'AUDITING...' : isLimitReached ? <Lock size={14} /> : 'RUN FORENSICS'}
              </button>
            </form>
          </div>

          <div className="flex items-center gap-8 pl-10 border-l border-slate-800/50">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shadow-inner">
                   <Users size={20} />
                </div>
                <div>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Active Node</p>
                   <p className="text-sm font-black text-white">{plan.tier} Pipeline</p>
                </div>
             </div>
          </div>
        </header>

        {/* Viewport Content */}
        <div className="flex-1 overflow-y-auto p-12 z-20 custom-scrollbar space-y-12">
          {activeTab === 'dashboard' && (
            <div className="space-y-12 animate-in fade-in duration-700">
               {/* Top Control Grid */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Forensic Throughput Chart */}
                  <div className="lg:col-span-8 glass p-10 rounded-[50px] border border-white/5 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><Network size={120} /></div>
                    <div className="flex items-center justify-between mb-10 relative z-10">
                      <h3 className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-4 uppercase">
                        <Activity className="text-emerald-500" size={28} />
                        Audit Performance
                      </h3>
                      <div className="flex bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
                        {['7D', '30D', '12M'].map((range) => (
                           <button key={range} onClick={() => setChartRange(range as any)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${chartRange === range ? 'bg-emerald-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}>{range}</button>
                        ))}
                      </div>
                    </div>
                    <div className="h-[300px] w-full relative z-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={currentChartData}>
                           <defs><linearGradient id="forensicGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient></defs>
                           <CartesianGrid strokeDasharray="8 8" stroke="#1e293b" vertical={false} opacity={0.3} />
                           <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dy={20} fontWeight="800" />
                           <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} dx={-20} fontWeight="800" />
                           <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '24px' }} />
                           <Area type="monotone" dataKey="scans" stroke="#10b981" fillOpacity={1} fill="url(#forensicGlow)" strokeWidth={4} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* 5x5 Risk Heatmap */}
                  <div className="lg:col-span-4 glass p-10 rounded-[50px] border border-white/5 shadow-2xl flex flex-col">
                    <h3 className="text-xl font-black text-white italic tracking-tighter flex items-center gap-4 uppercase mb-8">
                       <ShieldAlert className="text-amber-500" size={24} />
                       Risk P×I Matrix
                    </h3>
                    <div className="flex-1 grid grid-cols-5 gap-2.5">
                       {Array(5).fill(0).map((_, p) => (
                          Array(5).fill(0).map((__, i) => {
                            const count = heatmapData[4-p][i];
                            return (
                               <div 
                                 key={`${p}-${i}`}
                                 className={`rounded-xl border flex items-center justify-center text-[10px] font-black transition-all hover:scale-105 cursor-default ${getHeatmapColor(count, 4-p, i)}`}
                                 title={`Prob: ${5-p}, Impact: ${i+1}, Count: ${count}`}
                               >
                                 {count > 0 ? count : ''}
                               </div>
                            );
                          })
                       ))}
                    </div>
                    <div className="flex justify-between mt-6 text-[8px] font-black text-slate-500 uppercase tracking-widest italic">
                       <span>Low Impact → High Impact</span>
                       <span className="text-right">High Prob ↑</span>
                    </div>
                  </div>
               </div>

               {/* Pipeline Status Cards */}
               <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {[
                    { label: 'Integration Ingest', val: 'Operational', icon: Server, color: 'text-emerald-400' },
                    { label: 'Neural Normalizer', val: 'Active', icon: Cpu, color: 'text-blue-400' },
                    { label: 'Logic Execute', val: 'Stable', icon: Zap, color: 'text-amber-400' },
                    { label: 'AI Enrichment', val: 'Grok-4.1 Linked', icon: Fingerprint, color: 'text-purple-400' },
                  ].map((status, i) => (
                    <div key={i} className="glass p-8 rounded-[40px] border border-white/5 shadow-xl hover:border-slate-700 transition-all flex flex-col justify-between">
                       <div className="p-4 bg-slate-900 rounded-2xl w-fit mb-6 border border-slate-800">
                          <status.icon size={22} className={status.color} />
                       </div>
                       <div>
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] mb-1">{status.label}</p>
                          <p className={`text-lg font-black italic tracking-tighter ${status.color}`}>{status.val}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'scans' && (
            <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
              <div className="space-y-10">
                <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase flex items-center gap-6 leading-none">
                    <FileSearch size={48} className="text-emerald-500" />
                    Forensic Ledger
                </h2>
                
                {/* Advanced Filtering Suite */}
                <div className="glass p-8 rounded-[40px] border border-slate-800/60 shadow-2xl flex flex-col md:flex-row gap-8 items-center justify-between">
                   <div className="flex flex-col md:flex-row items-center gap-8 w-full md:w-auto">
                      <div className="relative group w-full md:w-80">
                        <input type="text" placeholder="Filter domain..." value={scanSearch} onChange={(e) => setScanSearch(e.target.value)} className="w-full bg-slate-900/60 border-2 border-slate-800 rounded-2xl px-6 py-4 pl-14 text-xs font-black focus:ring-8 focus:ring-emerald-500/5 transition-all outline-none" />
                        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-emerald-500" />
                      </div>
                      <div className="flex items-center gap-2 bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800">
                         {(['ALL', ...Object.values(RiskLevel)] as const).map((level) => (
                           <button key={level} onClick={() => setRiskFilter(level as any)} className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${riskFilter === level ? 'bg-slate-100 text-[#020617]' : 'text-slate-500 hover:text-slate-300'}`}>{level}</button>
                         ))}
                      </div>
                   </div>
                   <button onClick={resetFilters} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl text-slate-600 hover:text-rose-500 transition-all active:scale-95 group shadow-xl">
                      <RotateCcw size={20} className="group-hover:rotate-[-180deg] transition-transform duration-500" />
                   </button>
                </div>
              </div>

              {filteredAnalyses.length === 0 ? (
                <div className="glass rounded-[70px] p-48 text-center border-dashed border-4 border-slate-800/40 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-emerald-500/5 blur-3xl rounded-full opacity-20 -m-32 group-hover:scale-150 transition-transform duration-1000"></div>
                  <div className="w-32 h-32 rounded-[40px] bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto mb-10 text-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.5)]"><Layers size={64} /></div>
                  <h3 className="text-4xl font-black text-white mb-6 italic tracking-tight uppercase">Forensic Vault Empty</h3>
                  <p className="text-slate-500 max-w-xl mx-auto leading-relaxed font-bold text-xl opacity-70 uppercase tracking-widest italic">Submit a domain for real-time risk propagation assessment.</p>
                </div>
              ) : (
                <div className="space-y-16">
                  {filteredAnalyses.map((report) => (
                    <div key={report.id} className="glass rounded-[60px] overflow-hidden border border-slate-800/60 hover:border-emerald-500/40 transition-all group shadow-[0_50px_100px_-30px_rgba(0,0,0,0.6)]">
                      <div className="bg-slate-900/50 px-16 py-12 border-b border-slate-800/80 flex flex-wrap justify-between items-center gap-12">
                        <div className="flex items-center gap-10">
                          <div className={`w-24 h-24 rounded-[36px] flex items-center justify-center border-2 shadow-2xl ${report.riskLevel === RiskLevel.CRITICAL ? 'bg-rose-500/10 border-rose-500/40 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'}`}>
                            <Globe size={48} className="group-hover:rotate-12 transition-transform duration-700" />
                          </div>
                          <div>
                            <h3 className="text-5xl font-black text-white tracking-tighter italic leading-none mb-3">{report.url}</h3>
                            <div className="flex items-center gap-6">
                               <span className="text-xs text-slate-500 font-black uppercase tracking-[0.2em] flex items-center gap-2"><Clock size={18} className="text-slate-600" />{new Date(report.timestamp).toLocaleString()}</span>
                               <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${report.integration === 'SUCCESS' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                                  Audit Link: {report.id}
                               </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-12">
                           <div className="text-right">
                              <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.5em] mb-2 leading-none">RISK_SCORE</p>
                              <p className={`text-7xl font-black tracking-tighter leading-none ${report.riskScore > 75 ? 'text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]'}`}>{report.riskScore}</p>
                           </div>
                           <div className={`px-12 py-5 rounded-[28px] font-black tracking-[0.3em] text-xs uppercase border-2 shadow-2xl ${report.riskLevel === RiskLevel.CRITICAL ? 'bg-rose-600 border-rose-400 text-white animate-pulse' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'}`}>
                             {report.riskLevel} VERDICT
                           </div>
                        </div>
                      </div>

                      <div className="p-16 grid grid-cols-1 lg:grid-cols-12 gap-20 bg-slate-950/20 relative">
                        {/* Summary & Core Matrix Intelligence */}
                        <div className="lg:col-span-12 border-b border-slate-800/60 pb-16 flex flex-wrap gap-16">
                           <div className="flex-1 min-w-[300px]">
                              <div className="flex items-center gap-4 mb-10">
                                <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-500"><Cpu size={24}/></div>
                                <div>
                                   <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase">Forensic Summary</h4>
                                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">AI-Powered Audit Trail</p>
                                </div>
                              </div>
                              <p className="text-2xl text-slate-300 leading-relaxed font-bold italic selection:bg-emerald-500/40">"{report.summary}"</p>
                           </div>
                           
                           {/* PxI Vector Display */}
                           <div className="w-full lg:w-96 glass p-8 rounded-[44px] border-emerald-500/20 flex flex-col justify-center">
                              <div className="flex justify-between items-end mb-8">
                                 <div>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 italic">UAR Matrix Point</p>
                                    <p className="text-4xl font-black text-white italic tracking-tighter">P{report.probability} × I{report.impact}</p>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 italic">Zone</p>
                                    <p className="text-xl font-black text-emerald-400 uppercase tracking-tighter">{report.zone}</p>
                                 </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                 {report.threatVector.map((vec, idx) => (
                                    <span key={idx} className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest">{vec}</span>
                                 ))}
                              </div>
                           </div>
                        </div>

                        {/* Legal & Infra Breakdown */}
                        <div className="lg:col-span-12 space-y-10">
                           <div className="flex items-center gap-4">
                              <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-500"><BookOpenCheck size={24}/></div>
                              <h4 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Terms of Service Forensic Audit</h4>
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              {report.features.tosRedFlags.map((rf, idx) => (
                                 <div key={idx} className="group/flag relative p-10 bg-[#160a0c]/40 border-2 border-rose-950 rounded-[44px] hover:border-rose-500/40 transition-all shadow-xl overflow-hidden">
                                    <div className="absolute -top-10 -right-10 opacity-5 group-hover/flag:opacity-10 transition-opacity"><ShieldX size={160} /></div>
                                    <div className="flex items-center gap-5 mb-6">
                                       <div className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 group-hover/flag:scale-110 transition-transform"><AlertTriangle size={24}/></div>
                                       <h5 className="text-xl font-black text-rose-400 uppercase tracking-tighter italic leading-tight">{rf.flag}</h5>
                                    </div>
                                    <div className="relative pl-6 border-l-2 border-rose-900 group-hover/flag:border-rose-500 transition-colors">
                                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 opacity-60">Forensic Explanation</p>
                                       <p className="text-sm font-bold text-slate-300 leading-relaxed italic">{rf.explanation}</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>

                        {/* Infrastructure & Security State */}
                        <div className="lg:col-span-6 space-y-8">
                           <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] flex items-center gap-4">
                             <Activity size={20} className="text-blue-400" />
                             Security State
                           </h4>
                           <div className="bg-slate-900/50 p-10 rounded-[40px] border border-slate-800 space-y-6 shadow-xl">
                              <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">PQC Readiness</span>
                                 <span className={`text-xs font-black italic ${report.securityState.pqc === 'FULL' ? 'text-emerald-400' : 'text-slate-400'}`}>{report.securityState.pqc}</span>
                              </div>
                              <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secure Boot Validation</span>
                                 <span className={`text-xs font-black italic ${report.securityState.secureBoot ? 'text-emerald-400' : 'text-rose-400'}`}>{report.securityState.secureBoot ? 'ENABLED' : 'COMPROMISED'}</span>
                              </div>
                              <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SSL Expiry Ledger</span>
                                 <span className="text-xs font-black italic text-slate-200 font-mono">{report.features.sslExpiry}</span>
                              </div>
                           </div>
                        </div>

                        {/* Financial Vector Matrix */}
                        <div className="lg:col-span-6 space-y-8">
                           <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] flex items-center gap-4">
                             <CreditCard size={20} className="text-blue-400" />
                             Financial Vectors
                           </h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {report.features.paymentMethods.map((pm, idx) => (
                                <div key={idx} className={`relative p-8 rounded-[40px] border-2 transition-all ${pm.isHighRisk ? 'bg-[#1a0c0e] border-rose-500 text-rose-400 animate-pulse shadow-2xl' : 'bg-slate-900/40 border-slate-800 text-slate-400'}`}>
                                   <div className="flex items-center justify-between mb-8 relative z-10">
                                      <div className={`p-5 rounded-[22px] ${pm.isHighRisk ? 'bg-rose-500/20 text-rose-500' : 'bg-slate-800'}`}>
                                         {pm.name.toLowerCase().includes('crypto') ? <Coins size={28}/> : <Wallet size={28}/>}
                                      </div>
                                      {pm.isHighRisk && <Flame size={18} fill="currentColor" className="text-rose-500" />}
                                   </div>
                                   <span className="text-sm font-black uppercase tracking-wider italic leading-none">{pm.name}</span>
                                </div>
                              ))}
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
