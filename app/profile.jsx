import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../theme/colors";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import SectionGroup from "../components/SectionGroup";
import SettingsRow from "../components/SettingsRow";
import BottomTabBar from "../components/BottomTabBar";

// Replace with firebase data.
const MOCK_USER = {
    fullName: 'Joon Chonlatorn',
    email: '14929@ait.nsw.edu.au',
}

const Profile = () => {
    const router = useRouter()

    const handleLogout = () => {
        // Auth Signout and route back to welcome
        router.replace('/')
    }

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={styles.avatarBlock}>
                        <View style={styles.avatar} />
                        <Text style={styles.name}>{MOCK_USER.fullName}</Text>
                        <Text style={styles.email}>{MOCK_USER.email}</Text>
                    </View>

                    <SectionGroup title="ACCOUNT SETTINGS">
                        <SettingsRow
                            icon="person-outline"
                            title="Edit Profile"
                            onPress={() => router.push('/edit-profile')}
                            showDivider
                        />
                        <SettingsRow
                            icon="key-outline"
                            title="Change Password"
                            onPress={() => router.push('/change-password')}
                        />
                    </SectionGroup>

                    <SectionGroup title="PREFERENCES">
                        <SettingsRow
                            icon="notifications-outline"
                            title="Notification Settings"
                            subtitle="Push alerts"
                            onPress={() => router.push('/notifications')}
                            showDivider
                        />
                        <SettingsRow
                            icon="download-outline"
                            title="Import Data"
                            subtitle="PDF / JPEG"
                            onPress={() => router.push('/import-data')}
                        />
                    </SectionGroup>

                    <SectionGroup title="PRIVACY">
                        <SettingsRow
                            icon="eye-outline"
                            title="Portfolio Visibility"
                            subtitle="Public sharing is on"
                            onPress={() => router.push('/portfolio-visibility')}
                        />
                    </SectionGroup>

                    <View style={styles.dangerGroup}>
                        <SettingsRow
                            icon="trash-outline"
                            title="Delete Graduate Account"
                            onPress={() => router.push('/delete-account')}
                            danger
                        />
                    </View>

                    <TouchableOpacity style={styles.logoutButton} activeOpacity={0.85} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={18} color={colors.red} />
                        <Text style={styles.logoutText}>Log out account</Text>
                    </TouchableOpacity>
                </ScrollView>

                <BottomTabBar activeTab="profile" />
            </SafeAreaView>
        </SafeAreaProvider>
    )
}

export default Profile

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scroll: {
        flex: 1,
    },
    content: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.lg,
    },
    avatarBlock: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: colors.lightBlueTint,
        borderWidth: 2,
        borderColor: colors.accentBlue,
        marginBottom: spacing.md,
    },
    name: {
        fontSize: 19,
        fontWeight: '800',
        color: colors.textPrimary,
    },
    email: {
        fontSize: 13,
        color: colors.textMuted,
        marginTop: 2,
    },
    dangerGroup: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        overflow: 'hidden',
        marginBottom: spacing.lg,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        borderWidth: 1.5,
        borderColor: colors.red,
        backgroundColor: colors.redTint,
        borderRadius: radius.md,
        paddingVertical: 14,
    },
    logoutText: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.red,
    },
})
