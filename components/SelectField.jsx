import { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";

const SelectField = ({ label, placeholder = 'Select', value, options, onSelect, style }) => {
    const [open, setOpen] = useState(false)
    const { colors, spacing, radius } = useTheme()
    const styles = createStyles(colors, spacing, radius)

    return (
        <View style={style}>
            <Text style={styles.label}>{label}</Text>

            <TouchableOpacity style={styles.box} activeOpacity={0.7} onPress={() => setOpen(true)}>
                <Text style={[styles.value, !value && styles.placeholder]}>
                    {value || placeholder}
                </Text>
                <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)}>
                    <View style={styles.sheet}>
                        {options.map((option) => (
                            <TouchableOpacity
                                key={option}
                                style={styles.option}
                                activeOpacity={0.7}
                                onPress={() => {
                                    onSelect(option)
                                    setOpen(false)
                                }}
                            >
                                <Text style={[styles.optionText, option === value && styles.optionTextActive]}>
                                    {option}
                                </Text>
                                {option === value && (
                                    <Ionicons name="checkmark" size={18} color={colors.navy} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default SelectField

const createStyles = (colors, spacing, radius) => StyleSheet.create({
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    box: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
    },
    value: {
        fontSize: 13.5,
        color: colors.textPrimary,
    },
    placeholder: {
        color: colors.textMuted,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.lg,
        borderTopRightRadius: radius.lg,
        paddingVertical: spacing.sm,
        paddingBottom: spacing.xl,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
    },
    optionText: {
        fontSize: 15,
        color: colors.textPrimary,
    },
    optionTextActive: {
        fontWeight: '700',
        color: colors.navy,
    },
})
