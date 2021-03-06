export enum ThemeMode {
    DARK = "dark",
    LIGHT = "light",
}

export interface Theme {
    primary: string;
    secondary: string;
    foreground: string;
    foreground2: string;
    foreground3: string;
    background: string;
    background2: string;
    background3: string;
}

export const lightTheme: Theme = {
    primary: "#FFF",
    secondary: "#000",
    foreground: "#000",
    foreground2: "#111329",
    foreground3: "#ddd",
    background: "#FFF",
    background2: "#F9FAFB",
    background3: "#d4d4d5",
};

export const darkTheme: Theme = {
    primary: "#000",
    secondary: "#FFF",
    foreground: "#cbcbce",
    foreground2: "#67697E",
    foreground3: "#4A4C60",
    background: "#22222C",
    background2: "#1C1D30",
    background3: "#111329",
};
