'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProductRequests, ProductRequest } from '@/services/productRequestService';

const statusStyles: Record<string, string> = {
  new: 'bg-amber-100 text-amber-800',
  reviewing: 'bg-blue-100 text-blue-800',
  quoted: 'bg-purple-100 text-purple-800',
  sourced: 'bg-green-100 text-green-800',
  closed: 'bg-slate-200 text-slate-700',
};

export default function AdminSourcingRequestsInteractive() {
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const result = await getProductRequests();
      setRequests(result.data);
      setLoading(false);
    };

    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
      <div className="flex flex-col gap-4 rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-300">
            Admin Broker Desk
          </p>
          <h1 className="mt-2 text-3xl font-bold">Sourcing requests</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-200">
            Review products customers want Ka-ma-ro to source as broker, then confirm price,
            supplier, and payment terms manually.
          </p>
        </div>
        <Link
          href="/request-a-product"
          className="inline-flex rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950"
        >
          Open customer request form
        </Link>
      </div>

      <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          <div>Total requests: {requests.length}</div>
          <div>New: {requests.filter((request) => request.status === 'new').length}</div>
          <div>Guest/browser requests: {requests.filter((request) => request.source === 'guest').length}</div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-white shadow-sm">
        {loading ? (
          <div className="p-6 text-sm text-slate-600">Loading sourcing requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-6 text-sm text-slate-600">
            No sourcing requests yet. When customers use the broker form, they will appear here.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {requests.map((request) => (
              <div key={request.id} className="p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-bold text-slate-950">{request.productName}</h2>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[request.status]}`}
                      >
                        {request.status}
                      </span>
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {request.source}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      Request number: <strong>{request.requestNumber}</strong>
                    </p>
                    <p className="text-sm text-slate-600">
                      Customer: <strong>{request.customerName}</strong> | Phone:{' '}
                      <strong>{request.phone}</strong>
                    </p>
                    {request.email && (
                      <p className="text-sm text-slate-600">
                        Email: <strong>{request.email}</strong>
                      </p>
                    )}
                  </div>

                  <div className="text-sm text-slate-600">
                    {new Date(request.createdAt).toLocaleString('en-RW', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Quantity</p>
                    <p className="mt-1 font-semibold text-slate-950">{request.quantity}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Budget</p>
                    <p className="mt-1 font-semibold text-slate-950">{request.budget || 'Not given'}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Reference link</p>
                    <p className="mt-1 break-all font-semibold text-slate-950">
                      {request.productLink || 'No link shared'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Customer notes</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                    {request.notes || 'No extra notes'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
