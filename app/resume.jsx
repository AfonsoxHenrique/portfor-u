import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme/colors";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import TipCard from "../components/TipCard";
import FloatingActionButton from "../components/FloatingActionButton";
import BottomTabBar from "../components/BottomTabBar";

// Replace with real data from your resume storage / API.
const MOCK_RESUMES = [
    {
        id: '1',
        fileName: 'SWE_Intern_Resume.pdf',
        sizeLabel: '4.2 MB',
        updatedLabel: 'Updated 3d ago',
        title: 'SWE Intern Resume - Fall 2026',
        targetRole: 'Junior Software Engineer',
        industry: 'Technology & Software Development',
    },
]

const Resumes = () => {
    const router = useRouter()

    const handleEdit = (resume) => {
        router.push({ pathname: '/add-resume', params: { id: resume.id } })
    }

    const handleDelete = (resume) => {
        Alert.alert(
            'Delete Resume',
            `Remove "${resume.fileName}" from your resumes?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive' },
            ]
        )
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <ScreenHeader
                        title="My Resumes"
                        subtitle={`${MOCK_RESUMES.length} FILE${MOCK_RESUMES.length === 1 ? '' : 'S'} UPLOADED`}
                        bg={colors.lightBlueTint}
                        subtitleColor={colors.accentBlue}
                    />

                    <View style={styles.body}>
                        <TipCard
                            icon="sparkles"
                            title="Resume Analyzer"
                            body="Tip: review your resume and get feedback and improvement suggestions."
                            onPress={() => router.push('/resume-analyzer')}
                        />

                        {MOCK_RESUMES.map((resume) => (
                            <View key={resume.id} style={styles.resumeCard}>
                                <View style={styles.cardHeaderRow}>
                                    <View style={styles.fileIconChip}>
                                        <Ionicons name="document-text" size={18} color={colors.accentBlue} />
                                    </View>
                                    <View style={styles.fileTextBlock}>
                                        <Text style={styles.fileName}>{resume.fileName}</Text>
                                        <Text style={styles.fileMeta}>
                                            {resume.sizeLabel} • {resume.updatedLabel}
                                        </Text>
                                    </View>
                                    <View style={styles.actions}>
                                        <TouchableOpacity
                                            style={styles.editButton}
                                            activeOpacity={0.7}
                                            onPress={() => handleEdit(resume)}
                                        >
                                            <Ionicons name="pencil" size={14} color={colors.accentBlue} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            activeOpacity={0.7}
                                            onPress={() => handleDelete(resume)}
                                        >
                                            <Ionicons name="trash" size={14} color={colors.red} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.divider} />

                                <Text style={styles.resumeTitle}>{resume.title}</Text>

                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Target Role</Text>
                                    <Text style={styles.infoValue}>{resume.targetRole}</Text>
                                </View>
                                <View style={styles.infoRow}>
                                    <Text style={styles.infoLabel}>Primary Industry</Text>
                                    <Text style={styles.infoValue}>{resume.industry}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
                <FloatingActionButton onPress={() => router.push('/add-resume')} />
                
                <BottomTabBar activeTab="resumes" />
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

export default Resumes

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: spacing.lg,
    },
    body: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
    },
    resumeCard: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fileIconChip: {
        width: 36,
        height: 36,
        borderRadius: radius.sm,
        backgroundColor: colors.lightBlueTint,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    fileTextBlock: {
        flex: 1,
    },
    fileName: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    fileMeta: {
        fontSize: 12,
        color: colors.textMuted,
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
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: spacing.md,
    },
    resumeTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: spacing.xs,
    },
    infoLabel: {
        fontSize: 12.5,
        color: colors.textMuted,
    },
    infoValue: {
        fontSize: 12.5,
        fontWeight: '600',
        color: colors.textPrimary,
        flexShrink: 1,
        textAlign: 'right',
        marginLeft: spacing.md,
    },
})
