#[tauri::command]
#[cfg(debug_assertions)]
pub fn open_devtools(app: tauri::AppHandle, label: &str) {
    use tauri::Manager;

    let webview = app.get_webview_window(label);
    if let Some(win) = webview {
        win.open_devtools();
    }
}
