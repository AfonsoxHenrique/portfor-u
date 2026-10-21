import {
    StyleSheet,
    Text,
    View,
    TextInput,
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
    getDoc,
    setDoc,
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
    const [title, setTitle] = useState("");
    const [targetRole, setTargetRole] = useState("");
    const [industry, setIndustry] = useState("");
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    const user = auth.currentUser;

    useEffect(() => {
        if (!user) {
            setLoading(false);
            router.replace("/");
            return;
        }

        const unsubscribe = loadResumes();
        loadResumeSettings();

        return () => {
            unsubscribe();
        };
    }, []);

   
    const loadResumes = () => {
        const user = auth.currentUser;

        if (!user) {
            setLoading(false);
            return () => {};
        }

        const resumesRef = collection(db, "users", user.uid, "resumes");
        const resumesQuery = query(
            resumesRef,
            orderBy("uploadedAt", "desc")
        );

        const unsubscribe = onSnapshot(
            resumesQuery,
            (snapshot) => {
                setResumes(
                    snapshot.docs.map((resumeDoc) => ({
                        id: resumeDoc.id,
                        ...resumeDoc.data(),
                    }))
                );

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

    const loadResumeSettings = async () => {
        try {
            const settingsRef = doc(db, "users", user.uid, "settings", "resume");
            const snapshot = await getDoc(settingsRef);

            if (snapshot.exists()) {
                const data = snapshot.data();
                setTitle(data.title || "");
                setTargetRole(data.targetRole || "");
                setIndustry(data.industry || "");
            }
        } catch (error) {
            console.error("Error loading resume settings:", error);
        }
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

            const allowedExtensions = /\.(pdf|docx)$/i;

            if (!allowedExtensions.test(file.name)) {
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

            const resumesRef = collection(db, "users", uid, "resumes");

            await addDoc(resumesRef, {
                name: file.name,
                size: file.size || null,
                contentType: file.mimeType || null,
                storagePath,
                downloadURL,
                uploadedAt: serverTimestamp(),
            });

            await loadResumes();

            Alert.alert("Success", "Your resume was uploaded successfully.");
        } catch (error) {
            console.error("Resume upload error:", error);
            Alert.alert(
                "Upload failed",
                error.message || "Could not upload your resume."
            );
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!auth.currentUser) {
            Alert.alert("Please log in", "Log in to save your settings.");
            return;
        }

        if (!title.trim()) {
            Alert.alert("Missing title", "Please enter a resume title.");
            return;
        }

        try {
            setSaving(true);

            const settingsRef = doc(
                db,
                "users",
                auth.currentUser.uid,
                "settings",
                "resume"
            );

            await setDoc(
                settingsRef,
                {
                    title: title.trim(),
                    targetRole: targetRole.trim(),
                    industry: industry.trim(),
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            );

            Alert.alert("Saved", "Your resume settings have been saved.");
        } catch (error) {
            console.error("Error saving resume settings:", error);
            Alert.alert("Error", "Could not save your resume settings.");
        } finally {
            setSaving(false);
        }
    };

    const handleView = async (resume) => {
        try {
            let url = resume.downloadURL;

            if (!url && resume.storagePath) {
                url = await getDownloadURL(ref(storage, resume.storagePath));
            }

            if (!url) {
                Alert.alert("Unavailable", "No file link was found.");
                return;
            }

            await Linking.openURL(url);
        } catch (error) {
            console.error("Error opening resume:", error);
            Alert.alert("Error", "Could not open this resume.");
        }
    };

    const handleDelete = (resume) => {
        Alert.alert(
            "Delete Resume",
            `Are you sure you want to delete "${resume.name}"?`,
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const currentUser = auth.currentUser;

                            if (!currentUser) {
                                Alert.alert("Error", "Please log in again.");
                                return;
                            }

                            //deletes the actual file from Firebase Storage
                            if (resume.storagePath) {
                                try {
                                    const fileRef = ref(storage, resume.storagePath);
                                    await deleteObject(fileRef);
                                } catch (error) {
                                    //alloews the delete if the file is already missing
                                    if (error.code !== "storage/object-not-found") {
                                        throw error;
                                    }
                                }
                            }

                            //deletes the resume record from Firestore
                            await deleteDoc(
                                doc(
                                    db,
                                    "users",
                                    currentUser.uid,
                                    "resumes",
                                    resume.id
                                )
                            );

                            Alert.alert("Deleted", "Your resume was deleted.");
                        } catch (error) {
                            console.error("Resume deletion error:", error);
                            Alert.alert(
                                "Delete failed",
                                error.message || "Could not delete the resume."
                            );
                        }
                    },
                },
            ]
        );
    };

    const formatSize = (bytes) => {
        if (bytes == null) return "Size unavailable";
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const formatDate = (timestamp) => {
        if (!timestamp?.toDate) return "Recently uploaded";

        return `Uploaded ${timestamp.toDate().toLocaleDateString()}`;
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <ScreenHeader
                        title="My Resumes"
                        subtitle={`${resumes.length} FILE${resumes.length === 1 ? "" : "S"} UPLOADED`}
                        bg={colors.lightBlueTint}
                        subtitleColor={colors.accentBlue}
                    />

                    <View style={styles.body}>
                        {loading ? (
                            <ActivityIndicator
                                size="large"
                                color={colors.accentBlue}
                            />
                        ) : resumes.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Ionicons
                                    name="document-outline"
                                    size={32}
                                    color={colors.textMuted}
                                />
                                <Text style={styles.emptyText}>
                                    You haven't uploaded a resume yet.
                                </Text>
                            </View>
                        ) : (
                            resumes.map((resume) => (
                                <View style={styles.fileCard} key={resume.id}>
                                    <View style={styles.fileIconChip}>
                                        <Ionicons
                                            name="document-text"
                                            size={18}
                                            color={colors.custom2}
                                        />
                                    </View>

                                    <View style={styles.fileTextBlock}>
                                        <Text style={styles.fileName}>
                                            {resume.name}
                                        </Text>
                                        <Text style={styles.fileMeta}>
                                            {formatSize(resume.size)} •{" "}
                                            {formatDate(resume.uploadedAt)}
                                        </Text>
                                    </View>

                                    
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                        <TouchableOpacity
                                            style={styles.viewButton}
                                            onPress={() => handleView(resume)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={styles.viewButtonText}>
                                                View
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.viewButton, { backgroundColor: "#FDECEC" }]}
                                            onPress={() => handleDelete(resume)}
                                            activeOpacity={0.7}
                                        >
                                            <Text style={{ color: "#C62828", fontSize: 12.5, fontWeight: "700" }}>
                                                Delete
                                            </Text>
                                        </TouchableOpacity>
                                    </View>

                                </View>
                            ))
                        )}

                        <TouchableOpacity
                            style={styles.uploadBox}
                            activeOpacity={0.7}
                            onPress={handleUpload}
                            disabled={uploading}
                        >
                            <View style={styles.uploadIconChip}>
                                <Ionicons
                                    name="cloud-upload-outline"
                                    size={20}
                                    color={colors.accentBlue}
                                />
                            </View>

                            <Text style={styles.uploadTitle}>
                                {uploading
                                    ? "Uploading resume..."
                                    : "Upload a new version"}
                            </Text>

                            <Text style={styles.uploadHint}>
                                PDF, DOCX up to 10MB
                            </Text>

                            {uploading && (
                                <ActivityIndicator
                                    style={{ marginTop: 10 }}
                                    color={colors.accentBlue}
                                />
                            )}
                        </TouchableOpacity>

                        <Text style={styles.sectionTitle}>Resume Details</Text>

                        <Text style={styles.label}>Resume Title</Text>
                        <TextInput
                            style={styles.input}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g. Software Engineer Resume"
                            placeholderTextColor={colors.textMuted}
                        />

                        <Text style={styles.label}>Target Role / Tagline</Text>
                        <TextInput
                            style={styles.input}
                            value={targetRole}
                            onChangeText={setTargetRole}
                            placeholder="e.g. Junior Software Engineer"
                            placeholderTextColor={colors.textMuted}
                        />

                        <Text style={styles.label}>Primary Industry</Text>
                        <TextInput
                            style={styles.input}
                            value={industry}
                            onChangeText={setIndustry}
                            placeholder="e.g. Technology"
                            placeholderTextColor={colors.textMuted}
                        />

                        <TouchableOpacity
                            style={styles.saveButton}
                            activeOpacity={0.85}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            <Text style={styles.saveButtonText}>
                                {saving ? "Saving..." : "Save Resume Settings"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.analyzerButton}
                            activeOpacity={0.85}
                            onPress={() => router.push("/resume-analyzer")}
                        >
                            <Text style={styles.analyzerButtonText}>
                                Resume Analyzer
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>

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
        paddingBottom: spacing.lg,
    },
    body: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
    },
    fileCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
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
        marginRight: spacing.sm,
    },
    fileName: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    fileMeta: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 2,
    },
    viewButton: {
        backgroundColor: colors.lightBlueTint,
        borderRadius: radius.pill,
        paddingHorizontal: spacing.md,
        paddingVertical: 6,
    },
    viewButtonText: {
        fontSize: 12.5,
        fontWeight: "700",
        color: colors.accentBlue,
    },
    uploadBox: {
        borderWidth: 1.5,
        borderColor: colors.accentBlue,
        borderStyle: "dashed",
        borderRadius: radius.md,
        alignItems: "center",
        paddingVertical: spacing.lg,
        marginBottom: spacing.lg,
    },
    uploadIconChip: {
        width: 36,
        height: 36,
        borderRadius: radius.pill,
        backgroundColor: colors.lightBlueTint,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: spacing.sm,
    },
    uploadTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.textPrimary,
    },
    uploadHint: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 13,
        fontWeight: "600",
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        fontSize: 14,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    saveButton: {
        backgroundColor: colors.navy,
        borderRadius: radius.md,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: spacing.xs,
    },
    saveButtonText: {
        color: colors.white,
        fontSize: 15,
        fontWeight: "700",
    },
    analyzerButton: {
        backgroundColor: colors.custom10,
        borderWidth: 1,
        borderColor: colors.custom9,
        borderRadius: radius.md,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: spacing.sm,
    },
    analyzerButtonText: {
        color: colors.custom9,
        fontSize: 15,
        fontWeight: "700",
    },
    emptyState: {
        alignItems: "center",
        padding: spacing.lg,
        marginBottom: spacing.md,
    },
    emptyText: {
        color: colors.textMuted,
        marginTop: spacing.sm,
        textAlign: "center",
    },
});