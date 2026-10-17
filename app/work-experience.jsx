import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme/colors";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import BottomTabBar from "../components/BottomTabBar";

// Replace with real data from Firebase
const MOCK_EXPERIENCES = [
    {
        id: '1',
        title: 'Software Engineering Intern',
        company: 'TechCorp Industries',
        duration: 'Jun 2025 - Aug 2025',
        location: 'San Francisco, CA (Remote)',
        description: 'Developed API integrations using Node.js and improved frontend dashboard rendering speed by 24% using React.',
    },
    {
        id: '2',
        title: 'Lead Student Developer',
        company: 'University Computer Science Club',
        duration: 'Sep 2024 - May 2025',
        location: 'Campus',
        description: 'Led a team of 6 developers to build a student scheduling assistant web app used by over 500 graduates.',
    },
]

const WorkExperience = () => {
    const router = useRouter()

    const handleEdit = (id) => {
        // navigate to edit screen
        console.log('Edit', id)
    }

    const handleDelete = (id) => {
        // delete experience
        console.log('Delete', id)
    }

    const handleAdd = () => {
        // navigate to add screen
        console.log('Add new experience')
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
                        title="Work Experience"
                        subtitle={`${MOCK_EXPERIENCES.length} ENTRIES RECORDED`}
                        bg={colors.successTint}
                        subtitleColor={colors.success}
                    />

                    <View style={styles.body}>
                        {MOCK_EXPERIENCES.map((exp) => (
                            <View key={exp.id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <View style={styles.cardTitleBlock}>
                                        <Text style={styles.jobTitle}>{exp.title}</Text>
                                        <Text style={styles.company}>{exp.company}</Text>
                                    </View>
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity
                                            style={styles.editButton}
                                            activeOpacity={0.7}
                                            onPress={() => handleEdit(exp.id)}
                                        >
                                            <Ionicons name="pencil-outline" size={16} color={colors.accentBlue} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            activeOpacity={0.7}
                                            onPress={() => handleDelete(exp.id)}
                                        >
                                            <Ionicons name="trash-outline" size={16} color={colors.red} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <Text style={styles.duration}>
                                    {exp.duration} | {exp.location}
                                </Text>
                                <Text style={styles.description}>{exp.description}</Text>
                            </View>
                        ))}

                        <TouchableOpacity
                            style={styles.addButton}
                            activeOpacity={0.7}
                            onPress={handleAdd}
                        >
                            <Ionicons name="add" size={20} color={colors.success} />
                            <Text style={styles.addButtonText}>Add New Experience</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                <BottomTabBar activeTab="profile" />
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

export default WorkExperience

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
    card: {
        backgroundColor: colors.background,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.xs,
    },
    cardTitleBlock: {
        flex: 1,
        marginRight: spacing.sm,
    },
    jobTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 2,
    },
    company: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.custom1,
        fontFamily: 'monospace',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: spacing.xs,
    },
    editButton: {
        width: 32,
        height: 32,
        borderRadius: radius.sm,
        backgroundColor: colors.lightBlueTint,
        alignItems: 'center',
        justifyContent: 'center',
    },
    deleteButton: {
        width: 32,
        height: 32,
        borderRadius: radius.sm,
        backgroundColor: colors.redTint,
        alignItems: 'center',
        justifyContent: 'center',
    },
    duration: {
        fontSize: 12.5,
        color: colors.textMuted,
        marginBottom: spacing.xs,
    },
    description: {
        fontSize: 13.5,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        borderWidth: 1.5,
        borderColor: colors.success,
        borderStyle: 'dashed',
        borderRadius: radius.md,
        paddingVertical: spacing.md,
        marginTop: spacing.xs,
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.success,
    },
})
