"use client";

import React from "react";

const sentimentColor = (sentiment) => {
  if (!sentiment) {
    return "";
  }
  const s = sentiment.toLowerCase();
  if (s.includes("negative")) return "bg-red-100 text-red-800";
  if (s.includes("positive")) return "bg-green-100 text-green-800";
  if (s.includes("neutral")) return "bg-gray-100 text-gray-800";
  return "bg-blue-100 text-blue-800";
};

export const TicketInsightCard = ({ data }) => {
  if (!data) {
    return null;
  }

  console.log("DATA", data);

  const {
    ticketIds,
    complaints,
    damages,
    sentiment,
    summary,
    keyEvents,
    isAutoExtension,
    openDamageCase,
  } = data;

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Reservation Insight
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Overview of related tickets, sentiment, and key events.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${sentimentColor(
              sentiment
            )}`}
          >
            Sentiment: {sentiment}
          </span>

          {isAutoExtension && (
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
              Auto-extension activity
            </span>
          )}

          {openDamageCase && (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              Open damage case: {openDamageCase}
            </span>
          )}
        </div>
      </div>

      {/* Top stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Tickets
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {ticketIds.length}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Linked ticket IDs in this reservation.
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Complaints
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">
            {complaints}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Formal complaint cases recorded.
          </p>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Damages
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{damages}</p>
          <p className="mt-1 text-xs text-gray-500">
            Damage cases linked to this booking.
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800">Summary</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">{summary}</p>
      </div>

      {/* Ticket IDs */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-800">Ticket IDs</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {ticketIds.map((id) => (
            <span
              key={id}
              className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-800"
            >
              #{id}
            </span>
          ))}
        </div>
      </div>

      {/* Key Events */}
      {/* <div>
        <h3 className="text-sm font-semibold text-gray-800">Key Events</h3>
        <ol className="mt-3 space-y-2 text-sm text-gray-700">
          {keyEvents.map((event, index) => (
            <li key={index} className="flex gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
              <span>{event}</span>
            </li>
          ))}
        </ol>
      </div> */}
    </div>
  );
};
