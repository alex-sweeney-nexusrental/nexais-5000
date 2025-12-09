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
    activity there has been on this reservation. Summarise it in 100 words based 
    on a timeline style summary below this produce bullet points showing key reference 
    numbers such as ticket numbers, damage ids etc. excluding telephone numbers; 
    where it is contained in the original data. Output the timeframe this happened in and 
    look only at the last 3 months. Output this as JSON
    
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
    const f = e.target.files[0];
    setFile(f || null);
    setFileName(f ? f.name : "");
    setOutput("");
    setError("");
    setStatus("");
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
        setStatus("Processing....");

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
        setError(err.message);
        setStatus("");
      }
    };

    reader.onerror = () => {
      setError("Failed to read file");
      setStatus("");
    };

    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="mx-auto bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-700">
        <h1 className="text-2xl font-semibold mb-2">
          Booking event history summarization demo
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            {/* <label className="block text-sm mb-1 font-medium">Prompt</label>
            <textarea
              className="block w-full text-sm text-slate-300 mr-3 py-2 px-4 
                rounded-lg border-0 text-slate-900
                hover:bg-emerald-300 cursor-pointer"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            ></textarea> */}
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-300 file:mr-3 file:py-2 file:px-4 
                file:rounded-full file:border-0 file:bg-emerald-400 file:text-slate-900
                hover:file:bg-emerald-300 cursor-pointer"
            />
            {/* {fileName && (
              <p className="text-xs text-slate-400 mt-1">
                Selected: <span className="font-mono">{fileName}</span>
              </p>
            )} */}
          </div>
          {/* 
          <button
            type="submit"
            className={`px-6 py-2 rounded-full text-slate-900 font-semibold 
              ${
                file
                  ? "bg-emerald-400 hover:bg-emerald-300"
                  : "bg-slate-600 cursor-not-allowed"
              }`}
            disabled={!file}
          >
            Send to OpenAI
          </button> */}
        </form>

        {status !== "Done" && <div className="mt-4">Status: {status}</div>}

        {error && (
          <div className="mt-4 bg-red-900/40 border border-red-700 text-red-200 px-4 py-2 rounded-lg">
            {error}
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-2">Output</h2>

          {output && <TicketInsightCard data={output} />}

          {events.length && <EventTable events={events} />}
        </div>
      </div>
    </div>
  );
}

export default App;
