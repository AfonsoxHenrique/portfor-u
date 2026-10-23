import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors, spacing, radius } from "../theme/colors";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import BottomTabBar from "../components/BottomTabBar";

// Replace with real data from Firebase
const MOCK_CERTIFICATES = [
    {
        id: '1',
        name: 'AWS Cloud Practitioner',
        issuer: 'Amazon Web Services',
        earnedDate: 'Earned Oct 2025',
        logo: require('../assets/certificate-icon/aws.png'),
    },
    {
        id: '2',
        name: 'Certified ScrumMaster',
        issuer: 'Scrum Alliance',
        earnedDate: 'Earned Dec 2025',
        logo: require('../assets/certificate-icon/scrum.png'),
    },
    {
        id: '3',
        name: 'Google UX Design Professional',
        issuer: 'Coursera',
        earnedDate: 'Earned Feb 2026',
        logo: require('../assets/certificate-icon/coursera.png'),
    },
]

const Certificates = () => {
    const router = useRouter()

    const handleAdd = () => {
        router.push('/add-certificate')
    }

    const handleCertPress = (id) => {
        console.log('View cert', id)
    }
    const handleDelete = (id) => {      
        console.log('Delete cert', id)
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <ScreenHeader
                        title="Certificates"
                        subtitle={`${MOCK_CERTIFICATES.length} EARNED BADGES`}
                        bg={colors.amberTint}
                        subtitleColor={colors.amber}
                    />

                    <View style={styles.body}>
                        <View style={styles.grid}>
                            {MOCK_CERTIFICATES.map((cert) => (
                                <View key={cert.id} style={styles.certCard}>
                                    <TouchableOpacity
                                        style={styles.deleteIconBtn}
                                        onPress={() => handleDelete(cert.id)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="trash" size={14} color={colors.red} />
                                    </TouchableOpacity>
                                    <TouchableOpacity activeOpacity={0.7} onPress={() => handleCertPress(cert.id)}>
                                        <Image
                                            source={cert.logo}
                                            style={styles.logoImage}
                                            resizeMode="contain"
                                        />
                                        <Text style={styles.certName}>{cert.name}</Text>
                                        <Text style={styles.certIssuer}>{cert.issuer}</Text>
                                        <Text style={styles.certDate}>{cert.earnedDate}</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {/* Add New Badge Card */}
                            <TouchableOpacity
                                style={styles.addCard}
                                activeOpacity={0.7}
                                onPress={handleAdd}
                            >
                                <View style={styles.addIconChip}>
                                    <Ionicons name="add" size={24} color={colors.amber} />
                                </View>
                                <Text style={styles.addCardText}>Add New Badge</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Star Candidate Banner */}
                        <View style={styles.starBanner}>
                            <View style={styles.starIconChip}>
                                <Ionicons name="ribbon" size={20} color={colors.white} />
                            </View>
                            <View style={styles.starTextBlock}>
                                <Text style={styles.starTitle}>Star Candidate Status</Text>
                                <Text style={styles.starSubtitle}>
                                    Earn 1 more certificate to boost profile visibility.
                                </Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>

                <BottomTabBar activeTab="profile" />
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

export default Certificates

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
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    certCard: {
        width: '47%',
        backgroundColor: colors.background,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    logoImage: {
        width: 40,
        height: 40,
        borderRadius: radius.sm,
        marginBottom: spacing.sm,
    },
    certName: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 3,
    },
    certIssuer: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 3,
    },
    certDate: {
        fontSize: 11.5,
        fontWeight: '600',
        color: colors.amber,
    },
    addCard: {
        width: '47%',
        backgroundColor: colors.background,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: colors.amber,
        borderStyle: 'dashed',
        padding: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 130,
    },
    addIconChip: {
        width: 40,
        height: 40,
        borderRadius: radius.pill,
        backgroundColor: colors.amberTint,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    addCardText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.amber,
        textAlign: 'center',
    },
    starBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.navy,
        borderRadius: radius.md,
        padding: spacing.md,
        gap: spacing.md,
    },
    starIconChip: {
        width: 40,
        height: 40,
        borderRadius: radius.pill,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    starTextBlock: {
        flex: 1,
    },
    starTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.white,
        marginBottom: 3,
    },
    starSubtitle: {
        fontSize: 12.5,
        color: 'rgba(255,255,255,0.75)',
        lineHeight: 18,
    },
    
    deleteIconBtn: {
        position: 'absolute',
        top: spacing.sm,
        right: spacing.sm,
        width: 28,
        height: 28,
        borderRadius: radius.pill,
        backgroundColor: colors.redTint,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
})

