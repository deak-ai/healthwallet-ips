import React from "react";
import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, FlatList, ScrollView } from "react-native";
import { Text, View } from "@/components/Themed";
import { useRoute } from "@react-navigation/native";
import FhirBox from "@/components/FhirBox";
import { useIpsData } from "@/components/IpsDataContext";
import {
  filterResourceWrappers,
  getProcessor,
} from "@/components/ipsResourceProcessor";
import { FlattenedResource } from "@/components/fhirIpsModels";
import { useRouter } from "expo-router";
import yaml from "js-yaml";
import SectionCard from "@/components/card";

export default function SectionScreen() {
  const route = useRoute();
  const router = useRouter();
  const { title } = route.params as { title: string };
  const { code } = route.params as { code: string };
  const { ipsData } = useIpsData();

  const resources = ipsData ? getProcessor(code).process(ipsData) : [];

  const renderItem = ({ item }: { item: FlattenedResource }) => (
    <FhirBox name={item.name} onPress={() => handleTilePress(item)} />
  );

  const handleTilePress = (item: FlattenedResource) => {
    if (ipsData) {
      //let detail = ipsData.resources.filter(r => r.fullUrl === item.uri);
      router.push({
        pathname: "/modal",
        params: {
          fhirData: yaml.dump(item),
          title: item.name,
        },
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <View style={styles.listContainer}>
        {/* <FlatList
              data={resources}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
              contentContainerStyle={styles.flatList}
          /> */}
        <ScrollView contentContainerStyle={styles.container}>
          {resources.map((item, index) => (
            <SectionCard key={index} resource={item} />
          ))}
        </ScrollView>
      </View>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  listContainer: {
    flex: 1,
    width: "100%",
    alignItems: "stretch",
  },
  flatList: {
    padding: 20,
    width: "100%",
  },
});
