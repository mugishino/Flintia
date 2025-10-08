use std::process::Command;

use enigo::{Enigo, Key, Keyboard, Settings};

#[tauri::command]
pub fn paste(enter: bool, win: tauri::WebviewWindow) {
    let _ = win.hide();
    let mut enigo = Enigo::new(&Settings::default()).unwrap();

    // press Ctrl+V
    enigo.key(Key::Control, enigo::Direction::Press).unwrap();
    enigo.key(Key::V, enigo::Direction::Click).unwrap();

    // release Ctrl
    enigo.key(Key::Control, enigo::Direction::Release).unwrap();

    if enter {
        enigo.key(Key::Return, enigo::Direction::Click).unwrap();
    }
}

#[tauri::command]
pub fn run_process(file: &str, args: Vec<String>) -> Result<String, String> {
    let output = Command::new(file).args(args).spawn();

    match output {
        Ok(_) => Ok("Process started successfully".to_string()),
        Err(e) => Err(format!("Failed to start: {}", e)),
    }
}
