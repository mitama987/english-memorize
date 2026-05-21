/**
 * Generate daily-version block audio mp3s with OpenAI TTS.
 *
 * Reads src/data/topics.json (which build-data already merged simple-overrides into),
 * and for each block whose sentences have enSimple, generates:
 *   public/audio-daily/<topicSlug>/b<NN>-<slug>.mp3            (1.0x)
 *   public/audio-daily/<topicSlug>/b<NN>-<slug>_0.75x.mp3
 *   public/audio-daily/<topicSlug>/b<NN>-<slug>_0.5x.mp3
 *
 * The 0.75x / 0.5x files are produced from the 1.0x via ffmpeg's `atempo` (pitch-preserving).
 * Existing files are skipped unless --force.
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... npx tsx scripts/gen-daily-audio.ts
 *   OPENAI_API_KEY=sk-... npx tsx scripts/gen-daily-audio.ts --topic 01
 *   OPENAI_API_KEY=sk-... npx tsx scripts/gen-daily-audio.ts --force
 *
 * Requires `ffmpeg` on PATH.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import OpenAI from 'openai';

interface Sentence {
  en: string;
  ja: string;
  enSimple?: string;
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
interface TopicsData {
  topics: Topic[];
}

const ROOT = process.cwd();
const DATA = path.join(ROOT, 'src', 'data', 'topics.json');
const OUT_BASE = path.join(ROOT, 'public', 'audio-daily');

const MODEL = 'gpt-4o-mini-tts';
const VOICE = 'alloy';
const SPEED_VARIANTS: Array<{ name: string; tempo: number }> = [
  { name: '_0.75x', tempo: 0.75 },
  { name: '_0.5x', tempo: 0.5 },
];

interface Opts {
  topicId?: string;
  force: boolean;
}
function parseArgs(argv: string[]): Opts {
  const o: Opts = { force: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--topic') o.topicId = argv[++i];
    else if (a === '--force') o.force = true;
  }
  return o;
}

function ensureDir(p: string): void {
  fs.mkdirSync(p, { recursive: true });
}

function ffmpegAvailable(): boolean {
  const r = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  return r.status === 0;
}

function ffmpegAtempo(input: string, output: string, tempo: number): void {
  // atempo only accepts 0.5..2.0; chain if needed (here 0.5 is the lower bound exactly).
  const filter = `atempo=${tempo}`;
  const r = spawnSync(
    'ffmpeg',
    ['-y', '-loglevel', 'error', '-i', input, '-filter:a', filter, '-vn', output],
    { stdio: 'inherit' }
  );
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${input} -> ${output}`);
}

async function ttsToFile(client: OpenAI, text: string, output: string): Promise<void> {
  const res = await client.audio.speech.create({
    model: MODEL,
    voice: VOICE,
    input: text,
    response_format: 'mp3',
  });
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(output, buf);
}

async function processBlock(
  client: OpenAI,
  topic: Topic,
  block: Block,
  outDir: string,
  force: boolean
): Promise<{ generated: boolean; reason?: string }> {
  const dailyText = block.sentences
    .map((s) => s.enSimple)
    .filter((t): t is string => Boolean(t && t.trim()))
    .join('\n\n');
  if (!dailyText) return { generated: false, reason: 'no enSimple' };

  const padded = String(block.id).padStart(2, '0');
  const stem = `b${padded}-${block.slug}`;
  const baseFile = path.join(outDir, `${stem}.mp3`);

  if (fs.existsSync(baseFile) && !force) {
    // still ensure speed variants exist
    let producedVariant = false;
    for (const v of SPEED_VARIANTS) {
      const vf = path.join(outDir, `${stem}${v.name}.mp3`);
      if (!fs.existsSync(vf)) {
        ffmpegAtempo(baseFile, vf, v.tempo);
        producedVariant = true;
      }
    }
    return { generated: producedVariant, reason: 'base exists' };
  }

  await ttsToFile(client, dailyText, baseFile);
  for (const v of SPEED_VARIANTS) {
    const vf = path.join(outDir, `${stem}${v.name}.mp3`);
    ffmpegAtempo(baseFile, vf, v.tempo);
  }
  return { generated: true };
}

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY is not set');
    process.exit(1);
  }
  if (!ffmpegAvailable()) {
    console.error('ffmpeg not found on PATH. Install ffmpeg first.');
    process.exit(1);
  }
  if (!fs.existsSync(DATA)) {
    console.error(`topics.json not found. Run "npm run build:data" first.`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(DATA, 'utf8')) as TopicsData;
  const client = new OpenAI({ apiKey });

  let generated = 0;
  let skipped = 0;

  for (const topic of data.topics) {
    if (opts.topicId && topic.fileId !== opts.topicId) continue;
    const outDir = path.join(OUT_BASE, topic.slug);
    ensureDir(outDir);
    for (const block of topic.blocks) {
      const padded = String(block.id).padStart(2, '0');
      const tag = `[${topic.fileId} B${padded} ${block.slug}]`;
      try {
        const r = await processBlock(client, topic, block, outDir, opts.force);
        if (r.generated) {
          console.log(`${tag} generated`);
          generated++;
        } else {
          console.log(`${tag} skipped (${r.reason})`);
          skipped++;
        }
      } catch (err) {
        console.error(`${tag} FAILED: ${(err as Error).message}`);
      }
    }
  }

  console.log(`\nDone. generated: ${generated}, skipped: ${skipped}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
