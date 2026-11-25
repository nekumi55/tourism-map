'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ họ tên, email và nội dung góp ý.');
      return;
    }
    setErrorMsg('');
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="p-6 sm:p-8 rounded-xl bg-[var(--accent-jade-soft)] border border-[var(--accent-jade)]/25 text-center space-y-3"
      >
        <CheckCircle2 className="w-10 h-10 text-[var(--accent-jade)] mx-auto" aria-hidden="true" />
        <h3 className="font-serif font-semibold text-[var(--ink-primary)] text-lg">
          Đã tiếp nhận đóng góp của bạn
        </h3>
        <p className="text-sm text-[var(--ink-secondary)] leading-relaxed">
          Cảm ơn {form.name.trim()} đã gửi thông tin. Chúng tôi sẽ rà soát và cập nhật dữ liệu địa điểm trong thời gian sớm nhất.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setForm({ name: '', email: '', message: '' });
          }}
          className="min-h-11 px-4 text-sm font-semibold text-[var(--accent-jade)] hover:underline cursor-pointer"
        >
          Gửi phản hồi khác
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label
          htmlFor="contact-name"
          className="block text-sm font-semibold text-[var(--ink-primary)] mb-1.5"
        >
          Họ và tên
        </label>
        <input
          id="contact-name"
          type="text"
          autoComplete="name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Nguyễn Văn An"
          className="w-full min-h-12 px-3.5 py-2.5 text-base sm:text-sm rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:border-[var(--accent-jade)] focus:bg-[var(--bg-surface)] transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="contact-email"
          className="block text-sm font-semibold text-[var(--ink-primary)] mb-1.5"
        >
          Email liên hệ
        </label>
        <input
          id="contact-email"
          type="email"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="ten@example.com"
          className="w-full min-h-12 px-3.5 py-2.5 text-base sm:text-sm rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:border-[var(--accent-jade)] focus:bg-[var(--bg-surface)] transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="block text-sm font-semibold text-[var(--ink-primary)] mb-1.5"
        >
          Nội dung đóng góp
        </label>
        <textarea
          id="contact-message"
          rows={4}
          required
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          placeholder="Chia sẻ thông tin địa điểm, tọa độ hoặc góp ý trải nghiệm bản đồ..."
          className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:border-[var(--accent-jade)] focus:bg-[var(--bg-surface)] transition-colors"
        />
      </div>

      {errorMsg && (
        <p role="alert" className="text-xs sm:text-sm font-medium text-[#9A3412]">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        className="ui-interactive-press w-full min-h-12 rounded-lg bg-[var(--accent-jade)] hover:bg-[var(--accent-jade-hover)] text-[#FFFDF9] font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
      >
        <Send className="w-4 h-4" aria-hidden="true" />
        <span>Gửi đóng góp ý kiến</span>
      </button>
    </form>
  );
}
