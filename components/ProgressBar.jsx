import { StyleSheet, View } from "react-native";
import { colors, radius } from "../theme/colors";

const ProgressBar = ({ percent = 0, color = colors.success }) => {
    const clamped = Math.max(0, Math.min(100, percent))

    return (
        <View style={styles.track}>
            <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color }]} />
        </View>
    )
}

export default ProgressBar

const styles = StyleSheet.create({
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
