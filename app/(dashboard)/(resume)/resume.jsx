import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Linking } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { onSnapshot, collection, doc, deleteDoc } from "firebase/firestore";

import { ref, deleteObject } from "firebase/storage";
import { auth, db, storage } from "../../../firebase/firebase";

import ScreenHeader from "../../../components/ScreenHeader";
import TipCard from "../../../components/TipCard";
import FloatingActionButton from "../../../components/FloatingActionButton";
import { useTheme } from "../../../theme/ThemeContext";


const Resumes = () => {
    const router = useRouter()
    const { colors, spacing, radius } = useTheme()
    const styles = createStyles(colors, spacing, radius)

    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);

        useEffect(() => {
            const user = auth.currentUser;

            if (!user) {
                setLoading(false);
                Alert.alert(
                    "Login required",
                    "Please log in to view your resumes."
                );
                return;
            }

            const resumesRef = collection(
                db,
                "users",
                user.uid,
                "resumes"
            );

            const unsubscribe = onSnapshot(
                resumesRef,
                (snapshot) => {
                    const resumeList = snapshot.docs.map((document) => ({
                        id: document.id,
                        ...document.data(),
                    }));

                    resumeList.sort((a, b) => {
                        const dateA = a.updatedAt?.toDate?.()?.getTime() || 0;
                        const dateB = b.updatedAt?.toDate?.()?.getTime() || 0;
                        return dateB - dateA;
                    });

                    setResumes(resumeList);
                    setLoading(false);
                },
                (error) => {
                    console.error("Error loading resumes:", error);
                    setLoading(false);
                    Alert.alert("Error", "Could not load your resumes.");
                }
            );

            return unsubscribe;
        }, []);


        const handleView = async (resume) => {
            if (!resume.downloadURL) {
                Alert.alert(
                    "File unavailable",
                    "There is no download link for this resume."
                );
                return;
            }

            try {
                await Linking.openURL(resume.downloadURL);
            } catch (error) {
                console.error("Error opening resume:", error);
                Alert.alert("Error", "Could not open this resume.");
            }
        };

        const handleDelete = (resume) => {
            Alert.alert(
                "Delete Resume",
                `Remove "${resume.fileName || resume.name}" from your resumes?`,
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                const user = auth.currentUser;

                                if (!user) {
                                    Alert.alert("Error", "Please log in again.");
                                    return;
                                }

                                //deletes the file from Firebase Storage.
                                if (resume.storagePath) {
                                    try {
                                        await deleteObject(
                                            ref(storage, resume.storagePath)
                                        );
                                    } catch (storageError) {
                                        if (
                                            storageError.code !==
                                            "storage/object-not-found"
                                        ) {
                                            throw storageError;
                                        }
                                    }
                                }

                                //delete the resume details from Firestore.
                                await deleteDoc(
                                    doc(
                                        db,
                                        "users",
                                        user.uid,
                                        "resumes",
                                        resume.id
                                    )
                                );
                            } catch (error) {
                                console.error("Error deleting resume:", error);
                                Alert.alert(
                                    "Error",
                                    "Could not delete the resume. Please try again."
                                );
                            }
                        },
                    },
                ]
            );
        };

    return (
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <ScreenHeader
                        title="My Resumes"
                        subtitle={`${resumes.length} FILE${resumes.length === 1 ? "" : "S"} UPLOADED`}
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
                        {loading && (<Text style={{ color: colors.textMuted, marginBottom: spacing.md }}> Loading resumes...</Text>)}
                        {resumes.map((resume) => (
                            <View key={resume.id} style={styles.resumeCard}>
                                <View style={styles.cardHeaderRow}>
                                    <View style={styles.fileIconChip}>
                                        <Ionicons name="document-text" size={18} color={colors.accentBlue} />
                                    </View>
                                    <View style={styles.fileTextBlock}>
                                        <Text style={styles.fileName}>
                                            {resume.fileName || resume.name || "Resume"}
                                        </Text>
                                        <Text style={styles.fileMeta}>
                                            {resume.size
                                                ? `${(resume.size / (1024 * 1024)).toFixed(1)} MB`
                                                : "File size unavailable"}
                                            {" • "}
                                            {resume.updatedAt?.toDate
                                                ? `Updated ${resume.updatedAt.toDate().toLocaleDateString()}`
                                                : "Recently uploaded"}
                                        </Text>
                                    </View>
                                    <View style={styles.actions}>
                                        <TouchableOpacity
                                            style={styles.viewButton}
                                            activeOpacity={0.7}
                                            onPress={() => handleView(resume)}
                                        >
                                            <Ionicons
                                                name="eye-outline"
                                                size={14}
                                                color={colors.accentBlue}
                                            />
                                        </TouchableOpacity>
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
            </SafeAreaView>
    )
}

export default Resumes

const createStyles = (colors, spacing, radius) => StyleSheet.create({
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
        backgroundColor: colors.surface,
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
    viewButton: {
        width: 28,
        height: 28,
        borderRadius: radius.sm,
        backgroundColor: colors.lightBlueTint,
        alignItems: "center",
        justifyContent: "center",
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
