import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, radius } from "../theme/colors";

const SectionGroup = ({ title, children }) => {
    return (
        <View style={styles.wrapper}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.card}>{children}</View>
        </View>
    )
}

export default SectionGroup

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 1,
        marginBottom: spacing.sm,
    },
    card: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        overflow: 'hidden',
    },
})
