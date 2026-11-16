# app-kit

アプリが共通で使う、見た目を持たない部品。見た目のある部品は [Takibi Design System](https://design-system.y-kaz.com)（`takibi-design-system`）を使う。

| export | 内容 |
|---|---|
| `Analytics` | GA4 と Microsoft Clarity の計測タグ。ID が未設定なら何も出さない |
| `AgentationDebugGate` | `localhost` と `*.workers.dev` でだけ Agentation を読み込む |
