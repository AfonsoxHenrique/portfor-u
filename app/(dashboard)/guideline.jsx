import { useState } from "react";
import {
    Alert,
    Linking,
    ScrollView,
    Text,
    View,
    TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import ScreenHeader from "../../components/ScreenHeader";

const sections = [
     {
        number:"01",
        title:"Clear Formatting",
        icon:"grid-outline",
        body:"Use a simple, clean layout with readable sans-serif fonts.",
    },
    {
        number:"02",
        title:"Quantify Achievements",
        icon:"trending-up-outline",
        body:"Include metrics (e.g.'Boosted user retention bu 24%')",
    },
    {
        number:"03",
        title:"Tailor to the Job",
        icon:"radio-button-on-outline",
        body:"Align your experice with keywords from the job post.",
    },
    {
        number:"04",
        title:"Keep it Concise(1-2 pages)",
        icon:"document-text-outline",
        body:"Focus heavily on recent, relevant projects and roles.",
    },
    {
        number:"05",
        title:"Use Action Verbs",
        icon:"flash-outline",
        body:"Start points with powerful words like Lead, Design, Devise.",
    },
];

const checklist = [
    "My resume was created based on this job.",
    "My contact details are correct.",
    "My skills and experience are easy to find.",
    "My dates and qualifications are accurate.",
    "I have checked spelling and grammar.",
    "My file follows the employer's instructions.",
];

const resources = [
    {
        title: "Your Resume for Australian Employers",
        subtitle: "Linkedin",
        url: "https://www.linkedin.com/pulse/how-tailor-your-resume-australian-employers-madujith-ranathunga-li37e",
    },
    {
        title: "Youth Central",
        subtitle: "Victorian Government",
        url: "https://www.youthcentral.vic.gov.au/jobs/resumes-and-cover-letters/how-write-resume",
    },
    {
        title: "University of Melbourne Careers",
        subtitle: "Resume advice for students",
        url: "https://students.unimelb.edu.au/careers/get-career-ready/resumes",
    },
];

export default function Guidelines() {
    const { colors } = useTheme()
    const [checkedItems, setCheckedItems] = useState([]);

    const toggleChecklistItem = (item) => {
        setCheckedItems((currentItems) =>
            currentItems.includes(item)
                ? currentItems.filter((currentItem) => currentItem !== item)
                : [...currentItems, item]
        );
    };

    const progress = checkedItems.length / checklist.length;

    const openResource = async (url) => {
        try {
            await Linking.openURL(url);
        } catch (error) {
            Alert.alert(
                "Unable to open link",
                "Please try opening this resource in your browser."
            );
        }
    };

    const handleDownload = () => {
        Alert.alert(
            "Sample Resume Template",
            "A downloadable template can be connected later."
        );
    };

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: colors.background,
            }}
            edges={['top', 'bottom']}
        >
            <View style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={{
                        paddingBottom: 24,
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    <ScreenHeader
                        title="Resume Guideline"
                        subtitle="HOW TO WRITE A STRONG RESUME"
                        bg={colors.redTint}
                        subtitleColor={colors.red}
                    />

                    {/* Introduction */}
                    <View
                        style={{
                            marginHorizontal: 20,
                            marginTop: 18,
                            marginBottom: 20,
                            padding: 16,
                            flexDirection: "row",
                            alignItems: "flex-start",
                            backgroundColor: colors.surface,
                            borderWidth: 1,
                            borderColor: colors.border,
                            borderRadius: 16,
                        }}
                    >
                        <View
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                backgroundColor: colors.redTint,
                                alignItems: "center",
                                justifyContent: "center",
                                marginRight: 12,
                            }}
                        >
                            <Ionicons
                                name="bulb-outline"
                                size={22}
                                color={colors.red}
                            />
                        </View>

                        <View style={{ flex: 1 }}>
                            <Text
                                style={{
                                    color: colors.textPrimary,
                                    fontSize: 14,
                                    fontWeight: "800",
                                    marginBottom: 5,
                                }}
                            >
                                What Makes a Good Resume?
                            </Text>

                            <Text
                                style={{
                                    color: colors.textSecondary,
                                    fontSize: 12,
                                    lineHeight: 19,
                                }}
                            >
                                A strong resume clearly presents your skills,
                                experience and achievements. Keep it relevant
                                to the job and follow Local application
                                conventions.
                            </Text>
                        </View>
                    </View>

                    {/* Resume Tips */}
                    <View
                        style={{
                            paddingHorizontal: 20,
                            marginBottom: 10,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: 14,
                            }}
                        >
                            <Text
                                style={{
                                    color: colors.textPrimary,
                                    fontSize: 18,
                                    fontWeight: "800",
                                }}
                            >
                                Resume Tips
                            </Text>

                            <Text
                                style={{
                                    color: colors.accentBlue,
                                    fontSize: 10,
                                    fontWeight: "800",
                                }}
                            >
                                5 TIPS
                            </Text>
                        </View>

                        {sections.map((section) => (
                            <View
                                key={section.number}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "flex-start",
                                    backgroundColor: colors.surface,
                                    borderRadius: 16,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    padding: 14,
                                    marginBottom: 12,
                                }}
                            >
                                <View
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 12,
                                        backgroundColor: colors.redTint,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginRight: 12,
                                    }}
                                >
                                    <Ionicons
                                        name={section.icon}
                                        size={20}
                                        color={colors.red}
                                    />
                                </View>

                                <View style={{ flex: 1 }}>
                                    <View
                                        style={{
                                            flexDirection: "row",
                                            alignItems: "center",
                                            marginBottom: 5,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: colors.accentBlue,
                                                fontSize: 11,
                                                fontWeight: "800",
                                                marginRight: 8,
                                            }}
                                        >
                                            {section.number}
                                        </Text>

                                        <Text
                                            style={{
                                                flex: 1,
                                                color: colors.textPrimary,
                                                fontSize: 14,
                                                fontWeight: "800",
                                            }}
                                        >
                                            {section.title}
                                        </Text>
                                    </View>

                                    <Text
                                        style={{
                                            color: colors.textSecondary,
                                            fontSize: 12,
                                            lineHeight: 19,
                                        }}
                                    >
                                        {section.body}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Resume Template Example */}
                    <View
                        style={{
                            paddingHorizontal: 20,
                            paddingTop: 10,
                        }}
                    >
                        <Text
                            style={{
                                color: colors.textPrimary,
                                fontSize: 18,
                                fontWeight: "800",
                                marginBottom: 6,
                            }}
                        >
                            Resume Template Example
                        </Text>

                        <View
                            style={{
                                backgroundColor: colors.surface,
                                borderRadius: 20,
                                borderWidth: 1,
                                borderColor: colors.border,
                                padding: 20,
                                shadowColor: "#000000",
                                shadowOffset: {
                                    width: 0,
                                    height: 2,
                                },
                                shadowOpacity: 0.05,
                                shadowRadius: 8,
                                elevation: 2,
                            }}
                        >
                            <View
                                style={{
                                    alignItems: "center",
                                    marginBottom: 16,
                                }}
                            >
                                <Text
                                    style={{
                                        color: colors.textPrimary,
                                        fontSize: 18,
                                        fontWeight: "800",
                                    }}
                                >
                                    Wendy Girl
                                </Text>

                                <Text
                                    style={{
                                        color: colors.accentBlue,
                                        fontSize: 10,
                                        fontWeight: "700",
                                        letterSpacing: 0.5,
                                        marginTop: 4,
                                    }}
                                >
                                    DESIGNER · MELBOURNE
                                </Text>

                                <Text
                                    style={{
                                        color: colors.textSecondary,
                                        fontSize: 10,
                                        marginTop: 5,
                                    }}
                                >
                                    wendy@example.com
                                </Text>
                            </View>

                            <View
                                style={{
                                    height: 1,
                                    backgroundColor: colors.border,
                                    marginBottom: 16,
                                }}
                            />

                            <Text
                                style={{
                                    color: colors.navy,
                                    fontSize: 11,
                                    fontWeight: "800",
                                    marginBottom: 8,
                                }}
                            >
                                SUMMARY
                            </Text>

                            <Text
                                style={{
                                    color: colors.textSecondary,
                                    fontSize: 11,
                                    lineHeight: 17,
                                    marginBottom: 16,
                                }}
                            >
                                A motivated graduate with experience in
                                design projects, teamwork and problem-solving.
                                Interested in creating clear and accessible
                                digital experiences.
                            </Text>

                            <Text
                                style={{
                                    color: colors.navy,
                                    fontSize: 11,
                                    fontWeight: "800",
                                    marginBottom: 8,
                                }}
                            >
                                EXPERIENCE
                            </Text>

                            <Text
                                style={{
                                    color: colors.textPrimary,
                                    fontSize: 12,
                                    fontWeight: "700",
                                    marginBottom: 4,
                                }}
                            >
                                Student Project Designer
                            </Text>

                            <Text
                                style={{
                                    color: colors.textSecondary,
                                    fontSize: 10,
                                    marginBottom: 8,
                                }}
                            >
                                University Project · 2026
                            </Text>

                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "flex-start",
                                    marginBottom: 6,
                                }}
                            >
                                <Text
                                    style={{
                                        color: colors.textSecondary,
                                        marginRight: 6,
                                        fontSize: 11,
                                    }}
                                >
                                    •
                                </Text>
                                <Text
                                    style={{
                                        flex: 1,
                                        color: colors.textSecondary,
                                        fontSize: 11,
                                        lineHeight: 16,
                                    }}
                                >
                                    Collaborated with teammates to plan and
                                    design a mobile application.
                                </Text>
                            </View>

                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "flex-start",
                                    marginBottom: 16,
                                }}
                            >
                                <Text
                                    style={{
                                        color: colors.textSecondary,
                                        marginRight: 6,
                                        fontSize: 11,
                                    }}
                                >
                                    •
                                </Text>
                                <Text
                                    style={{
                                        flex: 1,
                                        color: colors.textSecondary,
                                        fontSize: 11,
                                        lineHeight: 16,
                                    }}
                                >
                                    Prepared interface mockups and presented
                                    design decisions to the team.
                                </Text>
                            </View>

                            <Text
                                style={{
                                    color: colors.navy,
                                    fontSize: 11,
                                    fontWeight: "800",
                                    marginBottom: 8,
                                }}
                            >
                                EDUCATION
                            </Text>

                            <Text
                                style={{
                                    color: colors.textPrimary,
                                    fontSize: 12,
                                    fontWeight: "700",
                                    marginBottom: 4,
                                }}
                            >
                                AIT University
                            </Text>

                            <Text
                                style={{
                                    color: colors.textSecondary,
                                    fontSize: 10,
                                    marginBottom: 16,
                                }}
                            >
                                BIT · 2026
                            </Text>

                            <Text
                                style={{
                                    color: colors.navy,
                                    fontSize: 11,
                                    fontWeight: "800",
                                    marginBottom: 8,
                                }}
                            >
                                KEY SKILLS
                            </Text>

                            <View
                                style={{
                                    flexDirection: "row",
                                    flexWrap: "wrap",
                                    gap: 6,
                                }}
                            >
                                {["UI/UX", "Figma", "React", "Teamwork"].map(
                                    (skill) => (
                                        <View
                                            key={skill}
                                            style={{
                                                backgroundColor: colors.lightBlueTint,
                                                paddingHorizontal: 10,
                                                paddingVertical: 5,
                                                borderRadius: 6,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: colors.accentBlue,
                                                    fontSize: 10,
                                                    fontWeight: "700",
                                                }}
                                            >
                                                {skill}
                                            </Text>
                                        </View>
                                    )
                                )}
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleDownload}
                            activeOpacity={0.85}
                            style={{
                                backgroundColor: colors.navy,
                                borderRadius: 14,
                                paddingVertical: 15,
                                paddingHorizontal: 16,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                marginTop: 14,
                                shadowColor: colors.navy,
                                shadowOffset: {
                                    width: 0,
                                    height: 4,
                                },
                                shadowOpacity: 0.2,
                                shadowRadius: 6,
                                elevation: 4,
                            }}
                        >
                            <Ionicons
                                name="download-outline"
                                size={18}
                                color={colors.white}
                                style={{ marginRight: 8 }}
                            />

                            <Text
                                style={{
                                    color: colors.white,
                                    fontSize: 14,
                                    fontWeight: "800",
                                }}
                            >
                                Download Sample Template
                            </Text>
                        </TouchableOpacity>

                        <Text
                            style={{
                                color: colors.textSecondary,
                                fontSize: 11,
                                lineHeight: 17,
                                marginTop: 8,
                                textAlign: "center",
                            }}
                        >
                            Sample content for display purposes. Replace it
                            with your own accurate information.
                        </Text>
                    </View>

                    {/* Checklist */}
                    <View
                        style={{
                            marginHorizontal: 20,
                            marginTop: 24,
                            marginBottom: 22,
                            backgroundColor: colors.surface,
                            borderWidth: 1,
                            borderColor: colors.border,
                            borderRadius: 18,
                            padding: 16,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <View style={{ flex: 1 }}>
                                <Text
                                    style={{
                                        color: colors.textPrimary,
                                        fontSize: 18,
                                        fontWeight: "800",
                                    }}
                                >
                                    Checklist
                                </Text>

                                <Text
                                    style={{
                                        color: colors.textSecondary,
                                        fontSize: 12,
                                        marginTop: 5,
                                    }}
                                >
                                    Check before you apply.
                                </Text>
                            </View>

                            <Text
                                style={{
                                    color: colors.red,
                                    fontSize: 14,
                                    fontWeight: "800",
                                }}
                            >
                                {checkedItems.length}/{checklist.length}
                            </Text>
                        </View>

                        <View
                            style={{
                                height: 6,
                                backgroundColor: colors.redTint,
                                borderRadius: 10,
                                overflow: "hidden",
                                marginTop: 16,
                                marginBottom: 10,
                            }}
                        >
                            <View
                                style={{
                                    height: "100%",
                                    width: `${progress * 100}%`,
                                    backgroundColor: colors.red,
                                    borderRadius: 10,
                                }}
                            />
                        </View>

                        {checklist.map((item) => {
                            const isChecked = checkedItems.includes(item);

                            return (
                                <TouchableOpacity
                                    key={item}
                                    activeOpacity={0.7}
                                    onPress={() => toggleChecklistItem(item)}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        paddingVertical: 10,
                                    }}
                                >
                                    <Ionicons
                                        name={
                                            isChecked
                                                ? "checkbox"
                                                : "square-outline"
                                        }
                                        size={21}
                                        color={
                                            isChecked ? colors.red : colors.textMuted
                                        }
                                    />

                                    <Text
                                        style={{
                                            flex: 1,
                                            color: isChecked
                                                ? colors.textMuted
                                                : colors.textPrimary,
                                            fontSize: 12,
                                            lineHeight: 18,
                                            marginLeft: 10,
                                            textDecorationLine: isChecked
                                                ? "line-through"
                                                : "none",
                                        }}
                                    >
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Australian Resources */}
                    <View
                        style={{
                            paddingHorizontal: 20,
                            marginBottom: 18,
                        }}
                    >
                        <Text
                            style={{
                                color: colors.textPrimary,
                                fontSize: 18,
                                fontWeight: "800",
                                marginBottom: 6,
                            }}
                        >
                            Helpful Australian Resources
                        </Text>

                        <Text
                            style={{
                                color: colors.textSecondary,
                                fontSize: 12,
                                lineHeight: 18,
                                marginBottom: 14,
                            }}
                        >
                            Explore these resources for further advice,
                            examples and job application tips.
                        </Text>

                        {resources.map((resource) => (
                            <TouchableOpacity
                                key={resource.title}
                                activeOpacity={0.75}
                                onPress={() => openResource(resource.url)}
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    backgroundColor: colors.surface,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    borderRadius: 14,
                                    padding: 13,
                                    marginBottom: 10,
                                }}
                            >
                                <View
                                    style={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 11,
                                        backgroundColor: colors.redTint,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginRight: 12,
                                    }}
                                >
                                    <Ionicons
                                        name="open-outline"
                                        size={19}
                                        color={colors.red}
                                    />
                                </View>

                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={{
                                            color: colors.textPrimary,
                                            fontSize: 13,
                                            fontWeight: "800",
                                        }}
                                    >
                                        {resource.title}
                                    </Text>

                                    <Text
                                        style={{
                                            color: colors.textSecondary,
                                            fontSize: 11,
                                            marginTop: 4,
                                        }}
                                    >
                                        {resource.subtitle}
                                    </Text>
                                </View>

                                <Ionicons
                                    name="chevron-forward"
                                    size={18}
                                    color={colors.textMuted}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Footer Note */}
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "flex-start",
                            marginHorizontal: 20,
                            marginBottom: 12,
                            padding: 14,
                            backgroundColor: colors.redTint,
                            borderRadius: 14,
                        }}
                    >
                        <Ionicons
                            name="information-circle-outline"
                            size={19}
                            color={colors.red}
                        />

                        <Text
                            style={{
                                flex: 1,
                                color: colors.textSecondary,
                                fontSize: 11,
                                lineHeight: 17,
                                marginLeft: 9,
                            }}
                        >
                            Always follow the instructions in the job advertisement. 
                            Resume expectations can vary depending on the role and employer.
                        </Text>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}
