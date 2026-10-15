import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../theme/colors";
import ProgressBar from "./ProgressBar";

const ScoreRow = ({ label, percent, color = colors.navy }) => {
    return (
        <View style={styles.row}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.barWrap}>
                <ProgressBar percent={percent} color={color} />
            </View>
            <Text style={styles.percent}>{percent}%</Text>
        </View>
    )
}

export default ScoreRow

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    label: {
        width: 110,
        fontSize: 13,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    barWrap: {
        flex: 1,
        marginHorizontal: spacing.sm,
    },
    percent: {
        width: 36,
        fontSize: 12.5,
        fontWeight: '700',
        color: colors.textSecondary,
        textAlign: 'right',
    },
})
