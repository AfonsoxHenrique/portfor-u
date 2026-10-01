import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, radius } from "../theme/colors";

const StatCard = ({ value, label }) => {
    return (
        <View style={styles.card}>
            <Text style={styles.value}>{value}</Text>
            <Text style={styles.label}>{label}</Text>
        </View>
    )
}

export default StatCard

const styles = StyleSheet.create({
    card: {
        flexBasis: '48%',
        backgroundColor: colors.lightBlueTint,
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        marginBottom: spacing.sm,
    },
    value: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.navy,
        marginBottom: 2,
    },
    label: {
        fontSize: 13,
        color: colors.accentBlue,
        fontWeight: '500',
    },
})
