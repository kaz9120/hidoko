# hidoko-id

## [0.5.0](https://github.com/kaz9120/hidoko/compare/hidoko-id-v0.4.0...hidoko-id-v0.5.0) (2026-06-16)


### Features

* **hidoko-id:** パスワード再設定 4 ステップを実装する ([#213](https://github.com/kaz9120/hidoko/issues/213)) ([f425f2e](https://github.com/kaz9120/hidoko/commit/f425f2ed1a9546e0d3575db67f8858a6fc6be744))

## [0.4.0](https://github.com/kaz9120/hidoko/compare/hidoko-id-v0.3.1...hidoko-id-v0.4.0) (2026-06-16)


### Features

* **hidoko-id:** パスワードハッシュを scrypt に移行し、旧 PBKDF2 を透過 rehash する ([#212](https://github.com/kaz9120/hidoko/issues/212)) ([66b357e](https://github.com/kaz9120/hidoko/commit/66b357e0ceba6553c30351db81bd2a84898d8a15)), closes [#208](https://github.com/kaz9120/hidoko/issues/208)

## [0.3.1](https://github.com/kaz9120/hidoko/compare/hidoko-id-v0.3.0...hidoko-id-v0.3.1) (2026-06-16)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * ui bumped to 0.3.0

## [0.3.0](https://github.com/kaz9120/hidoko/compare/hidoko-id-v0.2.0...hidoko-id-v0.3.0) (2026-06-15)


### Features

* **hidoko-id:** 検証メールを Email Service binding で本番送信する ([#207](https://github.com/kaz9120/hidoko/issues/207)) ([659a337](https://github.com/kaz9120/hidoko/commit/659a3371e4732fbda90a5fcf507a0e8321cf78ee))

## [0.2.0](https://github.com/kaz9120/hidoko/compare/hidoko-id-v0.1.0...hidoko-id-v0.2.0) (2026-06-15)


### Features

* **hidoko-id:** 共通ログイン基盤の vertical slice を新規追加 ([#193](https://github.com/kaz9120/hidoko/issues/193)) ([099c772](https://github.com/kaz9120/hidoko/commit/099c7722b410a0408fb99e1402d98d47e509fa1d))

## 0.1.0

### Minor Changes

- 共通ログイン基盤の vertical slice を新規追加（サインアップ → メール確認 → サインイン → return_to へのリダイレクト）。
