import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "../theme/colors";

const CircularProgress = ({ percent = 0, size = 170, strokeWidth = 14, color = colors.purple, label }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const dashOffset = circumference - (circumference * Math.max(0, Math.min(100, percent))) / 100

    return (
        <View style={[styles.wrapper, { width: size, height: size }]}>
            <Svg width={size} height={size}>
                <Circle
                    stroke={colors.border}
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                />
                <Circle
                    stroke={color}
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${circumference}, ${circumference}`}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    rotation="-90"
                    originX={size / 2}
                    originY={size / 2}
                />
            </Svg>
            <View style={styles.centerLabel}>
                <Text style={styles.percentText}>{percent}%</Text>
                {!!label && <Text style={styles.labelText}>{label}</Text>}
            </View>
        </View>
    )
}

export default CircularProgress

const styles = StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
    },
    centerLabel: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    percentText: {
        fontSize: 32,
        fontWeight: '800',
        color: colors.textPrimary,
    },
    labelText: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 1,
        marginTop: 2,
    },
})
