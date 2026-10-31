import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "../../../theme/ThemeContext";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../../components/ScreenHeader";
import UploadBox from "../../../components/UploadBox";

import { useEffect } from "react";
import * as DocumentPicker from "expo-document-picker";
import { Alert } from "react-native";
import { addDoc, collection, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../../../firebase/firebase";

const AddResume = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const isEditing = !!id;

    const { colors, spacing, radius } = useTheme();
    const styles = createStyles(colors, spacing, radius);

    const [title, setTitle] = useState("");
    const [targetRole, setTargetRole] = useState("");
    const [industry, setIndustry] = useState("");

    const [selectedFile, setSelectedFile] = useState(null);
    const [saving, setSaving] = useState(false);
    const [existingResume, setExistingResume] = useState(null);
    useEffect(() => {
        const loadResume = async () => {
            if (!id) return;
            const user = auth.currentUser;

            if (!user) {
                Alert.alert("Login required", "Please log in to edit your resume.");
                router.back();
                return;
            }

            try {
                const resumeRef = doc(
                    db,
                    "users",
                    user.uid,
                    "resumes",
                    String(id)
                );

                const resumeSnap = await getDoc(resumeRef);

                if (!resumeSnap.exists()) {
                    Alert.alert("Not found", "This resume could not be found.");
                    router.back();
                    return;
                }

                const data = resumeSnap.data();

                setTitle(data.title || "");
                setTargetRole(data.targetRole || "");
                setIndustry(data.industry || "");
                setExistingResume(data);
            } catch (error) {
                console.error("Error loading resume:", error);
                Alert.alert("Error", "Could not load the resume details.");
            }
        };

        loadResume();
    }, [id]);

    const handleChooseFile = async () => {
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

            if (file.size && file.size > 10 * 1024 * 1024) {
                Alert.alert("File too large", "Please choose a file smaller than 10 MB.");
                return;
            }

            setSelectedFile(file);
        } catch (error) {
            console.error("File picker error:", error);
            Alert.alert("Error", "Could not select the resume file.");
        }
    };

    const handleSave = async () => {
        const user = auth.currentUser;

        if (!user) {
            Alert.alert("Login required", "Please log in before saving a resume.");
            return;
        }

        if (!title.trim()) {
            Alert.alert("Missing information", "Please enter a resume title.");
            return;
        }

        if (!selectedFile && !existingResume) {
            Alert.alert("Missing file", "Please choose a PDF or DOCX resume.");
            return;
        }

        setSaving(true);

        try {
            let resumeData = {
                title: title.trim(),
                targetRole: targetRole.trim(),
                industry: industry.trim(),
                updatedAt: serverTimestamp(),
            };

            if (selectedFile) {
                const safeName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
                const storagePath = `users/${user.uid}/resumes/${Date.now()}_${safeName}`;
                const fileRef = ref(storage, storagePath);

                const response = await fetch(selectedFile.uri);
                const blob = await response.blob();

                await uploadBytes(fileRef, blob, {
                    contentType: selectedFile.mimeType || "application/octet-stream",
                });

                const downloadURL = await getDownloadURL(fileRef);

                resumeData = {
                    ...resumeData,
                    fileName: selectedFile.name,
                    name: selectedFile.name,
                    size: selectedFile.size || 0,
                    contentType: selectedFile.mimeType || "application/octet-stream",
                    storagePath,
                    downloadURL,
                    uploadedAt: serverTimestamp(),
                };
            }

            if (isEditing) {
                await updateDoc(
                    doc(db, "users", user.uid, "resumes", String(id)),
                    resumeData
                );
            } else {
                await addDoc(
                    collection(db, "users", user.uid, "resumes"),
                    resumeData
                );
            }

            Alert.alert(
                "Success",
                isEditing ? "Resume updated successfully." : "Resume uploaded successfully.",
                [{ text: "OK", onPress: () => router.back() }]
            );
        } catch (error) {
            console.error("Error saving resume:", error);
            Alert.alert("Error", error.message || "Could not save the resume.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <ScreenHeader
                        title={isEditing ? 'Edit Resume' : 'Add Resume'}
                        subtitle={isEditing ? 'UPDATE YOUR RESUME' : 'UPLOAD YOUR RESUME'}
                        bg={colors.lightBlueTint}
                        subtitleColor={colors.accentBlue}
                    />

                    <View style={styles.body}>
                        <UploadBox
                            label="Resume file"
                            title={selectedFile ? selectedFile.name : "Choose a resume to upload"}
                            hint={
                                selectedFile
                                    ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                                    : existingResume
                                        ? `Current file: ${existingResume.fileName || existingResume.name}`
                                        : "PDF or DOCX - Max 10MB"
                            }
                            onChooseFile={handleChooseFile}
                        />

                        <Text style={styles.label}>Resume Title</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. SWE Intern Resume - Fall 2026"
                            placeholderTextColor={colors.textMuted}
                            value={title}
                            onChangeText={setTitle}
                        />

                        <Text style={styles.label}>Target Role / Tagline</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Junior Software Engineer"
                            placeholderTextColor={colors.textMuted}
                            value={targetRole}
                            onChangeText={setTargetRole}
                        />

                        <Text style={styles.label}>Primary Industry</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Technology & Software"
                            placeholderTextColor={colors.textMuted}
                            value={industry}
                            onChangeText={setIndustry}
                        />

                        <TouchableOpacity style={styles.saveButton} activeOpacity={0.85} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>
                                {isEditing ? 'Save Changes' : 'Add Resume'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

export default AddResume

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
    label: {
        fontSize: 13,
        fontWeight: '600',
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
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    saveButtonText: {
        color: colors.white,
        fontSize: 15,
        fontWeight: '700',
    },
})
