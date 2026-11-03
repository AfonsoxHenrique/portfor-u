import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
    addDoc,
    collection,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "firebase/firestore";
import { auth, db } from "../../../firebase/firebase";

import { useTheme } from "../../../theme/ThemeContext";
import ScreenHeader from "../../../components/ScreenHeader";
import DateField from "../../../components/DateField";
import CheckboxRow from "../../../components/CheckboxRow";
import SelectField from "../../../components/SelectField";

const WORK_ARRANGEMENTS = ['Remote', 'Hybrid', 'On-site']

const AddWorkExperience = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const isEditing = !!id;

    const { colors, spacing, radius } = useTheme();
    const styles = createStyles(colors, spacing, radius);

    const [jobTitle, setJobTitle] = useState("");
    const [company, setCompany] = useState("");
    const [location, setLocation] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [description, setDescription] = useState("");
    const [currentlyWorkHere, setCurrentlyWorkHere] = useState(false);
    const [workArrangement, setWorkArrangement] = useState("");
   
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
                    setCurrentlyWorkHere(data.currentlyWorkHere || false);
                    setWorkArrangement(data.workArrangement || "");
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

        const handleDelete = () => {
        Alert.alert(
            "Delete experience",
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
                                    String(id)
                                )
                            );

                            Alert.alert("Deleted", "Work experience deleted successfully.", [
                                {
                                    text: "OK",
                                    onPress: () => router.back(),
                                },
                            ]);
                        } catch (error) {
                            console.error("Delete error:", error);
                            Alert.alert("Error", "Could not delete this experience.");
                        }
                    },
                },
            ]
        );
    };

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
                    endDate: currentlyWorkHere ? "" : endDate.trim(),
                    currentlyWorkHere,
                    workArrangement,
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
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <ScreenHeader
                        title={isEditing ? 'Edit Work Experience' : 'Add Work Experience'}
                        subtitle={isEditing ? 'UPDATE YOUR EXPERIENCE' : 'BUILD YOUR WORK HISTORY'}
                        bg={colors.successTint}
                        subtitleColor={colors.success}
                    />

                    <View style={styles.body}>
                        <Text style={styles.label}>Job title</Text>
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

                        <View style={styles.row}>
                            <DateField
                                label="Start date"
                                placeholder="Month, year"
                                value={startDate}
                                onChangeText={setStartDate}
                                style={styles.rowField}
                            />
                            <DateField
                                label="End date"
                                placeholder="Month, year"
                                value={endDate}
                                onChangeText={setEndDate}
                                style={styles.rowField}
                            />
                        </View>

                        <CheckboxRow
                            label="I currently work here"
                            checked={currentlyWorkHere}
                            onToggle={() => setCurrentlyWorkHere((prev) => !prev)}
                        />

                        <View style={styles.row}>
                            <View style={styles.rowField}>
                                <Text style={styles.label}>Location</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="City, state"
                                    placeholderTextColor={colors.textMuted}
                                    value={location}
                                    onChangeText={setLocation}
                                />
                            </View>
                            <SelectField
                                label="Work arrangement"
                                placeholder="Select"
                                value={workArrangement}
                                options={WORK_ARRANGEMENTS}
                                onSelect={setWorkArrangement}
                                style={styles.rowField}
                            />
                        </View>

                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Describe your responsibilities and key achievements..."
                            placeholderTextColor={colors.textMuted}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={5}
                            textAlignVertical="top"
                        />

                        <TouchableOpacity style={styles.saveButton} activeOpacity={0.85} onPress={handleSave} disabled={saving}>
                            <Text style={styles.saveButtonText}>
                                {saving ? 'Save...' : isEditing ? "Save Changes" : "Save Experience"}
                            </Text>
                        </TouchableOpacity>

                        {isEditing && (
                            <TouchableOpacity style={styles.deleteButton} activeOpacity={0.7} onPress={handleDelete}>
                                <Text style={styles.deleteButtonText}>Delete experience</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

export default AddWorkExperience

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
    textArea: {
        minHeight: 110,
        paddingTop: 12,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    rowField: {
        flex: 1,
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
    deleteButton: {
        backgroundColor: colors.redTint,
        borderRadius: radius.md,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    deleteButtonText: {
        color: colors.red,
        fontSize: 14,
        fontWeight: '700',
    },
})
