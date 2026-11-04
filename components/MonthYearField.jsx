import { useMemo, useState } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { MONTHS, formatMonth } from "../utils/dates";

const parse = (ym) => (ym ? { y: Number(ym.slice(0, 4)), m: Number(ym.slice(5, 7)) } : null);

export default function MonthYearField({ label, value, onChange, placeholder = "Month, year", disabled = false, fieldStyle }) {
    const { colors, spacing, radius } = useTheme();
    const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius]);

    const thisYear = new Date().getFullYear();
    const selected = parse(value);
    const [open, setOpen] = useState(false);
    const [year, setYear] = useState(thisYear);

    const openPicker = () => {
        if (disabled) return;
        setYear(selected?.y ?? thisYear);
        setOpen(true);
    };

    const pickMonth = (m) => {
        onChange(`${year}-${String(m).padStart(2, "0")}`);
        setOpen(false);
    };

    return (
        <View style={styles.wrapper}>
            {!!label && <Text style={styles.label}>{label}</Text>}

            <Pressable onPress={openPicker} style={[styles.field, fieldStyle, disabled && styles.fieldDisabled]}>
                <Text style={[styles.value, !value && !disabled && styles.placeholder]}>
                    {disabled ? "Present" : formatMonth(value) ?? placeholder}
                </Text>
                <Ionicons name="calendar-outline" size={18} color={colors.textMuted} />
            </Pressable>

            <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
                <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
                    <Pressable style={styles.sheet}>
                        <View style={styles.yearRow}>
                            <Pressable onPress={() => setYear((y) => y - 1)} hitSlop={12}>
                                <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
                            </Pressable>
                            <Text style={styles.yearText}>{year}</Text>
                            <Pressable
                                onPress={() => setYear((y) => Math.min(y + 1, thisYear + 5))}
                                hitSlop={12}
                            >
                                <Ionicons name="chevron-forward" size={22} color={colors.textPrimary} />
                            </Pressable>
                        </View>

                        <View style={styles.grid}>
                            {MONTHS.map((name, i) => {
                                const m = i + 1;
                                const active = selected?.y === year && selected?.m === m;
                                return (
                                    <Pressable
                                        key={name}
                                        onPress={() => pickMonth(m)}
                                        style={[styles.month, active && styles.monthActive]}
                                    >
                                        <Text style={[styles.monthText, active && styles.monthTextActive]}>
                                            {name}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        <View style={styles.actions}>
                            {!!value && (
                                <Pressable onPress={() => { onChange(null); setOpen(false); }}>
                                    <Text style={styles.clearText}>Clear</Text>
                                </Pressable>
                            )}
                            <Pressable onPress={() => setOpen(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </Pressable>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
}

const createStyles = (colors, spacing, radius) => StyleSheet.create({
    wrapper: { flex: 1 },
    label: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    field: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
    },
    fieldDisabled: { opacity: 0.5 },
    value: { fontSize: 14, color: colors.textPrimary },
    placeholder: { color: colors.textMuted },
    backdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.45)",
        justifyContent: "center",
        padding: spacing.lg,
    },
    sheet: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.lg,
    },
    yearRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: spacing.md,
    },
    yearText: { fontSize: 18, fontWeight: "800", color: colors.textPrimary },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        rowGap: spacing.sm,
    },
    month: {
        width: "31%",
        paddingVertical: spacing.md,
        borderRadius: radius.md,
        alignItems: "center",
        backgroundColor: colors.background,
    },
    monthActive: { backgroundColor: colors.navy },
    monthText: { fontSize: 14, fontWeight: "600", color: colors.textPrimary },
    monthTextActive: { color: colors.white },
    actions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: spacing.lg,
        marginTop: spacing.lg,
    },
    clearText: { fontSize: 14, fontWeight: "700", color: colors.red },
    cancelText: { fontSize: 14, fontWeight: "700", color: colors.textSecondary },
});