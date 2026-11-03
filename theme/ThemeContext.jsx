import { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors as palette, spacing, radius } from "./colors";

const THEME_STORAGE_KEY = "portfor-u:theme-mode";

const ThemeContext = createContext({
    colors: palette.light,
    spacing,
    radius,
    mode: 'light',
    isDark: false,
    toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
    const systemScheme = useColorScheme(); 
    const [mode, setMode] = useState(systemScheme ?? 'light');

    useEffect(() => {
        (async () => {
            try {
                const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (saved === 'light' || saved === 'dark') {
                    setMode(saved);
                }
            } catch (error) {
                
            }
        })();
    }, []);

    const toggleTheme = () => {
        setMode((current) => {
            const next = current === 'dark' ? 'light' : 'dark';
            AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {});
            return next;
        });
    };

    const colors = mode === 'dark' ? palette.dark : palette.light;

    return (
        <ThemeContext.Provider value={{ colors, spacing, radius, mode, isDark: mode === 'dark', toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
