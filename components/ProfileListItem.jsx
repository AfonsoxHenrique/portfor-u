import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme/colors";

const ProfileListItem = ({ icon, title, subtitle, onPress }) => {
    return (
        <TouchableOpacity style={styles.row} activeOpacity={0.7} onPress={onPress}>
            <View style={styles.iconChip}>
                <Ionicons name={icon} size={18} color={colors.navy} />
            </View>
            <View style={styles.textBlock}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
    )
}

export default ProfileListItem

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm + 2,
    },
    iconChip: {
        width: 36,
        height: 36,
        borderRadius: radius.sm,
        backgroundColor: colors.lightBlueTint,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    textBlock: {
        flex: 1,
    },
    title: {
        fontSize: 14.5,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: 12.5,
        color: colors.accentBlue,
        marginTop: 1,
    },
})
