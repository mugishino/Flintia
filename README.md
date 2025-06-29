# 概要
自分用の便利ツールセット

Ctrl+Shift+ALT+Qで呼び出せる

# ツールリスト
- パスワード管理
- 開発ツール(UUID生成など)
- FFmpegコマンドジェネレーター(映像のみ, NVENC)
- メモ帳
- QRCodeリーダー
- OTP認証

# 設定ファイル
`%AppData%/Roaming/com.flintia.app/config.json`にデータを直で書き込んでください
```
passfile: パスワードファイル
authfile: OTP認証コードファイル
```

# パスワードファイル記述形式
```
[
    {
        "title": string,
        "username": string,
        "mail": string,
        "password": string,
        "note": string,
        "hide": boolean
    }
]
```

# OTP認証コードファイル記述形式
```
{
    "Title": "SecretCode"
}
```
