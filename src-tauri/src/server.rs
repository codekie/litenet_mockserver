use crate::events::{
    LuminairePayload, EVENT_BRIGHTER, EVENT_DARKER, EVENT_SELECTED_LUMINAIRE, EVENT_TURNED_OFF,
    EVENT_TURNED_ON,
};
use crate::parameters::LUMINAIRE_ID;
use scraper::{ElementRef, Html, Selector};
use std::collections::HashMap;
use std::fs;
use tauri::Window;
use tracing::info;
use warp::{reply, Filter};

pub fn setup_server(window: Window) {
    let login =
        warp::path!("incontrol.web" / "login.aspx").and(warp::fs::file("./static/html/login.aspx"));
    let detail = {
        let page_raw = load_file("detail.aspx");
        let dom = Html::parse_document(&page_raw);
        let mapping_id_name = create_id_name_mapping(&dom);
        // Clone the window, because we have to move it into the closure below (as it will be used
        // in an async-thread)
        let window_clone = window.clone();
        warp::path!("incontrol.web" / "detail.aspx")
            // .and(warp::post().or(warp::get()))
            .and(warp::body::form())
            .map(move |params: HashMap<String, String>| {
                handle_detail(&window_clone, &page_raw, &mapping_id_name, &params)
            })
    };
    let routes = login.or(detail);
    tauri::async_runtime::spawn(warp::serve(routes).run(([127, 0, 0, 1], 8000)));
}

fn handle_detail(
    window: &Window,
    page_raw: &String,
    mapping_id_name: &HashMap<String, String>,
    params: &HashMap<String, String>,
) -> reply::Html<std::string::String> {
    info!("Starting request handler");
    let (action, payload) = create_payload(&mapping_id_name, params);
    info!("Action: {} - {:?}", &action, &payload);
    window.emit(action, payload).unwrap();
    let result = reply::html(page_raw.to_owned());
    info!("Finished request handler");
    result
}

fn load_file(file_name: &str) -> String {
    fs::read_to_string(format!("static/html/{}", file_name)).expect("Unable to read file")
}

fn create_payload<'a>(
    mapping_id_name: &'a HashMap<String, String>,
    params: &'a HashMap<String, String>,
) -> (&'a str, LuminairePayload) {
    let x_opt = params.get("ctl00$cphBody$ibLight.x");
    let y_opt = params.get("ctl00$cphBody$ibLight.y");

    let action = match (x_opt, y_opt) {
        (None, None) => EVENT_SELECTED_LUMINAIRE,
        _ => {
            let x = x_opt.unwrap().parse::<usize>().unwrap();
            let y = y_opt.unwrap().parse::<usize>().unwrap();
            match (x, y) {
                // TODO define ranges here
                (19, 19) => EVENT_TURNED_ON,
                (19, 89) => EVENT_TURNED_OFF,
                (64, 19) => EVENT_BRIGHTER,
                _ => EVENT_DARKER,
            }
        }
    };

    let level = match action {
        EVENT_TURNED_ON => Some(100),
        EVENT_TURNED_OFF => Some(-100),
        EVENT_BRIGHTER => Some(1),
        EVENT_DARKER => Some(-1),
        _ => None,
    };

    let name = match params.get(LUMINAIRE_ID) {
        Some(id) => Some(mapping_id_name.get(id).unwrap().to_owned()),
        None => None,
    };

    (action, LuminairePayload { name: name, level })
}

fn create_id_name_mapping(dom: &Html) -> HashMap<String, String> {
    let mut mapping: HashMap<String, String> = HashMap::new();
    let selector = Selector::parse(&format!("a")).unwrap();
    let links: Vec<ElementRef> = dom.select(&selector).collect();
    for link in links {
        let element = link.value();
        let id_opt = &element.id;
        if id_opt.is_none() {
            continue;
        }
        mapping.insert(
            id_opt.as_ref().unwrap().to_string(),
            link.text().collect::<String>().trim().to_owned(),
        );
    }
    mapping
}
