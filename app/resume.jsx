import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Linking,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme/colors";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import ScreenHeader from "../components/ScreenHeader";
import BottomTabBar from "../components/BottomTabBar";

import { auth, db, storage } from "../firebase/firebase";
import {
    collection,
    addDoc,
    onSnapshot,
    doc,
    query,
    orderBy,
    serverTimestamp,
    deleteDoc,
} from "firebase/firestore";
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from "firebase/storage";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const Resumes = () => {
    const router = useRouter();
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const user = auth.currentUser;

    useEffect(() => {
        if (!user) {
            setLoading(false);
            router.replace("/");
            return;
        }
        const unsubscribe = loadResumes();
        return () => unsubscribe();
    }, []);

    const loadResumes = () => {
        const user = auth.currentUser;
        if (!user) { setLoading(false); return () => {}; }

        const resumesRef = collection(db, "users", user.uid, "resumes");
        const resumesQuery = query(resumesRef, orderBy("uploadedAt", "desc"));

        const unsubscribe = onSnapshot(
            resumesQuery,
            (snapshot) => {
                setResumes(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
                setLoading(false);
            },
            (error) => {
                console.error("Error listening to resumes:", error);
                setLoading(false);
                Alert.alert("Error", "Could not load your resumes.");
            }
        );
        return unsubscribe;
    };

    const handleUpload = async () => {
        if (!auth.currentUser) {
            Alert.alert("Please log in", "Log in before uploading a resume.");
            return;
        }
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: [
                    "application/pdf",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ],
                copyToCacheDirectory: true,
                multiple: false,
            });
            if (result.canceled) return;

            const file = result.assets[0];
            if (file.size != null && file.size > MAX_FILE_SIZE) {
                Alert.alert("File too large", "Choose a file smaller than 10 MB.");
                return;
            }
            if (!/\.(pdf|docx)$/i.test(file.name)) {
                Alert.alert("Unsupported file", "Please select a PDF or DOCX file.");
                return;
            }

            setUploading(true);
            const uid = auth.currentUser.uid;
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
            const storagePath = `users/${uid}/resumes/${Date.now()}_${safeName}`;
            const fileRef = ref(storage, storagePath);
            const response = await fetch(file.uri);
            const blob = await response.blob();
            await uploadBytes(fileRef, blob, {
                contentType: file.mimeType || "application/octet-stream",
            });
            const downloadURL = await getDownloadURL(fileRef);
            await addDoc(collection(db, "users", uid, "resumes"), {
                name: file.name,
                size: file.size || null,
                contentType: file.mimeType || null,
                storagePath,
                downloadURL,
                uploadedAt: serverTimestamp(),
            });
            Alert.alert("Success", "Your resume was uploaded successfully.");
        } catch (error) {
            console.error("Resume upload error:", error);
            Alert.alert("Upload failed", error.message || "Could not upload your resume.");
        } finally {
            setUploading(false);
        }
    };

    const handleView = async (resume) => {
        try {
            let url = resume.downloadURL;
            if (!url && resume.storagePath) {
                url = await getDownloadURL(ref(storage, resume.storagePath));
            }
            if (!url) { Alert.alert("Unavailable", "No file link was found."); return; }
            await Linking.openURL(url);
        } catch (error) {
            Alert.alert("Error", "Could not open this resume.");
        }
    };

    const handleDelete = (resume) => {
        Alert.alert(
            "Delete Resume",
            `Are you sure you want to delete "${resume.name}"?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const currentUser = auth.currentUser;
                            if (!currentUser) { Alert.alert("Error", "Please log in again."); return; }
                            if (resume.storagePath) {
                                try {
                                    await deleteObject(ref(storage, resume.storagePath));
                                } catch (error) {
                                    if (error.code !== "storage/object-not-found") throw error;
                                }
                            }
                            await deleteDoc(doc(db, "users", currentUser.uid, "resumes", resume.id));
                            Alert.alert("Deleted", "Your resume was deleted.");
                        } catch (error) {
                            Alert.alert("Delete failed", error.message || "Could not delete the resume.");
                        }
                    },
                },
            ]
        );
    };

    const handleEdit = (resume) => {
        router.push({ pathname: "/edit-resume", params: { resumeId: resume.id } });
    };

    const handleAnalyze = (resume) => {
        router.push({ pathname: "/resume-analyzer", params: { resumeId: resume.id } });
    };

    const formatSize = (bytes) => {
        if (bytes == null) return "Size unavailable";
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const formatDate = (timestamp) => {
        if (!timestamp?.toDate) return "Recently uploaded";
        return `Updated ${timestamp.toDate().toLocaleDateString()}`;
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <ScreenHeader
                        title="My Resumes"
                        subtitle={`${resumes.length} FILE${resumes.length === 1 ? "" : "S"} UPLOADED`}
                        bg={colors.lightBlueTint}
                        subtitleColor={colors.accentBlue}
                    />

                    <View style={styles.body}>

                        {/* Resume Analyzer Banner */}
                        <TouchableOpacity
                            style={styles.analyzerBanner}
                            activeOpacity={0.85}
                            onPress={() => router.push("/resume-analyzer")}
                        >
                            <View style={styles.analyzerIconChip}>
                                <Ionicons name="bar-chart" size={18} color={colors.white} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.analyzerBannerTitle}>Resume Analyzer</Text>
                                <Text style={styles.analyzerBannerSub}>
                                    Tap to review your resume and get feedback and improvement suggestions.
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={16} color={colors.custom9} />
                        </TouchableOpacity>

                        {/* Resume Cards */}
                        {loading ? (
                            <ActivityIndicator
                                size="large"
                                color={colors.accentBlue}
                                style={{ marginTop: spacing.lg }}
                            />
                        ) : resumes.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons name="document-outline" size={32} color={colors.textMuted} />
                                <Text style={styles.emptyText}>
                                    You haven't uploaded a resume yet.
                                </Text>
                                <Text style={styles.emptyHint}>
                                    Tap the + button to upload your first resume
                                </Text>
                            </View>
                        ) : (
                            resumes.map((resume) => (
                                <TouchableOpacity
                                    key={resume.id}
                                    style={styles.resumeCard}
                                    activeOpacity={0.85}
                                    onPress={() => handleView(resume)}
                                >
                                    {/* File icon + text */}
                                    <View style={styles.cardLeft}>
                                        <View style={styles.fileIconChip}>
                                            <Ionicons
                                                name="document-text"
                                                size={18}
                                                color={colors.custom2}
                                            />
                                        </View>
                                        <View style={styles.fileTextBlock}>
                                            <Text style={styles.resumeName} numberOfLines={1}>
                                                {resume.name}
                                            </Text>
                                            <Text style={styles.resumeMeta}>
                                                {formatSize(resume.size)} • {formatDate(resume.uploadedAt)}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* 3 icon buttons */}
                                    <View style={styles.iconRow}>
                                        <TouchableOpacity
                                            style={[styles.iconBtn, { backgroundColor: colors.lightBlueTint }]}
                                            onPress={() => handleEdit(resume)}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="pencil" size={14} color={colors.accentBlue} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.iconBtn, { backgroundColor: colors.redTint }]}
                                            onPress={() => handleDelete(resume)}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="trash" size={14} color={colors.red} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.iconBtn, { backgroundColor: colors.custom10 }]}
                                            onPress={() => handleAnalyze(resume)}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="bar-chart" size={14} color={colors.custom9} />
                                        </TouchableOpacity>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                </ScrollView>

                {/* Floating + Button */}
                <TouchableOpacity
                    style={styles.fab}
                    onPress={handleUpload}
                    activeOpacity={0.85}
                    disabled={uploading}
                >
                    {uploading
                        ? <ActivityIndicator color={colors.white} />
                        : <Ionicons name="add" size={28} color={colors.white} />
                    }
                </TouchableOpacity>

                <BottomTabBar activeTab="resumes" />
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default Resumes;

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    body: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
    },

    // Analyzer Banner
    analyzerBanner: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        backgroundColor: colors.custom10,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.custom9 + "40",
    },
    analyzerIconChip: {
        width: 36,
        height: 36,
        borderRadius: radius.pill,
        backgroundColor: colors.custom9,
        alignItems: "center",
        justifyContent: "center",
    },
    analyzerBannerTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.custom9,
        marginBottom: 2,
    },
    analyzerBannerSub: {
        fontSize: 11.5,
        color: colors.textSecondary,
        lineHeight: 16,
    },

    // Resume Card
    resumeCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.background,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        marginBottom: spacing.md,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardLeft: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        marginRight: spacing.sm,
    },
    fileIconChip: {
        width: 36,
        height: 36,
        borderRadius: radius.sm,
        backgroundColor: colors.lightBlueTint,
        alignItems: "center",
        justifyContent: "center",
        marginRight: spacing.md,
    },
    fileTextBlock: {
        flex: 1,
    },
    resumeName: {
        fontSize: 13,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    resumeMeta: {
        fontSize: 11,
        color: colors.accentBlue,
        marginTop: 3,
        fontWeight: "600",
    },

    // Icon buttons
    iconRow: {
        flexDirection: "row",
        gap: 6,
    },
    iconBtn: {
        width: 30,
        height: 30,
        borderRadius: radius.sm,
        alignItems: "center",
        justifyContent: "center",
    },

    // Empty state
    emptyState: {
        alignItems: "center",
        padding: spacing.xl,
        marginBottom: spacing.md,
    },
    emptyText: {
        color: colors.textSecondary,
        marginTop: spacing.sm,
        textAlign: "center",
        fontWeight: "600",
        fontSize: 14,
    },
    emptyHint: {
        color: colors.textMuted,
        marginTop: spacing.xs,
        textAlign: "center",
        fontSize: 12,
    },

    // Floating + button
    fab: {
        position: "absolute",
        right: spacing.lg,
        bottom: 90,
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: colors.navy,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
});
