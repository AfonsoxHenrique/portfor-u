import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { colors, spacing, radius } from "../theme/colors";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const SignUp = () => {
    const router = useRouter()
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const handleSignUp = () => {
        // For Firebase sign up
        // if (!firstName || !lastName || !email || password.length < 8 || password !== confirmPassword) return
        router.push('/home')
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join Portfor-U and get career ready today.</Text>

                    <Text style={styles.label}>First Name</Text>
                    <TextInput
                        placeholder="e.g. Alex"
                        placeholderTextColor={colors.textMuted}
                        style={styles.input}
                        value={firstName}
                        onChangeText={setFirstName}
                    />

                    <Text style={styles.label}>Last Name</Text>
                    <TextInput
                        placeholder="e.g. Mary"
                        placeholderTextColor={colors.textMuted}
                        style={styles.input}
                        value={lastName}
                        onChangeText={setLastName}
                    />

                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        placeholder="e.g. Gmail@gmail.com"
                        placeholderTextColor={colors.textMuted}
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        placeholder="Minimum 8 characters"
                        placeholderTextColor={colors.textMuted}
                        secureTextEntry
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                    />

                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput
                        placeholder="Repeat password"
                        placeholderTextColor={colors.textMuted}
                        secureTextEntry
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />

                    <TouchableOpacity style={styles.button} activeOpacity={0.85} onPress={handleSignUp}>
                        <Text style={styles.buttonText}>Sign Up</Text>
                    </TouchableOpacity>

                    <View style={styles.toggleRow}>
                        <Text style={styles.toggleText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => router.push("login")}>
                            <Text style={styles.toggleLink}>Sign In</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

export default SignUp

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
        paddingBottom: spacing.xl,
    },
    title: {
        fontSize: 26,
        fontWeight: "800",
        color: colors.textPrimary,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: spacing.xs,
        marginBottom: spacing.lg,
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
        backgroundColor: colors.background,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        fontSize: 15,
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    button: {
        backgroundColor: colors.navy,
        borderRadius: radius.md,
        paddingVertical: 14,
        alignItems: "center",
        marginTop: spacing.xs,
    },
    buttonText: {
        color: colors.white,
        fontSize: 15,
        fontWeight: "700",
    },
    toggleRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: spacing.lg,
    },
    toggleText: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    toggleLink: {
        fontSize: 13,
        color: colors.accentBlue,
        fontWeight: "700",
    },
})
