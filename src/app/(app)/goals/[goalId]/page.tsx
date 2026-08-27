import { notFound } from "next/navigation";
import { ChevronRight, Plus } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getGoal, goalContext, listGoals, taskOptions } from "@/lib/data";
import { prettyDate } from "@/lib/dates";
import { FocusForm, GoalForm, OutcomeForm } from "@/components/goal-forms";
import { TaskForm } from "@/components/task-form";
import { TaskList } from "@/components/task-list";
import { DetailField, DetailSheet } from "@/components/detail-sheet";
import type { FocusPeriod, Goal, Outcome } from "@/lib/types";

export default async function GoalPage({ params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await params;
  const user = await requireUser();
  const goal = await getGoal(user.id, goalId);
  if (!goal) notFound();
  const [ctx, goals, options] = await Promise.all([goalContext(user.id, goalId), listGoals(user.id), taskOptions(user.id)]);
  const active = ctx.focus.find((focus) => focus.status === "active");
  const previous = ctx.focus.filter((focus) => focus.status !== "active");
  const achieved = ctx.outcomes.filter((outcome) => outcome.status === "achieved").length;
  const nextOutcome = ctx.outcomes.find((outcome) => outcome.status === "in_progress") || ctx.outcomes.find((outcome) => outcome.status === "planned");
  const nextTask = ctx.tasks.find((task) => task.status === "in_progress") || ctx.tasks.find((task) => task.status === "open");
  return <div className="container"><p className="eyebrow">{goal.status} goal</p><h1 className="page-title">{goal.title}</h1>{goal.description && <p className="muted">{goal.description}</p>}<div className="card context-grid"><Context label="Active focus" value={active?.title || "None"}/><Context label="Achieved outcomes" value={String(achieved)}/><Context label="Next outcome" value={nextOutcome?.title || "None"}/><Context label="Next task" value={nextTask?.title || "None"}/></div><details className="card" style={{ marginTop: 12 }}><summary style={{ cursor: "pointer", fontWeight: 700 }}>Edit goal</summary><div style={{ marginTop: 14 }}><GoalForm goal={goal}/></div></details>
    <div className="section-head"><h2>Focus periods</h2></div>{active && <FocusCard focus={active} goals={goals}/>}<div className="stack" style={{ marginTop: 8 }}>{previous.map((focus) => <FocusCard key={focus._id.toString()} focus={focus} goals={goals}/>)}</div><details className="card" style={{ marginTop: 8 }}><summary style={{ cursor: "pointer", fontWeight: 700 }}><Plus size={17} style={{ display: "inline" }}/> New focus period</summary><div style={{ marginTop: 12 }}><FocusForm goals={goals} defaultGoalId={goalId}/></div></details>
    <div className="section-head"><h2>Outcomes & milestones</h2><span className="pill">{achieved} achieved</span></div><div className="stack">{ctx.outcomes.map((outcome) => <OutcomeCard key={outcome._id.toString()} outcome={outcome} goals={goals} focusPeriods={ctx.focus}/>)}</div><details className="card" style={{ marginTop: 8 }}><summary style={{ cursor: "pointer", fontWeight: 700 }}><Plus size={17} style={{ display: "inline" }}/> New outcome</summary><div style={{ marginTop: 12 }}><OutcomeForm goals={goals} focusPeriods={ctx.focus} defaultGoalId={goalId}/></div></details>
    <div className="section-head"><h2>Related tasks</h2><span className="pill">{ctx.tasks.length}</span></div><TaskList tasks={ctx.tasks} options={options} empty="No tasks support this goal yet."/><details className="card" style={{ marginTop: 8 }}><summary style={{ cursor: "pointer", fontWeight: 700 }}><Plus size={17} style={{ display: "inline" }}/> Add a task</summary><div style={{ marginTop: 12 }}><TaskForm {...options}/></div></details>
  </div>;
}

function FocusCard({ focus, goals }: { focus: FocusPeriod; goals: Goal[] }) {
  const relatedGoals = goals.filter((goal) => focus.goalIds.some((id) => id.equals(goal._id)));
  return <DetailSheet title={focus.title} eyebrow="Focus period" trigger={<div className="card entity-row"><div><div className="task-meta"><span className="pill">{focus.status}</span></div><h3>{focus.title}</h3><p>{prettyDate(focus.startDate)} – {prettyDate(focus.endDate)}</p></div><ChevronRight/></div>}><div className="stack sheet-sections"><section className="detail-grid"><DetailField label="Status"><span className="pill">{focus.status}</span></DetailField><DetailField label="Dates">{prettyDate(focus.startDate)} – {prettyDate(focus.endDate)}</DetailField>{focus.description && <DetailField label="Description" wide>{focus.description}</DetailField>}<DetailField label="Goals" wide><div className="detail-pills">{relatedGoals.map((goal) => <span className="pill" key={goal._id.toString()}>{goal.title}</span>)}</div></DetailField>{focus.notes && <DetailField label="Notes" wide>{focus.notes}</DetailField>}</section><details className="sheet-section"><summary>Edit focus period</summary><div style={{ marginTop: 14 }}><FocusForm goals={goals} focus={focus}/></div></details></div></DetailSheet>;
}

function OutcomeCard({ outcome, goals, focusPeriods }: { outcome: Outcome; goals: Goal[]; focusPeriods: FocusPeriod[] }) {
  const focus = focusPeriods.find((item) => outcome.focusPeriodId?.equals(item._id));
  return <DetailSheet title={outcome.title} eyebrow={outcome.kind} trigger={<div className="card entity-row"><div><div className="task-meta"><span className="pill">{outcome.kind}</span><span className="pill">{outcome.status.replace("_", " ")}</span></div><h3>{outcome.title}</h3>{outcome.targetDate && <p>Target {prettyDate(outcome.targetDate)}</p>}</div><ChevronRight/></div>}><div className="stack sheet-sections"><section className="detail-grid"><DetailField label="Type"><span className="pill">{outcome.kind}</span></DetailField><DetailField label="Status"><span className="pill">{outcome.status.replace("_", " ")}</span></DetailField><DetailField label="Target date">{outcome.targetDate ? prettyDate(outcome.targetDate) : null}</DetailField><DetailField label="Focus period">{focus?.title}</DetailField>{outcome.description && <DetailField label="Description" wide>{outcome.description}</DetailField>}{outcome.notes && <DetailField label="Notes" wide>{outcome.notes}</DetailField>}</section><details className="sheet-section"><summary>Edit outcome</summary><div style={{ marginTop: 14 }}><OutcomeForm goals={goals} focusPeriods={focusPeriods} outcome={outcome}/></div></details></div></DetailSheet>;
}

function Context({ label, value }: { label: string; value: string }) { return <div><span className="label">{label}</span><strong style={{ display: "block" }}>{value}</strong></div>; }
