import fs from 'node:fs';
import path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';

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
const DATA_PATH = path.join(ROOT, 'src', 'data', 'topics.json');
const MODEL = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPT = `You rewrite an English sentence into the way a real native speaker would naturally say the same thing in everyday casual conversation.

Goal: produce a phrase the learner can actually use when talking to people — not a textbook paraphrase, not a "simpler" school-style sentence.

Rules:
- Output ONLY a JSON object: {"enSimple": "..."}.
- Aim for natural, spoken English (CEFR A2–B1). Short, direct, conversational.
- Use common contractions (I'm, I'd, don't, it's). Use everyday vocabulary.
- It is fine — and encouraged — to DROP stylistic hesitations, narrative fillers, and "thinking out loud" openers. For example, "So, where do I start?" should become something natural like "Let me tell you about myself." NOT "Where should I start?" or any phrasing that keeps the hesitation.
- Drop interjections ("honestly", "you know", "I mean"), em dashes, and parentheticals when they don't add real information.
- Keep proper nouns (place names, game titles, brand names), years, and numbers EXACTLY as in the original.
- Keep the core factual meaning of the sentence (what actually happened, where, when, with whom). Tone can be relaxed.
- Prefer one short sentence. Two short sentences are OK only when needed for clarity.
- Do NOT translate to Japanese. Output English only.
- Do NOT add commentary, prefixes, or markdown. Just the JSON object.`;

interface CliOptions {
  topicId?: string;
  force: boolean;
  limit?: number;
  dryRun: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const opts: CliOptions = { force: false, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--topic') opts.topicId = argv[++i];
    else if (a === '--force') opts.force = true;
    else if (a === '--limit') opts.limit = parseInt(argv[++i], 10);
    else if (a === '--dry-run') opts.dryRun = true;
  }
  return opts;
}

async function generateOne(client: Anthropic, en: string): Promise<string> {
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 256,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [
      {
        role: 'user',
        content: `Original:\n${en}\n\nReturn JSON now.`,
      },
    ],
  });
  const block = msg.content.find((c) => c.type === 'text');
  if (!block || block.type !== 'text') throw new Error('no text content');
  const raw = block.text.trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`no JSON in response: ${raw}`);
  const parsed = JSON.parse(jsonMatch[0]) as { enSimple?: string };
  if (!parsed.enSimple || typeof parsed.enSimple !== 'string') {
    throw new Error(`bad JSON shape: ${raw}`);
  }
  return parsed.enSimple.trim();
}

async function withRetry(fn: () => Promise<string>, attempts = 3): Promise<string> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const delay = 800 * (i + 1);
      console.warn(`  retry ${i + 1}/${attempts} after ${delay}ms (${(err as Error).message})`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ANTHROPIC_API_KEY is not set');
    process.exit(1);
  }
  if (!fs.existsSync(DATA_PATH)) {
    console.error(`topics.json not found at ${DATA_PATH}. Run "npm run build:data" first.`);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8')) as TopicsData;
  const client = new Anthropic({ apiKey });

  let processed = 0;
  let skipped = 0;
  const limit = opts.limit ?? Infinity;

  for (const topic of data.topics) {
    if (opts.topicId && topic.fileId !== opts.topicId) continue;
    for (const block of topic.blocks) {
      for (const s of block.sentences) {
        if (processed >= limit) break;
        if (s.enSimple && !opts.force) {
          skipped++;
          continue;
        }
        console.log(`[${topic.fileId} B${block.id}] ${s.en.slice(0, 80)}${s.en.length > 80 ? '…' : ''}`);
        if (opts.dryRun) {
          processed++;
          continue;
        }
        try {
          const simple = await withRetry(() => generateOne(client, s.en));
          s.enSimple = simple;
          console.log(`  → ${simple}`);
          processed++;
          fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
        } catch (err) {
          console.error(`  FAILED: ${(err as Error).message}`);
        }
      }
    }
  }

  console.log(`\nDone. Generated: ${processed}, skipped (already had enSimple): ${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
