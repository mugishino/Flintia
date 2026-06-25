use std::{os::windows::{process::CommandExt}, path::{self, Path}, process::{Command, Stdio}};
use enigo::{Enigo, Key, Keyboard, Settings};
use walkdir::WalkDir;

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
pub fn clipboard_copyfile(path: &str) -> Result<(), String> {
    let p = Path::new(path).canonicalize().map_err(|e| e.to_string())?;
    if !p.exists() {
        return Err(format!("File not found: {}", path));
    }
    let fullpath = p.to_string_lossy().into_owned();

    clipboard_win::raw::open().map_err(|e| e.to_string())?;
    clipboard_win::raw::empty().map_err(|e| e.to_string())?;
    clipboard_win::raw::set_file_list(&vec![fullpath]).map_err(|e| e.to_string())?;
    clipboard_win::raw::close().map_err(|e| e.to_string())?;
    Ok(())
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
        .map_err(|_| "Failed to Get-Hotfix")?;
    Ok(String::from_utf8_lossy(&out.stdout).to_string())
}

#[tauri::command]
pub fn is_directory(path: &str) -> bool {
    let target = path::PathBuf::from(path);
    target.is_dir()
}

#[tauri::command]
pub fn run_exe(path: &str, args: &str) -> Result<(), String> {
    if path.trim().is_empty() {
        return Err("path is empty".into());
    }

    // argsを分割
    let args_vec = shell_words::split(args)
        .map_err(|e| e.to_string())?;

    // flags
    const DETACHED_PROCESS: u32 = 0x00000008;

    Command::new(path)
        .args(args_vec)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .creation_flags(DETACHED_PROCESS)
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn console_log(msg: &str) {
    println!("{}", msg);
}

#[tauri::command]
pub fn file_trash(files: Vec<String>) -> Result<(), String> {
    let _ = trash::delete_all(files).map_err(|_| "File trash failed");
    Ok(())
}

#[tauri::command]
pub fn get_recursive_files(path: String) -> Vec<String> {
    WalkDir::new(path)
        .into_iter()
        .filter_map(|e| e.ok())           // エラー（アクセス権限なし等）をスキップ
        .filter(|e| e.file_type().is_file()) // ファイルのみに絞り込む
        .map(|e| e.path().to_string_lossy().into_owned()) // PathからStringへ変換
        .collect()
}
