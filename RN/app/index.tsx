import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  Button,
  Dimensions,
  FlatList,
  Image,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COCO_CLASSES } from "../context/selectionContext";
import slides from "../utils/boards";

import { useCameraPermissions } from "expo-camera";

export default function Index() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesRef = useRef<FlatList>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const { t } = useTranslation();

  const { width } = Dimensions.get("window");

  const viewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      setCurrentIndex(viewableItems[0].index ?? 100); // Done just to avoid type error
    }
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = (direction: string) => {
    if (slidesRef.current) {
      if (currentIndex < slides.length - 1 && direction == "forward") {
        slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
      } else if (currentIndex > 0 && direction == "backward") {
        slidesRef.current.scrollToIndex({ index: currentIndex - 1 });
      } else if (currentIndex == slides.length - 1 && direction == "forward") {
        if (router.canGoBack()) {
          router.back();
        } else {
          // First time onboarding
          router.push("/home");
          saveSettings();
        }
      }
    }
  };

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            textAlign: "center",
            paddingBottom: 10,
          }}
        >
          SightMate needs your permission to use the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  async function saveSettings() {
    await SecureStore.setItemAsync("isFirstTime", "no");

    await SecureStore.setItemAsync("language", "en");
    await SecureStore.setItemAsync("isDarkMode", "no");
    await SecureStore.setItemAsync("fontScaleIndex", "1");
    await SecureStore.setItemAsync("selection", COCO_CLASSES.join(";"));
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.board]}>
        <View style={{ flex: 3 }}>
          <FlatList
            data={slides}
            renderItem={(
              item: ListRenderItemInfo<{
                id: string;
                title: string;
                description: string;
                image: any;
              }>
            ) => {
              return (
                <View style={[styles.boardItem, { width }]}>
                  <Image
                    source={item.item.image}
                    style={[
                      styles.image,
                      { width: "100%", resizeMode: "contain" },
                    ]}
                    accessible={true}
                    accessibilityLabel={t("img-" + item.item.id)}
                  />

                  <View style={{ flex: 0.3, marginTop: 10 }}>
                    <Text
                      style={styles.title}
                      accessible={true}
                      accessibilityLabel={t("title-" + item.item.id)}
                    >
                      {t("title-" + item.item.id)}
                    </Text>
                    <Text
                      style={styles.description}
                      accessible={true}
                      accessibilityLabel={t("description-" + item.item.id)}
                    >
                      {t("description-" + item.item.id)}
                    </Text>
                  </View>
                </View>
              );
            }}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            keyExtractor={(item) => item.title}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false }
            )}
            scrollEventThrottle={32}
            onViewableItemsChanged={viewableItemsChanged}
            viewabilityConfig={viewConfig}
            ref={slidesRef}
          />
        </View>
        <View style={{ flexDirection: "row" }}>
          {slides.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 20, 10],
              extrapolate: "clamp",
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                style={[styles.dot, { width: dotWidth, opacity }]}
                key={i.toString()}
              />
            );
          })}
        </View>
        <View style={[styles.btnBar, { width }]}>
          <TouchableOpacity
            disabled={currentIndex == 0}
            activeOpacity={0.6}
            onPress={() => scrollTo("backward")}
            style={[styles.btn]}
          >
            <AntDesign name="arrowleft" color="#fff" size={40} />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => scrollTo("forward")}
            style={[styles.btn]}
          >
            <AntDesign name="arrowright" color="#fff" size={40} />
          </TouchableOpacity>
        </View>
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  board: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  boardItem: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  image: {
    flex: 0.7,
    justifyContent: "center",
  },
  title: {
    fontWeight: 800,
    fontSize: 28,
    marginBottom: 10,
    color: "#493d8a",
    textAlign: "center",
  },
  description: {
    fontWeight: 300,
    color: "#62656b",
    textAlign: "center",
    paddingHorizontal: 20,
  },

  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: "#493d8a",
    marginHorizontal: 8,
  },
  btnBar: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-evenly",
    flexDirection: "row",
  },
  btn: {
    width: 90,
    height: 90,
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#44BD32",
  },
});
