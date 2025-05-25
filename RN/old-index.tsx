import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import Voice from "@react-native-voice/voice";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import LottieView from "lottie-react-native";
import React, { useEffect, useReducer, useState } from "react";
import {
    Button,
    Dimensions,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from "react-native";
import Animated, {
    Extrapolation,
    interpolate,
    interpolateColor,
    useAnimatedStyle,
    useDerivedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

// FAB
const FAB_SIZE = 95;
const ACTION_BTN_SIZE = 100;
const circleScale = parseFloat((width / FAB_SIZE).toFixed(1)) * 1.1;
const circleSize = FAB_SIZE * circleScale;
const dist = circleSize / 2 - ACTION_BTN_SIZE + 25;
const middleDist = dist * 0.707;

import type { ViewStyle } from "react-native";

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
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: "flex-end",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },

  // FAB
  fabContainer: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  fab: {
    ...CircleStyle,
    // backgroundColor: "#ACC8E5",
    transform: [{ rotate: "180deg" }],
    zIndex: 5,
  },
  expandingCircle: {
    ...CircleStyle,
    // transform: [{ scale: 8 }],
    backgroundColor: "#4A6FA5",
    position: "absolute",
    zIndex: 2,
  },
  wave: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    position: "absolute",
    transform: [{ scale: 1.8 }],
    zIndex: 4,
  },
  actionBtn: {
    ...CircleStyle,
    width: ACTION_BTN_SIZE,
    height: ACTION_BTN_SIZE,
    backgroundColor: "#ACC8E5",
    position: "absolute",
    zIndex: 3,
  },
});

type ActionButtonProps = {
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  style: ViewStyle;
  onPress?: () => void;
  label: string;
};

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  style,
  onPress = () => {},
  label,
}) => {
  return (
    <Animated.View style={[styles.actionBtn, style]}>
      <TouchableWithoutFeedback onPress={onPress}>
        <View style={{ alignItems: "center" }}>
          <FontAwesome name={icon} size={45} color="white" />
          <Text style={{ fontWeight: "600", color: "#112A46" }}>{label}</Text>
        </View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
};

export default function Index() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [MODEscreen, setMODE] = useState("view");
  let isRecording = false;

  const speechStartHandler = () => {
    console.log("start");
  };
  const speechEndHandler = () => {
    console.log("end");
  };
  const speechResultsHandler = () => {
    console.log("res");
  };
  const speechErrorHandler = () => {
    console.log("err");
  };

  useEffect(() => {
    Voice.onSpeechStart = speechStartHandler;
    Voice.onSpeechEnd = speechEndHandler;
    Voice.onSpeechResults = speechResultsHandler;
    Voice.onSpeechError = speechErrorHandler;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  useEffect(() => {
    if (MODEscreen == "voiceCMD") {
      if (!isRecording) {
        startRecording();
        isRecording = true;
      }
    } else {
      if (isRecording) {
        stopRecording();
      }
    }
  }, [MODEscreen]);

  const startRecording = async () => {
    try {
      await Voice.start("en-GB");
    } catch (error) {
      console.log("Voice start: ", error);
    }
  };
  const stopRecording = async () => {
    try {
      await Voice.stop();
      isRecording = false;
    } catch (error) {
      console.log("Voice stop: ", error);
    }
  };
  // FAB
  const [open, toggle] = useReducer((s) => !s, false);
  const rotation = useDerivedValue(() => {
    return withTiming(open ? "0deg" : "180deg");
  }, [open]);

  const progress = useDerivedValue(() => {
    return open ? withSpring(1) : withSpring(0);
  });
  const translation = useDerivedValue(() => {
    return open ? withSpring(1, { stiffness: 80, damping: 8 }) : withSpring(0);
  });
  const fabStyles = useAnimatedStyle(() => {
    const rotate = rotation.value;
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      ["#166088", "#C0D6DF"]
    );
    return {
      transform: [{ rotate }],
      backgroundColor,
    };
  });

  const scalingStyles = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [0, circleScale]);
    return {
      transform: [{ scale }],
    };
  });

  const translationStyles1 = useAnimatedStyle(() => {
    const translate = interpolate(translation.value, [0, 1], [0, -dist], {
      extrapolateLeft: Extrapolation.CLAMP,
    });
    const scale = interpolate(progress.value, [0, 1], [0, 1], {
      extrapolateLeft: Extrapolation.CLAMP,
    });
    return {
      transform: [{ translateX: translate }, { scale }],
    };
  });
  const translationStyles2 = useAnimatedStyle(() => {
    const translate = interpolate(translation.value, [0, 1], [0, -middleDist], {
      extrapolateLeft: Extrapolation.CLAMP,
    });
    const scale = interpolate(progress.value, [0, 1], [0, 1], {
      extrapolateLeft: Extrapolation.CLAMP,
    });
    return {
      transform: [
        { translateX: translate },
        { translateY: translate },
        { scale },
      ],
    };
  });
  const translationStyles3 = useAnimatedStyle(() => {
    const translate = interpolate(translation.value, [0, 1], [0, -dist], {
      extrapolateLeft: Extrapolation.CLAMP,
    });
    const scale = interpolate(progress.value, [0, 1], [0, 1], {
      extrapolateLeft: Extrapolation.CLAMP,
    });
    return {
      transform: [{ translateY: translate }, { scale }],
    };
  });
  const translationStyles4 = useAnimatedStyle(() => {
    const translate = interpolate(translation.value, [0, 1], [0, middleDist], {
      extrapolateLeft: Extrapolation.CLAMP,
    });
    const translateB = interpolate(
      translation.value,
      [0, 1],
      [0, -middleDist],
      {
        extrapolateLeft: Extrapolation.CLAMP,
      }
    );
    const scale = interpolate(progress.value, [0, 1], [0, 1], {
      extrapolateLeft: Extrapolation.CLAMP,
    });
    return {
      transform: [
        { translateX: translate },
        { translateY: translateB },
        { scale },
      ],
    };
  });
  const translationStyles5 = useAnimatedStyle(() => {
    const translate = interpolate(translation.value, [0, 1], [0, dist], {
      extrapolateLeft: Extrapolation.CLAMP,
    });
    const scale = interpolate(progress.value, [0, 1], [0, 1], {
      extrapolateLeft: Extrapolation.CLAMP,
    });
    return {
      transform: [{ translateX: translate }, { scale }],
    };
  });

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }
  function btnHandler(mode: string) {
    // console.log(123)
    if (mode == "voiceCMD") {
      // toggle()
    }
    return () => setMODE(mode);
  }

  return (
    <View style={styles.container}>
      <CameraView style={StyleSheet.absoluteFillObject} facing={facing} />
      <SafeAreaView style={{ ...StyleSheet.absoluteFillObject }}>
        <View
          className="flex-1"
          style={{ backgroundColor: "rgba(225, 240, 13, 0.2)" }}
        >
          <View
            style={{
              shadowColor: "#7f5df0",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 3.5,
              elevation: 5,
              zIndex: 9,
            }}
            className="absolute top-2.5 right-4 bg-[#fff] rounded-[20px] h-[70px] w-[70px] items-center justify-center"
          >
            <Ionicons name="menu" size={60} color="#166088" />
          </View>

          <Text className="text-5xl text-blue-500 font-bold bg-[#040]">
            {MODEscreen}
          </Text>

          <View style={styles.fabContainer}>
            <Animated.View style={[styles.expandingCircle, scalingStyles]} />
            <View
              style={{
                position: "relative",
                backgroundColor: "",
                width: "100%",
                alignItems: "center",
              }}
            >
              <TouchableWithoutFeedback>
                <Animated.View style={[styles.fab, fabStyles]}>
                  <MaterialIcons name="auto-awesome" size={45} color="white" />
                </Animated.View>
              </TouchableWithoutFeedback>
              {MODEscreen == "voiceCMD" && (
                <LottieView
                  source={require("../../assets/icons/blue-wave.json")} // JSON, not GIF
                  loop
                  autoPlay
                  style={styles.wave}
                />
              )}
            </View>
            <ActionButton
              icon="retweet"
              style={translationStyles1}
              onPress={toggleCameraFacing}
              label="Switch"
            />
            <ActionButton
              icon="crosshairs"
              style={translationStyles2}
              onPress={btnHandler("read")}
              label="Read"
            />
            <ActionButton
              icon="anchor"
              style={translationStyles3}
              onPress={btnHandler("detect")}
              label="Detect"
            />
            <ActionButton
              icon="search"
              style={translationStyles4}
              onPress={btnHandler("describe")}
              label="Describe"
            />
            <ActionButton
              icon="anchor"
              style={translationStyles5}
              onPress={btnHandler("voiceCMD")}
              label="Voice"
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
