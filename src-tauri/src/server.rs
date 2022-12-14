use crate::constants::detail::DETAIL;
use crate::constants::login::LOGIN;
use crate::events::{
    LuminairePayload, EVENT_BRIGHTER, EVENT_DARKER, EVENT_LAST_CALL_TIMESTAMP,
    EVENT_SELECTED_LUMINAIRE, EVENT_TURNED_OFF, EVENT_TURNED_ON, EVENT_NEW_REQUEST,
};
use crate::parameters::LUMINAIRE_ID;
use regex::Regex;
use scraper::{ElementRef, Html, Selector};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::Window;
use tracing::{info, span, Level};
use warp::{reply, Filter};

pub fn setup_server(window: Window) {
    let req_counter = Arc::new(Mutex::new(0));

    // Define CORS
    let cors = warp::cors().allow_any_origin();
    // Define routes
    let login = warp::path!("incontrol.web" / "login.aspx").map(|| LOGIN);
    let detail = {
        let page_raw = DETAIL.to_owned();
        let dom = Html::parse_document(&page_raw);
        let mapping_id_name = create_id_name_mapping(&dom);
        let req_counter = Arc::clone(&req_counter);
        // Clone the window, because we have to move it into the closure below (as it will be used
        // in an async-thread)
        let window_clone = window.clone();
        warp::path!("incontrol.web" / "detail.aspx")
            // .and(warp::post().or(warp::get()))
            .and(warp::body::form())
            .map(move |params: HashMap<String, String>| {
                handle_detail(
                    &window_clone,
                    &req_counter,
                    &page_raw,
                    &mapping_id_name,
                    &params,
                )
            })
    };
    // Start server
    let routes = login.or(detail).with(cors);
    tauri::async_runtime::spawn(warp::serve(routes).run(([127, 0, 0, 1], 8000)));
}

fn handle_detail(
    window: &Window,
    req_counter: &Arc<Mutex<i32>>,
    page_raw: &String,
    mapping_id_name: &HashMap<String, String>,
    params: &HashMap<String, String>,
) -> reply::Html<std::string::String> {
    window.emit(EVENT_NEW_REQUEST, 1).unwrap();
    let req_counter_raw = counter_increase(&req_counter);
    let span = span!(Level::INFO, "Request", id = req_counter_raw);
    let _enter = span.enter();
    window
        .emit(
            EVENT_LAST_CALL_TIMESTAMP,
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_millis() as i32,
        )
        .unwrap();
    let (action, payload, response) = create_payload(&mapping_id_name, params, &page_raw);
    info!("Action: {} - {:?}", &action, &payload);
    window.emit(action, payload).unwrap();
    let result = reply::html(response);
    result
}

fn counter_increase(counter: &Arc<Mutex<i32>>) -> i32 {
    let mut counter_inner = counter.lock().unwrap();
    let current = *counter_inner;
    *counter_inner += 1;
    current
}

fn create_payload<'a>(
    mapping_id_name: &'a HashMap<String, String>,
    params: &'a HashMap<String, String>,
    page_raw: &String,
) -> (&'a str, LuminairePayload, String) {
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

    let (name, response) = match params.get(LUMINAIRE_ID) {
        Some(id) => (
            Some(mapping_id_name.get(id).unwrap().to_owned()),
            set_selected_node(page_raw, id),
        ),
        None => (None, page_raw.to_owned()),
    };

    (
        action,
        LuminairePayload { name, level },
        response.to_owned(),
    )
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

fn set_selected_node(response: &str, luminaire_id: &str) -> String {
    let regex = Regex::new(r#"\s+id="ctl00_cphBody_tvDevices_SelectedNode"\s+value="""#).unwrap();
    regex
        .replace(
            response,
            format!(
                r#" id="ctl00_cphBody_tvDevices_SelectedNode" value="{}" "#,
                luminaire_id
            ),
        )
        .to_string()
}
