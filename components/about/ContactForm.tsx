'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, Info } from 'lucide-react';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-8 rounded-3xl bg-teal-50 border border-teal-200 text-center space-y-3">
        <CheckCircle2 className="w-10 h-10 text-teal-600 mx-auto" />
        <h4 className="font-bold text-slate-900 text-base">Cảm ơn bạn đã gửi ý kiến!</h4>
        <p className="text-xs text-slate-600">
          Phản hồi của bạn đã được ghi nhận vào hệ thống để phục vụ cải thiện trải nghiệm bản đồ số.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setForm({ name: '', email: '', message: '' });
          }}
          className="text-xs font-semibold text-teal-700 underline"
        >
          Gửi phản hồi khác
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
          Họ và tên
        </label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nguyễn Văn A"
          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-teal-500 focus:bg-white transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
          Email liên hệ
        </label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="email@example.com"
          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-teal-500 focus:bg-white transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
          Nội dung đóng góp ý kiến
        </label>
        <textarea
          rows={4}
          required
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Đóng góp về tính năng bản đồ, địa điểm mới hoặc trải nghiệm giao diện..."
          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-teal-500 focus:bg-white transition-colors"
        />
      </div>

      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-teal-50/80 border border-teal-100 text-[11px] text-teal-800">
        <Info className="w-4 h-4 text-teal-600 shrink-0" />
        <span>Biểu mẫu thử nghiệm: Phản hồi được mô phỏng tiếp nhận trong hệ thống.</span>
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
      >
        <Send className="w-3.5 h-3.5" />
        <span>Gửi Đóng Góp Ý Kiến</span>
      </button>
    </form>
  );
}
