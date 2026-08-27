"use client";

import { useActionState, useMemo, useState } from "react";
import { FileJson, Upload } from "lucide-react";
import { bulkImportTasks, type BulkImportState } from "@/app/bulk-actions";

type Option = { id: string; title: string };
const example = JSON.stringify([{ title: "Example task", scheduledDate: "2026-08-28", dueDate: "2026-08-30", priority: "high", tags: ["example", "planning"] }], null, 2);
const initialBulkImportState: BulkImportState = { status: "idle", message: "" };

export function BulkTaskUpload({ goals, focusPeriods, outcomes }: { goals: Option[]; focusPeriods: Option[]; outcomes: Option[] }) {
  const [json, setJson] = useState(example);
  const [fileError, setFileError] = useState("");
  const [state, action, pending] = useActionState(bulkImportTasks, initialBulkImportState);
  const preview = useMemo(() => {
    try {
      const value: unknown = JSON.parse(json);
      if (!Array.isArray(value)) return { error: "The top-level JSON value must be an array.", tasks: [] };
      return { error: "", tasks: value.filter((item): item is { title?: unknown } => typeof item === "object" && item !== null) };
    } catch { return { error: "JSON is not valid yet.", tasks: [] }; }
  }, [json]);

  async function readFile(file?: File) {
    setFileError("");
    if (!file) return;
    if (file.size > 200_000) { setFileError("The selected file is larger than 200 KB."); return; }
    setJson(await file.text());
  }

  return <form action={action} className="stack">
    <section className="card stack">
      <div><p className="eyebrow" style={{ margin: 0 }}>Step 1</p><h2 style={{ margin: ".3rem 0" }}>Choose relationships</h2><p className="muted" style={{ margin: 0, fontSize: 14 }}>These selections will be applied to every task in this upload.</p></div>
      <fieldset style={{ border: 0, padding: 0 }}><legend className="label">Goals (optional, select any that apply)</legend><div className="relation-grid">{goals.length ? goals.map((goal) => <label key={goal.id} className="check-option"><input type="checkbox" name="goalIds" value={goal.id}/><span>{goal.title}</span></label>) : <span className="muted">Create a goal first if you want linked tasks.</span>}</div></fieldset>
      <div className="form-grid two"><label><span className="label">Focus period (optional)</span><select className="input" name="focusPeriodId"><option value="">None</option>{focusPeriods.map((focus) => <option value={focus.id} key={focus.id}>{focus.title}</option>)}</select></label><label><span className="label">Outcome or milestone (optional)</span><select className="input" name="outcomeId"><option value="">None</option>{outcomes.map((outcome) => <option value={outcome.id} key={outcome.id}>{outcome.title}</option>)}</select></label></div>
      <label className="commit-option"><input type="checkbox" name="commitToWeeks" value="true" defaultChecked/><span><strong>Add tasks to weekly plans</strong><small>Uses each task’s scheduled date to place it in the correct Monday–Sunday plan. Missing plans will be created.</small></span></label>
    </section>
    <section className="card stack">
      <div><p className="eyebrow" style={{ margin: 0 }}>Step 2</p><h2 style={{ margin: ".3rem 0" }}>Add task JSON</h2></div>
      <label className="file-drop"><FileJson/><span><strong>Select a JSON file</strong><small>Maximum 200 KB and 200 tasks</small></span><input type="file" accept="application/json,.json" onChange={(event) => readFile(event.target.files?.[0])}/></label>
      {fileError && <p className="form-message error">{fileError}</p>}
      <div style={{ textAlign: "center" }} className="muted">or paste JSON below</div>
      <label><span className="label">JSON task array</span><textarea className="input json-input" name="tasksJson" value={json} onChange={(event) => setJson(event.target.value)} required spellCheck={false}/></label>
      {preview.error ? <p className="form-message error" aria-live="polite">{preview.error}</p> : <div className="preview"><strong>{preview.tasks.length} {preview.tasks.length === 1 ? "task" : "tasks"} ready to validate</strong>{preview.tasks.slice(0, 5).map((task, index) => <span key={index}>{index + 1}. {typeof task.title === "string" ? task.title : "Missing title"}</span>)}{preview.tasks.length > 5 && <span>…and {preview.tasks.length - 5} more</span>}</div>}
    </section>
    {state.message && <p className={`form-message ${state.status}`} aria-live="polite">{state.message}</p>}
    <button className="btn btn-primary" disabled={pending || !!preview.error || preview.tasks.length === 0}><Upload size={18}/>{pending ? "Importing…" : `Import ${preview.tasks.length || ""} tasks`}</button>
  </form>;
}
