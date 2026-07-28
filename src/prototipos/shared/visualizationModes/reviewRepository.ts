import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { PrototypeReview, ReviewInput, ReviewUser } from "./types";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim() || import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
export const reviewBackendConfigured = Boolean(url && key);
const client: SupabaseClient | null = reviewBackendConfigured ? createClient(url!, key!) : null;
const LOCAL_USER = "prototype-review-user";
const LOCAL_REVIEWS = "prototype-reviews";

const localUser = (): ReviewUser | null => {
  try { return JSON.parse(localStorage.getItem(LOCAL_USER) ?? "null"); } catch { return null; }
};
const localReviews = (): PrototypeReview[] => {
  try { return JSON.parse(localStorage.getItem(LOCAL_REVIEWS) ?? "[]"); } catch { return []; }
};

function rowToReview(row: Record<string, unknown>): PrototypeReview {
  return { id: String(row.id), prototypeId: String(row.prototype_id), prototypeVersion: String(row.prototype_version), screenId: String(row.screen_id), componentId: String(row.component_id), componentTitle: String(row.component_title), reviewerId: String(row.reviewer_id), reviewerName: String(row.reviewer_name ?? row.reviewer_email), reviewerEmail: String(row.reviewer_email), status: row.status as PrototypeReview["status"], comment: String(row.comment ?? ""), createdAt: String(row.created_at), updatedAt: String(row.updated_at) };
}

export const reviewRepository = {
  configured: reviewBackendConfigured,
  async getUser(): Promise<ReviewUser | null> {
    if (!client) return localUser();
    const { data: { user } } = await client.auth.getUser();
    if (!user) return null;
    const { data } = await client.from("prototype_review_profiles").select("display_name,role").eq("id", user.id).maybeSingle();
    return { id: user.id, email: user.email ?? "", name: data?.display_name || user.user_metadata?.display_name || user.email || "Avaliador", role: data?.role === "ADMIN" ? "ADMIN" : "REVIEWER" };
  },
  onAuthChange(callback: () => void) {
    if (!client) return () => undefined;
    const { data } = client.auth.onAuthStateChange(() => callback());
    return () => data.subscription.unsubscribe();
  },
  async signIn(email: string, password: string): Promise<void> {
    if (!client) { localStorage.setItem(LOCAL_USER, JSON.stringify({ id: `local-${email}`, email, name: email.split("@")[0], role: email.toLowerCase().startsWith("admin") ? "ADMIN" : "REVIEWER" })); return; }
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },
  async signOut(): Promise<void> {
    if (!client) { localStorage.removeItem(LOCAL_USER); return; }
    const { error } = await client.auth.signOut(); if (error) throw error;
  },
  async list(screenId: string, user: ReviewUser, prototypeVersion?: string): Promise<PrototypeReview[]> {
    if (!client) return localReviews().filter((item) => item.screenId === screenId && (user.role === "ADMIN" || item.reviewerId === user.id));
    const { data, error } = await client.from("prototype_reviews").select("*").eq("screen_id", screenId).order("updated_at", { ascending: false });
    if (error) throw error; return (data ?? []).map(rowToReview);
  },
  async listReviewers(): Promise<ReviewUser[]> {
    if (!client) {
      const unique = new Map<string, ReviewUser>();
      localReviews().forEach((item) => unique.set(item.reviewerId, { id: item.reviewerId, email: item.reviewerEmail, name: item.reviewerName, role: "REVIEWER" }));
      return [...unique.values()];
    }
    const { data, error } = await client.from("prototype_review_profiles").select("id,display_name,role").eq("role", "REVIEWER").order("display_name");
    if (error) throw error;
    return (data ?? []).map((row) => ({ id: String(row.id), email: "", name: String(row.display_name || "Avaliador"), role: "REVIEWER" as const }));
  },
  async save(input: ReviewInput, user: ReviewUser): Promise<PrototypeReview> {
    const now = new Date().toISOString();
    if (!client) {
      const all = localReviews(); const index = all.findIndex((item) => item.prototypeVersion === input.prototypeVersion && item.componentId === input.componentId && item.reviewerId === user.id);
      const review: PrototypeReview = { id: index >= 0 ? all[index].id : crypto.randomUUID(), ...input, reviewerId: user.id, reviewerName: user.name, reviewerEmail: user.email, createdAt: index >= 0 ? all[index].createdAt : now, updatedAt: now };
      if (index >= 0) all[index] = review; else all.push(review); localStorage.setItem(LOCAL_REVIEWS, JSON.stringify(all)); return review;
    }
    const payload = { prototype_id: input.prototypeId, prototype_version: input.prototypeVersion, screen_id: input.screenId, component_id: input.componentId, component_title: input.componentTitle, reviewer_id: user.id, reviewer_name: user.name, reviewer_email: user.email, status: input.status, comment: input.comment };
    const { data, error } = await client.from("prototype_reviews").upsert(payload, { onConflict: "prototype_version,component_id,reviewer_id" }).select().single();
    if (error) throw error; return rowToReview(data);
  },
};
