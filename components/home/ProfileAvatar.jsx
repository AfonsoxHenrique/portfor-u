import { useMemo } from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";

const getInitials = (name = "") =>
    name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

export default function ProfileAvatar({
    photoURL,
    name,
    size = 48,
    onPress,
    showBadge = true,
    badgeBorderColor, 
}) {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors, size), [colors, size]);
    const initials = getInitials(name);

    return (
        <Pressable
            onPress={onPress}
            hitSlop={6}
            accessibilityRole="button"
            accessibilityLabel="Open your profile"
            style={({ pressed }) => [styles.wrapper, pressed && { transform: [{ scale: 0.95 }] }]}
        >
            <View style={styles.avatar}>
                {photoURL ? (
                    <Image source={{ uri: photoURL }} style={styles.image} />
                ) : initials ? (
                    <Text style={styles.initials}>{initials}</Text>
                ) : (
                    <Ionicons name="person-outline" size={size * 0.45} color={colors.navy} />
                )}
            </View>

            {showBadge && (
                <View style={[styles.badge, { borderColor: badgeBorderColor ?? colors.surface }]}>
                    <Ionicons name="pencil" size={size * 0.2} color={colors.white} />
                </View>
            )}
        </Pressable>
    );
}

const createStyles = (colors, size) => {
    const badgeSize = Math.round(size * 0.42);

    return StyleSheet.create({
        wrapper: {
            width: size,
            height: size,
        },
        avatar: {
            width: size,
            height: size,
            borderRadius: size * 0.3,
            backgroundColor: colors.surface,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            shadowColor: "#000",
            shadowOpacity: 0.12,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
            elevation: 3,
        },
        image: {
            width: "100%",
            height: "100%",
        },
        initials: {
            fontSize: size * 0.36,
            fontWeight: "800",
            color: colors.navy,
        },
        badge: {
            position: "absolute",
            right: -badgeSize * 0.3,
            bottom: -badgeSize * 0.3,
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize / 2,
            backgroundColor: colors.navy,
            borderWidth: 2,
            alignItems: "center",
            justifyContent: "center",
        },
    });
};