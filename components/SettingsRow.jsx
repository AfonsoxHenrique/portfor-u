import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";

const SettingsRow = ({ icon, title, subtitle, onPress, danger = false, showDivider = false }) => {
    const { colors, spacing } = useTheme()
    const styles = createStyles(colors, spacing)
    const iconColor = danger ? colors.red : colors.navy
    const titleColor = danger ? colors.red : colors.textPrimary

    return (
        <TouchableOpacity
            style={[styles.row, showDivider && styles.divider]}
            activeOpacity={0.7}
            onPress={onPress}
        >
            <Ionicons name={icon} size={20} color={iconColor} style={styles.icon} />
            <View style={styles.textBlock}>
                <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
                {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
    )
}

export default SettingsRow

const createStyles = (colors, spacing) => StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
    },
    divider: {
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    icon: {
        width: 24,
        marginRight: spacing.md,
    },
    textBlock: {
        flex: 1,
    },
    title: {
        fontSize: 14.5,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 12.5,
        color: colors.textMuted,
        marginTop: 1,
    },
})
