import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { BottomTabBar } from "../components/BottomTabBar";

/*palette={
blue: "#3B82F6",
navy: "#1E3A8A",
purple:"#A05DF2",
lightPurple:"#F2E5FF",
green:"#10B981",
lightGreen:"#EAFDEC",
yellow:"#F0D601",
lightYellow:"#FEF3E7",
red:"#EF4444",
lightPink:"#FDF2F8",
background:"#F7F9FC",
white:"#FFFFFF",
text:"#1F2937",
muted:"#64748B",
border:"#E5EAF2",
}*/
const sections=[
    {
        number:"01",
        title:"Clear Formatting",
        icon:"grid-outline",
        color:"#3B82F6",
        body:"Use a simple, clean layout with readable sans-serif fonts.",
    },
    {
        number:"02",
        title:"Quantify Achievements",
        icon:"trending-up-outline",
        color:"#10B981",
        body:"Include metrics (e.g.'Boosted user retention bu 24%')",
    },
    {
        number:"03",
        title:"Tailor to the Job",
        icon:"radio-button-on-outline",
        color:"#EF4444",
        body:"Align your experice with keywords from the job post.",
    },
    {
        number:"04",
        title:"Keep it Concise(1-2 pages)",
        icon:"document-text-outline",
        color:"#A05DF2",
        body:"Focus heavily on recent, relevant projects and roles.",
    },
    {
        number:"05",
        title:"Use Action Verbs",
        icon:"flash-outline",
        color:"#F0D601",
        body:"Start points with powerful words like Lead, Design, Devise.",
    },  
];

export default function Guidelines() {
    return(
        <SafeAreaView style={{flex:1,backgroundColor:"#F7F9FC"}} edges={["top"]}>
            <View style={{flex:1}}>
                <ScrollView contentContainerStyle={{paddingBottom:32}} showsVerticalScrollIndicator={false}>
                    
                    <View style={{backgroundColor:"#FDF2F8",paddingHorizontal:20,paddingTop:16,paddingBottom:20, flexDirection:"row",alignItems:"center"}}>
                        <TouchableOpacity onPress={()=>router.back()} 
                        accessibilityLabel="GO BACK"
                        style={{width:36,height:36, borderRadius:12,backgroundColor:"#FFFFFF",alignItems:"center",justifyContent:"center", marginRight:14, borderWidth:1,borderColor:"#E5EAF2"}}
                        >
                            <Ionicons name="chevron-back-outline" size={20} color="#1F2937"/>
                        </TouchableOpacity>
                        <View style={{flex:1}}>
                            <Text style={{color:"#1F2937",fontSize:20,fontWeight:"800"}}>Resume Guidelines</Text>
                        <Text style={{color:"#EF4444",fontSize:10,fontWeight:"800", letterSpacing:0.8,marginTop:2}}>HOW TO WRITE A STRONG RESUME</Text>
                        </View>
                    </View>

            <View style={{paddingHorizontal:20,marginTop:20}}>
                <Text style={{color:"#1F2937",fontSize:18,fontWeight:"800",marginBottom:16}}>What Makes a Good Resume?</Text>
                {sections.map((section)=>(
                    <View key={section.number}style={{flexDirection:"row",alignItems:"flex-start",backgroundColor:"#FFFFFF",borderRadius:16,borderWidth:1,borderColor:"#E5EAF2",padding:14, marginBottom:12}}>
                        <View style={{width:40,height:40,borderRadius:12, backgroundColor:"#FFF1F2", alignItems:"center", justifyContent:"center", marginRight:14}}>
                            <Ionicons name={section.icon} size={20} color={"#EF4444"} />
                        </View>
                        <View style={{flex:1}}>
                            <Text style={{color:"#1F2937", fontSize:14, fontWeight:"800", marginBottom:4}}>{section.title}</Text>
                            <Text style={{color:"#64748B", fontSize:12, lineHeight:18}}>{section.body}</Text>
                        </View>
                    </View>
                ))}
                </View>
                
                <View style ={{paddingHorizontal:20, paddingTop:10}}>
                    <Text style={{color:"#1F2937",fontSize:18,fontWeight:"800",marginBottom:14}}>Resume Template Example</Text>
                    
                    <View style={{backgroundColor:"#FFFFFF", borderRadius:20, borderWidth:1,borderColor:"#E5EAF2",padding:20,shadowColor:"#000000",shadowOffset:{width:0,height:2},shadowOpacity:0.05,shadowRadius:8,elevation:2}}>
                        <View style={{alignItems:"center", marginBottom:16}}>
                    <Text style={{color:"#1F2937", fontSize:16,fontWeight:"800"}}>Wendy LA</Text>
                    <Text style={{color:"#3B82F6", fontSize:10,fontWeight:"700",letterSpacing:0.5,marginTop:4}}>BUSINESSMAN ． MELBOURNE</Text>
                    </View>
                    
                    <View style={{height:1, backgroundColor:"#E5EAF2",marginBottom:16}} />
                    /*Summary*/
                    <Text style={{ color: "#1E3A8A", fontSize: 11, fontWeight: "800", marginBottom: 8 }}>SUMMARY</Text>
                    <View style={{ height: 8, backgroundColor: "#E2E8F0", borderRadius: 4, width: "100%", marginBottom: 6 }} />
                    <View style={{ height: 8, backgroundColor: "#E2E8F0", borderRadius: 4, width: "55%", marginBottom: 16 }} />
                    /*Experience*/
                    <Text style={{color:"#1E3A8A", fontWeight:"800",marginBottom:8}}>SKILLS</Text>
                    <View style={{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
                        <View style={{height:8, backgroundColor:"#1E3A8A",borderRadius:4, width:"100%", marginBottom:6}}/>
                        <View style={{ height: 8, backgroundColor: "#E2E8F0", borderRadius: 4, width: "15%" }} />
                    </View>
                    /*Skill */
                    <Text style={{color:"#1E3A8A", fontSize: 11, fontWeight: "800", marginBottom: 8 }}>SKILLS</Text>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                        {["UI/UX", "Figma", "React"].map((skill) => (
                            <View key={skill} style={{ backgroundColor: "#EFF6FF", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 }}>
                             <Text style={{ color:"#3B82F6", fontSize: 10, fontWeight: "700" }}>{skill}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
            <View style={{paddingHorizontal: 20, paddingTop: 20}}>
                <TouchableOpacity onPress={() => Alert.alert("Downloading sample template...")}
                    activeOpacity={0.85}
                    style={{backgroundColor:"#1E3A8A", borderRadius:14, paddingVertical:16, alignItems:"center", justifyContent:"center", shadowColor:"#1E3A8A", shadowOffset:{width:0,height:4},shadowOpacity: 0.2, shadowRadius: 6, elevation: 4}}>
                        <Text style={{color:"#FFFFFF",fontSize:14,fontWeight:"800"}}>Download Sample Template</Text>
                    </TouchableOpacity>
            </View>
                </ScrollView>
                <BottomTabBar activeTab="guideline" />
            </View>
        </SafeAreaView>
    );
}