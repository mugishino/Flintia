use std::{io::Cursor, os::windows::process::CommandExt, path, process::{Command, Stdio}};

use base64::{Engine, engine::general_purpose};
use enigo::{Enigo, Key, Keyboard, Settings};
use file_icon_provider::get_file_icon;
use image::{DynamicImage, RgbaImage};
use lnk::encoding::WINDOWS_1252;
use serde::Serialize;
use windows::{Management::Deployment::PackageManager, UI::ViewManagement::{UIColorType, UISettings}, core::HSTRING};

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
        .map_err(|_| "Failed to Get-Hotfix")?;
    Ok(String::from_utf8_lossy(&out.stdout).to_string())
}

#[tauri::command]
pub fn get_file_icon_base64(path: &str, size: u16) -> Result<String, String> {
    let icon = get_file_icon(path, size).map_err(|_| "Failed to get file icon")?;

    // Icon -> DynamicImage
    let image = RgbaImage::from_raw(icon.width, icon.height, icon.pixels)
        .map(DynamicImage::ImageRgba8)
        .ok_or("Failed to convert Icon to Image")?;

    // create buffer
    let mut buffer = Cursor::new(Vec::new());
    image
        .write_to(&mut buffer, image::ImageFormat::Png)
        .map_err(|e| format!("Failed to encode image: {}", e))?;
    let bytes = buffer.into_inner();

    // 2. Base64エンコード
    let b64 = general_purpose::STANDARD.encode(bytes);
    Ok(b64)
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
    const CREATE_NO_WINDOW: u32 = 0x08000000;
    const DETACHED_PROCESS: u32 = 0x00000008;

    Command::new("cmd")
        .args(["/C", "start", "", path])
        .args(args_vec)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .creation_flags(CREATE_NO_WINDOW | DETACHED_PROCESS)
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn console_log(msg: &str) {
    println!("{}", msg);
}

#[tauri::command]
pub fn get_windows_accent_color() -> Result<serde_json::Value, String> {
    let settings = UISettings::new().map_err(|_| "Failed to create UISettings new instance")?;
    let accent_color = settings.GetColorValue(UIColorType::Accent).map_err(|_| "Failed to GetColorValue")?;

    let json = serde_json::json!({
        "R": accent_color.R,
        "G": accent_color.G,
        "B": accent_color.B,
        "A": accent_color.A,
    });
    Ok(json)
}

#[tauri::command]
pub fn file_trash(files: Vec<String>) -> Result<(), String> {
    let _ = trash::delete_all(files).map_err(|_| "File trash failed");
    Ok(())
}

#[tauri::command]
pub fn parse_lnk(path: &str) -> Result<serde_json::Value, String> {
    // WINDOWS_1252で欧米圏の標準
    let shortcut = lnk::ShellLink::open(path, WINDOWS_1252).map_err(|_| "Failed to get lnk file")?;
    let json = serde_json::json!(shortcut);
    Ok(json)
}

#[derive(Serialize)]
pub struct UwpAppInfo {
    display_name: Option<String>,
    description: Option<String>,
    aumid: String
}

#[tauri::command]
pub fn get_uwp_apps() -> Result<Vec<UwpAppInfo>, String> {
    let manager = PackageManager::new().map_err(|e| format!("Failed-Init-PackageManager: {}", e))?;
    let current_uesr = HSTRING::from("");
    let packages = manager.FindPackagesByUserSecurityId(&current_uesr).map_err(|e| format!("Failed-Get-Packages: {}", e))?;

    let data = packages
        .into_iter()
        .flat_map(|pack| {
            let Ok(entries) = pack.GetAppListEntries() else {
                return Vec::new().into_iter();
            };

            entries.into_iter().filter_map(|app| {
                let info = app.DisplayInfo().ok()?;
                let aumid = app.AppUserModelId().ok()?.to_string();

                Some(UwpAppInfo {
                    display_name: info.DisplayName().ok().map(|v| v.to_string()),
                    description: info.Description().ok().map(|v| v.to_string()),
                    aumid,
                })
            }).collect::<Vec<_>>().into_iter()
        }).collect();
    Ok(data)
}
