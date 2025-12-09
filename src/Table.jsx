// EventTable.tsx
import React from "react";

const columns = [
  "Date",
  "Description",
  "User",
  "Supplier",
  "Supplier Contact",
  "Account Contact",
  "Event Type",
];

// Optional: sample data – replace this with your real data
const sampleEvents = [
  {
    Date: "10-07-2023 14:57",
    Description: "By Hamida Khan",
    User: "INTERNET_USER",
    Supplier: "",
    "Supplier Contact": "",
    "Account Contact": "Hamida Khan",
    "Event Type": "Request",
  },
  {
    Date: "",
    Description: "",
    User: "",
    Supplier: "",
    "Supplier Contact": "",
    "Account Contact": "",
    "Event Type": "(Original Booking)",
  },
  {
    Date: "10-07-2023 14:57",
    Description:
      "No authorisation needed on booking. Matched group/days exception rule.",
    User: "INTERNET_USER",
    Supplier: "",
    "Supplier Contact": "",
    "Account Contact": "",
    "Event Type": "Note Added",
  },
  {
    Date: "10-07-2023 14:59",
    Description:
      "By Sup. AUTOMATIC Supplier emailed with the booking request and the booking has been changed to UNCONFIRMED",
    User: "",
    Supplier: "Salford Van Hire Ltd (Leeds)",
    "Supplier Contact": "AUTOMATIC",
    "Account Contact": "",
    "Event Type": "Accept",
  },
  {
    Date: "10-07-2023 15:16",
    Description:
      "Offer made by supplier: Vehicle available but must be collected from depot and returned to depot. Insurance required.",
    User: "SUPPLIER_INTERNET_USER",
    Supplier: "",
    "Supplier Contact": "",
    "Account Contact": "",
    "Event Type": "Note Added",
  },
];

export const EventTable = ({ events = sampleEvents }) => {
  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Event Table</h2>
        <p className="text-xs text-gray-500">
          Showing {events.length} event{events.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="whitespace-nowrap px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-600"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {events.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                {columns.map((col) => (
                  <td
                    key={String(col)}
                    className="max-w-xs truncate px-4 py-2 align-top text-xs text-gray-800"
                    title={row[col] || ""}
                  >
                    {row[col] || ""}
                  </td>
                ))}
              </tr>
            ))}

            {events.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  No events to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
