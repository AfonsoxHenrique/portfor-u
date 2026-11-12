
import { useEffect, useMemo, useState } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";

import { db } from "../../firebase/firebase";
import { useTheme } from "../../theme/ThemeContext";
import { useAuthUser } from "../../hooks/useAuthUser";
import { republishIfVisible } from "../../services/publicProfile";
import EducationCard from "../EducationCard";

export default function EducationList({ onCountChange }) {
    const router = useRouter();
    const { colors, spacing, radius } = useTheme();

    const styles = useMemo(
        () => createStyles(colors, spacing, radius),
        [colors, spacing, radius]
    );

    const { user, initializing } = useAuthUser();
    const [education, setEducation] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (initializing) return;

        if (!user) {
            setEducation([]);
            onCountChange?.(0);
            setLoading(false);
            return;
        }       

        const educationRef = collection(
            db,
            "users",
            user.uid,
            "education"
        );

        const unsubscribe = onSnapshot(
            educationRef,
            (snapshot) => {
                const items = snapshot.docs.map((item) => ({
                    id: item.id,
                    ...item.data(),
                }));

                items.sort((a, b) =>
                    (b.startDate || "").localeCompare(a.startDate || "")
                );

                setEducation(items);
                onCountChange?.(items.length);
                setLoading(false);
            },
            (error) => {
                console.error("Error loading education:", error);
                Alert.alert("Error", "Could not load education.");
                setLoading(false);
            }
        );

        return unsubscribe;
    }, [user, initializing]);

    const handleEdit = (id) => {
        router.push({
            pathname: "/add-education",
            params: { id },
        });
    };

    const handleDelete = (id) => {
        Alert.alert(
            "Delete Education",
            "Are you sure you want to delete this education entry?",
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
                            await deleteDoc(
                                doc(db, "users", user.uid, "education", id)
                            );
                            republishIfVisible();
                        } catch (error) {
                            console.error("Error deleting education:", error);
                            Alert.alert("Error", "Could not delete education.");
                        }
                    },
                },
            ]
        );
    };

    const handleAdd = () => router.push("/add-education");

    return (
        <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {loading ? (
                <Text style={styles.message}>Loading education...</Text>
            ) : education.length === 0 ? (
                <Text style={styles.message}>
                    No education added yet. Tap below to add your first entry.
                </Text>
            ) : (
                education.map((item) => (
                    <EducationCard
                        key={item.id}
                        title={item.qualification}
                        institution={item.institution}
                        dateRange={`${item.startDate || "Start date not specified"} - ${
                            item.currentlyStudying
                                ? "Present"
                                : item.endDate || "End date not specified"
                        }`}
                        fieldOfStudy={item.fieldOfStudy}
                        description={item.description || "No description provided."}
                        onEdit={() => handleEdit(item.id)}
                        onDelete={() => handleDelete(item.id)}
                    />
                ))
            )}

            <TouchableOpacity
                style={styles.addButton}
                activeOpacity={0.7}
                onPress={handleAdd}
            >
                <Ionicons name="add" size={20} color={colors.success} />
                <Text style={styles.addButtonText}>Add Education</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const createStyles = (colors, spacing, radius) =>
    StyleSheet.create({
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
