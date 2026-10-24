import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme/colors";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import BottomTabBar from "../components/BottomTabBar";
import {
    collection,
    onSnapshot,
    doc,
    deleteDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

const WorkExperience = () => {
    const router = useRouter()
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = auth.currentUser;

        if (!user) {
            setLoading(false);
            return;
        }

        const experiencesRef = collection(
            db,
            "users",
            user.uid,
            "workExperience"
        );

        const unsubscribe = onSnapshot(
            experiencesRef,
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

                setExperiences(items);
                setLoading(false);
            },
            (error) => {
                console.error("Error loading work experience:", error);
                Alert.alert("Error", "Could not load work experience.");
                setLoading(false);
            }
        );

        return unsubscribe;
    }, []);

    const handleEdit = (id) => {
        router.push({
            pathname: "/add-work-experience",
            params: { id },
        });
    };

    const handleDelete = (id) => {
        Alert.alert(
            "Delete Experience",
            "Are you sure you want to delete this work experience?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const user = auth.currentUser;

                        if (!user) {
                            Alert.alert("Error", "Please log in first.");
                            return;
                        }

                        try {
                            await deleteDoc(
                                doc(
                                    db,
                                    "users",
                                    user.uid,
                                    "workExperience",
                                    id
                                )
                            );
                        } catch (error) {
                            console.error("Error deleting experience:", error);
                            Alert.alert(
                                "Error",
                                "Could not delete this experience."
                            );
                        }
                    },
                },
            ]
        );
    };

    const handleAdd = () => {
        router.push('/add-work-experience')
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
                        subtitle={`${experiences.length} ENTRIES RECORDED`}
                        bg={colors.successTint}
                        subtitleColor={colors.success}
                    />

                    <View style={styles.body}>
                        {loading ? (
                            <Text style={styles.description}>
                                Loading experiences...
                            </Text>
                        ) : experiences.length === 0 ? (
                            <Text style={styles.description}>
                                No work experience added yet. Tap below to add your first entry.
                            </Text>
                        ) : (
                            experiences.map((exp) => (
                                <View key={exp.id} style={styles.card}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.cardTitleBlock}>
                                            <Text style={styles.jobTitle}>
                                                {exp.jobTitle}
                                            </Text>
                                            <Text style={styles.company}>
                                                {exp.company}
                                            </Text>
                                        </View>

                                        <View style={styles.actionButtons}>
                                            <TouchableOpacity
                                                style={styles.editButton}
                                                activeOpacity={0.7}
                                                onPress={() => handleEdit(exp.id)}
                                            >
                                                <Ionicons
                                                    name="pencil-outline"
                                                    size={16}
                                                    color={colors.accentBlue}
                                                />
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={styles.deleteButton}
                                                activeOpacity={0.7}
                                                onPress={() => handleDelete(exp.id)}
                                            >
                                                <Ionicons
                                                    name="trash-outline"
                                                    size={16}
                                                    color={colors.red}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <Text style={styles.duration}>
                                        {exp.startDate || "Start date not specified"}
                                        {" - "}
                                        {exp.endDate || "Present"}
                                        {exp.location ? ` | ${exp.location}` : ""}
                                    </Text>

                                    <Text style={styles.description}>
                                        {exp.description || "No description provided."}
                                    </Text>
                                </View>
                            ))
                        )}

                        <TouchableOpacity
                            style={styles.addButton}
                            activeOpacity={0.7}
                            onPress={handleAdd}
                        >
                            <Ionicons name="add" size={20} color={colors.success} />
                            <Text style={styles.addButtonText}>
                                Add New Experience
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
                <BottomTabBar activeTab="work-experience" />
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
