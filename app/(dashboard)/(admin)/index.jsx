
import { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import { collection, onSnapshot } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

import { db } from "../../../firebase/firebase";
import { useTheme } from "../../../theme/ThemeContext";

import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function AdminDashboard() {
    const { colors, spacing, radius } = useTheme();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const usersRef = collection(db, "users");

        const unsubscribe = onSnapshot(
            usersRef,
            (snapshot) => {
                const userList = snapshot.docs.map((item) => ({
                    id: item.id,
                    ...item.data(),
                }));

                setUsers(userList);
                setLoading(false);
                setError(false);
            },
            (err) => {
                console.error("Admin users error:", err);
                setError(true);
                setLoading(false);
            }
        );

        return unsubscribe;
    }, []);

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
            padding: spacing.lg,
        },
        title: {
            fontSize: 25,
            fontWeight: "800",
            color: colors.textPrimary,
        },
        subtitle: {
            fontSize: 14,
            color: colors.textSecondary,
            marginTop: spacing.xs,
            marginBottom: spacing.lg,
        },
        count: {
            fontSize: 16,
            fontWeight: "700",
            color: colors.textPrimary,
            marginBottom: spacing.md,
        },
        card: {
            backgroundColor: colors.surface,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: colors.border,
            padding: spacing.md,
            marginBottom: spacing.sm,
            flexDirection: "row",
            alignItems: "center",
        },
        iconContainer: {
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: colors.background,
            alignItems: "center",
            justifyContent: "center",
            marginRight: spacing.md,
        },
        name: {
            fontSize: 15,
            fontWeight: "700",
            color: colors.textPrimary,
        },
        email: {
            fontSize: 13,
            color: colors.textSecondary,
            marginTop: 3,
        },
        role: {
            fontSize: 11,
            color: colors.textSecondary,
            marginTop: 4,
            textTransform: "uppercase",
        },
        message: {
            color: colors.textSecondary,
            textAlign: "center",
            marginTop: spacing.xl,
        },
    });

    const renderUser = ({ item }) => {
        const fullName =
            `${item.firstName || ""} ${item.lastName || ""}`.trim();

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.7}
                onPress={() =>
                    router.push({
                        pathname: "/(dashboard)/(admin)/user-details",
                        params: { userId: item.id },
                    })
                }
            >

                <View style={{ flex: 1 }}>
                    <Text style={styles.name}>
                        {fullName || "Unnamed User"}
                    </Text>

                    <Text style={styles.email}>
                        {item.email || "No email available"}
                    </Text>

                    <Text style={styles.role}>
                        {item.role || "user"}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Admin Dashboard</Text>

            <Text style={styles.subtitle}>
                Manage registered users and their profiles.
            </Text>

            <Text style={styles.count}>
                Registered Users: {users.length}
            </Text>

            {loading ? (
                <ActivityIndicator size="large" color={colors.accentBlue} />
            ) : error ? (
                <Text style={styles.message}>
                    Could not load users. Please check your permissions.
                </Text>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => item.id}
                    renderItem={renderUser}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <Text style={styles.message}>
                            No registered users found.
                        </Text>
                    }
                />
            )}
        </View>
    );
}
