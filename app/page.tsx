"use client";

import { useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export default function HomePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'sys-1', role: 'system', content: 'Welcome! Ask me anything.' },
  ]);
  const [input, setInput] = useState('');
  const [temperature, setTemperature] = useState(0.5);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const gradient = useMemo(() => (
    `conic-gradient(from 180deg at 50% 50%, rgba(99,102,241,.35), rgba(236,72,153,.35), rgba(14,165,233,.35), rgba(99,102,241,.35))`
  ), []);

  async function sendPrompt() {
    const prompt = input.trim();
    if (!prompt || loading) return;
    setInput('');
    setLoading(true);

    const user: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: prompt };
    setMessages(prev => [...prev, user]);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, temperature })
      });
      const data = await res.json();
      const text = data?.response ?? data?.error ?? 'Unknown error';
      const assistant: ChatMessage = { id: crypto.randomUUID(), role: data?.success ? 'assistant' : 'system', content: text };
      setMessages(prev => [...prev, assistant]);
    } catch (e: any) {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'system', content: String(e?.message || e) }]);
    } finally {
      setLoading(false);
      queueMicrotask(() => containerRef.current?.scrollTo({ top: containerRef.current.scrollHeight, behavior: 'smooth' }));
    }
  }

  return (
    <main className="relative min-h-dvh overflow-hidden">
      <div className="pointer-events-none fixed inset-0 grid-overlay opacity-40" />
      <div
        className="absolute -left-40 -top-40 h-96 w-96 rounded-full blur-3xl spin-slow"
        style={{ background: gradient }}
      />

      <div className="mx-auto grid min-h-dvh max-w-4xl grid-rows-[auto,1fr,auto] gap-6 p-6">
        <header className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-brand-500/40" />
              <div>
                <p className="font-semibold">Agentic UI</p>
                <p className="text-xs text-white/60">Gemini powered answers</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="hidden sm:block text-white/60">Temperature</div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="accent-brand-400"
                aria-label="temperature"
              />
              <div className="w-12 text-right tabular-nums text-white/80">{temperature.toFixed(1)}</div>
            </div>
          </div>
        </header>

        <section ref={containerRef} className="glass relative rounded-2xl p-4 sm:p-6 overflow-auto">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/5 to-transparent rounded-2xl" />
          <div>
            {messages.map((m) => (
              <div
                key={m.id}
                className={clsx('mb-3 flex gap-3 fade-in-up', m.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                {m.role !== 'user' && (
                  <div className="mt-1 size-8 shrink-0 rounded-full bg-brand-500/40" />
                )}
                <div className={clsx('max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
                  m.role === 'user' ? 'bg-white/15 text-white' : 'bg-white/10 text-white/90')}
                >
                  {m.content}
                </div>
                {m.role === 'user' && (
                  <div className="mt-1 size-8 shrink-0 rounded-full bg-white/20" />
                )}
              </div>
            ))}
            {loading && (
              <div className="mt-2 fade-in">
                <div className="shimmer inline-block rounded-2xl bg-white/10 px-4 py-3 text-sm text-white/70">Thinking…</div>
              </div>
            )}
          </div>
        </section>

        <footer className="glass rounded-2xl p-3">
          <div className="flex items-center gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendPrompt()}
              placeholder="Ask anything…"
              className="grow rounded-xl bg-white/10 px-4 py-3 outline-none placeholder:text-white/50"
            />
            <button
              onClick={sendPrompt}
              disabled={loading || !input.trim()}
              className="rounded-xl bg-brand-500 px-5 py-3 font-medium text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
