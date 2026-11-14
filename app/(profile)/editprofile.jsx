import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator, Alert, ScrollView, Image, StyleSheet, Text, TextInput,
    TouchableOpacity, View, KeyboardAvoidingView, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { updateProfile, verifyBeforeUpdateEmail } from "firebase/auth";
import * as ImagePicker from "expo-image-picker";

import { auth, db } from "../../firebase/firebase";
import { useTheme } from "../../theme/ThemeContext";
import ScreenHeader from "../../components/ScreenHeader";
import { uploadFile, deleteFile } from "../../services/storage";
import { republishIfVisible } from "../../services/publicProfile";
import { normalizeUrl } from "../../utils/links";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const HEADLINE_MAX = 80;
const BIO_MAX = 500;

// Outside the component so inputs don't lose focus while typing
const Field = ({ label, hint, styles, colors, multiline, ...inputProps }) => (
    <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={[styles.input, multiline && styles.textArea]}
            placeholderTextColor={colors.textMuted}
            multiline={multiline}
            textAlignVertical={multiline ? "top" : "center"}
            {...inputProps}
        />
        {!!hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
);

const EditProfile = () => {
    const router = useRouter();
    const { colors, spacing, radius } = useTheme();
    const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [selectedImage, setSelectedImage] = useState(null);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [photoPath, setPhotoPath] = useState(null);

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [originalEmail, setOriginalEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    const [headline, setHeadline] = useState("");
    const [bio, setBio] = useState("");
    const [linkedin, setLinkedin] = useState("");
    const [portfolio, setPortfolio] = useState("");

    useEffect(() => {
        const loadProfile = async () => {
            const user = auth.currentUser;
            if (!user) {
                setLoading(false);
                router.replace("/login");
                return;
            }

            try {
                const snapshot = await getDoc(doc(db, "users", user.uid));
                const data = snapshot.exists() ? snapshot.data() : {};

                setFullName(
                    data.fullName ||
                    [data.firstName, data.lastName].filter(Boolean).join(" ") ||
                    user.displayName ||
                    ""
                );
                setEmail(user.email || data.email || "");
                setOriginalEmail(user.email || "");
                setPhone(data.phone || "");
                setLocation(data.location || "");
                setHeadline(data.headline || "");
                setBio(data.bio || "");
                setLinkedin(data.linkedin || "");
                setPortfolio(data.portfolio || "");
                setProfilePhoto(data.photoURL || user.photoURL || null);
                setPhotoPath(data.photoPath || null);
            } catch (error) {
                console.error("Load profile error:", error);
                Alert.alert("Error", "Could not load your profile.");
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handleChoosePhoto = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (result.canceled) return;

        const photo = result.assets[0];
        if (photo.fileSize && photo.fileSize > MAX_PHOTO_BYTES) {
            Alert.alert("File too large", "Please choose an image smaller than 5 MB.");
            return;
        }
        setSelectedImage(photo);
    };

    const handleSave = async () => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert("Sign in required", "Please sign in again.");
            return;
        }

        const trimmedName = fullName.trim();
        const trimmedEmail = email.trim().toLowerCase();

        if (!trimmedName) {
            Alert.alert("Missing name", "Please enter your full name.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            Alert.alert("Invalid email", "Please enter a valid email address.");
            return;
        }

        const [firstName, ...rest] = trimmedName.split(/\s+/);
        const lastName = rest.join(" ");
        const emailChanged = trimmedEmail !== originalEmail.toLowerCase();

        setSaving(true);

        try {
            //New photo: upload with a unique name so the old one isn't cached
            let newPhotoURL = profilePhoto;
            let newPhotoPath = photoPath;

            if (selectedImage) {
                const uploaded = await uploadFile(
                    selectedImage.uri,
                    `users/${user.uid}/profile/avatar_${Date.now()}.jpg`,
                    "image/jpeg"
                );
                newPhotoURL = uploaded.url;
                newPhotoPath = uploaded.path;
            }

            //Auth profile (name + photo)
            await updateProfile(user, { displayName: trimmedName, photoURL: newPhotoURL });

            //Firestore profile. Email stays as-is until the new one is verified
            await setDoc(
                doc(db, "users", user.uid),
                {
                    fullName: trimmedName,
                    firstName,
                    lastName,
                    photoURL: newPhotoURL ?? null,
                    photoPath: newPhotoPath ?? null,
                    phone: phone.trim(),
                    location: location.trim(),
                    headline: headline.trim(),
                    bio: bio.trim(),
                    linkedin: normalizeUrl(linkedin),
                    portfolio: normalizeUrl(portfolio),
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            );

            //Remove the old photo now that the new one is saved
            if (selectedImage && photoPath && photoPath !== newPhotoPath) {
                deleteFile(photoPath).catch(() => {});
            }

            setProfilePhoto(newPhotoURL);
            setPhotoPath(newPhotoPath);
            setSelectedImage(null);

            //Email change: send a verification link to the new address
            if (emailChanged) {
                await verifyBeforeUpdateEmail(user, trimmedEmail);
                Alert.alert(
                    "Check your new email",
                    `We've sent a link to ${trimmedEmail}. Your email will change once you tap it. Your other changes are saved.`
                );
            } else {
                Alert.alert("Saved", "Your profile has been updated.");
            }

            republishIfVisible(); // keep the public portfolio up to date
        } catch (error) {
            console.error("Save profile error:", error);

            if (error.code === "auth/requires-recent-login") {
                Alert.alert(
                    "Sign in again",
                    "For security, please sign out and back in before changing your email. Your other changes were saved."
                );
            } else if (error.code === "auth/email-already-in-use") {
                Alert.alert("Email unavailable", "That email is already used by another account.");
            } else if (error.code === "auth/invalid-email") {
                Alert.alert("Invalid email", "Please enter a valid email address.");
            } else {
                Alert.alert("Update failed", "Could not save your profile. Please try again.");
            }
        } finally {
            setSaving(false);
        }
    };

    const header = (
        <ScreenHeader
            title="Edit Profile"
            subtitle="YOUR ACCOUNT DETAILS"
            bg={colors.lightBlueTint}
            subtitleColor={colors.accentBlue}
        />
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea} edges={["top"]}>
                {header}
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.accentBlue} />
                </View>
            </SafeAreaView>
        );
    }

    const avatarUri = selectedImage?.uri || profilePhoto;

    return (
        <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
            {header}

            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <ScrollView
                    style={styles.flex}
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Photo */}
                    <View style={styles.card}>
                        <TouchableOpacity
                            style={styles.avatarContainer}
                            activeOpacity={0.7}
                            onPress={handleChoosePhoto}
                            accessibilityLabel="Change profile photo"
                        >
                            <View style={styles.avatar}>
                                {avatarUri ? (
                                    <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                                ) : (
                                    <Ionicons name="person-outline" size={40} color={colors.accentBlue} />
                                )}
                            </View>
                            <View style={styles.cameraButton}>
                                <Ionicons name="camera" size={16} color={colors.white} />
                            </View>
                        </TouchableOpacity>

                        <Text style={styles.photoAction}>
                            {selectedImage ? "New photo selected. Save to apply." : "Change profile photo"}
                        </Text>
                        <Text style={styles.photoHint}>PNG or JPEG · Max 5 MB</Text>
                    </View>

                    {/* Account */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Account</Text>

                        <Field
                            label="Full name"
                            styles={styles}
                            colors={colors}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder="Enter your full name"
                            autoCapitalize="words"
                            autoComplete="name"
                        />
                        <Field
                            label="Email address"
                            styles={styles}
                            colors={colors}
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email address"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="email"
                            hint="Changing this sends a confirmation link to the new address."
                        />
                        <Field
                            label="Phone number"
                            styles={styles}
                            colors={colors}
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="+61 400 000 000"
                            keyboardType="phone-pad"
                            autoComplete="tel"
                            hint="Private. Never shown on your public portfolio."
                        />
                    </View>

                    {/* Public profile info */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Shown on your portfolio</Text>

                        <Field
                            label={`Professional headline (${headline.length}/${HEADLINE_MAX})`}
                            styles={styles}
                            colors={colors}
                            value={headline}
                            onChangeText={setHeadline}
                            placeholder="e.g. IT student · Aspiring UX developer"
                            maxLength={HEADLINE_MAX}
                        />
                        <Field
                            label="Location"
                            styles={styles}
                            colors={colors}
                            value={location}
                            onChangeText={setLocation}
                            placeholder="e.g. Melbourne, Australia"
                        />
                        <Field
                            label={`About me (${bio.length}/${BIO_MAX})`}
                            styles={styles}
                            colors={colors}
                            value={bio}
                            onChangeText={setBio}
                            placeholder="A few sentences about who you are and what you're looking for…"
                            maxLength={BIO_MAX}
                            multiline
                        />
                        <Field
                            label="LinkedIn profile"
                            styles={styles}
                            colors={colors}
                            value={linkedin}
                            onChangeText={setLinkedin}
                            placeholder="linkedin.com/in/yourprofile"
                            keyboardType="url"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <Field
                            label="Portfolio website"
                            styles={styles}
                            colors={colors}
                            value={portfolio}
                            onChangeText={setPortfolio}
                            placeholder="yourportfolio.com"
                            keyboardType="url"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.saveButton, saving && styles.disabledButton]}
                        onPress={handleSave}
                        disabled={saving}
                        activeOpacity={0.8}
                    >
                        {saving ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default EditProfile;

const createStyles = (colors, spacing, radius) => StyleSheet.create({
    flex: { flex: 1 },
    safeArea: { flex: 1, backgroundColor: colors.background },
    loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xl,
        gap: spacing.md,
    },
    card: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.lg,
        padding: spacing.md,
    },
    cardTitle: {
        fontSize: 14.5,
        fontWeight: "700",
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    avatarContainer: {
        alignSelf: "center",
        width: 96,
        height: 96,
        alignItems: "center",
        justifyContent: "center",
        marginTop: spacing.sm,
    },
    avatar: {
        width: 94,
        height: 94,
        borderRadius: 47,
        borderWidth: 2,
        borderColor: colors.accentBlue,
        backgroundColor: colors.lightBlueTint,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    avatarImage: { width: "100%", height: "100%" },
    cameraButton: {
        position: "absolute",
        right: -2,
        bottom: 0,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: colors.accentBlue,
        borderWidth: 2,
        borderColor: colors.surface,
        alignItems: "center",
        justifyContent: "center",
    },
    photoAction: {
        color: colors.accentBlue,
        fontSize: 14,
        fontWeight: "600",
        marginTop: spacing.sm,
        textAlign: "center",
    },
    photoHint: {
        color: colors.textMuted,
        fontSize: 12,
        marginTop: spacing.xs,
        marginBottom: spacing.xs,
        textAlign: "center",
    },
    field: { marginBottom: spacing.md },
    label: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: "600",
        marginBottom: spacing.xs,
    },
    input: {
        minHeight: 48,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        color: colors.textPrimary,
        fontSize: 14,
        backgroundColor: colors.background,
    },
    textArea: { minHeight: 110 },
    hint: { fontSize: 11.5, color: colors.textMuted, marginTop: 4 },
    saveButton: {
        minHeight: 54,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.navy,
        borderRadius: radius.md,
        marginTop: spacing.sm,
    },
    disabledButton: { opacity: 0.7 },
    saveButtonText: { color: colors.white, fontSize: 15, fontWeight: "700" },
});