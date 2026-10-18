import { StyleSheet, Text, View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, radius } from "../theme/colors";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ProgressBar from "../components/ProgressBar";
import CredentialCard from "../components/CredentialCard";
import BottomTabBar from "../components/BottomTabBar";

// Replace with real user data from your auth/profile.
const MOCK_USER = { firstName: 'Joon' }
const MOCK_PROFILE = {
    completionPercent: 85,
    certificatesNeeded: 2,
}
const MOCK_CREDENTIALS = {
    resumeFileCount: 2,
    latestResumeName: 'SWE_Intern_Resume.pdf',
    workExperienceCount: 3,
    workExperienceSummary: 'TechCorp Sweet Intern, SWE Club Lead',
    certificateCount: 4,
    certificateSummary: 'AWS Cloud Practitioner, Certified Scrum',
}

const Home = () => {
    const router = useRouter()

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <View style={styles.circleLarge} />
                        <View style={styles.circleSmall} />
                        <Text style={styles.dashboardLabel}>DASHBOARD</Text>
                        <Text style={styles.greeting}>Hi, {MOCK_USER.firstName}</Text>
                    </View>

                    <View style={styles.completionCard}>
                        <View style={styles.completionHeaderRow}>
                            <Text style={styles.completionTitle}>Profile completion</Text>
                            <Text style={styles.completionPercent}>{MOCK_PROFILE.completionPercent}% COMPLETE</Text>
                        </View>
                        <ProgressBar percent={MOCK_PROFILE.completionPercent} />
                        <Text style={styles.completionHint}>
                            Add {MOCK_PROFILE.certificatesNeeded} more certificate to reach 100%
                        </Text>
                    </View>

                    <Text style={styles.sectionTitle}>Your Credentials</Text>

                    <CredentialCard
                        icon="document-text-outline"
                        iconColor={colors.accentBlue}
                        iconBg={colors.lightBlueTint}
                        title="My Resumes"
                        stat={`${MOCK_CREDENTIALS.resumeFileCount} files`}
                        statColor={colors.accentBlue}
                        subtitle={`Latest: ${MOCK_CREDENTIALS.latestResumeName}`}
                        onPress={() => router.push('/resume')}
                    />

                    <CredentialCard
                        icon="briefcase-outline"
                        iconColor={colors.success}
                        iconBg={colors.successTint}
                        title="Work Experience"
                        stat={`${MOCK_CREDENTIALS.workExperienceCount} entries`}
                        statColor={colors.success}
                        subtitle={MOCK_CREDENTIALS.workExperienceSummary}
                        onPress={() => router.push('/work-experience')}
                    />

                    <CredentialCard
                        icon="ribbon-outline"
                        iconColor={colors.amber}
                        iconBg={colors.amberTint}
                        title="Certificates"
                        stat={`${MOCK_CREDENTIALS.certificateCount} earned`}
                        statColor={colors.amber}
                        subtitle={MOCK_CREDENTIALS.certificateSummary}
                        onPress={() => router.push('/certificates')}
                    />

                    <CredentialCard
                        icon="locate-outline"
                        iconColor={colors.red}
                        iconBg={colors.redTint}
                        title="Resume Guideline"
                        subtitle="How to make a good resume?"
                        onPress={() => router.push('/guideline')}
                    />
                </ScrollView>

                <BottomTabBar activeTab="home" />
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

export default Home

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scroll: {
        flex: 1,
    },
    content: {
        paddingBottom: spacing.lg,
    },
    header: {
        backgroundColor: colors.custom1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl + spacing.md,
        overflow: 'hidden',
    },
    circleLarge: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: colors.custom10,
        top: -60,
        right: -40,
    },
    circleSmall: {
        position: 'absolute',
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: colors.custom4,
        top: 50,
        right: 50,
    },
    dashboardLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 1,
    },
    greeting: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.white,
        marginTop: spacing.xs,
    },
    completionCard: {
        backgroundColor: colors.background,
        borderRadius: radius.lg,
        padding: spacing.lg,
        marginHorizontal: spacing.lg,
        marginTop: -spacing.xl,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 4,
    },
    completionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    completionTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    completionPercent: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.success,
    },
    completionHint: {
        fontSize: 12.5,
        color: colors.textMuted,
        marginTop: spacing.sm,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: colors.textPrimary,
        marginHorizontal: spacing.lg,
        marginTop: spacing.lg,
        marginBottom: spacing.md,
    },
})
