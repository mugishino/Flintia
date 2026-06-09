// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::panic;

use windows::Win32::System::Diagnostics::Debug::{AddVectoredExceptionHandler, EXCEPTION_POINTERS};

unsafe extern "system" fn win32_exception_handler(_info: *mut EXCEPTION_POINTERS) -> i32 {
    flintia_lib::crash_handler();
    0
}

fn main() {
    let default_hook = panic::take_hook();
    panic::set_hook(Box::new(move |panic_info| {
        flintia_lib::crash_handler();
        // 元のpanicに戻す
        default_hook(panic_info);
    }));

    let _veh_handler = unsafe { AddVectoredExceptionHandler(1, Some(win32_exception_handler)) };

    flintia_lib::run()
}
