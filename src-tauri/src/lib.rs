use enigo::{Enigo, Key, Keyboard, Settings};
use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager,
};
use tauri_plugin_autostart::{MacosLauncher, ManagerExt};
use tauri_plugin_dialog::DialogExt;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn show(win: tauri::WebviewWindow) {
    let _ = win.center();
    let _ = win.show();
    let _ = win.set_focus();
}

#[tauri::command]
fn hide(win: tauri::WebviewWindow) {
    let _ = win.hide();
}

#[tauri::command]
fn paste() {
    let mut enigo = Enigo::new(&Settings::default()).unwrap();

    // press Ctrl+V
    enigo.key(Key::Control, enigo::Direction::Press).unwrap();
    enigo.key(Key::V, enigo::Direction::Click).unwrap();

    // release Ctrl
    enigo.key(Key::Control, enigo::Direction::Release).unwrap();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
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
            let _ = TrayIconBuilder::new()
                .menu(&Menu::with_items(
                    app,
                    &[
                        &MenuItem::with_id(app, "show", "Show", true, None::<&str>)?,
                        &MenuItem::with_id(app, "al", "AutoLaunch", true, None::<&str>)?,
                        &MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?,
                    ],
                )?)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "al" => {
                        let ans = app.dialog()
                            .message("StartUp is Enabled(Y)/Disabled(N)")
                            .kind(tauri_plugin_dialog::MessageDialogKind::Info)
                            .title("Startup")
                            .buttons(tauri_plugin_dialog::MessageDialogButtons::YesNo)
                            .blocking_show();
                        if ans {
                            let _ = app.autolaunch().enable();
                        } else {
                            let _ = app.autolaunch().disable();
                        }
                    }
                    "show" => {
                        show(app.get_webview_window("main").expect("no main window"));
                    }
                    _ => {
                        println!("unknown menu item")
                    }
                })
                .show_menu_on_left_click(true)
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("SouPass")
                .build(app);
            Ok(())
        })
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![show, hide, paste])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
