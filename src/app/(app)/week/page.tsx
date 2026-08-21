import{redirect}from"next/navigation";import{weekStart}from"@/lib/dates";export default function Week(){redirect(`/week/${weekStart()}`)}
