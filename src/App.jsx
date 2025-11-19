import { useState } from 'react'
import Header from './components/Header'
import Chat from './components/Chat'
import Email from './components/Email'

function App() {
  const [active, setActive] = useState('chat')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-blue-100">
      <div className="absolute inset-0 bg-[radial-gradient(60rem_30rem_at_50%_-10%,rgba(59,130,246,0.15),transparent),radial-gradient(40rem_20rem_at_10%_60%,rgba(99,102,241,0.12),transparent),radial-gradient(50rem_30rem_at_90%_40%,rgba(56,189,248,0.12),transparent)]"/>
      <Header active={active} setActive={setActive} />

      <main className="relative max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">All-in-one communication</h1>
          <p className="text-blue-200/80 mt-1">Manage real-time chats and emails in a single, polished interface.</p>
        </div>

        {active === 'chat' ? (
          <Chat />
        ) : (
          <Email />
        )}
      </main>

      <footer className="relative mt-16 pb-10 text-center text-blue-300/60">
        Built with love • Demo app
      </footer>
    </div>
  )
}

export default App
