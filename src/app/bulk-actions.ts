"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { collections } from "@/lib/data";
import { requireUser } from "@/lib/session";

const optionalText = z.string().trim().max(2000).optional();
const optionalDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Dates must use YYYY-MM-DD").optional();
const bulkTaskSchema = z.object({
  title: z.string().trim().min(1).max(180),
  description: optionalText,
  scheduledDate: optionalDate,
  dueDate: optionalDate,
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  status: z.enum(["open", "in_progress", "completed", "cancelled"]).default("open"),
  notes: optionalText,
  tags: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
}).strict();
const batchSchema = z.array(bulkTaskSchema).min(1, "Add at least one task").max(200, "A batch can contain at most 200 tasks");

export type BulkImportState = { status: "idle" | "error" | "success"; message: string; imported?: number };
export const initialBulkImportState: BulkImportState = { status: "idle", message: "" };

export async function bulkImportTasks(_previous: BulkImportState, formData: FormData): Promise<BulkImportState> {
  const user = await requireUser();
  const rawJson = String(formData.get("tasksJson") ?? "");
  if (rawJson.length > 200_000) return { status: "error", message: "The JSON payload is too large (maximum 200 KB)." };
  let parsedJson: unknown;
  try { parsedJson = JSON.parse(rawJson); } catch { return { status: "error", message: "The content is not valid JSON." }; }
  const parsed = batchSchema.safeParse(parsedJson);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const location = issue.path.length ? `Task ${Number(issue.path[0]) + 1}, ${issue.path.slice(1).join(".") || "value"}: ` : "";
    return { status: "error", message: `${location}${issue.message}` };
  }

  const c = await collections();
  const goalIds = formData.getAll("goalIds").map(String).filter(ObjectId.isValid).map((value) => new ObjectId(value));
  const focusValue = String(formData.get("focusPeriodId") ?? "");
  const outcomeValue = String(formData.get("outcomeId") ?? "");
  const focusPeriodId = ObjectId.isValid(focusValue) ? new ObjectId(focusValue) : null;
  const outcomeId = ObjectId.isValid(outcomeValue) ? new ObjectId(outcomeValue) : null;
  const [ownedGoalCount, ownedFocus, ownedOutcome] = await Promise.all([
    goalIds.length ? c.goals.countDocuments({ ownerId: user.id, _id: { $in: goalIds } }) : Promise.resolve(0),
    focusPeriodId ? c.focusPeriods.findOne({ ownerId: user.id, _id: focusPeriodId }, { projection: { _id: 1 } }) : Promise.resolve(null),
    outcomeId ? c.outcomes.findOne({ ownerId: user.id, _id: outcomeId }, { projection: { _id: 1 } }) : Promise.resolve(null),
  ]);
  if (ownedGoalCount !== goalIds.length || (focusPeriodId && !ownedFocus) || (outcomeId && !ownedOutcome)) return { status: "error", message: "One of the selected relationships is no longer available." };

  const now = new Date();
  const documents = parsed.data.map((task) => ({ ...task, description: task.description || undefined, notes: task.notes || undefined, tags: [...new Set(task.tags.map((tag) => tag.toLowerCase()))], goalIds, focusPeriodId, outcomeId, ownerId: user.id, createdAt: now, updatedAt: now, completedAt: task.status === "completed" ? now : null, archivedAt: null }));
  await c.tasks.insertMany(documents as never[]);
  revalidatePath("/today"); revalidatePath("/week"); revalidatePath("/goals"); revalidatePath("/bulk-upload");
  goalIds.forEach((goalId) => revalidatePath(`/goals/${goalId}`));
  return { status: "success", message: `${documents.length} ${documents.length === 1 ? "task" : "tasks"} imported successfully.`, imported: documents.length };
}
