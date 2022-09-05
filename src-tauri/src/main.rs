#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

pub mod constants;
pub mod events;
pub mod luminaire;
pub mod parameters;
pub mod room;
pub mod server;

use crate::events::EVENT_TURN_ON;
use crate::luminaire::Luminaire;
use crate::room::create_room;
use crate::server::setup_server;
use tauri::{App, Manager, Wry};

fn main() {
    // install global collector configured based on RUST_LOG env var.
    tracing_subscriber::fmt::init();

    tauri::Builder::default()
        .setup(|app| {
            bind_events(app)?;
            let main_window = app.get_window("main").unwrap();
            setup_server(main_window);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![greet, get_room])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_room() -> Vec<Vec<Luminaire>> {
    create_room()
}

fn bind_events(app: &mut App<Wry>) -> anyhow::Result<()> {
    app.listen_global(EVENT_TURN_ON, |event| {
        let name = event.payload().unwrap();
        // app.emit_all(
        //     EVENT_TURNED_ON,
        //     LuminairePayload {
        //         name: name.to_string(),
        //         level: 0,
        //     },
        // )
        // .unwrap();
        println!("{}", name);
    });
    Ok(())
}
