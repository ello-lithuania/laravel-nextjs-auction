"use client";

import { useState } from "react";
import { useToast } from "./ToastProvider";
import { inputClass, labelClass, primaryBtnClass } from "./AuthShell";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export default function ContactForm() {
  const { success, error: toastError } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toastError("Užpildyk visus laukus.");
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      if (!res.ok) throw new Error(data?.message ?? "Nepavyko išsiųsti žinutės.");
      success(data?.message ?? "Žinutė išsiųsta!");
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Tinklo klaida.");
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className={labelClass}>Vardas</label>
        <input className={`mt-1.5 ${inputClass}`} value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>El. paštas</label>
        <input
          type="email"
          className={`mt-1.5 ${inputClass}`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="kad galėtume atsakyti"
        />
      </div>
      <div>
        <label className={labelClass}>Žinutė</label>
        <textarea
          rows={6}
          className={`mt-1.5 resize-y ${inputClass}`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Kuo galime padėti?"
        />
      </div>
      <button type="submit" disabled={sending} className={primaryBtnClass}>
        {sending ? "Siunčiama…" : "Siųsti žinutę ✉️"}
      </button>
    </form>
  );
}
