import { useEffect, useMemo, useState } from "react";
import {
    StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert,
    ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    addDoc, collection, doc, getDoc, updateDoc, deleteDoc, serverTimestamp,
} from "firebase/firestore";

import { republishIfVisible } from "../../../services/publicProfile";
import { auth, db } from "../../../firebase/firebase";
import { useTheme } from "../../../theme/ThemeContext";
import ScreenHeader from "../../../components/ScreenHeader";
import MonthYearField from "../../../components/MonthYearField";
import CheckboxRow from "../../../components/CheckboxRow";
import SelectField from "../../../components/SelectField";

const WORK_ARRANGEMENTS = ["Remote", "Hybrid", "On-site"];

const AddWorkExperience = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const isEditing = !!id;

    const { colors, spacing, radius } = useTheme();
    const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius]);

    const [jobTitle, setJobTitle] = useState("");
    const [company, setCompany] = useState("");
    const [location, setLocation] = useState("");
    const [startDate, setStartDate] = useState(null); // "YYYY-MM" or null
    const [endDate, setEndDate] = useState(null);
    const [description, setDescription] = useState("");
    const [currentlyWorkHere, setCurrentlyWorkHere] = useState(false);
    const [workArrangement, setWorkArrangement] = useState("");

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);

    const experienceRef = (uid) => doc(db, "users", uid, "workExperience", String(id));

    useEffect(() => {
        if (!isEditing) return;

        const loadExperience = async () => {
            try {
                const user = auth.currentUser;
                if (!user) {
                    Alert.alert("Error", "Please log in first.");
                    return;
                }

                const snapshot = await getDoc(experienceRef(user.uid));

                if (!snapshot.exists()) {
                    Alert.alert("Error", "Experience not found.");
                    router.back();
                    return;
                }

                const data = snapshot.data();
                setJobTitle(data.jobTitle || "");
                setCompany(data.company || "");
                setLocation(data.location || "");
                setStartDate(data.startDate ?? null);
                setEndDate(data.endDate ?? null);
                setDescription(data.description || "");
                setCurrentlyWorkHere(!!data.currentlyWorkHere);
                setWorkArrangement(data.workArrangement || "");
            } catch (error) {
                console.error("Error loading experience:", error);
                Alert.alert("Error", "Could not load this experience.");
            } finally {
                setLoading(false);
            }
        };

        loadExperience();
    }, [id]);

    const handleDelete = () => {
        Alert.alert(
            "Delete experience",
            "Are you sure you want to delete this work experience?",
            [
                { text: "Cancel", style: "cancel" },
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
                            await deleteDoc(experienceRef(user.uid));
                            republishIfVisible();
                            router.back();
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
            Alert.alert("Missing information", "Please enter at least a job title and company.");
            return;
        }

        if (startDate && !currentlyWorkHere && !endDate) {
            Alert.alert("Missing end date", 'Add an end date, or tick "I currently work here".');
            return;
        }

        if (startDate && endDate && !currentlyWorkHere && endDate < startDate) {
            Alert.alert("Check your dates", "The end date can't be before the start date.");
            return;
        }

        setSaving(true);

        try {
            const experienceData = {
                jobTitle: jobTitle.trim(),
                company: company.trim(),
                location: location.trim(),
                startDate: startDate ?? null,
                endDate: currentlyWorkHere ? null : endDate ?? null,
                currentlyWorkHere,
                workArrangement,
                description: description.trim(),
                updatedAt: serverTimestamp(),
            };

            if (isEditing) {
                await updateDoc(experienceRef(user.uid), experienceData);
            } else {
                await addDoc(collection(db, "users", user.uid, "workExperience"), {
                    ...experienceData,
                    createdAt: serverTimestamp(),
                });
            }
            republishIfVisible();
            router.back();
        } catch (error) {
            console.error("Error saving experience:", error);
            Alert.alert("Error", "Could not save the work experience.");
        } finally {
            setSaving(false);
        }
    };

    const header = (
        <ScreenHeader
            title={isEditing ? "Edit Work Experience" : "Add Work Experience"}
            subtitle={isEditing ? "UPDATE YOUR EXPERIENCE" : "BUILD YOUR WORK HISTORY"}
            bg={colors.successTint}
            subtitleColor={colors.success}
        />
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {header}
                <View style={styles.center}>
                    <ActivityIndicator color={colors.success} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            {header}

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
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
                        <View style={styles.rowField}>
                            <MonthYearField
                                label="Start date"
                                value={startDate}
                                onChange={setStartDate}
                                fieldStyle={styles.dateField}
                            />
                        </View>
                        <View style={styles.rowField}>
                            <MonthYearField
                                label="End date"
                                value={endDate}
                                onChange={setEndDate}
                                disabled={currentlyWorkHere}
                                fieldStyle={styles.dateField}
                            />
                        </View>
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

                    <TouchableOpacity
                        style={[styles.saveButton, saving && styles.disabled]}
                        activeOpacity={0.85}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        {saving ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={styles.saveButtonText}>
                                {isEditing ? "Save Changes" : "Save Experience"}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {isEditing && (
                        <TouchableOpacity
                            style={styles.deleteButton}
                            activeOpacity={0.7}
                            onPress={handleDelete}
                        >
                            <Text style={styles.deleteButtonText}>Delete experience</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default AddWorkExperience;

const createStyles = (colors, spacing, radius) => StyleSheet.create({
    flex: { flex: 1 },
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.xl,
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
    dateField: {
        backgroundColor: colors.surface,
    },
    textArea: {
        minHeight: 110,
        paddingTop: 12,
    },
    row: {
        flexDirection: "row",
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
        alignItems: "center",
        marginTop: spacing.xs,
    },
    saveButtonText: {
        color: colors.white,
        fontSize: 15,
        fontWeight: "700",
    },
    disabled: {
        opacity: 0.6,
    },
    deleteButton: {
        backgroundColor: colors.redTint,
        borderRadius: radius.md,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: spacing.sm,
    },
    deleteButtonText: {
        color: colors.red,
        fontSize: 14,
        fontWeight: "700",
    },
});