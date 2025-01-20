import React from "react";
import { StatusBar } from "expo-status-bar";
import {
  Platform,
  StyleSheet,
  FlatList,
  ScrollView,
  ImageBackground,
  SafeAreaView,
} from "react-native";
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
    <SafeAreaView>
      {/* <ImageBackground
        source={require("../assets/images/bg.png")}
        style={styles.backgroundImage}
        resizeMode="cover"
      > */}
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
            <ScrollView contentContainerStyle={styles.sectionContainer}>
              {resources.map((item, index) => (
                <SectionCard key={index} resource={item} />
              ))}
            </ScrollView>
          </View>
          <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
        </View>
      {/* </ImageBackground> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 10,
    justifyContent: "center",
    paddingHorizontal: 20,
    margin: 4,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
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
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
  sectionContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    flexGrow: 1,
    backgroundColor: "transparent",
  },
});
