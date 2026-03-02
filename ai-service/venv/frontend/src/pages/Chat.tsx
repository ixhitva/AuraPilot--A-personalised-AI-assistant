import { useState, useEffect, useRef } from 'react';
import API from '../api';

interface Message { role: 'user' | 'assistant'; content: string; sentiment?: string; }

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [persona, setPersona] = useState('Friendly');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    API.get('/chat/history').then(r => setMessages(r.data.messages || []));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);
    try {
      const { data } = await API.post('/chat/message', {
        message: input,
        history: updatedMessages.slice(-6).map(m => ({ role: m.role, content: m.content }))
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, sentiment: data.sentiment }]);
    } catch { setMessages(prev => [...prev, { role: 'assistant', content: 'Error getting response.' }]); }
    setLoading(false);
  };

  const clearChat = async () => {
    await API.delete('/chat/history');
    setMessages([]);
  };

  const sentimentColor = (s?: string) =>
    s === 'positive' ? 'border-l-4 border-green-400' : s === 'negative' ? 'border-l-4 border-red-400' : '';

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
        <h1 className="text-xl font-bold text-purple-400">🤖 AuraPilot</h1>
        <div className="flex gap-3 items-center">
          <select
            value={persona}
            onChange={e => { setPersona(e.target.value); API.put('/chat/persona', { persona: e.target.value }); }}
            className="bg-gray-800 text-sm rounded px-2 py-1 border border-gray-700"
          >
            {['Friendly', 'Professional', 'Witty', 'Empathetic'].map(p => <option key={p}>{p}</option>)}
          </select>
          <button onClick={clearChat} className="text-sm bg-red-700 hover:bg-red-600 px-3 py-1 rounded">
            Clear
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-4xl mb-2">🤖</p>
            <p>Hi! I'm AuraPilot. Ask me anything.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm ${
              msg.role === 'user'
                ? 'bg-purple-600 text-white rounded-br-none'
                : `bg-gray-800 text-gray-100 rounded-bl-none ${sentimentColor(msg.sentiment)}`
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none">
              <span className="animate-pulse">AuraPilot is thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-gray-900 border-t border-gray-800 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask AuraPilot anything..."
          className="flex-1 bg-gray-800 rounded-xl px-4 py-3 text-sm outline-none border border-gray-700 focus:border-purple-500"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-5 py-3 rounded-xl font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}
