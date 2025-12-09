import React, { useState } from "react";
import Papa from "papaparse";
import { EventTable } from "./Table";
import { TicketInsightCard } from "./widget";

const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

function App() {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [prompt, setPrompt] = useState(
    `Summarise the description column in this csv file on the basis that you are outputting themes from 
    'other' note types that would tell a customer service agent want recent 
    activity there has been on this reservation. 
    
    please use the following output:

    {
      ticketIds: <list of ticket ids from the events>,
      complaints: <how many complaints or customer service complaints>
      damages: <number of damage cases in the events>
      sentiment: <general sentiment of the overall events>
      summary: <100 word summary of all of the events>
      keyEvents: <possible key events or milestones>
      isAutoExtension: <is this an auto extending booking>
      openDamageCase: <does this have an open damge case, if so pass the id here. A damage case is considered open as long as rhere is no later event closing the damage case>
    }

    `
  );
  const [events, setEvents] = useState([]);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setFileName(f ? f.name : "");
    setOutput("");
    setError("");
    setStatus("");

    if (!f) return;

    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setEvents(results.data); // then pass to <EventTable events={events} />
      },
    });

    handleSubmit(f);
  };

  const handleSubmit = async (file) => {
    if (!file) {
      setError("Please choose a file.");
      return;
    }

    setStatus("Reading file…");
    setError("");
    setOutput("");

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const fileText = reader.result;
        setStatus("Processing…");

        const input = prompt + ":\n\n" + fileText;

        const res = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-5.1",
            input,
            max_output_tokens: 50000,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text);
        }

        const data = await res.json();

        let textOut = "";

        if (Array.isArray(data.output)) {
          const msg = data.output.find((o) => o.type === "message");
          if (msg) {
            const txt = msg.content.find((c) => c.type === "output_text");
            if (txt) textOut = JSON.parse(txt.text);
          }
        }

        setOutput(textOut);
        setStatus("Done");
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong");
        setStatus("");
      }
    };

    reader.onerror = () => {
      setError("Failed to read file");
      setStatus("");
    };

    reader.readAsText(file);
  };

  const statusColor =
    status === "Done"
      ? "bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/40"
      : status
      ? "bg-sky-500/10 text-sky-300 ring-1 ring-sky-500/40"
      : "";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-10">
      <div className="mx-auto">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              Booking Event History Summarization
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Upload a CSV of reservation events and get an AI-generated case
              summary for agents.
            </p>
          </div>

          {status && status !== "Done" && (
            <div
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition ${statusColor}`}
            >
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-300" />
              </span>
              {status}
            </div>
          )}
          {status === "Done" && (
            <div
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition ${statusColor}`}
            >
              <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              Ready
            </div>
          )}
        </header>

        {/* Main card */}
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl shadow-[0_18px_60px_rgba(15,23,42,0.9)] backdrop-blur-xl p-6 md:p-8 space-y-6">
          {/* File input + info */}
          <section className="space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-[0.18em] text-slate-400 mb-2">
                CSV File
              </label>
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-slate-300 file:mr-3 file:py-2 file:px-4 
                    file:rounded-full file:border-0 file:bg-emerald-400 file:text-slate-900
                    hover:file:bg-emerald-300 cursor-pointer
                    bg-slate-900/60 border border-slate-700/60 rounded-xl px-3 py-2"
                />
                {fileName && (
                  <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1 text-xs text-slate-300 font-mono">
                    {fileName}
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                We only use the <code className="font-mono">description</code>{" "}
                column to build the summary.
              </p>
            </div>

            {/* Optional: show status & error inside card */}
            <div className="flex flex-col gap-2 text-xs">
              {status && status !== "Done" && (
                <div className="inline-flex items-center rounded-xl bg-slate-900/80 border border-slate-700/70 px-3 py-2 text-slate-300">
                  <span className="mr-2 h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
                  <span className="font-medium mr-1">Status:</span>
                  <span className="text-slate-300">{status}</span>
                </div>
              )}

              {error && (
                <div className="rounded-xl bg-red-950/70 border border-red-700/80 text-red-100 px-3 py-2 text-xs">
                  <div className="font-medium mb-0.5">Error</div>
                  <div className="text-red-200/90">{error}</div>
                </div>
              )}
            </div>
          </section>

          {/* Output + events */}
          <section className="grid grid-cols-1 gap-6 mt-4">
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-start justify-center">
                {output ? <TicketInsightCard data={output} /> : null}
              </div>
            </div>

            <div className="lg:col-span-3 space-y-3">
              <div className="flex items-center justify-between">
                {events.length > 0 && (
                  <span className="text-[11px] text-slate-500">
                    {events.length} rows
                  </span>
                )}
              </div>
              <div className="overflow-hidden flex flex-col">
                <div className="flex-1 overflow-auto custom-scrollbar">
                  {events.length ? <EventTable events={events} /> : null}
                </div>
              </div>
            </div>
          </section>

          {/* (Optional) show prompt in a collapsible for debugging */}
          {/* 
          <details className="mt-4 text-xs text-slate-400">
            <summary className="cursor-pointer select-none text-slate-300">
              Show system prompt
            </summary>
            <pre className="mt-2 whitespace-pre-wrap bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400">
              {prompt}
            </pre>
          </details>
          */}
        </div>
      </div>
    </div>
  );
}

export default App;
