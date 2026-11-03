import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";

const SectionGroup = ({ title, children }) => {
    const { colors, spacing, radius } = useTheme()
    const styles = createStyles(colors, spacing, radius)

    return (
        <View style={styles.wrapper}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.card}>{children}</View>
        </View>
    )
}

export default SectionGroup

const createStyles = (colors, spacing, radius) => StyleSheet.create({
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
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        overflow: 'hidden',
    },
})
