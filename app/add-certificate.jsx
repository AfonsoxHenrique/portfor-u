import {
    StyleSheet, Text, View, TextInput,
    TouchableOpacity, ScrollView, Alert, ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme/colors";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import ScreenHeader from "../components/ScreenHeader";
import BottomTabBar from "../components/BottomTabBar";

import { auth, db, storage } from "../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AddCertificate = () => {
    const router = useRouter();
    const [certName, setCertName] = useState("");
    const [issuer, setIssuer] = useState("");
    const [dateEarned, setDateEarned] = useState("");
    const [credentialId, setCredentialId] = useState("");
    const [file, setFile] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleChooseFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ["application/pdf", "image/png", "image/jpeg"],
                copyToCacheDirectory: true,
                multiple: false,
            });
            if (result.canceled) return;
            setFile(result.assets[0]);
        } catch (error) {
            Alert.alert("Error", "Could not select file.");
        }
    };

    const handleAdd = async () => {
        if (!certName.trim()) { Alert.alert("Missing field", "Please enter a certificate name."); return; }
        if (!issuer.trim()) { Alert.alert("Missing field", "Please enter the issuing organization."); return; }
        if (!dateEarned.trim()) { Alert.alert("Missing field", "Please enter the date earned."); return; }

        const user = auth.currentUser;
        if (!user) { Alert.alert("Please log in", "Log in to add a certificate."); return; }

        try {
            setSaving(true);
            let downloadURL = null;
            let storagePath = null;

            if (file) {
                const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
                storagePath = `users/${user.uid}/certificates/${Date.now()}_${safeName}`;
                const fileRef = ref(storage, storagePath);
                const response = await fetch(file.uri);
                const blob = await response.blob();
                await uploadBytes(fileRef, blob, { contentType: file.mimeType || "application/octet-stream" });
                downloadURL = await getDownloadURL(fileRef);
            }

            await addDoc(collection(db, "users", user.uid, "certificates"), {
                name: certName.trim(),
                issuer: issuer.trim(),
                earnedDate: dateEarned.trim(),
                credentialId: credentialId.trim() || null,
                downloadURL: downloadURL || null,
                storagePath: storagePath || null,
                createdAt: serverTimestamp(),
            });

            Alert.alert("Success", "Certificate added successfully!", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error("Add certificate error:", error);
            Alert.alert("Error", "Could not add certificate.");
        } finally { setSaving(false); }
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
                        title="Add Certificate"
                        subtitle="SHOWCASE YOUR ACHIEVEMENTS"
                        bg={colors.amberTint}
                        subtitleColor={colors.amber}
                    />

                    <View style={styles.body}>
                        <View style={styles.formCard}>
                            {/* Certificate Name */}
                            <Text style={styles.label}>Certificate name</Text>
                            <TextInput
                                style={styles.input}
                                value={certName}
                                onChangeText={setCertName}
                                placeholder="Enter certificate name"
                                placeholderTextColor={colors.textMuted}
                            />

                            {/* Issuing Organization */}
                            <Text style={styles.label}>Issuing organization</Text>
                            <TextInput
                                style={styles.input}
                                value={issuer}
                                onChangeText={setIssuer}
                                placeholder="Enter issuing organization"
                                placeholderTextColor={colors.textMuted}
                            />

                            {/* Date Earned */}
                            <Text style={styles.label}>Date earned</Text>
                            <View style={styles.dateInput}>
                                <TextInput
                                    style={[styles.input, { flex: 1, marginBottom: 0, borderWidth: 0 }]}
                                    value={dateEarned}
                                    onChangeText={setDateEarned}
                                    placeholder="Day, month, year"
                                    placeholderTextColor={colors.textMuted}
                                />
                                <Ionicons name="calendar-outline" size={18} color={colors.textMuted} style={{ marginRight: spacing.sm }} />
                            </View>

                            {/* Credential ID */}
                            <Text style={styles.label}>Credential ID or URL (optional)</Text>
                            <TextInput
                                style={[styles.input, { marginBottom: 0 }]}
                                value={credentialId}
                                onChangeText={setCredentialId}
                                placeholder="Enter credential ID or link"
                                placeholderTextColor={colors.textMuted}
                            />
                        </View>

                        {/* Upload Box */}
                        <TouchableOpacity style={styles.uploadBox} activeOpacity={0.7} onPress={handleChooseFile}>
                            <View style={styles.uploadIconChip}>
                                <Ionicons name="share-outline" size={20} color={colors.amber} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.uploadTitle}>Upload certificate / badge</Text>
                                <Text style={styles.uploadHint}>PDF, PNG or JPEG · Max 10 MB</Text>
                                {file ? (
                                    <Text style={styles.fileName}>{file.name}</Text>
                                ) : (
                                    <Text style={styles.chooseFile}>Choose file</Text>
                                )}
                            </View>
                        </TouchableOpacity>

                        {/* Add Button */}
                        <TouchableOpacity
                            style={styles.addButton}
                            activeOpacity={0.85}
                            onPress={handleAdd}
                            disabled={saving}
                        >
                            {saving
                                ? <ActivityIndicator color={colors.white} />
                                : <Text style={styles.addButtonText}>Add Certificate</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </ScrollView>

                <BottomTabBar activeTab="certificates" />
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default AddCertificate;

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.surface },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: spacing.lg },
    body: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg },

    formCard: {
        backgroundColor: colors.background,
        borderRadius: radius.md,
        borderWidth: 1, borderColor: colors.border,
        padding: spacing.md,
        marginBottom: spacing.md,
        shadowColor: "#000", shadowOpacity: 0.04,
        shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2,
    },
    label: { fontSize: 13, fontWeight: "600", color: colors.textPrimary, marginBottom: spacing.xs, marginTop: spacing.sm },
    input: {
        borderWidth: 1, borderColor: colors.border,
        backgroundColor: colors.surface, borderRadius: radius.md,
        paddingHorizontal: spacing.md, paddingVertical: 12,
        fontSize: 14, color: colors.textPrimary, marginBottom: spacing.md,
    },
    dateInput: {
        flexDirection: "row", alignItems: "center",
        borderWidth: 1, borderColor: colors.border,
        backgroundColor: colors.surface, borderRadius: radius.md,
        marginBottom: spacing.md,
    },

    uploadBox: {
        flexDirection: "row", alignItems: "center", gap: spacing.md,
        borderWidth: 1.5, borderColor: colors.border,
        borderStyle: "dashed", borderRadius: radius.md,
        padding: spacing.md, backgroundColor: colors.background,
        marginBottom: spacing.lg,
    },
    uploadIconChip: {
        width: 40, height: 40, borderRadius: radius.pill,
        backgroundColor: colors.amberTint,
        alignItems: "center", justifyContent: "center",
    },
    uploadTitle: { fontSize: 13, fontWeight: "700", color: colors.textPrimary },
    uploadHint: { fontSize: 11.5, color: colors.textMuted, marginTop: 2 },
    chooseFile: { fontSize: 12, color: colors.accentBlue, fontWeight: "600", marginTop: 4 },
    fileName: { fontSize: 12, color: colors.success, fontWeight: "600", marginTop: 4 },

    addButton: {
        backgroundColor: colors.navy, borderRadius: radius.md,
        paddingVertical: 15, alignItems: "center",
    },
    addButtonText: { color: colors.white, fontSize: 15, fontWeight: "700" },
});
