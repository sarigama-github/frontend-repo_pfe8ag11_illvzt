import { useEffect, useMemo, useState } from 'react'

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function Chat() {
  const [users, setUsers] = useState([])
  const [currentUserId, setCurrentUserId] = useState('')
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [newUser, setNewUser] = useState({ name: '', email: '' })

  // Load users
  useEffect(() => {
    fetch(`${API_URL}/api/users`).then(r => r.json()).then(setUsers).catch(() => {})
  }, [])

  // Load conversations for current user
  useEffect(() => {
    if (!currentUserId) return
    fetch(`${API_URL}/api/conversations?user_id=${currentUserId}`).then(r => r.json()).then(setConversations)
  }, [currentUserId])

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConv) return
    fetch(`${API_URL}/api/conversations/${activeConv.id}/messages`).then(r => r.json()).then(setMessages)
  }, [activeConv])

  const createUser = async () => {
    if (!newUser.name || !newUser.email) return
    const res = await fetch(`${API_URL}/api/users`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser) })
    if (res.ok) {
      const u = await res.json()
      setUsers(prev => [...prev, u])
      setCurrentUserId(u.id)
      setNewUser({ name: '', email: '' })
    }
  }

  const startConversation = async (otherId) => {
    if (!currentUserId || !otherId) return
    const res = await fetch(`${API_URL}/api/conversations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ participant_ids: [currentUserId, otherId] }) })
    if (res.ok) {
      const c = await res.json()
      setConversations(prev => [c, ...prev])
      setActiveConv(c)
    }
  }

  const sendMessage = async () => {
    if (!text || !activeConv) return
    const res = await fetch(`${API_URL}/api/messages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversation_id: activeConv.id, sender_id: currentUserId, content: text }) })
    if (res.ok) {
      const m = await res.json()
      setMessages(prev => [...prev, m])
      setText('')
      // refresh convs list order
      fetch(`${API_URL}/api/conversations?user_id=${currentUserId}`).then(r => r.json()).then(setConversations)
    }
  }

  const otherUsers = useMemo(() => users.filter(u => u.id !== currentUserId), [users, currentUserId])

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-3 bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
        <h3 className="text-white font-semibold mb-3">Users</h3>
        <div className="space-y-2 max-h-56 overflow-auto pr-2">
          {users.map(u => (
            <button key={u.id} onClick={() => setCurrentUserId(u.id)} className={`w-full text-left px-3 py-2 rounded-xl transition ${currentUserId===u.id? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-blue-100 hover:bg-slate-700'}`}>
              <div className="font-medium">{u.name}</div>
              <div className="text-xs opacity-70">{u.email}</div>
            </button>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <input value={newUser.name} onChange={e=>setNewUser(s=>({...s, name:e.target.value}))} placeholder="Name" className="w-full bg-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-400"/>
          <input value={newUser.email} onChange={e=>setNewUser(s=>({...s, email:e.target.value}))} placeholder="Email" className="w-full bg-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-400"/>
          <button onClick={createUser} className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-xl py-2">Add user</button>
        </div>
        <div className="mt-6">
          <h4 className="text-white font-semibold mb-2">Start conversation</h4>
          <div className="space-y-2 max-h-40 overflow-auto pr-2">
            {otherUsers.map(u => (
              <button key={u.id} onClick={()=>startConversation(u.id)} className="w-full bg-slate-700/50 hover:bg-slate-700 text-blue-100 rounded-xl px-3 py-2 text-left">
                with {u.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="col-span-4 bg-slate-800/60 border border-slate-700 rounded-2xl p-4">
        <h3 className="text-white font-semibold mb-3">Conversations</h3>
        <div className="space-y-2 max-h-[520px] overflow-auto pr-2">
          {conversations.map(c => (
            <button key={c.id} onClick={()=>setActiveConv(c)} className={`w-full text-left px-3 py-3 rounded-xl transition ${activeConv?.id===c.id? 'bg-blue-600 text-white' : 'bg-slate-700/50 text-blue-100 hover:bg-slate-700'}`}>
              <div className="font-medium">{c.title}</div>
              <div className="text-xs opacity-70 line-clamp-1">{c.last_message || 'No messages yet'}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="col-span-5 bg-slate-800/60 border border-slate-700 rounded-2xl p-4 flex flex-col">
        <h3 className="text-white font-semibold mb-3">Messages</h3>
        <div className="flex-1 overflow-auto space-y-3 pr-2">
          {messages.map(m => (
            <div key={m.id} className={`max-w-[80%] px-4 py-2 rounded-2xl ${m.sender_id===currentUserId? 'bg-blue-600 text-white ml-auto rounded-br-none' : 'bg-slate-700 text-blue-100 rounded-bl-none'}`}>
              {m.content}
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message" className="flex-1 bg-slate-700 rounded-xl px-3 py-2 text-white placeholder:text-slate-400"/>
          <button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4">Send</button>
        </div>
      </div>
    </div>
  )
}
