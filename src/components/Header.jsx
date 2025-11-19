export default function Header({ active, setActive }) {
  const tabs = [
    { key: 'chat', label: 'Chat' },
    { key: 'email', label: 'Email' },
  ]
  return (
    <div className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-slate-900/50 bg-slate-900/70 border-b border-blue-500/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/flame-icon.svg" alt="Flames" className="w-8 h-8" />
          <div className="text-white font-semibold tracking-tight">Chat & Mail</div>
        </div>
        <div className="flex gap-2 bg-slate-800/60 p-1 rounded-xl border border-slate-700">
          {tabs.map(t => (
            <button key={t.key} onClick={()=>setActive(t.key)} className={`px-4 py-1.5 rounded-lg text-sm transition ${active===t.key? 'bg-blue-600 text-white' : 'text-blue-100 hover:bg-slate-700'}`}>{t.label}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
