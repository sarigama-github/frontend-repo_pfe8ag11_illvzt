import { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function Email() {
  const [owner, setOwner] = useState('')
  const [emails, setEmails] = useState([])
  const [folder, setFolder] = useState('inbox')
  const [compose, setCompose] = useState({ sender: '', to: '', subject: '', body: '' })

  useEffect(() => {
    if (!owner) return
    fetch(`${API_URL}/api/emails?owner=${owner}&folder=${folder}`).then(r => r.json()).then(setEmails)
  }, [owner, folder])

  const send = async () => {
    if (!compose.sender || !compose.to || !compose.subject) return
    const payload = { sender: compose.sender, to: compose.to.split(',').map(s=>s.trim()), subject: compose.subject, body: compose.body }
    const res = await fetch(`${API_URL}/api/emails`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (res.ok) {
      setCompose({ sender: compose.sender, to: '', subject: '', body: '' })
      if (owner) {
        fetch(`${API_URL}/api/emails?owner=${owner}&folder=${folder}`).then(r => r.json()).then(setEmails)
      }
    }
  }

  const move = async (id, toFolder) => {
    await fetch(`${API_URL}/api/emails/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ folder: toFolder }) })
    fetch(`${API_URL}/api/emails?owner=${owner}&folder=${folder}`).then(r => r.json()).then(setEmails)
  }

  const markRead = async (id, read) => {
    await fetch(`${API_URL}/api/emails/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ read }) })
    fetch(`${API_URL}/api/emails?owner=${owner}&folder=${folder}`).then(r => r.json()).then(setEmails)
  }

  const folders = useMemo(() => ['inbox', 'sent', 'trash', 'archived'], [])

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-3 bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
        <h3 className="text-white font-semibold mb-3">Mailbox</h3>
        <div className="space-y-2">
          <input value={owner} onChange={e=>setOwner(e.target.value)} placeholder="Your email (owner)" className="w-full bg-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-400"/>
          <div className="flex gap-2">
            {folders.map(f => (
              <button key={f} onClick={()=>setFolder(f)} className={`px-3 py-1 rounded-xl text-sm ${folder===f? 'bg-blue-600 text-white' : 'bg-slate-700/60 text-blue-100 hover:bg-slate-700'}`}>{f}</button>
            ))}
          </div>
        </div>
        <div className="mt-6 space-y-2">
          <h4 className="text-white font-semibold">Compose</h4>
          <input value={compose.sender} onChange={e=>setCompose(s=>({...s, sender:e.target.value}))} placeholder="From" className="w-full bg-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-400"/>
          <input value={compose.to} onChange={e=>setCompose(s=>({...s, to:e.target.value}))} placeholder="To (comma separated)" className="w-full bg-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-400"/>
          <input value={compose.subject} onChange={e=>setCompose(s=>({...s, subject:e.target.value}))} placeholder="Subject" className="w-full bg-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-400"/>
          <textarea value={compose.body} onChange={e=>setCompose(s=>({...s, body:e.target.value}))} placeholder="Write your email..." className="w-full h-28 bg-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-400"/>
          <button onClick={send} className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-2">Send</button>
        </div>
      </div>

      <div className="col-span-9 bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
        <h3 className="text-white font-semibold mb-3">{folder.charAt(0).toUpperCase()+folder.slice(1)}</h3>
        <div className="space-y-2 max-h-[600px] overflow-auto pr-2">
          {emails.map(e => (
            <div key={e.id} className="bg-slate-700/50 hover:bg-slate-700 transition rounded-2xl p-4 flex items-start gap-4">
              <div className={`w-2 h-2 mt-2 rounded-full ${e.read? 'bg-slate-500' : 'bg-blue-500'}`}></div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <div className="text-white font-medium">{e.subject}</div>
                  <div className="text-blue-200/70 text-sm">{new Date(e.created_at).toLocaleString()}</div>
                </div>
                <div className="text-blue-200/80 text-sm line-clamp-2">{e.body}</div>
                <div className="text-xs text-blue-300/60 mt-1">From: {e.sender} • To: {e.to?.join(', ')}</div>
                <div className="mt-2 flex gap-2">
                  <button onClick={()=>markRead(e.id, !e.read)} className="px-3 py-1 rounded-xl text-xs bg-slate-600 text-white">{e.read? 'Mark unread' : 'Mark read'}</button>
                  <button onClick={()=>move(e.id, 'archived')} className="px-3 py-1 rounded-xl text-xs bg-slate-600 text-white">Archive</button>
                  <button onClick={()=>move(e.id, 'trash')} className="px-3 py-1 rounded-xl text-xs bg-red-600 text-white">Trash</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
