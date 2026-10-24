import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { colors, spacing, radius } from "../theme/colors";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

const AddWorkExperience = () => {
    const router = useRouter()
    const { id } = useLocalSearchParams()
    const isEditing = !!id

    const [jobTitle, setJobTitle] = useState('')
    const [company, setCompany] = useState('')
    const [location, setLocation] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [description, setDescription] = useState('')

    const [saving, setSaving] = useState(false);


        useEffect(() => {
        const loadExperience = async () => {
            if (!id) return;

            try {
                const user = auth.currentUser;

                if (!user) {
                    Alert.alert("Error", "Please log in first.");
                    return;
                }

                const experienceRef = doc(
                    db,
                    "users",
                    user.uid,
                    "workExperience",
                    String(id)
                );

                const snapshot = await getDoc(experienceRef);

                if (snapshot.exists()) {
                    const data = snapshot.data();

                    setJobTitle(data.jobTitle || "");
                    setCompany(data.company || "");
                    setLocation(data.location || "");
                    setStartDate(data.startDate || "");
                    setEndDate(data.endDate || "");
                    setDescription(data.description || "");
                } else {
                    Alert.alert("Error", "Experience not found.");
                }
            } catch (error) {
                console.error("Error loading experience:", error);
                Alert.alert("Error", "Could not load this experience.");
            }
        };

        loadExperience();
    }, [id]);

    const handleSave = async () => {
        const user = auth.currentUser;

        if (!user) {
            Alert.alert("Error", "Please log in first.");
            return;
        }

        if (!jobTitle.trim() || !company.trim()) {
            Alert.alert(
                "Missing information",
                "Please enter at least a job title and company."
            );
            return;
        }

        setSaving(true);

        try {
            const experienceData = {
                jobTitle: jobTitle.trim(),
                company: company.trim(),
                location: location.trim(),
                startDate: startDate.trim(),
                endDate: endDate.trim(),
                description: description.trim(),
                updatedAt: serverTimestamp(),
            };

            if (isEditing) {
                await updateDoc(
                    doc(
                        db,
                        "users",
                        user.uid,
                        "workExperience",
                        String(id)
                    ),
                    experienceData
                );
            } else {
                await addDoc(
                    collection(
                        db,
                        "users",
                        user.uid,
                        "workExperience"
                    ),
                    {
                        ...experienceData,
                        createdAt: serverTimestamp(),
                    }
                );
            }

            router.back();
        } catch (error) {
            console.error("Error saving experience:", error);
            Alert.alert("Error", "Could not save the work experience.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <ScreenHeader
                        title={isEditing ? 'Edit Experience' : 'Add Work Experience'}
                        subtitle={isEditing ? 'UPDATE ENTRY' : 'NEW ENTRY'}
                        bg={colors.successTint}
                        subtitleColor={colors.success}
                    />

                    <View style={styles.body}>
                        <Text style={styles.label}>Job Title</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. Software Engineering Intern"
                            placeholderTextColor={colors.textMuted}
                            value={jobTitle}
                            onChangeText={setJobTitle}
                        />

                        <Text style={styles.label}>Company</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. TechCorp Industries"
                            placeholderTextColor={colors.textMuted}
                            value={company}
                            onChangeText={setCompany}
                        />

                        <Text style={styles.label}>Location</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. San Francisco, CA (Remote)"
                            placeholderTextColor={colors.textMuted}
                            value={location}
                            onChangeText={setLocation}
                        />

                        <View style={styles.dateRow}>
                            <View style={styles.dateField}>
                                <Text style={styles.label}>Start Date</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Jun 2025"
                                    placeholderTextColor={colors.textMuted}
                                    value={startDate}
                                    onChangeText={setStartDate}
                                />
                            </View>
                            <View style={styles.dateField}>
                                <Text style={styles.label}>End Date</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Aug 2025"
                                    placeholderTextColor={colors.textMuted}
                                    value={endDate}
                                    onChangeText={setEndDate}
                                />
                            </View>
                        </View>

                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="What did you work on? Mention tools, impact, and results."
                            placeholderTextColor={colors.textMuted}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={5}
                            textAlignVertical="top"
                        />

                        <TouchableOpacity
                            style={styles.saveButton}
                            activeOpacity={0.85}
                            onPress={handleSave}
                            disabled={saving}
                        >
                            <Text style={styles.saveButtonText}>
                                {saving
                                    ? "Saving..."
                                    : isEditing
                                        ? "Save Changes"
                                        : "Save Experience"}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton} activeOpacity={0.7} onPress={() => router.back()}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

export default AddWorkExperience

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
    textArea: {
        minHeight: 110,
        paddingTop: 12,
    },
    dateRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    dateField: {
        flex: 1,
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
    cancelButton: {
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    cancelButtonText: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
})
