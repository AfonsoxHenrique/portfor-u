import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { colors, spacing } from "../theme/colors";


const TABS = [
    { key: 'home', label: 'Home', icon: 'home', route: '/home' },
    { key: 'resume', label: 'Resume', icon: 'document-text-outline', route: '/resume' },
    { key: 'guidelines', label: 'Guidelines', icon: 'list-outline', route: '/guidelines' },
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
