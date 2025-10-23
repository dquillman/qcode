import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { randomUUID } from "crypto";
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

export async function GET() {
  const list = await readProjects();
  return NextResponse.json(list, { status: 200 });
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const token = process.env.ADMIN_TOKEN;
  if (!token || auth !== `Bearer ${token}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
  const title = (bodyObj.title ?? "").toString().trim();
  const url = (bodyObj.url ?? "").toString().trim();
  const description = (bodyObj.description ?? "").toString().trim();
  const imageUrl = (bodyObj.imageUrl ?? "").toString().trim();
  let tags: string[] = [];
  if (Array.isArray(bodyObj.tags)) tags = bodyObj.tags.map((t: unknown) => String(t).trim()).filter(Boolean);
  else if (typeof bodyObj.tags === "string") tags = bodyObj.tags.split(",").map((t: string) => t.trim()).filter(Boolean);

  if (!title || !url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "Title and valid URL are required" }, { status: 400 });
  }

  const list = await readProjects();
  const id = `srv-${randomUUID()}`;
  const project: Project = { id, title, url, description, imageUrl, tags };
  const next = [project, ...list];
  await writeProjects(next);

  return NextResponse.json(project, { status: 201 });
}
