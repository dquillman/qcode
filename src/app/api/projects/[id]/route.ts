import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type Project = {
  id: string;
  title: string;
  url: string;
  description: string;
  tags: string[];
  imageUrl?: string;
};

const dataFile = path.join(process.cwd(), "src", "data", "projects.json");

async function readProjects(): Promise<Project[]> {
  try {
    const raw = await fs.readFile(dataFile, "utf8");
    return JSON.parse(raw);
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err.code === "ENOENT" || err.code === "EISDIR")) return [];
    throw err;
  }
}

async function writeProjects(list: Project[]) {
  const json = JSON.stringify(list, null, 2);
  await fs.writeFile(dataFile, json, "utf8");
}

function isAuthorized(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = process.env.ADMIN_TOKEN;
  return Boolean(token && auth === `Bearer ${token}`);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(_req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const list = await readProjects();
  const next = list.filter((p) => String(p.id) !== String(id));
  if (next.length === list.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await writeProjects(next);
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(req)) {
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

  const list = await readProjects();
  const idx = list.findIndex((p) => String(p.id) === String(id));
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const current = list[idx];
  const updated: Project = {
    ...current,
    title: (bodyObj.title ?? current.title).toString().trim(),
    url: (bodyObj.url ?? current.url).toString().trim(),
    description: (bodyObj.description ?? current.description).toString(),
    imageUrl: (bodyObj.imageUrl ?? (current.imageUrl || "")).toString(),
    tags: Array.isArray(bodyObj.tags)
      ? bodyObj.tags.map((t: unknown) => String(t).trim()).filter(Boolean)
      : typeof bodyObj.tags === "string"
      ? bodyObj.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
      : current.tags,
  };

  if (!updated.title || !updated.url || !/^https?:\/\//i.test(updated.url)) {
    return NextResponse.json({ error: "Title and valid URL are required" }, { status: 400 });
  }

  list[idx] = updated;
  await writeProjects(list);
  return NextResponse.json(updated, { status: 200 });
}

