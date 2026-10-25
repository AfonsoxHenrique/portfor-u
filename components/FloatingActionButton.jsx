import { StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing } from "../theme/colors";

const FloatingActionButton = ({ icon = 'add', onPress, color = colors.accentBlue }) => {
    return (
        <TouchableOpacity
            style={[styles.fab, { backgroundColor: color }]}
            activeOpacity={0.85}
            onPress={onPress}
        >
            <Ionicons name={icon} size={26} color={colors.white} />
        </TouchableOpacity>
    )
}

export default FloatingActionButton

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        right: spacing.lg,
        bottom: 90,
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 6,
    },
})
