import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme/colors";

const ScreenHeader = ({ title, subtitle, bg, subtitleColor }) => {
    const router = useRouter()

    return (

        <View style={[styles.header, { backgroundColor: bg }]}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        accessibilityLabel="Go back"
                        activeOpacity={0.75}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back-outline" size={20} color="#1F2937" />
                    </TouchableOpacity>
        
                    <View style={styles.textBlock}>
                        <Text style={styles.title}>{title}</Text>
                        {!!subtitle && <Text style={[styles.subtitle, { color: subtitleColor }]}>{subtitle}</Text>}
                    </View>
                </View>
    )
}

export default ScreenHeader

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 36,
        height: 36,
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
    textBlock: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
        marginTop: spacing.sm,
    },
})
