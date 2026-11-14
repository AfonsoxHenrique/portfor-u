import { useMemo } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";

const TipCard = ({ icon = 'sparkles', title, body, bg, accentColor, onPress }) => {
    const { colors, spacing, radius } = useTheme()
    const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius])

    const cardBg = bg ?? colors.purpleTint
    const accent = accentColor ?? colors.purple

    return (
        <TouchableOpacity style={[styles.card, { backgroundColor: cardBg }]} activeOpacity={0.8} onPress={onPress}>
            <View style={[styles.iconChip, { backgroundColor: colors.background }]}>
                <Ionicons name={icon} size={18} color={accent} />
            </View>
            <View style={styles.textBlock}>
                <Text style={[styles.title, { color: accent }]}>{title}</Text>
                <Text style={styles.body}>{body}</Text>
            </View>
        </TouchableOpacity>
    )
}

export default TipCard

const createStyles = (colors, spacing, radius) => StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    iconChip: {
        width: 32,
        height: 32,
        borderRadius: radius.pill,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.sm,
    },
    textBlock: {
        flex: 1,
    },
    title: {
        fontSize: 13.5,
        fontWeight: '800',
    },
    body: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
        lineHeight: 17,
    },
})