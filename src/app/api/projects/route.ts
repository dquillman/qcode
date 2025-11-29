import { NextRequest, NextResponse } from "next/server";
import { getProjects, createProject, type DbProject } from "@/lib/db";
import { cookies } from "next/headers";

type Project = {
  id: string;
  title: string;
  url: string;
  description: string;
  tags: string[];
  imageUrl?: string;
};

export async function GET() {
  const dbProjects = await getProjects();
  const result: Project[] = dbProjects.map((r: DbProject) => ({
    id: r.id,
    title: r.title,
    url: r.url,
    description: r.description,
    imageUrl: r.image_url || undefined,
    tags: Array.isArray(r.tags) ? r.tags : [],
  }));
  return NextResponse.json(result, { status: 200 });
}

export async function POST(req: NextRequest) {
  async function isAuthorized() {
    // Bearer token path
    const auth = req.headers.get("authorization") || "";
    const token = process.env.ADMIN_TOKEN;
    if (token && auth === `Bearer ${token}`) return true;
    // Session cookie path
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

  if (!(await isAuthorized())) {
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

  const newProject = await createProject({
    title,
    url,
    description,
    image_url: imageUrl || null,
    tags
  });

  const project: Project = {
    id: newProject.id,
    title: newProject.title,
    url: newProject.url,
    description: newProject.description,
    imageUrl: newProject.image_url || undefined,
    tags: newProject.tags
  };
  return NextResponse.json(project, { status: 201 });
}
