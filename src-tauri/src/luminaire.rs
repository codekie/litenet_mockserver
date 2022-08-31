use serde_derive::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct Luminaire {
    name: String,
    disabled: bool,
    level: usize,
}

impl Luminaire {
    pub fn new(name: String, disabled: bool, level: usize) -> Self {
        Self {
            name,
            disabled,
            level,
        }
    }
}
