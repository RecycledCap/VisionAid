import { ThemeContext } from "@/context/ThemeContext";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { useFocusEffect, useRouter } from "expo-router";
import { Accelerometer } from "expo-sensors";
import LottieView from "lottie-react-native";
import React, {
  useCallback,
  useContext,
  useRef,
  useState
} from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import Animated from "react-native-reanimated";
import Toast from "react-native-root-toast";
import { useFontScale } from "../../context/fontScaleContext";
import { dark, light } from "../../utils/Colors";

const { width, height } = Dimensions.get("window");

// FAB
const FAB_SIZE = 100;
const ACTION_BTN_SIZE = 100;
const circleScale = parseFloat((width / FAB_SIZE).toFixed(1)) * 1.1;
const circleSize = FAB_SIZE * circleScale;
const dist = circleSize / 2 - FAB_SIZE;
const middleDist = dist * 0.707;

const CircleStyle: ViewStyle = {
  width: FAB_SIZE,
  height: FAB_SIZE,
  borderRadius: "50%",
  justifyContent: "center",
  alignItems: "center",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  message: {
    textAlign: "center",
    paddingBottom: 10,
  },

  // FAB
  fabContainer: {
    position: "absolute",
    bottom: 0,
    height: 300,
    // bottom: 20,
    width: width - 10,
    // backgroundColor: "#fff",
    alignItems: "center",
    alignSelf: "center",

    justifyContent: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    zIndex: 12,
    borderTopRightRadius: "10%",
    borderTopLeftRadius: "10%",
    overflow: "hidden",
    gap: 6,
  },
  fab: {
    ...CircleStyle,
    // backgroundColor: "#ACC8E5",
    transform: [{ rotate: "180deg" }],
    zIndex: 4,
  },
  btn: {
    width: (width - 10) / 2 - 3,
    height: "50%",
    backgroundColor: "#0ff",
    borderColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    // borderWidth: 1,
  },
  expandingCircle: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ff0",
    position: "absolute",
    zIndex: 2,
    transform: [{ scale: 1.2 }],
  },
  wave: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    position: "absolute",
    // transform: [{ scale: 2 }],
    zIndex: 1,
  },
});

type ActionButtonProps = {
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  onPress?: () => void;
  label: string;
  aLabel: string;
  isDMode: boolean;
  val?: string;
};

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  onPress = () => {},
  label,
  aLabel,
  val,
  isDMode,
}) => {
  const { fontScale } = useFontScale();
  return (
    <TouchableWithoutFeedback
      accessibilityRole="button"
      accessibilityLabel={aLabel}
      accessibilityValue={{ text: val ?? "" }}
      onPress={onPress}
    >
      <View
        style={[
          styles.btn,
          { backgroundColor: isDMode ? dark.actionBtn : light.actionBtn },
        ]}
      >
        <FontAwesome
          name={icon}
          size={45}
          color={isDMode ? dark.actionBtnText : light.actionBtnText}
        />
        <Text
          style={{
            fontWeight: "600",
            color: isDMode ? dark.actionBtnText : light.actionBtnText,
            fontSize: 14 * fontScale,
          }}
        >
          {label}
        </Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default function Index() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [MODEscreen, setMODE] = useState("detect");
  const isFocused = useIsFocused();
  const router = useRouter();
  const { t } = useTranslation();
  const { isDarkMode } = useContext(ThemeContext);

  // FAB

  // Toggle Voice Command when shaking
  const lastAcceleration = useRef({ x: 0, y: 0, z: 0 });
  const lastShakeTime = useRef(0);
  const SHAKE_THRESHOLD = 1.8; // Can be adjusted further
  const SHAKE_COOLDOWN = 2000; // 1 second debounce
  useFocusEffect(
    useCallback(() => {
      // update value every 100ms.
      // Adjust this interval to detect
      // faster (20ms) or slower shakes (500ms)
      Accelerometer.setUpdateInterval(100);

      // at each update, we have acceleration registered on 3 axis
      // 1 = no device movement, only acceleration caused by gravity
      const onUpdate = ({ x, y, z }: { x: number; y: number; z: number }) => {
        const delta =
          Math.abs(x - lastAcceleration.current.x) +
          Math.abs(y - lastAcceleration.current.y) +
          Math.abs(z - lastAcceleration.current.z);

        const now = Date.now();

        // Check shaking
        if (
          delta > SHAKE_THRESHOLD &&
          now - lastShakeTime.current > SHAKE_COOLDOWN
        ) {
          lastShakeTime.current = now;

          setFacing((current) => {
            Toast.show("Hello world!", {
              duration: Toast.durations.LONG,
              position: Toast.positions.CENTER,
            });
            return current === "back" ? "front" : "back";
          });
        }

        lastAcceleration.current = { x, y, z };
      };

      const subscription = Accelerometer.addListener(onUpdate);

      return () => subscription.remove(); // Cleanup when component unmounts
    }, [])
  );

  // useEffect(() => {
  //   console.log("Camera switched to " + facing);
  //   Toast.show("world!", {
  //     duration: Toast.durations.LONG,
  //     position: Toast.positions.CENTER,
  //   });
  // }, [facing]);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to use the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isFocused && (
        <CameraView style={StyleSheet.absoluteFillObject} facing={facing} />
      )}
      {/* <SafeAreaView style={{ ...StyleSheet.absoluteFillObject }}> */}
      <View
        className="flex-1"
        accessible={true}
        accessibilityLabel={t("homeDesc-a")}
      >
        <View
          style={{ backgroundColor: "rgba(240, 13, 13, 0.2)" }}
          className="flex-1 items-center justify-center"
          accessible={true}
          accessibilityLabel={t("home-a")}
        >
          <Pressable
            style={{
              shadowColor: "#7f5df0",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 3.5,
              elevation: 5,
              backgroundColor: isDarkMode ? dark.menuBtn : light.menuBtn,
            }}
            onPress={() => router.navigate("/profile")}
            accessibilityLabel={t("menuBtn-a")}
            accessibilityRole="button"
            className="absolute top-12 right-4 rounded-[20px] p-2"
          >
            <Ionicons
              name="menu"
              size={60}
              color={isDarkMode ? dark.menuBtnIcon : light.menuBtnIcon}
            />
          </Pressable>

          <Text
            accessible={true}
            className="text-5xl text-blue-500 font-bold bg-[#040]"
          >
            {MODEscreen}
          </Text>

          <View style={styles.fabContainer}>
            <View
              style={{
                position: "absolute",
                // backgroundColor: "#f0f",
                width: "100%",
                alignItems: "center",
                alignSelf: "center",
              }}
            >
              <View style={styles.expandingCircle}></View>
              <Pressable
                style={{ zIndex: 5 }}
                accessibilityLabel={t("vision-a")}
                accessibilityHint={t("visionHint-a")}
                accessibilityRole="button"
              >
                <Animated.View
                  style={[
                    styles.fab,
                    {
                      backgroundColor: isDarkMode
                        ? dark.mainBtn
                        : light.mainBtn,
                    },
                  ]}
                >
                  <MaterialIcons
                    name="auto-awesome"
                    size={50}
                    color={isDarkMode ? dark.mainBtnIcon : light.mainBtnIcon}
                  />
                </Animated.View>
              </Pressable>
              {MODEscreen == "voiceCMD" && (
                <View
                  style={{
                    position: "absolute",
                    alignItems: "center",
                    zIndex: 1,
                    width: FAB_SIZE,
                    height: FAB_SIZE,
                    transform: [{ scale: 2 }],
                    // backgroundColor: "#fff"
                  }}
                  pointerEvents="none"
                >
                  <LottieView
                    source={require("../../assets/icons/blue-wave.json")} // JSON, not GIF
                    loop
                    autoPlay
                    style={styles.wave}
                  />
                </View>
              )}
            </View>
            <ActionButton
              icon="microphone"
              onPress={() =>
                setMODE((curMode) =>
                  curMode !== "voiceCMD" ? "voiceCMD" : "detect"
                )
              }
              label={t("voice")}
              aLabel={t("voice-a")}
              isDMode={isDarkMode}
              val={MODEscreen === "voiceCMD" ? "On" : "Off"}
            />
            <ActionButton
              icon="crosshairs"
              onPress={() => setMODE("read")}
              label={t("read")}
              aLabel={t("read-a")}
              isDMode={isDarkMode}
            />
            <ActionButton
              icon="anchor"
              onPress={() => setMODE("detect")}
              label={t("detect")}
              aLabel={t("detect-a")}
              isDMode={isDarkMode}
            />
            <ActionButton
              icon="search"
              onPress={() => setMODE("describe")}
              label={t("describe")}
              aLabel={t("describe-a")}
              isDMode={isDarkMode}
            />
          </View>
        </View>
      </View>
      {/* </SafeAreaView> */}
    </View>
  );
}
