import { useMemo, useState } from "react";
import { View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "../../../theme/ThemeContext";
import ScreenHeader from "../../../components/ScreenHeader";
import SegmentedToggle from "../../../components/SegmentedToggle";
import WorkList from "../../../components/experience/WorkList";
import ProjectsList from "../../../components/experience/ProjectsList";

const OPTIONS = [
    { label: "Work", value: "work" },
    { label: "Projects", value: "projects" },
];

export default function Experience() {
    const router = useRouter();
    const { view } = useLocalSearchParams();
    const current = view === "projects" ? "projects" : "work";

    const { colors } = useTheme();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [counts, setCounts] = useState({ work: 0, projects: 0 });

    const subtitle =
        current === "work"
            ? `${counts.work} ${counts.work === 1 ? "ENTRY" : "ENTRIES"} RECORDED`
            : `${counts.projects} ${counts.projects === 1 ? "PROJECT" : "PROJECTS"} ADDED`;

    return (
        <SafeAreaView style={styles.safeArea} edges={["top"]}>
            <ScreenHeader
                title="Experience"
                subtitle={subtitle}
                bg={colors.successTint}
                subtitleColor={colors.success}
            />

            <SegmentedToggle
                options={OPTIONS}
                value={current}
                onChange={(v) => router.setParams({ view: v })}
                activeColor={colors.success}
            />

            <View style={styles.content}>
                {current === "work" ? (
                    <WorkList onCountChange={(n) => setCounts((c) => ({ ...c, work: n }))} />
                ) : (
                    <ProjectsList onCountChange={(n) => setCounts((c) => ({ ...c, projects: n }))} />
                )}
            </View>
        </SafeAreaView>
    );
}

const createStyles = (colors) => StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1 },
});