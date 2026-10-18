import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme/colors";

const ScreenHeader = ({ title, subtitle, bg, subtitleColor }) => {
    const router = useRouter()

    return (
        <View style={[styles.header, { backgroundColor: bg }]}>
            <View style={styles.titleRow}>
                <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.title}>{title}</Text>
            </View>
            {!!subtitle && (
                <Text style={[styles.subtitle, { color: subtitleColor }]}>{subtitle}</Text>
            )}
        </View>
    )
}

export default ScreenHeader

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: radius.md,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        marginTop: spacing.sm,
        marginLeft: 40 + spacing.md,
    },
})
