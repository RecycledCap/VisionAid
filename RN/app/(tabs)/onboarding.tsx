import { AntDesign } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import {
    Animated,
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
import slides from "../../utils/boards";

const onboardingItem = ({
  item,
}: ListRenderItemInfo<{
  id: string;
  title: string;
  description: string;
  image: any;
}>) => {
  const { width } = Dimensions.get("window");
  return (
    <View style={[styles.boardItem, { width }]}>
      <Image
        source={item.image}
        style={[styles.image, { width: "100%", resizeMode: "contain" }]}
      />

      <View style={{ flex: 0.3 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );
};

export default function onboarding() {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesRef = useRef<FlatList>(null);

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
          router.push("/");
        }
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.board]}>
        <View style={{ flex: 3 }}>
          <FlatList
            data={slides}
            renderItem={(item) => onboardingItem(item)}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            keyExtractor={(item) => item.id}
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
    paddingHorizontal: 64,
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
    width: 110,
    height: 110,
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4338f",
  },
});
