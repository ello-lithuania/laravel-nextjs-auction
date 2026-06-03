"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { useToast } from "./ToastProvider";
import { categories } from "../data/categories";
import { inputClass, labelClass, primaryBtnClass } from "./AuthShell";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

const LOCATIONS = ["Vilnius", "Kaunas", "Klaipėda", "Šiauliai", "Panevėžys", "Alytus", "Marijampolė", "Kita"];
const DURATIONS = [
  { v: 1, l: "1 diena" },
  { v: 3, l: "3 dienos" },
  { v: 5, l: "5 dienos" },
  { v: 7, l: "7 dienos" },
  { v: 14, l: "14 dienų" },
];

export default function CreateListingForm() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { success, error: toastError } = useToast();

  const [mounted, setMounted] = useState(false);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [startingPrice, setStartingPrice] = useState("");
  const [durationDays, setDurationDays] = useState(7);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const subOptions = useMemo(
    () => categories.find((c) => c.label === category)?.children ?? [],
    [category],
  );

  if (mounted && !user) {
    return (
      <div className="text-center">
        <p className="font-display text-xl font-bold">Turi prisijungti</p>
        <p className="mt-1 text-muted">Skelbti gali tik prisijungę vartotojai — tai nemokama.</p>
        <div className="mt-5 flex justify-center gap-2.5">
          <Link href="/login" className={`w-auto px-6 ${primaryBtnClass}`}>Prisijungti</Link>
          <Link href="/register" className="press w-auto rounded-md border-[2.5px] border-ink bg-paper px-6 py-3 font-display font-bold shadow-chunky">Registruotis</Link>
        </div>
      </div>
    );
  }

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(Array.from(e.target.files ?? []).slice(0, 6));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !title.trim() || !description.trim() || !startingPrice || files.length === 0) {
      toastError("Užpildyk kategoriją, pavadinimą, aprašymą, kainą ir įkelk bent 1 nuotrauką.");
      return;
    }
    if (!token) {
      toastError("Jūsų sesija nebegalioja. Prisijunkite iš naujo.");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      fd.append("category", category);
      if (subcategory) fd.append("subcategory", subcategory);
      fd.append("location", location);
      fd.append("starting_price", startingPrice);
      fd.append("duration_days", String(durationDays));
      files.forEach((f) => fd.append("images[]", f));

      const res = await fetch(`${apiBaseUrl}/api/auctions`, {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = (await res.json().catch(() => null)) as { message?: string; auction?: { slug: string } } | null;
      if (!res.ok) throw new Error(data?.message ?? "Nepavyko paskelbti skelbimo.");
      success(data?.message ?? "Skelbimas paskelbtas! 🎉");
      if (data?.auction?.slug) {
        router.push(`/auction/?slug=${encodeURIComponent(data.auction.slug)}`);
      } else {
        router.push("/");
      }
    } catch (err) {
      toastError(err instanceof Error ? err.message : "Tinklo klaida.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Kategorija</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setSubcategory("");
            }}
            className={`mt-1.5 cursor-pointer ${inputClass}`}
          >
            <option value="">— pasirink —</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.label}>{c.icon} {c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Subkategorija</label>
          <select
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            disabled={subOptions.length === 0}
            className={`mt-1.5 cursor-pointer disabled:opacity-50 ${inputClass}`}
          >
            <option value="">— pasirink —</option>
            {subOptions.map((s) => (
              <option key={s.slug} value={s.label}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Pavadinimas</label>
        <input className={`mt-1.5 ${inputClass}`} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="pvz. iPhone 13, 128 GB" />
      </div>

      <div>
        <label className={labelClass}>Aprašymas</label>
        <textarea rows={5} className={`mt-1.5 resize-y ${inputClass}`} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Būklė, komplektacija, detalės…" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={labelClass}>Pradinė kaina (€)</label>
          <input type="number" min="1" step="1" className={`mt-1.5 ${inputClass}`} value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} placeholder="50" />
        </div>
        <div>
          <label className={labelClass}>Miestas</label>
          <select value={location} onChange={(e) => setLocation(e.target.value)} className={`mt-1.5 cursor-pointer ${inputClass}`}>
            {LOCATIONS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Trukmė</label>
          <select value={durationDays} onChange={(e) => setDurationDays(Number(e.target.value))} className={`mt-1.5 cursor-pointer ${inputClass}`}>
            {DURATIONS.map((d) => <option key={d.v} value={d.v}>{d.l}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Nuotraukos (iki 6)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={onFiles}
          className="mt-1.5 block w-full rounded-md border-[2.5px] border-ink bg-paper px-3 py-2.5 text-sm file:mr-3 file:rounded-md file:border-2 file:border-ink file:bg-gold file:px-3 file:py-1 file:font-bold"
        />
        {previews.length > 0 ? (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {previews.map((src, i) => (
              <img key={i} src={src} alt={`Nuotrauka ${i + 1}`} className="aspect-square w-full rounded-md border-2 border-ink object-cover" />
            ))}
          </div>
        ) : null}
      </div>

      <button type="submit" disabled={submitting} className={primaryBtnClass}>
        {submitting ? "Skelbiama…" : "Paskelbti skelbimą 🚀"}
      </button>
    </form>
  );
}
