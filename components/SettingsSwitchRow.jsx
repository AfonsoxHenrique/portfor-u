import { StyleSheet, Text, View, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";

const SettingsSwitchRow = ({ icon, title, subtitle, value, onValueChange, showDivider = false }) => {
    const { colors, spacing } = useTheme()
    const styles = createStyles(colors, spacing)

    return (
        <View style={[styles.row, showDivider && styles.divider]}>
            <Ionicons name={icon} size={20} color={colors.navy} style={styles.icon} />
            <View style={styles.textBlock}>
                <Text style={styles.title}>{title}</Text>
                {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: colors.border, true: colors.navy }}
                thumbColor={colors.switchThumb}
                ios_backgroundColor={colors.border}
            />
        </View>
    )
}

export default SettingsSwitchRow

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
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: 12.5,
        color: colors.textMuted,
        marginTop: 1,
    },
})
