import { useMemo } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";

const ScreenHeader = ({
    title,
    subtitle,
    bg,
    subtitleColor,
    showBack = true,
    fallbackHref = "/home",
}) => {
    const router = useRouter()
    const { colors, spacing, radius } = useTheme()
    const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius])

    const handleBack = () => {
        if (router.canGoBack()) {
            router.back()
        } else {
            router.replace(fallbackHref)
        }
    }

    return (
        <View style={[styles.header, { backgroundColor: bg ?? colors.background }]}>
            {showBack && (
                <TouchableOpacity
                    onPress={handleBack}
                    accessibilityRole="button"
                    accessibilityLabel="Go back"
                    activeOpacity={0.75}
                    style={styles.backButton}
                    hitSlop={8}
                >
                    <Ionicons name="chevron-back-outline" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
            )}

            <View style={styles.textBlock}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                {!!subtitle && (
                    <Text style={[styles.subtitle, { color: subtitleColor ?? colors.textSecondary }]}>
                        {subtitle}
                    </Text>
                )}
            </View>
        </View>
    )
}

export default ScreenHeader

const createStyles = (colors, spacing, radius) => StyleSheet.create({
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 36,
        height: 36,
        borderRadius: radius.md,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },
    textBlock: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        marginTop: spacing.sm,
    },
})