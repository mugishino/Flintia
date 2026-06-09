use std::{fs::File, io::Read, os::windows::ffi::OsStrExt, path::Path, sync::Mutex};
use ab_glyph::{FontVec, PxScale};
use image::{ImageBuffer, Rgba, codecs::webp::WebPEncoder, imageops};
use imageproc::drawing::draw_text_mut;
use serde::Serialize;
use ttf_parser::name_id;
use windows::{Win32::{Foundation::{LPARAM, WPARAM}, Graphics::Gdi::{AddFontResourceExW, FONT_RESOURCE_CHARACTERISTICS, RemoveFontResourceExW}, UI::WindowsAndMessaging::{HWND_BROADCAST, PostMessageW, WM_FONTCHANGE}}, core::{HSTRING, PCWSTR}};

#[derive(Serialize)]
pub struct FontMetadata {
    family_name: Option<String>,
    post_script_name: Option<String>, // 内部識別名
    full_name: Option<String>,
    subfamily_name: Option<String>, // "Regular", "Bold" など
    version: Option<String>,
    license: Option<String>,
    copyright: Option<String>,
    monospaced: bool,
    variable: bool,
}

#[tauri::command]
pub fn parse_font_metadata(path: &str) -> Result<FontMetadata, String> {
    let path = Path::new(&path);
    let mut file = File::open(path).map_err(|e| e.to_string())?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer).map_err(|e| e.to_string())?;

    // ttf-parserでフォントをパース
    let face = ttf_parser::Face::parse(&buffer, 0).map_err(|e| e.to_string())?;

    let mut family_name     : Option<String> = None;
    let mut post_script_name: Option<String> = None;
    let mut full_name       : Option<String> = None;
    let mut subfamily_name  : Option<String> = None;
    let mut version         : Option<String> = None;
    let mut license         : Option<String> = None;
    let mut copyright       : Option<String> = None;

    for name in face.names() {
        if name.is_unicode() {
            match name.name_id {
                name_id::FAMILY => family_name = family_name.or_else(|| name.to_string()),
                name_id::FULL_NAME => full_name = full_name.or_else(|| name.to_string()),
                name_id::POST_SCRIPT_NAME => post_script_name = post_script_name.or_else(|| name.to_string()),
                name_id::SUBFAMILY => subfamily_name = subfamily_name.or_else(|| name.to_string()),
                name_id::VERSION => version = version.or_else(|| name.to_string()),
                name_id::LICENSE => license = license.or_else(|| name.to_string()),
                name_id::COPYRIGHT_NOTICE => copyright = copyright.or_else(|| name.to_string()),
                _ => {}
            }
        }
    }

    Ok(FontMetadata {
        family_name,
        post_script_name,
        full_name,
        subfamily_name,
        version,
        license,
        copyright,
        monospaced: face.is_monospaced(),
        variable: face.is_variable(),
    })
}

#[tauri::command]
pub fn generate_font_preview(
    font_path: &str,
    output_path: &str,
    text: &str,
    font_size: f32,
    canvas_width: u32,
    canvas_height: u32,
    base_x: i32,
    base_y: i32,
    padding: u32,
) -> Result<(), String> {
    // フォントファイルの読み込み
    let font_bytes = std::fs::read(&font_path).map_err(|e| e.to_string())?;
    let font = FontVec::try_from_vec(font_bytes).map_err(|e| e.to_string())?;
    let scale = PxScale::from(font_size);



    // キャンバス新規作成
    let mut canvas = ImageBuffer::from_pixel(canvas_width, canvas_height, Rgba([0u8, 0, 0, 0]));

    // 描画設定
    let text_color = Rgba([255, 255, 255, 255]);

    // 描画
    draw_text_mut(&mut canvas, text_color, base_x, base_y, scale, &font, &text);



    // クリッピング
    let mut left = canvas_width;
    let mut right = 0;
    let mut top = canvas_height;
    let mut bottom = 0;
    let mut has_pixels = false;

    for (x, y, pixel) in canvas.enumerate_pixels_mut() {
        let alpha = pixel[3];
        if alpha == 0 { continue; }

        // クリッピング用データ
        has_pixels = true;
        if x < left   { left   = x; }
        if x > right  { right  = x; }
        if y < top    { top    = y; }
        if y > bottom { bottom = y; }

        // 減色(3値化)
        if alpha < 200 {
            *pixel = Rgba([255, 255, 255, 80]);
        } else {
            *pixel = Rgba([255, 255, 255, 255]);
        }
    }

    // もし文字が何も描画されなかった場合（空文字など）は、最小サイズで返す
    if !has_pixels {
        canvas.save(&output_path).map_err(|e| e.to_string())?;
        return Ok(());
    }

    // 余白を考慮した切り出し範囲の計算（画像の枠を超えないように制限）
    let crop_x = left.saturating_sub(padding);
    let crop_y = top .saturating_sub(padding);
    let crop_width  = (right - left) + (padding * 2);
    let crop_height = (bottom - top) + (padding * 2);

    let final_width  = crop_width .min(canvas_width  - crop_x);
    let final_height = crop_height.min(canvas_height - crop_y);

    // 画像を切り抜く（crop_imm は元の画像を参照して切り抜く高速な関数です）
    let cropped_view = imageops::crop_imm(&canvas, crop_x, crop_y, final_width, final_height);



    // webpに変換し、保存
    let file = File::create(&output_path).map_err(|e| e.to_string())?;
    let encoder = WebPEncoder::new_lossless(file);
    encoder.encode(cropped_view.to_image().as_raw(), final_width, final_height, image::ExtendedColorType::Rgba8).map_err(|e| e.to_string())?;
    Ok(())
}



static ACTIVE_FONTS: Mutex<Vec<String>> = Mutex::new(Vec::new());

fn fontpath_to_hstring(fontpath: &str) -> HSTRING {
    let path = Path::new(fontpath);
    let wide: Vec<u16> = path.as_os_str().encode_wide().collect();
    HSTRING::from_wide(&wide)
}

#[tauri::command]
pub fn register_fonts(fonts: Vec<String>) -> Result<Vec<String>, String> {
    let mut actives = ACTIVE_FONTS.lock().map_err(|e| e.to_string())?;

    let mut added_fonts: Vec<String> = Vec::new();
    for f in fonts {
        let hstr = fontpath_to_hstring(&f);
        let pcwstr = PCWSTR::from_raw(hstr.as_ptr());
        unsafe {
            let r = AddFontResourceExW(pcwstr, FONT_RESOURCE_CHARACTERISTICS(0), None);
            // 0は失敗なのでそれ以外
            if r != 0 {
                added_fonts.push(f);
            }
        }
    }
    unsafe {
        let _ = PostMessageW(Some(HWND_BROADCAST), WM_FONTCHANGE, WPARAM(0), LPARAM(0));
    }
    // リソース追加成功したフォントをActiveFontsに追加する
    actives.extend(added_fonts.iter().cloned());
    Ok(added_fonts)
}

#[tauri::command]
pub fn unregister_fonts(fonts: Vec<String>) -> Result<(), String> {
    let mut actives = ACTIVE_FONTS.lock().map_err(|e| e.to_string())?;

    let mut removed = false;
    for f in fonts {
        let hstr = fontpath_to_hstring(&f);
        let pcwstr = PCWSTR::from_raw(hstr.as_ptr());
        unsafe {
            while RemoveFontResourceExW(pcwstr, 0, None).as_bool() {
                removed = true;
            }
        }
        actives.retain(|x| x.to_string() != f);
    }
    if removed {
        unsafe {
            let _ = PostMessageW(Some(HWND_BROADCAST), WM_FONTCHANGE, WPARAM(0), LPARAM(0));
        }
    }
    Ok(())
}

#[tauri::command]
pub fn get_active_fonts() -> Result<Vec<String>, String> {
    let fonts = ACTIVE_FONTS.lock().map_err(|e| e.to_string())?;
    Ok(fonts.clone())
}

/**
 * この関数はRust側に登録されているフォントを解放するものです。
 * フォントディレクトリ内のフォント全てを解放する正確性のあるものではありません。
 */
pub fn remove_all_font_resource() -> Result<(), String> {
    let actives = get_active_fonts().map_err(|e| e.to_string())?;
    unregister_fonts(actives)?;
    Ok(())
}
