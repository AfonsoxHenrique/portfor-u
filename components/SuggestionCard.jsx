import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme/colors";

const SuggestionCard = ({ title, description }) => {
    return (
        <View style={styles.card}>
            <View style={styles.iconChip}>
                <Ionicons name="warning" size={16} color={colors.amber} />
            </View>
            <View style={styles.textBlock}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>
        </View>
    )
}

export default SuggestionCard

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    iconChip: {
        width: 30,
        height: 30,
        borderRadius: radius.pill,
        backgroundColor: colors.amberTint,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    textBlock: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    description: {
        fontSize: 12.5,
        color: colors.textSecondary,
        marginTop: 2,
        lineHeight: 17,
    },
})
