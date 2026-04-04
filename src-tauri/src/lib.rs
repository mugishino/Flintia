use tauri::{
    Manager, menu::{Menu, MenuItem}, tray::TrayIconBuilder
};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons};

mod commands;

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
            commands::paste,
            commands::get_system_uptime,
            commands::get_all_disk_info,
            commands::get_windows_hotfix,
            commands::get_file_icon_base64,
            commands::is_directory,
            commands::run_exe,
            commands::console_log,
            commands::get_windows_accent_color
        ])
        .setup(|app| {
            // 開発用 - DevToolsを自動で開く
//            app.get_webview_window("main").unwrap().open_devtools();

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
                    "quit" => {
                        // cleanup_before_exitの後の行ではtauri関連のAPIは使用しないでらしい
                        app.cleanup_before_exit();
                        app.exit(0);
                    }
                    "info" => {
                        app.dialog()
                            .message(format!(
                                "Flintia {}\n(C) 2025 sou",
                                app.package_info().version.to_string()
                            ))
                            .kind(tauri_plugin_dialog::MessageDialogKind::Info)
                            .title("Infomation")
                            .blocking_show();
                    }
                    "restart" => {
                        let answer = app.dialog()
                            .message("Are you sure you want to restart Flintia?")
                            .title("Confirmation")
                            .buttons(MessageDialogButtons::OkCancel)
                            .blocking_show();
                        if answer {
                            // この処理で本当に安定しているのかは不明。1412エラーが出る可能性も否めない
                            for win in app.webview_windows().into_values() {
                                let _ = win.close();
                            }
                            app.request_restart();
                        }
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
                            if let Err(e) = win.show() {
                                let _ = win.set_focus();
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
