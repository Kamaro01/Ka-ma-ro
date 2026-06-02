'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { createProductRequest, ProductRequest } from '@/services/productRequestService';

export default function RequestAProductInteractive() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    customerName: '',
    phone: '',
    email: '',
    productName: '',
    quantity: 1,
    budget: '',
    productLink: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<ProductRequest | null>(null);

  useEffect(() => {
    const query = searchParams?.get('q');
    if (query) {
      setForm((current) => ({
        ...current,
        productName: current.productName || query,
      }));
    }
  }, [searchParams]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const result = await createProductRequest(form);

    if (result.error || !result.data) {
      setError(result.error || 'Failed to submit your request.');
      setLoading(false);
      return;
    }

    setSuccess(result.data);
    setLoading(false);
    setForm({
      customerName: '',
      phone: '',
      email: '',
      productName: '',
      quantity: 1,
      budget: '',
      productLink: '',
      notes: '',
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 lg:py-12">
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-900 px-6 py-10 text-white shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
          Broker Request
        </p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Need a product we do not list yet?</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-200 sm:text-base">
          Send us the product name, link, or details. Ka-ma-ro will look for a trusted supplier,
          confirm the price, then contact you before any advance payment is required.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <div className="rounded-full bg-white/10 px-4 py-2">No need to hold stock</div>
          <div className="rounded-full bg-white/10 px-4 py-2">Price confirmed first</div>
          <div className="rounded-full bg-white/10 px-4 py-2">Partner sourcing in Rwanda</div>
        </div>
      </div>

      {success && (
        <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5">
          <p className="text-sm font-semibold text-green-700">Request received</p>
          <h2 className="mt-1 text-xl font-bold text-green-950">{success.requestNumber}</h2>
          <p className="mt-2 text-sm text-green-900">
            We saved your sourcing request for <strong>{success.productName}</strong>. Keep this
            number and wait for Ka-ma-ro to confirm supplier availability and pricing.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-950">Request form</h2>
          <p className="mt-2 text-sm text-slate-600">
            Fill this once and we will source the item as broker instead of forcing you to search
            elsewhere.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Your name</span>
              <input
                required
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-amber-500"
                placeholder="Your full name"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Phone number</span>
              <input
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-amber-500"
                placeholder="07XXXXXXXX"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Email</span>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-amber-500"
                placeholder="Optional"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Quantity</span>
              <input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) || 1 })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-amber-500"
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Product name</span>
            <input
              required
              value={form.productName}
              onChange={(e) => setForm({ ...form, productName: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-amber-500"
              placeholder="Example: Samsung S24 Ultra 256GB"
            />
          </label>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Budget or target price
              </span>
              <input
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-amber-500"
                placeholder="Example: 600,000 RWF"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">
                Product link or reference
              </span>
              <input
                value={form.productLink}
                onChange={(e) => setForm({ ...form, productLink: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-amber-500"
                placeholder="Optional URL"
              />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Extra details</span>
            <textarea
              rows={5}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-amber-500"
              placeholder="Color, storage, brand, delivery area, or any sourcing note"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex rounded-xl bg-amber-600 px-5 py-3 font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? 'Submitting request...' : 'Submit sourcing request'}
          </button>
        </form>

        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-950">How it works</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li>1. You request the product you want.</li>
              <li>2. Ka-ma-ro checks trusted partner shops or suppliers.</li>
              <li>3. We confirm the real price and timing with you.</li>
              <li>4. Only then do we ask for advance payment.</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
              Good fit
            </p>
            <p className="mt-2 text-sm text-amber-900">
              This is best for hard-to-find phones, accessories, bulk items, and products you saw
              somewhere else but want Ka-ma-ro to source safely.
            </p>
          </div>

          <Link
            href="/customer-support-center"
            className="inline-flex text-sm font-semibold text-slate-700 underline underline-offset-4"
          >
            Need general help instead? Open support center
          </Link>
        </div>
      </div>
    </div>
  );
}
