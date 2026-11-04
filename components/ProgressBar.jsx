import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";

const ProgressBar = ({ percent = 0, color }) => {
    const { colors, spacing, radius } = useTheme()
    const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius])

    const clamped = Math.max(0, Math.min(100, percent))
    const fillColor = color ?? colors.success

    return (
        <View style={styles.track}>
            <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: fillColor }]} />
        </View>
    )
}

export default ProgressBar

const createStyles = (colors, spacing, radius) => StyleSheet.create({
    track: {
        height: 8,
        borderRadius: radius.pill,
        backgroundColor: colors.border,
        overflow: 'hidden',
    },
    fill: {
        height: '100%',
        borderRadius: radius.pill,
    },
})
