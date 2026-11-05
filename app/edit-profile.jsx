
import {StyleSheet,Text,View,TextInput,TouchableOpacity,ScrollView, Alert,} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { colors, spacing, radius } from "../theme/colors";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../components/ScreenHeader";
import {doc,getDoc,updateDoc,setDoc,serverTimestamp,} from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { auth, db } from "../firebase/firebase";

const EditProfile = () => {
    const router = useRouter();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            const user = auth.currentUser;
            if (!user) {
                Alert.alert("Error", "Please log in first.");
                router.replace("/");
                return;
            }
            try {
                const userRef = doc(db, "users", user.uid);
                const snapshot = await getDoc(userRef);
                if (snapshot.exists()) {
                    const data = snapshot.data();
                    setFirstName(data.firstName || "");
                    setLastName(data.lastName || "");
                } else {
                    setFirstName("");
                    setLastName("");
                }

                setEmail(user.email || "");
            } catch (error) {
                console.error("Error loading profile:", error);
                Alert.alert("Error", "Could not load your profile.");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
        }, []);

    const handleSave = async () => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert("Error", "Please log in first.");
            return;
        }

        if (!firstName.trim() || !lastName.trim()) {
            Alert.alert(
                "Missing information",
                "Please enter your first name and last name."
            );
            return;
        }

        setSaving(true);

        try {
            const profileData = {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                fullName: `${firstName.trim()} ${lastName.trim()}`,
                updatedAt: serverTimestamp(),
            };

            const userRef = doc(db, "users", user.uid);
            const snapshot = await getDoc(userRef);

            if (snapshot.exists()) {
                await updateDoc(userRef, profileData);
            } else {
                await setDoc(userRef, profileData);
                        }

            await updateProfile(user, {
                displayName: `${firstName.trim()} ${lastName.trim()}`,
            });

            Alert.alert(
                "Success",
                "Your profile has been updated.",
                [{ text: "OK", onPress: () => router.back() }]
            );
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert(
                "Error",
                "Could not update your profile. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <ScreenHeader
                        title="Edit Profile"
                        subtitle="UPDATE YOUR INFORMATION"
                        bg={colors.lightBlueTint}
                        subtitleColor={colors.accentBlue}
                    />

                    <View style={styles.body}>
                        <View style={styles.intro}>
                            <Text style={styles.heading}>
                                Personal Information
                            </Text>
                            <Text style={styles.description}>
                                Keep your profile details up to date.
                            </Text>
                        </View>

                        {loading ? (
                            <Text style={styles.loadingText}>
                                Loading profile...
                            </Text>
                        ) : (
                            <>
                                <Text style={styles.label}>First Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your first name"
                                    placeholderTextColor={colors.textMuted}
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    autoCapitalize="words"
                                    editable={!saving}
                                />

                                <Text style={styles.label}>Last Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your last name"
                                    placeholderTextColor={colors.textMuted}
                                    value={lastName}
                                    onChangeText={setLastName}
                                    autoCapitalize="words"
                                    editable={!saving}
                                />

                                <Text style={styles.label}>Email Address</Text>
                                <TextInput
                                    style={[
                                        styles.input,
                                        styles.disabledInput,
                                    ]}
                                    value={email}
                                    editable={false}
                                    placeholder="Email address"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="email-address"
                                />

                                <Text style={styles.helperText}>
                                    Your email address cannot be changed here.
                                </Text>

                                <TouchableOpacity
                                    style={[
                                        styles.saveButton,
                                        saving && styles.disabledButton,
                                    ]}
                                    activeOpacity={0.85}
                                    onPress={handleSave}
                                    disabled={saving}
                                >
                                    <Text style={styles.saveButtonText}>
                                        {saving ? "Saving..." : "Save Changes"}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    activeOpacity={0.7}
                                    onPress={() => router.back()}
                                    disabled={saving}
                                >
                                    <Text style={styles.cancelButtonText}>
                                        Cancel
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default EditProfile;

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
    intro: {
        marginBottom: spacing.lg,
    },
    heading: {
        fontSize: 18,
        fontWeight: "800",
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    description: {
        fontSize: 14,
        lineHeight: 21,
        color: colors.textSecondary,
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
    disabledInput: {
        opacity: 0.7,
    },
    helperText: {
        fontSize: 12,
        color: colors.textMuted,
        marginTop: -spacing.sm,
        marginBottom: spacing.lg,
    },
    loadingText: {
        fontSize: 14,
        color: colors.textSecondary,
        paddingVertical: spacing.lg,
    },
    saveButton: {
        backgroundColor: colors.navy,
        borderRadius: radius.md,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: spacing.xs,
    },
    disabledButton: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: colors.white,
        fontSize: 15,
        fontWeight: "700",
    },
    cancelButton: {
        alignItems: "center",
        paddingVertical: spacing.md,
    },
    cancelButtonText: {
        color: colors.textSecondary,
        fontSize: 14,
        fontWeight: "600",
    },
});