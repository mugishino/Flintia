# 概要
自分用のパスワード管理・コピペツール
Ctrl+Shift+ALT+Qで呼び出せる
%AppData%/Roaming/com.soupass.app/config.jsonで指定したファイルにデータを直で書き込んでください

# パスワードファイルの書き方
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

# 使用技術
Tauri + React + Typescript
