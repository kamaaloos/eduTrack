import { useContext } from "react";
import { TouchableOpacity, Text, StyleSheet, Alert } from "react-native";
import { AuthContext } from "../src/context/authContext";

export default function LogoutButton() {
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Logout failed. Please try again.");
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={() => void handleLogout()}>
      <Text style={styles.text}>Logout</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#FF3B30",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },

  text: {
    color: "white",
    fontWeight: "700",
  },
});
