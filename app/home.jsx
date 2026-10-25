import { StyleSheet, Text, View, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { colors, spacing, radius } from "../theme/colors";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ProgressBar from "../components/ProgressBar";
import CredentialCard from "../components/CredentialCard";
import BottomTabBar from "../components/BottomTabBar";
import { useEffect, useState } from "react";
import { doc, collection, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

// Replace with real user data from your auth/profile.

const Home = () => {
    const router = useRouter()

    const [userProfile, setUserProfile] = useState(null);
    const [resumeList, setResumeList] = useState([]);
    const [workExperienceList, setWorkExperienceList] = useState([]);
    const [certificateList, setCertificateList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = auth.currentUser;
        
        if (!user) {
            setLoading(false);
            return;
        }

        let loadedSources = {
            profile: false,
            resumes: false,
            workExperience: false,
            certificates: false,
        };

        const updateLoading = (source) => {
            loadedSources[source] = true;

            if (Object.values(loadedSources).every(Boolean)) {
                setLoading(false);
            }
        };

        const unsubscribers = [];

        // User profile
        unsubscribers.push(
            onSnapshot(
                doc(db, "users", user.uid),
                (snapshot) => {
                    setUserProfile(snapshot.exists() ? snapshot.data() : null);
                    updateLoading("profile");
                },
                (error) => {
                    console.error("Profile error:", error);
                    updateLoading("profile");
                }
            )
        );

        // Resumes
        unsubscribers.push(
            onSnapshot(
                collection(db, "users", user.uid, "resumes"),
                (snapshot) => {
                    const items = snapshot.docs.map((item) => ({
                        id: item.id,
                        ...item.data(),
                    }));

                    items.sort((a, b) => {
                        const dateA = a.updatedAt?.toDate?.()?.getTime() || 0;
                        const dateB = b.updatedAt?.toDate?.()?.getTime() || 0;
                        return dateB - dateA;
                    });

                    setResumeList(items);
                    updateLoading("resumes");
                },
                (error) => {
                    console.error("Resumes error:", error);
                    updateLoading("resumes");
                }
            )
        );

        // Work experience
        unsubscribers.push(
            onSnapshot(
                collection(db, "users", user.uid, "workExperience"),
                (snapshot) => {
                    setWorkExperienceList(
                        snapshot.docs.map((item) => ({
                            id: item.id,
                            ...item.data(),
                        }))
                    );
                    updateLoading("workExperience");
                },
                (error) => {
                    console.error("Work experience error:", error);
                    updateLoading("workExperience");
                }
            )
        );

        // Certificates
        unsubscribers.push(
            onSnapshot(
                collection(db, "users", user.uid, "certificates"),
                (snapshot) => {
                    setCertificateList(
                        snapshot.docs.map((item) => ({
                            id: item.id,
                            ...item.data(),
                        }))
                    );
                    updateLoading("certificates");
                },
                (error) => {
                    console.error("Certificates error:", error);
                    updateLoading("certificates");
                }
            )
        );

        return () => {
            unsubscribers.forEach((unsubscribe) => unsubscribe());
        };
    }, 
    []);

    const completionItems = [
    Boolean(userProfile?.firstName),
    Boolean(userProfile?.email || auth.currentUser?.email),
    resumeList.length > 0,
    workExperienceList.length > 0,
    certificateList.length > 0,
    ];

    const completionPercent = Math.round(
        (completionItems.filter(Boolean).length / completionItems.length) * 100
    );

    const certificatesNeeded = Math.max(0, 2 - certificateList.length);
    
    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <View style={styles.circleLarge} />
                        <View style={styles.circleSmall} />
                        <Text style={styles.dashboardLabel}>DASHBOARD</Text>
                        <Text style={styles.greeting}>
                            Hi, {userProfile?.firstName || auth.currentUser?.displayName?.split(" ")[0] || "there"}
                        </Text>
                    </View>

                    <View style={styles.completionCard}>
                        <View style={styles.completionHeaderRow}>
                            <Text style={styles.completionTitle}>Profile completion</Text>
                            <Text style={styles.completionPercent}>
                                {completionPercent}% COMPLETE
                            </Text>
                        </View>
                        <ProgressBar percent={completionPercent} /> 
                        <Text style={styles.completionHint}>
                            {certificatesNeeded > 0
                                ? `Add ${certificatesNeeded} more certificate${certificatesNeeded === 1 ? "" : "s"} to reach your certificate goal`
                                : "Your certificate goal has been reached. Congratulations"}
                        </Text>
                    </View>

                    <Text style={styles.sectionTitle}>Your Credentials</Text>

                    <CredentialCard
                        icon="document-text-outline"
                        iconColor={colors.accentBlue}
                        iconBg={colors.lightBlueTint}
                        title="My Resumes"
                        stat={`${resumeList.length} ${resumeList.length === 1 ? "file" : "files"}`}
                        statColor={colors.accentBlue}
                        subtitle={
                            resumeList.length > 0
                                ? `Latest: ${resumeList[0].fileName || resumeList[0].name || "Resume"}`
                                : "No resumes uploaded yet"
                        }
                        onPress={() => router.push("/resume")}
                    />

                    <CredentialCard
                        icon="briefcase-outline"
                        iconColor={colors.success}
                        iconBg={colors.successTint}
                        title="Work Experience"
                        stat={`${workExperienceList.length} ${workExperienceList.length === 1 ? "entry" : "entries"}`}
                        statColor={colors.success}
                        subtitle={
                            workExperienceList.length > 0
                                ? workExperienceList
                                    .slice(0, 2)
                                    .map((item) => item.jobTitle || item.position || item.title || "Experience")
                                    .join(", ")
                                : "No work experience added yet"
                        }
                        onPress={() => router.push("/work-experience")}
                    />

                    <CredentialCard
                        icon="ribbon-outline"
                        iconColor={colors.amber}
                        iconBg={colors.amberTint}
                        title="Certificates"
                        stat={`${certificateList.length} ${certificateList.length === 1 ? "earned" : "earned"}`}
                        statColor={colors.amber}
                        subtitle={
                            certificateList.length > 0
                                ? certificateList
                                    .slice(0, 2)
                                    .map((item) => item.name || item.title || item.certificateName || "Certificate")
                                    .join(", ")
                                : "No certificates added yet"
                        }
                        onPress={() => router.push("/certificates")}
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
