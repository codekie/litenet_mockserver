use serde_derive::{Deserialize, Serialize};

pub const EVENT_TURNED_ON: &str = "turnedOnLuminaire";
pub const EVENT_TURNED_OFF: &str = "turnedOffLuminaire";
pub const EVENT_BRIGHTER: &str = "brighterLuminaire";
pub const EVENT_DARKER: &str = "darkerLuminaire";
pub const EVENT_TURN_ON: &str = "turnOnLuminaire";
pub const EVENT_TURN_OFF: &str = "turnOffLuminaire";
pub const EVENT_SELECTED_LUMINAIRE: &str = "selectedLuminaire";
pub const EVENT_LAST_CALL_TIMESTAMP: &str = "lastCallTimestamp";

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct LuminairePayload {
    pub name: Option<String>,
    pub level: Option<i32>,
}
