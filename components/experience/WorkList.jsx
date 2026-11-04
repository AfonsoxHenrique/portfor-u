import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";

import { db } from "../../firebase/firebase";
import { useTheme } from "../../theme/ThemeContext";
import { useAuthUser } from "../../hooks/useAuthUser";
import ExperienceCard from "../ExperienceCard";

export default function WorkList({ onCountChange }) {
    const router = useRouter();
    const { colors, spacing, radius } = useTheme();
    const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius]);

    const { user, initializing } = useAuthUser();
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (initializing) return;

        if (!user) {
            setExperiences([]);
            setLoading(false);
            return;
        }

        const experiencesRef = collection(db, "users", user.uid, "workExperience");

        const unsubscribe = onSnapshot(
            experiencesRef,
            (snapshot) => {
                const items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));

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
    }, [user, initializing]);

    useEffect(() => {
        onCountChange?.(experiences.length);
    }, [experiences.length]);

    const handleEdit = (id) => {
        router.push({ pathname: "/add-work-experience", params: { id } });
    };

    const handleDelete = (id) => {
        Alert.alert(
            "Delete Experience",
            "Are you sure you want to delete this work experience?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        if (!user) {
                            Alert.alert("Error", "Please log in first.");
                            return;
                        }
                        try {
                            await deleteDoc(doc(db, "users", user.uid, "workExperience", id));
                        } catch (error) {
                            console.error("Error deleting experience:", error);
                            Alert.alert("Error", "Could not delete this experience.");
                        }
                    },
                },
            ]
        );
    };

    const handleAdd = () => router.push("/add-work-experience");

    return (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {loading ? (
                <Text style={styles.message}>Loading experiences...</Text>
            ) : experiences.length === 0 ? (
                <Text style={styles.message}>
                    No work experience added yet. Tap below to add your first entry.
                </Text>
            ) : (
                experiences.map((exp) => (
                    <ExperienceCard
                        key={exp.id}
                        title={exp.jobTitle}
                        company={exp.company}
                        dateRange={`${exp.startDate || "Start date not specified"} - ${
                            exp.currentlyWorkHere ? "Present" : exp.endDate || "End date not specified"
                        }`}
                        location={exp.location}
                        description={exp.description || "No description provided."}
                        onEdit={() => handleEdit(exp.id)}
                        onDelete={() => handleDelete(exp.id)}
                    />
                ))
            )}

            <TouchableOpacity style={styles.addButton} activeOpacity={0.7} onPress={handleAdd}>
                <Ionicons name="add" size={20} color={colors.success} />
                <Text style={styles.addButtonText}>Add New Experience</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const createStyles = (colors, spacing, radius) => StyleSheet.create({
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xl,
    },
    message: {
        fontSize: 13,
        color: colors.textSecondary,
        textAlign: "center",
        marginVertical: spacing.lg,
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.xs,
        borderWidth: 1.5,
        borderColor: colors.success,
        borderStyle: "dashed",
        borderRadius: radius.md,
        paddingVertical: spacing.md,
    },
    addButtonText: {
        fontSize: 14,
        fontWeight: "700",
        color: colors.success,
    },
});