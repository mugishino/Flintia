use std::{collections::HashMap, sync::{Mutex}};

use tauri::{
    AppHandle, Manager, WindowEvent, Wry, menu::{Menu, MenuItem}, tray::TrayIconBuilder
};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons};

pub mod flintia;
use flintia::{debug as fdebug, font, invks, launcher, core as fcore};

pub fn crash_handler() {
    //! アプリ終了時の共通処理の記述から呼び出されています。
    //! クラッシュ時にのみ行う処理が発生した場合は分離するなど対処してください。

    let _ = font::remove_all_font_resource().map_err(|e| {
        println!("Failed to collect font resource: {}", e)
    });
}

pub fn quit_application(app: &AppHandle<Wry>, restart: bool) {
    // ウィンドウを閉じた際に最後のウィンドウであれば処理を行う
    for win in app.webview_windows().into_values() {
        let app_handle = app.app_handle().clone();
        win.on_window_event(move |event| {
            if let WindowEvent::Destroyed = event {
                if app_handle.webview_windows().is_empty() {
                    if restart {
                        app_handle.request_restart();
                    } else {
                        app_handle.exit(0);
                    }
                }
            }
        });
    }
    // ウィンドウを全て閉じる
    for win in app.webview_windows().into_values() {
        let _ = win.close();
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            let _ = app
                .get_webview_window("main")
                .expect("no main window")
                .set_focus();
        }))
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            None,
        ))
        .invoke_handler(tauri::generate_handler![
            fcore::register_hotkey,
            invks::paste,
            invks::get_system_uptime,
            invks::get_all_disk_info,
            invks::get_windows_hotfix,
            invks::is_directory,
            invks::run_exe,
            invks::console_log,
            invks::file_trash,
            invks::get_recursive_files,
            launcher::get_file_icon_base64,
            launcher::get_windows_accent_color,
            launcher::parse_lnk,
            launcher::get_uwp_apps,
            font::parse_font_metadata,
            font::generate_font_preview,
            font::register_fonts,
            font::unregister_fonts,
            font::get_active_fonts,
            #[cfg(debug_assertions)]
            fdebug::open_devtools,
        ])
        .manage(fcore::CommandState {
            hotkey_data: Mutex::new(HashMap::new()),
        })
        .on_window_event(|_, event| match event {
            tauri::WindowEvent::Destroyed => {
                // アプリ終了時の共通処理
                crash_handler();
            }
            _ => {}
        })
        .setup(|app| {
            // 開発用 - DevToolsを自動で開く
            #[cfg(debug_assertions)]
            app.get_webview_window("main").unwrap().open_devtools();

            // タスクトレイ
            let _ = TrayIconBuilder::new()
                .menu(&Menu::with_items(
                    app,
                    &[
                        &MenuItem::with_id(app, "show", "Show", true, None::<&str>)?,
                        &MenuItem::with_id(app, "info", "Info", true, None::<&str>)?,
                        // 詳細: restartロジック
                        &MenuItem::with_id(app, "restart", "Restart", true, None::<&str>)?,
                        &MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?,
                    ],
                )?)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "restart" | "quit" => {
                        let is_restart = event.id.as_ref() == "restart";
                        let dialog_str = if is_restart.clone() {"restart"} else {"quit"};
                        let answer = app.dialog()
                            .message(format!("Are you sure you want to {} Flintia?", dialog_str))
                            .title("Confirmation")
                            .buttons(MessageDialogButtons::OkCancel)
                            .blocking_show();
                        if answer {
                            quit_application(app, is_restart);
                        }
                    }
                    "info" => {
                        app.dialog()
                            .message(format!(
                                "Flintia {}\n(C) 2025 mugishino",
                                app.package_info().version.to_string()
                            ))
                            .kind(tauri_plugin_dialog::MessageDialogKind::Info)
                            .title("Infomation")
                            .blocking_show();
                    }
                    "show" => {
                        let Some(win) = app.get_webview_window("main") else {
                            println!("[ERROR] Failed to get main window");
                            return;
                        };
                        // 開発時にJS側でエラーが発生し、ウィンドウが非表示にできない場合の対応策
                        let is_visible = win.is_visible().unwrap_or(false);
                        if is_visible {
                            if let Err(e) = win.hide() {
                                println!("[ERROR] Window hide failure: {}", e);
                            }
                        } else {
                            if let Err(e) = (|| -> tauri::Result<()> {
                                win.show()?;
                                win.unminimize()?;
                                win.set_focus()?;
                                Ok(())
                            })() {
                                println!("[ERROR] Window show failure: {}", e)
                            }
                        }
                    }
                    _ => {
                        println!("unknown menu item")
                    }
                })
                .show_menu_on_left_click(true)
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("Flintia")
                .build(app);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
