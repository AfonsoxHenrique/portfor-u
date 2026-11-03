import { StyleSheet, Text, View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";

// Free-text entry styled like a date picker. Swap the TextInput for
// @react-native-community/datetimepicker (or similar) when you're ready
// to wire up a real native date picker.
const DateField = ({ label, placeholder, value, onChangeText, style }) => {
    const { colors, spacing, radius } = useTheme()
    const styles = createStyles(colors, spacing, radius)

    return (
        <View style={style}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.inputRow}>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textMuted}
                    value={value}
                    onChangeText={onChangeText}
                />
                <Ionicons name="calendar-outline" size={16} color={colors.textMuted} style={styles.icon} />
            </View>
        </View>
    )
}

export default DateField

const createStyles = (colors, spacing, radius) => StyleSheet.create({
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
    },
    input: {
        flex: 1,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        fontSize: 13.5,
        color: colors.textPrimary,
    },
    icon: {
        marginRight: spacing.md,
    },
})
