"use server";

// Thin re-export so credit-related callers can import from /admin/credits/...
// without depending on the user-actions module directly.
export { adjustCreditsAction } from "@/app/admin/users/actions";
