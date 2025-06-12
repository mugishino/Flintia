use std::process::Command;

use enigo::{Enigo, Key, Keyboard, Settings};

#[tauri::command]
pub fn show(win: tauri::WebviewWindow) {
    let _ = win.center();
    let _ = win.show();
    let _ = win.set_focus();
}

#[tauri::command]
pub fn hide(win: tauri::WebviewWindow) {
    let _ = win.hide();
}

#[tauri::command]
pub fn paste() {
    let mut enigo = Enigo::new(&Settings::default()).unwrap();

    // press Ctrl+V
    enigo.key(Key::Control, enigo::Direction::Press).unwrap();
    enigo.key(Key::V, enigo::Direction::Click).unwrap();

    // release Ctrl
    enigo.key(Key::Control, enigo::Direction::Release).unwrap();
}

#[tauri::command]
pub fn open_explorer(path: &str) {
    Command::new("explorer").arg(path).spawn().unwrap();
}
