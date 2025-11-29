import { NextRequest, NextResponse } from "next/server";
import { getProject, updateProject, deleteProject, type DbProject } from "@/lib/db";
import { cookies } from "next/headers";

type Project = {
  id: string;
  title: string;
  url: string;
  description: string;
  tags: string[];
  imageUrl?: string;
};

async function isAuthorized(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = process.env.ADMIN_TOKEN;
  if (token && auth === `Bearer ${token}`) return true;
  try {
    const store = await cookies();
    const session = store.get("admin_session");
    if (!session) return false;
    const expiry = parseInt(session.value);
    return Number.isFinite(expiry) && expiry > Date.now();
  } catch {
    return false;
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorized(_req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deleteProject(id);
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const bodyObj = body as Record<string, unknown>;

  const current = await getProject(id);
  if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated: Project = {
    id: current.id,
    title: (bodyObj.title ?? current.title).toString().trim(),
    url: (bodyObj.url ?? current.url).toString().trim(),
    description: (bodyObj.description ?? current.description).toString(),
    imageUrl: (bodyObj.imageUrl ?? (current.image_url || "")).toString(),
    tags: Array.isArray(bodyObj.tags)
      ? bodyObj.tags.map((t: unknown) => String(t).trim()).filter(Boolean)
      : typeof bodyObj.tags === "string"
        ? bodyObj.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
        : (current.tags as string[]),
  };

  if (!updated.title || !updated.url || !/^https?:\/\//i.test(updated.url)) {
    return NextResponse.json({ error: "Title and valid URL are required" }, { status: 400 });
  }

  await updateProject(id, {
    title: updated.title,
    url: updated.url,
    description: updated.description,
    image_url: updated.imageUrl || null,
    tags: updated.tags
  });
  return NextResponse.json(updated, { status: 200 });
}
