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
pub fn run_process(file: &str, args: Vec<String>) -> Result<(), String> {
    Command::new(file)
        .args(args)
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn run_process_sync(file: &str, args: Vec<String>) -> Result<String, String> {
    let mut cmd = Command::new(file);
    cmd.args(args);
    let output = cmd.output().map_err(|e| e.to_string())?;
    if !output.status.success() {
        return Err(format!("Failed to start process: {:?}", output.status));
    }
    return Ok(String::from_utf8_lossy(&output.stdout).to_string());
}

#[tauri::command]
pub fn get_system_uptime() -> u64 {
    sysinfo::System::uptime()
}

#[tauri::command]
pub fn command_exists(cmd: &str) -> bool {
    Command::new("where")
        .arg(cmd)
        .output()
        .map_or(false, |o| o.status.success())
}

#[derive(serde::Serialize)]
pub struct DiskInfo {
    name: String,
    total_size: u64,
    available_space: u64,
}

#[tauri::command]
pub fn get_all_disk_info() -> Vec<DiskInfo> {
    let disks = sysinfo::Disks::new_with_refreshed_list();
    disks
        .iter()
        .map(|disk| DiskInfo {
            name: disk
                .mount_point()
                .to_str()
                .map(|s| s.to_string())
                .unwrap_or("?:".to_string()),
            total_size: disk.total_space(),
            available_space: disk.available_space(),
        })
        .collect()
}
