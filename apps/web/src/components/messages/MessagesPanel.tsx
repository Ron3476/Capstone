'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export function MessagesPanel() {
  const [messages, setMessages] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    api.messages.list().then((res) => setMessages(res.data as Record<string, unknown>[])).catch(console.error);
  }, []);

  return (
    <div className="space-y-3">
      {messages.map((m) => {
        const msg = m as {
          id: string; body: string; subject: string; isRead: boolean; createdAt: string;
          sender: { firstName: string; lastName: string };
        };
        return (
          <div key={msg.id} className="card p-4">
            <div className="flex justify-between mb-1">
              <span className="font-medium text-sm">{msg.sender.firstName} {msg.sender.lastName}</span>
              <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
            </div>
            {msg.subject && <p className="text-sm font-medium">{msg.subject}</p>}
            <p className="text-sm text-gray-500 mt-1">{msg.body}</p>
          </div>
        );
      })}
      {messages.length === 0 && <p className="text-center text-gray-400 py-12">No messages yet</p>}
    </div>
  );
}
