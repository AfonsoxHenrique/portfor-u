import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { colors, spacing, radius } from "../theme/colors";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import CircularProgress from "../components/CircularProgress";
import ScoreRow from "../components/ScoreRow";
import SuggestionCard from "../components/SuggestionCard";
import BottomTabBar from "../components/BottomTabBar";

//Get real analysis from api
const MOCK_ANALYSIS = {
    overallScore: 78,
    breakdown: [
        { label: 'Format &\nStructure', percent: 85 },
        { label: 'Content Quality', percent: 72 },
        { label: 'Keywords & ATS', percent: 80 },
        { label: 'Readability', percent: 75 },
    ],
    suggestions: [
        {
            title: 'Add more quantifiable achievements',
            description: 'Quantify past milestones with metrics and numeric outputs.',
        },
        {
            title: 'Include relevant keywords for target role',
            description: 'Add keywords from Junior Software Developer listings.',
        },
        {
            title: 'Strengthen professional summary',
            description: 'Include tech stacks clearly inside the introductory summary.',
        },
    ],
}

const ResumeAnalyzer = () => {
    const handleReanalyze = () => {
        //resume analyse api
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>

                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <ScreenHeader
                    title="Resume Analyzer"
                    subtitle="INSTANT RESUME FEEDBACK SCORE"
                    bg={colors.custom10}
                    subtitleColor={colors.custom9}
                    />
                    <View style={styles.body}>
                        <CircularProgress
                            percent={MOCK_ANALYSIS.overallScore}
                            color={colors.custom9}
                            label="RESUME SCORE"
                        />

                        <View style={styles.breakdownCard}>
                            <Text style={styles.breakdownTitle}>Score Breakdown</Text>
                            {MOCK_ANALYSIS.breakdown.map((row) => (
                                <ScoreRow key={row.label} label={row.label} percent={row.percent} color={colors.navy} />
                            ))}
                        </View>

                        <Text style={styles.sectionTitle}>Suggestions to Improve</Text>
                        {MOCK_ANALYSIS.suggestions.map((item) => (
                            <SuggestionCard key={item.title} title={item.title} description={item.description} />
                        ))}

                        <TouchableOpacity style={styles.reanalyzeButton} activeOpacity={0.85} onPress={handleReanalyze}>
                            <Text style={styles.reanalyzeButtonText}>Re-analyze Resume</Text>
                        </TouchableOpacity>
                    </View>
                    
                </ScrollView>

                <BottomTabBar activeTab="resumes" />
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

export default ResumeAnalyzer

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
    breakdownCard: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.lg,
        marginTop: spacing.lg,
        marginBottom: spacing.lg,
    },
    breakdownTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    reanalyzeButton: {
        backgroundColor: colors.navy,
        borderRadius: radius.md,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    reanalyzeButtonText: {
        color: colors.white,
        fontSize: 15,
        fontWeight: '700',
    },
})
