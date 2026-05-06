# English Memorize

自己紹介トピックを 20 ブロック単位で暗記する練習用 PWA。Next.js + Tailwind v4 で実装、GitHub Pages にデプロイ。

データソースは別リポ [`mitama987/ClaudeCompany`](https://github.com/mitama987/ClaudeCompany) の `.company/english/`（`.bi.md` + `audio/`）。ビルド時に GitHub Actions が clone してデータを取り込む。

## 機能

| モード | 内容 |
|---|---|
| 🎧 判読 | EN 表示 + 音声、JA はタップで表示。シャドーイング向け |
| 🗣️ 暗唱 | JA 表示、EN は隠して口で言ってからタップで答え合わせ |
| ▶️ 連続再生 | B01 を N 回 → B02 → … 自動進行。loop 回数 (1/3/5) と速度を選択 |
| 🔁 ずらし復習 | 「覚えた」してから 1/3/7 日経ったブロックだけ表示する SRS 風 |

3 速度音声（1.0x / 0.75x / 0.5x）、進捗 localStorage 保存、JSON エクスポート/インポート対応。

## ローカル開発

前提:
- Node.js 20+
- 隣ディレクトリに ClaudeCompany が clone されていること（`../90_other/ClaudeCompany/`）

```bash
npm install
npm run dev
```

http://localhost:3000 でアクセス。スマホから LAN テスト:
```bash
npm run dev -- --hostname 0.0.0.0
# → http://192.168.x.x:3000 をスマホで開く
```

データソースのパスは `CLAUDECOMPANY_PATH` 環境変数で上書き可能:
```bash
CLAUDECOMPANY_PATH=/path/to/ClaudeCompany npm run dev
```

## ビルド

```bash
npm run build       # build:data → next build → out/ に静的サイト生成
npx serve out -l 3001
```

## デプロイ

`main` ブランチへの push で `.github/workflows/deploy.yml` が自動実行され GitHub Pages へデプロイ。

公開先: https://mitama987.github.io/english-memorize/

ClaudeCompany のデータを更新したら（`.bi.md` の追加/編集や `gen_audio.py` での mp3 追加）、それを ClaudeCompany 側に push すれば、こちらの workflow を再実行することで反映される。

## 仕組み

```
ClaudeCompany リポ                    english-memorize リポ
.company/english/                     scripts/build-data.ts
├── scripts/*.bi.md  ──────parse────→ src/data/topics.json
└── audio/**/*.mp3   ──────copy─────→ public/audio/

                                      Next.js (static export)
                                      ├── app/page.tsx           トピック一覧
                                      └── app/topics/[id]/...    練習画面
                                              └─ TopicView (5 modes)
                                              └─ BlockCard / AudioPlayer / ...
```

## アーキテクチャ

- **データ層**: ビルド時に `.bi.md` をパースして `topics.json` 生成（`scripts/build-data.ts`）
- **ページ**: App Router、すべて静的エクスポート (`output: 'export'`)
- **状態**: 各ブロックの「覚えた」状態は localStorage に保存、SSR ではダミー
- **PWA**: `public/sw.js` がランタイムキャッシュで mp3/HTML/JS/CSS を保持。初回アクセス後はオフラインで動作
- **GitHub Pages**: `basePath: '/english-memorize'`、`trailingSlash: true`

## 既知の制限

- iOS Safari は SVG `apple-touch-icon` を一部表示しない（Android Chrome は OK）。必要なら PNG 化
- service worker のスコープは `/english-memorize/` 配下のみ
- mp3 全部キャッシュすると数百 MB になりうる。スマホストレージに注意
