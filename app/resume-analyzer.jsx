import { ScrollView, Text,TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, radius } from '../theme/colors';
import BottomTabBar from '../components/BottomTabBar';

const ResumeAnalyzer = () => {
    const router = useRouter();
    const suggestions = [
        {icon: "checkmark-circle-outline", 
            title: "Clear section headings", 
            detail: "Your resume is easier to scan when sections have clear, familiar headings.", 
            positive: true},
        {icon: "alert-circle-outline",
            title: "Add measurable achievements",
            detail: "Where possible, include outcomes or numbers to show the impact of your work.",
            positive: false},
        {icon: "alert-circle-outline",
            title: "Tailor your skills",
            detail: "Compare your skills with the requirements in the job advertisement.",
            positive: false},
    ];
    return (
        <SafeAreaView edges={["top"]} 
        style={{flex: 1, backgroundColor: colors.surface}}>
            <View style={{flex: 1}}>
                <ScrollView contentContainerStyle={{paddingHorizontal: spacing.lg, 
                paddingTop: spacing.lg, 
                paddingBottom: spacing.xl,
            }} 
                showsVerticalScrollIndicator={false}
                >
                
                <TouchableOpacity onPress={() => router.back()}
                style={{flexDirection: "row", alignItems: "center", 
                alignSelf: "flex-start", marginBottom: spacing.lg,}}>

                    <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
                    <Text style={{fontSize: 14, color: colors.textPrimary, marginLeft: 4}}>
                        Back 
                    </Text>
                </TouchableOpacity>

                <Text style={{fontSize: 26, fontWeight: '800', color: colors.textPrimary}}>
                    Resume Analyzer</Text>
                <Text style={{fontSize: 12, color: colors.textMuted, marginTop: 6, letterSpacing: 1}}>
                    RESUME REVIEW </Text>
                <Text style={{fontSize: 14, lineHeight: 20, color: colors.textSecondary, marginTop: spacing.md}}>
                    Review these suggestion to help make your resume clearer and more relevant to Australian job applications.                
                </Text>
                <View style ={{alignItems:"center",
                    backgroundColor: colors.background,
                    borderRadius: radius.lg,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: spacing.lg,
                    marginTop: spacing.lg
                }}
                    >

                <View style={{
                    width:116,
                    height:116,
                    borderRadius: 58,
                    borderWidth: 9,
                    borderColor: colors.accentBlue,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: spacing.md
                }}
                >
                    <Text style={{fontSize: 34, fontWeight:"800", color: colors.navy}}>
                        75%</Text>
                    <Text style={{fontSize: 11, color: colors.textSecondary}}>
                        /100</Text>
                </View>
                <Text style={{fontSize:17, fontWeight:"700", color:colors.textPrimary}}>
                    Good Start
                </Text>
                <Text style={{fontSize:13, color: colors.textSecondary,textAlign:"center", marginTop: 6, lineHeight: 20}}>
                    These sample results are for demonstration. They are not generated from an uploaded resume.
                </Text>
                </View>
                <Text style={{fontSize:17, fontWeight:"700", color:colors.textPrimary, marginBottom: spacing.sm}}>
                    Suggestions to Improve
                </Text>

                {suggestions.map((item) => (
                    <View key={item.title} style={{
                        flexDirection: "row",
                        alignItems: "flex-start",
                        backgroundColor: colors.background,
                        borderWidth:1,
                        borderColor: colors.border,
                        borderRadius: radius.md,
                        padding: spacing.md,
                        marginBottom: spacing.sm,
                    }}>
                        <Ionicons name={item.icon}
                        size={22}
                        color={item.positive ? "#10B981" : "#F0D610"}
                        style={{marginRight: spacing.sm, marginTop: 1}}
                        />
                        <View style={{flex:1}}>
                            <Text style={{fontSize:14, fontWeight:"700", color: colors.textPrimary}}>
                                {item.title}
                            </Text>
                            <Text style={{fontSize:12, lineHeight: 18, color: colors.textSecondary, marginTop: 4}}>
                                {item.detail}
                            </Text>
                        </View>
                    </View>
                ))}
                <TouchableOpacity activeOpacity={0.8}
                 onPress={() => router.push("/resume")}
                 style={{
                    backgroundColor: colors.navy,
                    borderRadius: radius.md,
                    paddingVertical: 14,
                    alignItems: "center",
                    marginTop: spacing.sm,
                 }}
                 >
                    <Text style={{fontSize: 14, fontWeight:"700", color: colors.white}}>
                        Back to My Resume
                    </Text>
                </TouchableOpacity>
                </ScrollView>
                <BottomTabBar activeTab="resume" />
            </View>
        </SafeAreaView>
    );
};

export default ResumeAnalyzer;
