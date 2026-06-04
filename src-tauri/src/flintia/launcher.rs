use std::{io::{Cursor}};

use base64::{Engine, engine::general_purpose};
use file_icon_provider::get_file_icon;
use image::{DynamicImage, RgbaImage};
use lnk::encoding::WINDOWS_1252;
use serde::Serialize;
use windows::{Management::Deployment::PackageManager, UI::ViewManagement::{UIColorType, UISettings}, core::HSTRING};

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
