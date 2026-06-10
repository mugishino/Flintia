use std::{collections::HashMap, sync::{Mutex, atomic::{AtomicBool, Ordering}}};
use tauri::{AppHandle, Emitter, Wry};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

pub struct CommandState {
    pub hotkey_data: Mutex<HashMap<String, String>>,
    pub is_initial: AtomicBool,
}

#[tauri::command]
pub fn register_hotkey(hotkey: &str, id: &str, app: AppHandle<Wry>, state: tauri::State<'_, CommandState>) -> Result<String, String> {
    let manager = app.global_shortcut();
    let mut data = state.hotkey_data.lock().unwrap();

    let already_key_opt = data.get(id);
    if let Some(already_key) = already_key_opt {
        // 既に登録されているキーと同じならキャンセル
        if already_key == hotkey {return Ok("Success - some key".to_string());}

        // キー更新の場合は旧キーを削除
        let _ = manager.unregister(already_key.as_str());
    }

    // 登録
    let id_str = String::from(id);
    manager.on_shortcut(hotkey, move |app, _, state| {
        if state.state == ShortcutState::Pressed {
            let _ = app.emit("hotkey-pressed", id_str.clone()).unwrap();
        }
    }).map(|_| {
        // 成功すれば更新
        data.insert(String::from(id), String::from(hotkey));
        format!("Success - Register hotkey: {}", hotkey)
    }).map_err(|_| {
        format!("Failed - Register hotkey: {}", hotkey)
    })
}

#[tauri::command]
pub fn is_initial(state: tauri::State<'_, CommandState>) -> bool {
    let value = state.is_initial.load(Ordering::SeqCst);
    state.is_initial.store(false, Ordering::SeqCst);
    value
}
