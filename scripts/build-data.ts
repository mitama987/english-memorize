import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

interface Sentence {
  en: string;
  ja: string;
}

interface Block {
  id: number;
  slug: string;
  enTitle: string;
  jaTitle: string;
  sentences: Sentence[];
}

interface Topic {
  fileId: string;
  slug: string;
  title: string;
  jaTitle: string;
  blocks: Block[];
}

const ROOT = process.cwd();
const SOURCE =
  process.env.CLAUDECOMPANY_PATH ||
  path.resolve(ROOT, '..', '90_other', 'ClaudeCompany');
const SCRIPTS_DIR = path.join(SOURCE, '.company', 'english', 'scripts');
const AUDIO_DIR = path.join(SOURCE, '.company', 'english', 'audio');
const OUT_DATA = path.join(ROOT, 'src', 'data', 'topics.json');
const OUT_AUDIO = path.join(ROOT, 'public', 'audio');

const BLOCK_HEADING_RE = /^###\s+B(\d+)\.\s+(.+?)\s+\/\s+(.+?)\s*$/;
const TITLE_HEADING_RE = /^#\s+(.+?)\s*\/\s*(.+?)\s*$/;

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'block'
  );
}

function parseSentences(lines: string[]): Sentence[] {
  const pairs: Sentence[] = [];
  let pendingEn: string | null = null;
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line === '---' || line.startsWith('#') || line.startsWith('>')) continue;
    if (pendingEn === null) {
      pendingEn = line;
    } else {
      pairs.push({ en: pendingEn, ja: line });
      pendingEn = null;
    }
  }
  if (pendingEn !== null) pairs.push({ en: pendingEn, ja: '' });
  return pairs;
}

function parseBiMd(filePath: string): Topic {
  const raw = fs.readFileSync(filePath, 'utf8');
  const { content } = matter(raw);
  const fileName = path.basename(filePath);
  const fileId = fileName.split('-')[0];
  const slug = fileName.replace(/\.bi\.md$/, '');

  let title = slug;
  let jaTitle = '';
  for (const line of content.split('\n')) {
    const m = TITLE_HEADING_RE.exec(line);
    if (m) {
      title = m[1].trim();
      jaTitle = m[2].trim();
      break;
    }
  }

  const blocks: Block[] = [];
  let curMeta: { id: number; en: string; ja: string } | null = null;
  let curLines: string[] = [];

  const flush = () => {
    if (!curMeta) return;
    blocks.push({
      id: curMeta.id,
      slug: slugify(curMeta.en),
      enTitle: curMeta.en,
      jaTitle: curMeta.ja,
      sentences: parseSentences(curLines),
    });
    curMeta = null;
    curLines = [];
  };

  for (const line of content.split('\n')) {
    const m = BLOCK_HEADING_RE.exec(line);
    if (m) {
      flush();
      curMeta = { id: parseInt(m[1], 10), en: m[2].trim(), ja: m[3].trim() };
    } else if (curMeta) {
      curLines.push(line);
    }
  }
  flush();

  return { fileId, slug, title, jaTitle, blocks };
}

function copyDirRecursive(src: string, dest: string): void {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDirRecursive(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

function main(): void {
  console.log(`[build-data] source = ${SOURCE}`);
  if (!fs.existsSync(SCRIPTS_DIR)) {
    console.error(
      `[build-data] ERROR: ${SCRIPTS_DIR} not found. Set CLAUDECOMPANY_PATH or place ClaudeCompany at ../90_other/ClaudeCompany/`
    );
    process.exit(1);
  }

  const files = fs
    .readdirSync(SCRIPTS_DIR)
    .filter((f) => f.endsWith('.bi.md'))
    .sort();
  const topics = files.map((f) => parseBiMd(path.join(SCRIPTS_DIR, f)));

  fs.mkdirSync(path.dirname(OUT_DATA), { recursive: true });
  fs.writeFileSync(OUT_DATA, JSON.stringify({ topics }, null, 2));
  const blockCount = topics.reduce((n, t) => n + t.blocks.length, 0);
  console.log(
    `[build-data] wrote ${path.relative(ROOT, OUT_DATA)} (${topics.length} topic(s), ${blockCount} block(s))`
  );

  if (fs.existsSync(AUDIO_DIR)) {
    if (fs.existsSync(OUT_AUDIO)) fs.rmSync(OUT_AUDIO, { recursive: true });
    copyDirRecursive(AUDIO_DIR, OUT_AUDIO);
    console.log(`[build-data] copied audio to ${path.relative(ROOT, OUT_AUDIO)}`);
  } else {
    console.warn(`[build-data] WARN: ${AUDIO_DIR} not found, skipping audio copy`);
  }
}

main();
