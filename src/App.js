import React, { useState } from "react";

const OPENAI_API_KEY = OPENAI_API_KEY;

function App() {
 const [file, setFile] = useState(null);
 const [fileName, setFileName] = useState("");
 const [output, setOutput] = useState("");
 const [status, setStatus] = useState("");
 const [error, setError] = useState("");
 const [prompt, setPrompt] = useState(
  "Summarise the description column in this csv file on the basis that you are outputting themes from 'other' note types that would tell a customer service agent want recent activity there has been on this reservation. Summarise it in 100 words based on a timeline style summary below this produce bullet points showing key reference numbers such as ticket numbers, damage ids etc. excluding telephone numbers; where it is contained in the original data. Output the timeframe this happened in and look only at the last 3 months. Output this as JSON"
 );

 const handleFileChange = (e) => {
  const f = e.target.files[0];
  setFile(f || null);
  setFileName(f ? f.name : "");
  setOutput("");
  setError("");
  setStatus("");
 };

 const handleSubmit = async (e) => {
  e.preventDefault();

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
    setStatus("Sending to OpenAI…");

    const input = prompt + ":\n\n" + fileText;

    const res = await fetch("https://api.openai.com/v1/responses", {
     method: "POST",
     headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
     },
     body: JSON.stringify({
      model: "gpt-4.1-mini",
      input,
      max_output_tokens: 1500,
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
      if (txt) textOut = txt.text;
     }
    }

    setOutput(
     textOut ||
      "Could not extract output_text. Raw response:\n\n" +
       JSON.stringify(data, null, 2)
    );
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
    <h1 className="text-2xl font-semibold mb-2">OpenAI File Demo</h1>
    <p className="text-slate-400 mb-6">
     Upload a file → send it to OpenAI → show the formatted output.
    </p>

    <form onSubmit={handleSubmit} className="space-y-4">
     <div>
      <label className="block text-sm mb-1 font-medium">Prompt</label>
      <textarea
       className="block w-full text-sm text-slate-300 mr-3 py-2 px-4 
                rounded-lg border-0 text-slate-900
                hover:bg-emerald-300 cursor-pointer"
       value={prompt}
       onChange={(e) => setPrompt(e.target.value)}
      ></textarea>
      <label className="block text-sm mb-1 font-medium">Choose a file</label>
      <input
       type="file"
       onChange={handleFileChange}
       className="block w-full text-sm text-slate-300 file:mr-3 file:py-2 file:px-4 
                file:rounded-full file:border-0 file:bg-emerald-400 file:text-slate-900
                hover:file:bg-emerald-300 cursor-pointer"
      />
      {fileName && (
       <p className="text-xs text-slate-400 mt-1">
        Selected: <span className="font-mono">{fileName}</span>
       </p>
      )}
     </div>

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
     </button>
    </form>

    {status && (
     <div className="mt-4 text-xs text-slate-400">Status: {status}</div>
    )}

    {error && (
     <div className="mt-4 bg-red-900/40 border border-red-700 text-red-200 px-4 py-2 rounded-lg">
      {error}
     </div>
    )}

    <div className="mt-8">
     <h2 className="text-lg font-semibold mb-2">Output</h2>

     {!output && !error && (
      <p className="text-slate-500 text-sm">
       No output yet. Upload a file and click <b>Send to OpenAI</b>.
      </p>
     )}

     {output && (
      <pre className="bg-white text-black border border-slate-700 p-4 rounded-xl whitespace-pre-wrap overflow-auto max-h-[60vh] text-sm">
       {/* <div
                style={{
                  color: "#000000 !important",
                }}
                dangerouslySetInnerHTML={createMarkup(output)}
              // /> */}
       {output}
      </pre>
     )}
    </div>
   </div>
  </div>
 );
}

export default App;
