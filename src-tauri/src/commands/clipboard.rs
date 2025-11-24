use arboard::Clipboard;

#[tauri::command]
pub async fn copy_to_clipboard(text: String) -> Result<(), String> {
    let mut clipboard = Clipboard::new()
        .map_err(|e| format!("Failed to initialize clipboard: {}", e))?;

    clipboard
        .set_text(text)
        .map_err(|e| format!("Failed to copy to clipboard: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn read_from_clipboard() -> Result<String, String> {
    let mut clipboard = Clipboard::new()
        .map_err(|e| format!("Failed to initialize clipboard: {}", e))?;

    clipboard
        .get_text()
        .map_err(|e| format!("Failed to read from clipboard: {}", e))
}