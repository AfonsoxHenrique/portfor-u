import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme/colors";

const UploadBox = ({ label, title, hint, onChooseFile, variant = 'stacked' }) => {
    if (variant === 'inline') {
        return (
            <View style={styles.inlineCard}>
                <View style={styles.inlineIconChip}>
                    <Ionicons name="cloud-upload-outline" size={18} color={colors.amber} />
                </View>
                <View style={styles.inlineTextBlock}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.hint}>{hint}</Text>
                    <TouchableOpacity activeOpacity={0.7} onPress={onChooseFile}>
                        <Text style={styles.chooseFileLink}>Choose file</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <View>
            {!!label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.stackedCard}>
                <View style={styles.stackedIconChip}>
                    <Ionicons name="cloud-upload-outline" size={20} color={colors.accentBlue} />
                </View>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.hint}>{hint}</Text>
                <TouchableOpacity style={styles.chooseFileButton} activeOpacity={0.7} onPress={onChooseFile}>
                    <Text style={styles.chooseFileButtonText}>Choose file</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default UploadBox

const styles = StyleSheet.create({
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    stackedCard: {
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        alignItems: 'center',
        paddingVertical: spacing.lg,
        marginBottom: spacing.md,
    },
    stackedIconChip: {
        width: 36,
        height: 36,
        borderRadius: radius.pill,
        backgroundColor: colors.lightBlueTint,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    chooseFileButton: {
        marginTop: spacing.sm,
    },
    chooseFileButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.accentBlue,
    },
    inlineCard: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    inlineIconChip: {
        width: 36,
        height: 36,
        borderRadius: radius.sm,
        backgroundColor: colors.amberTint,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    inlineTextBlock: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    hint: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 2,
    },
    chooseFileLink: {
        fontSize: 12.5,
        fontWeight: '700',
        color: colors.accentBlue,
        marginTop: spacing.xs,
    },
})
