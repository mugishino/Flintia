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
pub fn get_system_uptime() -> u64 {
    sysinfo::System::uptime()
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

#[tauri::command]
pub async fn get_windows_hotfix() -> Result<String, String> {
    let out = tokio::process::Command::new("powershell")
        .arg("-Command")
        .arg("Get-Hotfix | ConvertTo-Json")
        .output()
        .await
        .expect("failed to Get-Hotfix");
    Ok(String::from_utf8_lossy(&out.stdout).to_string())
}
