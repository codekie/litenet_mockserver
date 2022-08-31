use crate::Luminaire;

const COLS: usize = 4;
const ROWS: usize = 12;
// const PATTERN: &str = "Leuchte_R21G{:0width$}B{:0width$}";
const COL_NUMBERS: [usize; 4] = [1, 13, 25, 37];
const ROW_START_INDICES: [usize; 4] = [1, 13, 25, 37];

pub fn create_room() -> Vec<Vec<Luminaire>> {
    let mut result = Vec::new();
    for col_idx in 0..COLS {
        let mut rows = Vec::new();
        for row_idx in 0..ROWS {
            rows.push(Luminaire::new(
                format!(
                    "Leuchte_R21G{:0width$}B{:0width$}",
                    COL_NUMBERS[col_idx],
                    ROW_START_INDICES[col_idx] + row_idx,
                    width = 2
                ),
                false,
                0,
            ));
        }
        result.push(rows);
    }
    result
}
