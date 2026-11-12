import { View, Platform, StyleSheet, useWindowDimensions } from "react-native";
import { useTheme } from "../theme/ThemeContext";

const FRAME_WIDTH = 480;

export default function WebFrame({ children, disabled = false }) {
    const { colors, isDark } = useTheme();
    const { width } = useWindowDimensions();

    const framed = Platform.OS === "web" && !disabled && width > FRAME_WIDTH;

    return (
        <View
            style={[
                styles.outer,
                framed && { backgroundColor: isDark ? "#0B0F17" : "#E5E7EB" },
            ]}
        >
            <View
                style={[
                    styles.inner,
                    { backgroundColor: colors.background },
                    framed && [styles.framed, { maxWidth: FRAME_WIDTH, borderColor: colors.border }],
                ]}
            >
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    outer: {
        flex: 1,
        alignItems: "center",
    },
    inner: {
        flex: 1,
        width: "100%",
    },
    framed: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 0 },
    },
});