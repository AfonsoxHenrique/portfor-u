import { StyleSheet, Text, View, ScrollView} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { colors, spacing } from "../theme/colors";
import StatCard from "../components/StatCard";
import ProfileListItem from "../components/ProfileListItem";
import BottomTabBar from "../components/BottomTabBar";

// user profile
const MOCK_USER = { firstName: 'Joon' }
const MOCK_STATS = {
    applications: 3,
    certificates: 5,
    workExperience: 2,
    resumes: 1,
}

const Home = () => {
    const router = useRouter()

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.greeting}>Good morning 👋</Text>
                <Text style={styles.name}>{MOCK_USER.firstName}</Text>
                <Text style={styles.tagline}>Keep your profile up to date</Text>

                <View style={styles.statGrid}>
                    <StatCard value={MOCK_STATS.applications} label="Applications" />
                    <StatCard value={MOCK_STATS.certificates} label="Certificates" />
                    <StatCard value={MOCK_STATS.workExperience} label="Work experience" />
                    <StatCard value={MOCK_STATS.resumes} label="Resume" />
                </View>

                <Text style={styles.sectionTitle}>My profile</Text>
                <View style={styles.listCard}>
                    <ProfileListItem
                        icon="document-text-outline"
                        title="Resume"
                        subtitle="Last updated 2 days ago"
                        onPress={() => router.push('/resume')}
                    />
                    <ProfileListItem
                        icon="briefcase-outline"
                        title="Work experience"
                        subtitle="2 entries"
                        onPress={() => router.push('/work-experience')}
                    />
                    <ProfileListItem
                        icon="ribbon-outline"
                        title="Certificates"
                        subtitle="5 certificates"
                        onPress={() => router.push('/certificates')}
                    />
                    <ProfileListItem
                        icon="list-outline"
                        title="Job tracker"
                        subtitle="3 applications"
                        onPress={() => router.push('/tracker')}
                    />
                </View>
            </ScrollView>

            <BottomTabBar activeTab="home" />
        </SafeAreaView>
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
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
    },
    greeting: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    name: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.textPrimary,
        marginTop: 2,
    },
    tagline: {
        fontSize: 13,
        color: colors.textMuted,
        marginTop: 2,
        marginBottom: spacing.lg,
    },
    statGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    listCard: {
        backgroundColor: colors.background,
    },
})
