import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";

const ExperienceCard = ({ title, company, dateRange, location, description, onEdit, onDelete }) => {
    const { colors, spacing, radius } = useTheme()
    const styles = createStyles(colors, spacing, radius)

    return (
        <View style={styles.card}>
            <View style={styles.headerRow}>
                <View style={styles.titleBlock}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.company}>{company}</Text>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.editButton} activeOpacity={0.7} onPress={onEdit}>
                        <Ionicons name="pencil" size={14} color={colors.accentBlue} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.deleteButton} activeOpacity={0.7} onPress={onDelete}>
                        <Ionicons name="trash" size={14} color={colors.red} />
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.meta}>
                {dateRange}{!!location && ` | ${location}`}
            </Text>
            <Text style={styles.description}>{description}</Text>
        </View>
    )
}

export default ExperienceCard

const createStyles = (colors, spacing, radius) => StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    titleBlock: {
        flex: 1,
        marginRight: spacing.sm,
    },
    title: {
        fontSize: 15,
        fontWeight: '800',
        color: colors.textPrimary,
    },
    company: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.accentBlue,
        marginTop: 2,
    },
    actions: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    editButton: {
        width: 28,
        height: 28,
        borderRadius: radius.sm,
        backgroundColor: colors.lightBlueTint,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButton: {
        width: 28,
        height: 28,
        borderRadius: radius.sm,
        backgroundColor: colors.redTint,
        alignItems: 'center',
        justifyContent: 'center',
    },
    meta: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: spacing.sm,
    },
    description: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        lineHeight: 18,
    },
})
