import { View, Text, ActivityIndicator } from "react-native";
import COLORS from "../constants/colors";
import { LinearGradient } from 'expo-linear-gradient';
import styles from "../assets/styles/signup.styles";

export default function Loader({ size = "large" }) {
return (
    <LinearGradient colors={['#2E6B56', '#90C67C']} style={styles.container}>  
    <View
        style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            
        }}
    >
    <ActivityIndicator size={size} color={"#2E6B56"} />
    </View>
    </LinearGradient>
    );
}