import { Text, View } from "@/components/Themed";
import {StyleSheet} from "react-native";

 const Card = (resource: any) => {
    const {
      name,
      criticality,
      clinicalStatus,
      verificationStatus,
      status,
      category,
      type,
    } = resource.resource;
    return (
      <View style={[{ backgroundColor: "white" }, cardStyles.card]}>
        <Text style={[{ color: "black" }, cardStyles.title]}>{name}</Text>
        <View style={[{ backgroundColor: "white" }, cardStyles.infoRow]}>
          <View style={[{ backgroundColor: "white" }, cardStyles.infoColumn]}>
            {type && <Text style={cardStyles.label}>Type: {type}</Text>}
            {criticality && (
              <Text style={cardStyles.label}>Criticality: {criticality}</Text>
            )}
            {verificationStatus && (
              <Text style={cardStyles.label}>
                Verification Status: {verificationStatus}
              </Text>
            )}
          </View>
          <View style={[{ backgroundColor: "white" }, cardStyles.infoColumn]}>
            {category && (
              <Text style={cardStyles.label}>Category: {category}</Text>
            )}
            {clinicalStatus && (
              <Text style={cardStyles.label}>
                Clinical Status: {clinicalStatus}
              </Text>
            )}
            {status && <Text style={cardStyles.label}>Status: {status}</Text>}
          </View>
        </View>
      </View>
    );
  };

  const cardStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#000000",
      justifyContent: "center",
      alignItems: "center",
    },
    card: {
      borderRadius: 8,
      padding: 16,
      margin: 16,
      shadowColor: "#000",
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    title: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 12,
    },
    infoRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: "white",
    },
    infoColumn: {
      flex: 1,
    },
    label: {
      fontSize: 14,
      color: "#666",
      marginBottom: 4,
    },
  });

  export default Card