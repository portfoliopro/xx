"use client";
import { useState } from "react";

export default function ProductForm({ onSaved }: any) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [paymentUrl, setPaymentUrl] = useState("");

  const submit = async () => {
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, paymentUrl }),
    });

    setName(""); setSlug(""); setPaymentUrl("");
    onSaved();
  };

  return (
    <div>
      <h3>إضافة منتج</h3>
      <input placeholder="اسم المنتج" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="slug" value={slug} onChange={e => setSlug(e.target.value)} />
      <input placeholder="رابط الدفع" value={paymentUrl} onChange={e => setPaymentUrl(e.target.value)} />
      <button onClick={submit}>حفظ</button>
    </div>
  );
}
