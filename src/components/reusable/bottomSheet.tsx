import React, { forwardRef } from "react";
import RBSheet from "react-native-raw-bottom-sheet";
import { View, Text } from "react-native";
import { Icon } from "@/components/MultiSourceIcon";
import { getPalette } from "@/constants/Colors";
import { useColorScheme } from "react-native";

interface BottomSheetProps {
  title: string;
  description: string;
}
const BottomSheet = forwardRef<any, BottomSheetProps>(({ title, description }, ref) => {

    const theme = useColorScheme() ?? "light";
    const palette = getPalette(theme === "dark");

    return (
      <RBSheet
        ref={ref}
        height={200}
        closeOnPressMask={true}
        customStyles={{
          container: {
            justifyContent: "center",
            alignItems: "center",
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            backgroundColor:
              theme === "dark" ? palette.neutral.grey : palette.neutral.white,
          },
          wrapper: {
            backgroundColor: "rgba(0, 0, 0, 0.5)"
          }
        }}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Icon
              type={"ionicon"}
              name={"information-circle"}
              size={38}
              color={palette.primary.main}
            />
            <Text
              style={{
                fontSize: 18,
                marginLeft: 10,
                color: palette.primary.main,
              }}
            >
              {title}
            </Text>
          </View>
          <Text style={{ fontWeight: "700", color: theme === "dark" ? palette.neutral.white : palette.neutral.black }}>{description}</Text>
        </View>
      </RBSheet>
    );
  }
);

export default BottomSheet;
