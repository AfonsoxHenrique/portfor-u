import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme/colors";

const CredentialCard = ({ icon, iconColor, iconBg, title, stat, statColor, subtitle, onPress }) => {
    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={onPress}>
            <View style={[styles.iconChip, { backgroundColor: iconBg }]}>
                <Ionicons name={icon} size={20} color={iconColor} />
            </View>

            <View style={styles.textBlock}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>{title}</Text>
                    {!!stat && <Text style={[styles.stat, { color: statColor }]}>{stat}</Text>}
                </View>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
    )
}

export default CredentialCard

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.sm,
    },
    iconChip: {
        width: 40,
        height: 40,
        borderRadius: radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    textBlock: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    stat: {
        fontSize: 12.5,
        fontWeight: '700',
    },
    subtitle: {
        fontSize: 12.5,
        color: colors.textSecondary,
        marginTop: 2,
    },
})
