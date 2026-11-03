import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";

const CheckboxRow = ({ label, checked, onToggle, accentColor }) => {
    const { colors, spacing } = useTheme()
    const styles = createStyles(colors, spacing)
    const resolvedAccent = accentColor || colors.success

    return (
        <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={onToggle}>
            <Ionicons
                name={checked ? 'checkbox' : 'square-outline'}
                size={20}
                color={checked ? resolvedAccent : colors.textMuted}
            />
            <Text style={styles.label}>{label}</Text>
        </TouchableOpacity>
    )
}

export default CheckboxRow

const createStyles = (colors, spacing) => StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 13,
        color: colors.textSecondary,
        marginLeft: spacing.sm,
    },
})
