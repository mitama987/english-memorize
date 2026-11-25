# VERSION HISTORY ARCHIVE

## ClaudeCompany の既定の場所を今の work の形に（2026-11-25・branch `fix/claudecompany-default-path`）
- きっかけ: work フォルダを「区分 → 分野」の 2 段にする。このリポは `1_own\55_media\52_english-memorize`、ClaudeCompany は `1_own\10_ops\10_ClaudeCompany` になる
- 元の状態: `scripts/build-data.ts` の既定が `../90_other/ClaudeCompany`。2026-11-03 の改名（→ `10_ClaudeCompany`）から存在せず、`CLAUDECOMPANY_PATH` を入れないと `predev`／`prebuild` が止まる状態だった
- 中身: 既定の候補を 2 つにして、あるほうを使う（`../../10_ops/10_ClaudeCompany` → `../10_ClaudeCompany`）。環境変数があればそれを優先（今までどおり）
- 確かめ: `npm run build:data` の 1 行目 `[build-data] source = …` が実在する ClaudeCompany を指し、エラーなく終わること
