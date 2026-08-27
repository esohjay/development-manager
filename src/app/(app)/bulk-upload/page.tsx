import { BulkTaskUpload } from "@/components/bulk-task-upload";
import { taskOptions } from "@/lib/data";
import { requireUser } from "@/lib/session";

const formatExample = JSON.stringify([{ title: "Required", description: "Optional", scheduledDate: "2026-08-28", dueDate: "2026-08-30", priority: "normal", status: "open", notes: "Optional", tags: ["planning"] }], null, 2);

export default async function BulkUploadPage() {
  const user = await requireUser();
  const options = await taskOptions(user.id);
  const plainOptions = {
    goals: options.goals.map((item) => ({ id: item._id.toString(), title: item.title })),
    focusPeriods: options.focus.map((item) => ({ id: item._id.toString(), title: item.title })),
    outcomes: options.outcomes.map((item) => ({ id: item._id.toString(), title: item.title })),
  };
  return <div className="container bulk-page"><p className="eyebrow">Task tools</p><h1 className="page-title">Bulk upload</h1><p className="muted" style={{ marginTop: 0 }}>Import multiple tasks from JSON and connect the whole batch to your existing direction.</p><div className="bulk-layout"><BulkTaskUpload {...plainOptions}/><aside className="card format-help"><h2>Accepted format</h2><p className="muted">The file must contain one JSON array. Only <code>title</code> is required.</p><pre>{formatExample}</pre><p className="muted"><strong>Priority:</strong> low, normal, or high</p><p className="muted"><strong>Status:</strong> open, in_progress, completed, or cancelled</p><p className="muted">Dates must use <code>YYYY-MM-DD</code>. Unknown fields are rejected so mistakes are visible before import.</p></aside></div></div>;
}
