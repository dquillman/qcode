import { NextRequest, NextResponse } from "next/server";
import { importProjects, type DbProject } from "@/lib/db";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";

type IncomingProject = {
  id?: string;
  title: string;
  url: string;
  description?: string;
  imageUrl?: string;
  tags?: string[] | string;
};

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = process.env.ADMIN_TOKEN;

  // Check for Bearer token
  let isAuthenticated = token && auth === `Bearer ${token}`;

  // If not authenticated by token, check for session cookie
  if (!isAuthenticated) {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    if (session) {
      const expiry = parseInt(session.value);
      if (expiry > Date.now()) {
        isAuthenticated = true;
      }
    }
  }

  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  function hasProjectsKey(x: unknown): x is { projects: unknown } {
    return !!x && typeof x === "object" && Object.prototype.hasOwnProperty.call(x, "projects");
  }

  const arr: IncomingProject[] = Array.isArray(body)
    ? (body as IncomingProject[])
    : hasProjectsKey(body) && Array.isArray((body as { projects: unknown }).projects)
      ? (((body as { projects: unknown }).projects as unknown[]) as IncomingProject[])
      : [];

  if (!arr.length) {
    return NextResponse.json({ error: "No projects provided" }, { status: 400 });
  }

  // Normalize and validate
  const toInsert = arr
    .map((p) => {
      const title = String(p.title || "").trim();
      const url = String(p.url || "").trim();
      const description = String(p.description || "");
      const imageUrl = p.imageUrl ? String(p.imageUrl) : "";
      let tags: string[] = [];
      if (Array.isArray(p.tags)) tags = p.tags.map((t) => String(t).trim()).filter(Boolean);
      else if (typeof p.tags === "string") tags = p.tags.split(",").map((t) => t.trim()).filter(Boolean);
      return { title, url, description, image_url: imageUrl || null, tags };
    })
    .filter((p) => p.title && p.url && /^https?:\/\//i.test(p.url));

  if (!toInsert.length) {
    return NextResponse.json({ error: "No valid projects to import" }, { status: 400 });
  }

  try {
    const count = await importProjects(toInsert);
    return NextResponse.json({ imported: count }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Import failed" }, { status: 500 });
  }
}
