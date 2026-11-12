
import { useEffect, useMemo, useState } from "react";
import {
    StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView,
    Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    addDoc, collection, doc, getDoc, updateDoc, serverTimestamp,
} from "firebase/firestore";

import { republishIfVisible } from "../../../services/publicProfile";
import { auth, db } from "../../../firebase/firebase";
import { useTheme } from "../../../theme/ThemeContext";
import ScreenHeader from "../../../components/ScreenHeader";
import MonthYearField from "../../../components/MonthYearField";
import CheckboxRow from "../../../components/CheckboxRow";

const AddEducation = () => {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const isEditing = !!id;

    const { colors, spacing, radius } = useTheme();
    const styles = useMemo(
        () => createStyles(colors, spacing, radius),
        [colors, spacing, radius]
    );

    const [institution, setInstitution] = useState("");
    const [qualification, setQualification] = useState("");
    const [fieldOfStudy, setFieldOfStudy] = useState("");
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [description, setDescription] = useState("");
    const [currentlyStudying, setCurrentlyStudying] = useState(false);

    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);

    const educationRef = (uid) =>
        doc(db, "users", uid, "education", String(id));

    useEffect(() => {
        if (!isEditing) return;

        const loadEducation = async () => {
            try {
                const user = auth.currentUser;

                if (!user) {
                    Alert.alert("Error", "Please log in first.");
                    return;
                }

                const snapshot = await getDoc(educationRef(user.uid));

                if (!snapshot.exists()) {
                    Alert.alert("Error", "Education not found.");
                    router.back();
                    return;
                }

                const data = snapshot.data();

                setInstitution(data.institution || "");
                setQualification(data.qualification || "");
                setFieldOfStudy(data.fieldOfStudy || "");
                setStartDate(data.startDate ?? null);
                setEndDate(data.endDate ?? null);
                setDescription(data.description || "");
                setCurrentlyStudying(!!data.currentlyStudying);

            } catch (error) {
                console.error("Error loading education:", error);
                Alert.alert("Error", "Could not load this education entry.");
            } finally {
                setLoading(false);
            }
        };

        loadEducation();
    }, [id]);

    const handleDelete = () => {
        Alert.alert(
            "Delete education",
            "Are you sure you want to delete this education entry?",
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
                            await deleteDoc(educationRef(user.uid));
                            republishIfVisible();
                            router.back();
                        } catch (error) {
                            console.error("Delete error:", error);
                            Alert.alert("Error", "Could not delete this education entry.");
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

        if (!institution.trim() || !qualification.trim()) {
            Alert.alert(
                "Missing information",
                "Please enter at least an institution and qualification."
            );
            return;
        }

        if (startDate && !currentlyStudying && !endDate) {
            Alert.alert(
                "Missing end date",
                'Add an end date, or tick "I am currently studying here".'
            );
            return;
        }

        if (startDate && endDate && !currentlyStudying && endDate < startDate) {
            Alert.alert("Check your dates", "The end date can't be before the start date.");
            return;
        }

        setSaving(true);

        try {
            const educationData = {
                institution: institution.trim(),
                qualification: qualification.trim(),
                fieldOfStudy: fieldOfStudy.trim(),
                startDate: startDate ?? null,
                endDate: currentlyStudying ? null : endDate ?? null,
                currentlyStudying,
                description: description.trim(),
                updatedAt: serverTimestamp(),
            };

            if (isEditing) {
                await updateDoc(educationRef(user.uid), educationData);
            } else {
                await addDoc(
                    collection(db, "users", user.uid, "education"),
                    {
                        ...educationData,
                        createdAt: serverTimestamp(),
                    }
                );
            }

            republishIfVisible();
            router.back();

        } catch (error) {
            console.error("Error saving education:", error);
            Alert.alert("Error", "Could not save the education entry.");
        } finally {
            setSaving(false);
        }
    };

    const header = (
        <ScreenHeader
            title={isEditing ? "Edit Education" : "Add Education"}
            subtitle={isEditing ? "UPDATE YOUR EDUCATION" : "BUILD YOUR EDUCATION HISTORY"}
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
                    <Text style={styles.label}>Institution</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. La Trobe University"
                        placeholderTextColor={colors.textMuted}
                        value={institution}
                        onChangeText={setInstitution}
                    />

                    <Text style={styles.label}>Qualification</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Bachelor of Information Technology"
                        placeholderTextColor={colors.textMuted}
                        value={qualification}
                        onChangeText={setQualification}
                    />

                    <Text style={styles.label}>Field of study</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g. Software Development"
                        placeholderTextColor={colors.textMuted}
                        value={fieldOfStudy}
                        onChangeText={setFieldOfStudy}
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
                                disabled={currentlyStudying}
                                fieldStyle={styles.dateField}
                            />
                        </View>
                    </View>

                    <CheckboxRow
                        label="I am currently studying here"
                        checked={currentlyStudying}
                        onToggle={() => setCurrentlyStudying((prev) => !prev)}
                    />

                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe your studies, achievements or relevant subjects..."
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
                                {isEditing ? "Save Changes" : "Save Education"}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {isEditing && (
                        <TouchableOpacity
                            style={styles.deleteButton}
                            activeOpacity={0.7}
                            onPress={handleDelete}
                        >
                            <Text style={styles.deleteButtonText}>
                                Delete education
                            </Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default AddEducation;

const createStyles = (colors, spacing, radius) =>
    StyleSheet.create({
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
