use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager,
};
use tauri_plugin_autostart::MacosLauncher;
use tauri_plugin_dialog::DialogExt;
mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
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
                        &MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?,
                    ],
                )?)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
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
                    "show" => {
                        let win = app.get_webview_window("main").expect("no main window");
                        // 開発時にJS側でエラーが発生し、ウィンドウが非表示にできない場合の対応策
                        if !win.is_visible().unwrap_or(false) {
                            win.show().expect("window show failure");
                        } else {
                            win.hide().expect("window hide failure");
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
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::paste,
            commands::get_system_uptime,
            commands::get_all_disk_info,
            commands::get_windows_hotfix,
            commands::get_file_icon_base64,
            commands::is_directory,
            commands::run_exe
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
