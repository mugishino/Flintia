// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn show(win: tauri::WebviewWindow) {
    let _ = win.center();
    let _ = win.show();
    let _ = win.set_focus();
}

#[tauri::command]
fn hide(win: tauri::WebviewWindow) {
    let _ = win.hide();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![show, hide])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
