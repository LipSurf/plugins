// to prevent variable collisions when working with unknown js code/html
export const NO_COLLISION_UNIQUE_ATTR = 'rnh290318';
export const ON_ICON: string = "assets/icon-on-128.png";
export const OFF_ICON: string = "assets/icon-off-128.png";
export const PROBLEM_ICON: string = "assets/icon-error-128.png";
export const ORDINAL_CMD_DELAY = 500;
// there's some command that partially matches, so we delay
// fully matching commands so that the user has a chance
// to finish their utterance and execute a longer match cmd
export const PARTIAL_MATCH_DELAY = 700;

export const CONFIDENCE_THRESHOLD = 0.0;
export const LANG_CODE_TO_NICE: {[L in LanguageCode]?: string} = {
    "en": "English",
    "ja": "日本語 (Japanese)",
    "en-AU": "English (Australia)",
    "en-IN": "English (India)",
    "en-NZ": "English (New Zealand)",
    "en-ZA": "English (South Africa)",
    "en-GB": "English (UK)",
    "en-US": "English (US)",
};