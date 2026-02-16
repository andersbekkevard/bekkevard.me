#!/usr/bin/env node

import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { stdin as input, stdout as output } from "node:process";
import { createInterface } from "node:readline/promises";

const BLOG_ROOT = path.resolve("src/content/blog");
const VALID_EXTENSIONS = new Set(["md", "mdx"]);

function toLocalIsoString(date) {
  const pad = (n) => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const offsetHours = pad(Math.floor(Math.abs(offsetMinutes) / 60));
  const offsetMins = pad(Math.abs(offsetMinutes) % 60);
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMins}`;
}

function toSlug(value) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `post-${Date.now()}`;
}

function parseBoolean(inputValue) {
  const normalized = inputValue.trim().toLowerCase();
  if (!normalized) return undefined;
  if (["y", "yes", "true", "1"].includes(normalized)) return true;
  if (["n", "no", "false", "0"].includes(normalized)) return false;
  return null;
}

function parseDate(inputValue) {
  const raw = inputValue.trim();
  if (!raw) return undefined;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return raw;
}

async function fileExists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function promptBoolean(rl, label) {
  while (true) {
    const answer = await rl.question(`${label} [y/n, Enter to skip]: `);
    const parsed = parseBoolean(answer);
    if (parsed === null) {
      output.write("Please answer with y, n, or leave empty.\n");
      continue;
    }
    return parsed;
  }
}

async function promptBooleanWithDefault(rl, label, defaultValue) {
  while (true) {
    const defaultLabel = defaultValue ? "Y/n" : "y/N";
    const answer = await rl.question(`${label} [${defaultLabel}]: `);
    const parsed = parseBoolean(answer);
    if (parsed === null) {
      output.write("Please answer with y, n, or press Enter.\n");
      continue;
    }
    return parsed ?? defaultValue;
  }
}

async function promptDate(rl, label, defaultValue) {
  while (true) {
    const promptSuffix = defaultValue ? ` (${defaultValue})` : "";
    const answer = await rl.question(`${label}${promptSuffix}: `);
    const value = answer.trim() || defaultValue || "";
    const parsed = parseDate(value);
    if (parsed === null) {
      output.write(
        "Please provide a valid date/time (ISO-8601 recommended) or leave empty.\n",
      );
      continue;
    }
    return parsed;
  }
}

async function promptText(rl, label, defaultValue = "") {
  const promptSuffix = defaultValue ? ` (${defaultValue})` : "";
  const answer = await rl.question(`${label}${promptSuffix}: `);
  return answer.trim() || defaultValue;
}

async function promptExtension(rl, defaultValue = "md") {
  while (true) {
    const extension = await promptText(
      rl,
      "file extension (md or mdx)",
      defaultValue,
    );
    const normalized = extension.replace(/^\./, "").toLowerCase();
    if (VALID_EXTENSIONS.has(normalized)) return normalized;
    output.write("Please use either 'md' or 'mdx'.\n");
  }
}

function renderWizardHeader() {
  output.write("\n=======================================\n");
  output.write(" New Blog Post Wizard\n");
  output.write("=======================================\n");
  output.write("Creates a post inside src/content/blog.\n");
  output.write("Press Enter to skip optional fields.\n\n");
}

function renderSection(title) {
  output.write(`\n-- ${title} --\n`);
}

function renderFrontmatter(data) {
  const lines = ["---"];

  const add = (key, value) => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      if (value.length === 0) return;
      lines.push(`${key}: ${JSON.stringify(value)}`);
      return;
    }
    if (typeof value === "boolean") {
      lines.push(`${key}: ${value}`);
      return;
    }
    lines.push(`${key}: ${JSON.stringify(value)}`);
  };

  add("title", data.title ?? "");
  add("description", data.description ?? "");
  add("pubDatetime", data.pubDatetime);
  add("modDatetime", data.modDatetime);
  add("author", data.author);
  add("featured", data.featured);
  add("draft", data.draft);
  add("unlisted", data.unlisted);
  add("tags", data.tags);
  add("ogImage", data.ogImage);
  add("heroImage", data.heroImage);
  add("canonicalURL", data.canonicalURL);
  add("hideEditPost", data.hideEditPost);
  add("timezone", data.timezone);
  add("source", data.source);
  add("AIDescription", data.AIDescription);

  lines.push("---", "");
  return `${lines.join("\n")}\n`;
}

function renderPreview(filePath, postData) {
  output.write("\nPreview\n");
  output.write("---------------------------------------\n");
  output.write(`File: ${filePath}\n`);
  output.write(`pubDatetime: ${postData.pubDatetime}\n`);

  const shownFields = [
    "title",
    "description",
    "tags",
    "draft",
    "modDatetime",
    "author",
    "featured",
    "unlisted",
    "ogImage",
    "heroImage",
    "canonicalURL",
    "hideEditPost",
    "timezone",
    "source",
    "AIDescription",
  ];

  for (const field of shownFields) {
    const value = postData[field];
    if (value === undefined) continue;
    output.write(`${field}: ${JSON.stringify(value)}\n`);
  }
}

async function main() {
  const rl = createInterface({ input, output });

  try {
    renderWizardHeader();
    const now = new Date();
    const defaultPubDatetime = toLocalIsoString(now);
    const defaultYear = String(now.getFullYear());

    renderSection("Basic post details");
    const title = await promptText(rl, "title");
    const description = await promptText(rl, "description");
    const tagsRaw = await promptText(
      rl,
      'tags (comma-separated, e.g. "astro,js")',
    );
    const draft = await promptBoolean(rl, "draft");

    renderSection("File options");
    const year = await promptText(rl, "year folder", defaultYear);
    const defaultSlug = toSlug(title || "new-post");
    const slug = toSlug(await promptText(rl, "filename slug", defaultSlug));
    const cleanExt = await promptExtension(rl, "md");

    const useDetailedConfig = await promptBooleanWithDefault(
      rl,
      "Open detailed configuration",
      false,
    );

    let modDatetime;
    let author;
    let featured;
    let unlisted;
    let ogImage;
    let heroImage;
    let canonicalURL;
    let hideEditPost;
    let timezone;
    let source;
    let AIDescription;

    if (useDetailedConfig) {
      renderSection("Detailed configuration");
      modDatetime = await promptDate(rl, "modDatetime");
      author = await promptText(rl, "author");
      featured = await promptBoolean(rl, "featured");
      unlisted = await promptBoolean(rl, "unlisted");
      ogImage = await promptText(rl, "ogImage");
      heroImage = await promptText(rl, "heroImage");
      canonicalURL = await promptText(rl, "canonicalURL");
      hideEditPost = await promptBoolean(rl, "hideEditPost");
      timezone = await promptText(rl, "timezone");
      source = await promptText(rl, "source");
      AIDescription = await promptBoolean(rl, "AIDescription");
    }

    const tags = tagsRaw
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const postData = {
      title,
      description,
      pubDatetime: defaultPubDatetime,
      modDatetime,
      author: author || undefined,
      featured,
      draft,
      unlisted,
      tags: tags.length ? tags : undefined,
      ogImage: ogImage || undefined,
      heroImage: heroImage || undefined,
      canonicalURL: canonicalURL || undefined,
      hideEditPost,
      timezone: timezone || undefined,
      source: source || undefined,
      AIDescription,
    };

    const directory = path.join(BLOG_ROOT, year);
    const filePath = path.join(directory, `${slug}.${cleanExt}`);

    renderPreview(filePath, postData);
    const shouldCreate = await promptBooleanWithDefault(rl, "Create this post", true);
    if (!shouldCreate) {
      output.write("Aborted. No file was created.\n");
      return;
    }

    await mkdir(directory, { recursive: true });

    if (await fileExists(filePath)) {
      const overwrite = await promptBoolean(
        rl,
        `File exists at ${filePath}. Overwrite`,
      );
      if (!overwrite) {
        output.write("Aborted. Existing file was not changed.\n");
        return;
      }
    }

    const frontmatter = renderFrontmatter(postData);
    await writeFile(filePath, frontmatter, "utf8");
    output.write(`\nDone. Created ${filePath}\n`);
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error("\nFailed to create blog post:", error);
  process.exitCode = 1;
});
