
import { useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../theme/ThemeContext";
import ScreenHeader from "../../../components/ScreenHeader";
import EducationList from "../../../components/education/EducationList";

export default function Education() {
    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const [educationCount, setEducationCount] = useState(0);
    return (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <ScreenHeader
                title="Education"
                subtitle={`${educationCount} EDUCATION ${educationCount === 1 ? "ENTRY" : "ENTRIES"}`}
                bg={colors.successTint}
                subtitleColor={colors.success}
            />

            <View style={styles.content}>
                <EducationList onCountChange={setEducationCount} />
            </View>
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
    },
});
