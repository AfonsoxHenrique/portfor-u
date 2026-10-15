import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors, spacing } from "../theme/colors";

// Visual stand-in for the mockup's bottom bar. If you move to an
// expo-router (tabs) group instead, delete this and let the Tabs layout
// render the bar for you.
const TABS = [
    { key: 'home', label: 'Home', icon: 'home', route: '/home' },
    { key: 'resumes', label: 'Resume', icon: 'document-text-outline', route: '/resume' },
    { key: 'guideline', label: 'Guideline', icon: 'locate-outline', route: '/guideline' },
    { key: 'profile', label: 'Profile', icon: 'person-outline', route: '/profile' },
]

const BottomTabBar = ({ activeTab = 'home' }) => {
    const router = useRouter()

    return (
        <View style={styles.bar}>
            {TABS.map((tab) => {
                const isActive = tab.key === activeTab
                return (
                    <TouchableOpacity
                        key={tab.key}
                        style={styles.tab}
                        activeOpacity={0.7}
                        onPress={() => router.push(tab.route)}
                    >
                        <Ionicons
                            name={isActive ? tab.icon.replace('-outline', '') : tab.icon}
                            size={22}
                            color={isActive ? colors.navy : colors.textMuted}
                        />
                        <Text style={[styles.label, isActive && { color: colors.navy, fontWeight: '700' }]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}

export default BottomTabBar

const styles = StyleSheet.create({
    bar: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.background,
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
    },
    label: {
        fontSize: 11,
        color: colors.textMuted,
        marginTop: 2,
    },
})
