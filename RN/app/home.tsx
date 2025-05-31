import { ThemeContext } from "@/context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { useFocusEffect, useRouter } from "expo-router";
import { Accelerometer } from "expo-sensors";
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dimensions,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  ObjectType,
  hazardObjects,
  useSelection,
} from "../context/selectionContext";
// const micStartSndFile = require("../assets/sounds/micStart.mp3");
// const micStopSndFile = require("../assets/sounds/micStop.mp3");
// import Toast from "react-native-root-toast";
import { useFontScale } from "../context/fontScaleContext";
import { dark, light } from "../utils/Colors";

import * as Speech from "expo-speech";

import {
  GoogleGenAI,
  createPartFromUri,
  createUserContent,
} from "@google/genai";

import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import tw from "twrnc";

const ai = new GoogleGenAI({
  apiKey: "AIzaSyCnuP4OK7uCNWCKlK0qhuMycQRvrs3RFlc",
});

const { width, height } = Dimensions.get("window");

type MODES = "read" | "detect" | "describe" | "voice" | "ai";

// FAB
const FAB_SIZE = 105;

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
  actionSection: {
    position: "absolute",
    bottom: 0,
    width: width,
    alignSelf: "center",

    flexDirection: "column",
    borderTopRightRadius: "10%",
    borderTopLeftRadius: "10%",
    boxSizing: "border-box",
  },
  fabContainer: {
    height: 320,
    width: width,
    alignItems: "center",
    justifyContent: "space-evenly",

    // padding: 20,
    paddingTop: 25,

    flexDirection: "row",
    flexWrap: "wrap",
    zIndex: 12,
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    // overflow: "hidden",
    boxSizing: "border-box",
    // gap: 6,
  },
  fab: {
    ...CircleStyle,
    // backgroundColor: "#ACC8E5",
    // transform: [{ rotate: "180deg" }],
    zIndex: 4,
    // borderWidth: 3,
    // borderColor: "#aaf"
  },
  btn: {
    width: (width - 2 * 20 - 2 * 8) / 2,
    height: (320 - 32 - 2 * 8) / 2 - 10,
    marginBottom: 8,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  expandingCircle: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: "50%",
    opacity: 0.3,
    position: "absolute",
    zIndex: 2,
    pointerEvents: "none",
  },
  expandingBorder: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: "50%",
    backgroundColor: "transparent",
    borderWidth: 2,
    position: "absolute",
    zIndex: 2,
    pointerEvents: "none",
  },
  preview: {
    // alignSelf: 'center',
    // borderRadius: 8,
  },
});

type ActionButtonProps = {
  src: ImageSourcePropType;
  onPress?: () => void;
  label: string;
  aLabel: string;
  isDMode: boolean;
};

const ActionButton: React.FC<ActionButtonProps> = ({
  src,
  onPress = () => {},
  label,
  aLabel,
  isDMode,
}) => {
  const { fontScale } = useFontScale();
  return (
    <TouchableWithoutFeedback
      accessibilityRole="button"
      accessibilityLabel={aLabel}
      onPress={onPress}
    >
      <View
        style={[
          styles.btn,
          { backgroundColor: isDMode ? dark.actionBtn : light.actionBtn },
        ]}
      >
        <Image
          source={src}
          resizeMode="contain"
          style={{ width: 45, height: 45 }}
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
const MIN_SCALE = 1;
const MAX_SCALE = 2;

type Detection = {
  box: { x: number; y: number; w: number; h: number };
  class_id: number;
  confidence: number;
};

export default function home() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [MODEscreen, setMODE] = useState<MODES>("detect");
  const isFocused = useIsFocused();
  const router = useRouter();
  const { t } = useTranslation();
  const { isDarkMode } = useContext(ThemeContext);
  const { fontScale } = useFontScale();

  const volumeScale = useSharedValue(MIN_SCALE);
  const pulseScale = useSharedValue(MIN_SCALE);
  const pulseOpacity = useSharedValue(0);

  // const micStartSnd = useAudioPlayer(micStartSndFile);
  // const micStopSnd = useAudioPlayer(micStopSndFile);

  const cameraRef = useRef<CameraView | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const [fileURI, setFileURI] = useState<any | null>(null);
  const [fileMIME, setFileMIME] = useState<any | null>(null);

  const [isCamReady, setIsCamReady] = useState(false);
  const isCamReadyRef = useRef(false);
  const [isCamActive, setIsCamActive] = useState(true);
  const isCamActiveRef = useRef(true);

  const [detections, setDetections] = useState<Detection[]>([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [intervalID, setIntervalID] = useState<number>();

  const [aiAnnouncement, setAiAnnouncement] = useState<string>("");

  const resetVolumeMeter = () => {
    volumeScale.value = MIN_SCALE;
    pulseScale.value = MIN_SCALE;
    pulseOpacity.value = 0;
  };

  const { selection } = useSelection();
  // const [detectionAnnouncement, setDetectionAnnouncement] = useState<string>("");
  const shouldAnnounce = useRef<boolean>(true);

  // Speech Transcription
  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");
  useSpeechRecognitionEvent("start", () => {
    setRecognizing(true);
    // micStartSnd.seekTo(0);
    // micStartSnd.play();
    resetVolumeMeter();
  });
  useSpeechRecognitionEvent("end", () => {
    setRecognizing(false);
    // micStopSnd.seekTo(0);
    // micStopSnd.play();
    resetVolumeMeter();
  });
  useSpeechRecognitionEvent("result", (event) => {
    setTranscript(event.results[0]?.transcript);

    if (event.isFinal) {
      let a = event.results[0]?.transcript.trim().toLowerCase();

      let cmd = a;

      if (MODEscreen == "voice") {
        if (cmd.startsWith("detect") || cmd.startsWith("cancel")) {
          handleDetect();
        }
        if (cmd.startsWith("read")) {
          handleRead();
        }
        if (cmd.startsWith("describe")) {
          handleDescribe();
        }
        if (cmd.startsWith("open menu")) {
          Speech.stop();
          router.navigate("/preferences");
        }

        if (cmd.startsWith("switch camera")) {
          cmd = cmd.replace("switch camera", "").trim();
          if (cmd.startsWith("to front")) {
            if (!isCamActiveRef.current) {
              reactivateCam();
            }
            setFacing("front");
            Speech.speak("Camera switched to front");
          } else if (cmd.startsWith("to back")) {
            if (!isCamActiveRef.current) {
              reactivateCam();
            }
            setFacing("back");
            Speech.speak("Camera switched to back");
          } else {
            if (!isCamActiveRef.current) {
              reactivateCam();
            }
            setFacing((current) => (current === "back" ? "front" : "back"));
            Speech.speak("Camera switched");
          }
        }
      } else if (MODEscreen == "ai" && !isCamActive) {
        handleAI(cmd);
      }
    }
  });
  useSpeechRecognitionEvent("error", (event) => {
    console.log("error code:", event.error, "error message:", event.message);
  });
  useSpeechRecognitionEvent("volumechange", (event) => {
    // Don't animate anything if the volume is too low
    if (event.value <= 1) {
      return;
    }

    const newScale = interpolate(
      event.value,
      [-2, 10], // The value range is between -2 and 10
      [MIN_SCALE, MAX_SCALE],
      Extrapolation.CLAMP
    );

    // Animate the volume scaling
    volumeScale.value = withSequence(
      withSpring(newScale, {
        damping: 10,
        stiffness: 150,
      }),
      // Scale back down, unless the volume changes again
      withTiming(MIN_SCALE, { duration: 500 })
    );

    // Animate the pulse (scale and fade out)
    if (pulseOpacity.value <= 0) {
      pulseScale.value = MIN_SCALE;
      pulseOpacity.value = 1;
      pulseScale.value = withTiming(MAX_SCALE, {
        duration: 1000,
        easing: Easing.out(Easing.quad),
      });
      pulseOpacity.value = withTiming(0, { duration: 1000 });
    }
  });

  const volumeScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: volumeScale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
    transform: [{ scale: pulseScale.value }],
  }));

  const handleTranscription = async () => {
    if (recognizing) {
      return ExpoSpeechRecognitionModule.stop();
    }

    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      console.warn("Permissions not granted", result);
      return;
    }
    // Start speech recognition
    ExpoSpeechRecognitionModule.start({
      lang: "en-US",
      interimResults: true,
      continuous: false,
      volumeChangeEventOptions: {
        enabled: true,
        // how often you want to receive the volumechange event
        intervalMillis: 300,
      },
    });
  };

  useEffect(() => {
    isCamActiveRef.current = isCamActive;
  }, [isCamActive]);
  useEffect(() => {
    isCamReadyRef.current = isCamReady;
  }, [isCamReady]);

  useEffect(() => {
    if (MODEscreen == "detect") {
      if (!isDetecting) {
        startDetection();
        setIsDetecting(true);
      }
    } else if (MODEscreen != "voice") {
      if (isDetecting) {
        stopDetection();
        setIsDetecting(false);
      }
    }
  }, [MODEscreen]);

  // Switch Camera when shaking
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

          if (isCamActiveRef.current) {
            setFacing((current) => {
              const next = current === "back" ? "front" : "back";

              Speech.speak("Camera switched to " + next);
              return next;
            });
          }
        }

        lastAcceleration.current = { x, y, z };
      };

      const subscription = Accelerometer.addListener(onUpdate);

      return () => subscription.remove(); // Cleanup when component unmounts
    }, [])
  );

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

  async function takePicture() {
    if (cameraRef.current && isCamReadyRef.current && isCamActiveRef.current) {
      // console.log("in condition");
      const photo = await cameraRef.current.takePictureAsync({
        shutterSound: false, // Disable shutter sound
        quality: 0.5, // Set image quality (0 to 1)
        exif: false, // Disable exif data storage
        base64: true, // Return image data in Base64 format
        skipProcessing: false,
      });

      try {
        const response = await fetch("http://20.174.3.30:80/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: photo.base64,
          }),
        });

        const result = await response.json();

        liveDetectionHandler(result.detections);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  }

  function liveDetectionHandler(detections: Detection[]) {
    // setDetections(detections);
    console.log(detections);
    let strToAnnounce = "";
    let safetyAlert = "";
    Object.entries(detections).map(([obj, count]) => {
      if (hazardObjects.includes(obj)) {
        safetyAlert += `${count} ${obj}`;
      }
      if (selection.includes(obj as ObjectType)) {
        strToAnnounce += `${count} ${obj}`;
      }
    });
    if (safetyAlert != "")
      Speech.speak(`Safety Warning: ${safetyAlert} detected!`);
    // setDetectionAnnouncement(strToAnnounce)
    if (shouldAnnounce.current) {
      shouldAnnounce.current = false;
      Speech.speak(strToAnnounce, {
        onDone: () => {
          shouldAnnounce.current = true;
        },
        onError: () => {
          shouldAnnounce.current = true;
        },
        onStopped: () => {
          shouldAnnounce.current = true;
        },
      });
    }
  }

  function startDetection() {
    const id = setInterval(takePicture, 500);
    setIntervalID(id);
  }

  function stopDetection() {
    clearInterval(intervalID);
  }

  const reactivateCam = () => {
    setIsCamActive(true); //
    setFileURI(null); // unload the image for the AI prompts
    setPhotoUri(null); // unloads from the screen
  };

  const handleReadDescribe = async (mod: "read" | "describe") => {
    if (!isCamReady || !cameraRef.current) return;

    reactivateCam();

    const photo = await cameraRef.current.takePictureAsync({ base64: true });
    setPhotoUri(photo.uri);
    setIsCamActive(false); // photoUri

    const endpoint =
      mod === "read"
        ? `http://20.174.3.30:80/ocr`
        : `http://20.174.3.30:80/combined`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: photo.base64,
      }),
    });

    const result = await response.json();
    // const ra = await response.text();

    readDescribeHandler(result.result);
  };

  function readDescribeHandler(text: string) {
    Speech.speak(text);
  }

  const handleAI = async (prompt: string) => {
    if (isCamActive) return;

    let tmpFileURI: any = fileURI;
    let tmpFileMIME: any = fileMIME;
    if (!fileURI) {
      const blob = await fetch(photoUri as any).then((res) => res.blob());
      const myfile = await ai.files.upload({
        file: blob,
        config: { mimeType: "image/jpeg" },
      });

      tmpFileURI = myfile.uri;
      tmpFileMIME = myfile.mimeType;
    }
    const sysInstruction =
      "If you think that there is a missing information or the question is ambigious, reply saying to repeat the question clear." +
      "If the question is not related to the image, do not answer it. Instead, say that you can not help them with this question." +
      "If the question is not complete or is missing, ask for the question to be repeated clearly.";

    const masterPrompt =
      "Strictly follow these instruction when answering the question: " +
      "Instruction: " +
      sysInstruction +
      ". Question: " +
      prompt;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: createUserContent([
        createPartFromUri(tmpFileURI, tmpFileMIME),
        masterPrompt,
      ]),
    });

    setTranscript(response.text as any);
    Speech.speak(response.text || "");

    setFileURI(tmpFileURI);
    setFileMIME(tmpFileMIME);
  };

  const handleRead = () => {
    Speech.stop();
    if (!isCamActive) {
      reactivateCam();
      Speech.speak("Current mode discarded");
      return;
    }
    Speech.speak("Reading");
    setMODE("read");
    setAiAnnouncement("Ask me about the document or sign just read");
    handleReadDescribe("read");
  };

  const handleDetect = () => {
    Speech.stop();
    if (!isCamActive) {
      reactivateCam();
      Speech.speak("Current mode discarded");
      return;
    }
    Speech.speak("Detection Mode");
    setMODE("detect");
  };

  const handleDescribe = () => {
    Speech.stop();
    if (!isCamActive) {
      reactivateCam();
      Speech.speak("Current mode discarded");
      return;
    }
    setMODE("describe");
    setAiAnnouncement("Ask me about the scene just described");
    Speech.speak("Describing");
    handleReadDescribe("describe");
  };
  const handleVoice = () => {
    Speech.stop();
    setMODE("voice");
    handleTranscription();
  };

  const handleSightMate = () => {
    if (isCamActive) return;

    Speech.stop();
    setMODE("ai");
    Speech.speak(aiAnnouncement, {
      onDone: () => {
        setAiAnnouncement("");
        handleTranscription();
      },
    });
  };

  return (
    <View style={styles.container}>
      {isFocused && (
        <CameraView
          animateShutter={false}
          ref={cameraRef}
          active={isCamActive}
          flash="off"
          // barcodeScannerSettings={{
          //   barcodeTypes: allBarcodeTypes,
          // }}
          style={StyleSheet.absoluteFillObject}
          // onBarcodeScanned={onBarcodeScanned}
          facing={facing}
          onCameraReady={() => setIsCamReady(true)}
          // pictureSize=""
          // poster=""
        />
      )}
      <Image
        source={
          isCamActive
            ? require("../assets/images/sightmate-logo.png")
            : { uri: photoUri }
        }
        style={{
          ...StyleSheet.absoluteFillObject,
          opacity: isCamActive ? 0 : 1,
        }}
      />
      {/* <SafeAreaView style={{ ...StyleSheet.absoluteFillObject }}> */}
      <View
        style={tw`flex-1`}
        accessible={true}
        accessibilityLabel={t("homeDesc-a")}
      >
        <View
          style={{
            ...tw`flex-1 items-center justify-center`,
            zIndex: 2,
            // backgroundColor: "rgba(240, 13, 13, 0.2)",
          }}
          accessible={true}
          accessibilityLabel={t("home-a")}
        >
          <Pressable
            style={{
              ...tw`absolute top-12 right-4 rounded-[20px] p-2`,
              shadowColor: "#7f5df0",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 3.5,
              elevation: 5,
              backgroundColor: isDarkMode ? dark.menuBtn : light.menuBtn,
            }}
            onPress={() => {
              Speech.stop();
              router.navigate("/preferences");
            }}
            accessibilityLabel={t("menuBtn-a")}
            accessibilityRole="button"
          >
            <Ionicons
              name="menu"
              size={60}
              color={isDarkMode ? dark.menuBtnIcon : light.menuBtnIcon}
            />
          </Pressable>

          {transcript && (
            <Text
              accessible={true}
              style={tw`text-5xl text-blue-500 font-bold bg-[#040]`}
            >
              {transcript}
            </Text>
          )}

          <View
            style={{
              ...styles.actionSection,
            }}
          >
            <View
              style={{
                backgroundColor: isDarkMode
                  ? dark.actionSection
                  : light.actionSection,
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                width: 275,
                // paddingHorizontal: 50,
                paddingTop: 5,
                alignItems: "center",
                alignSelf: "center",
                zIndex: 13,
              }}
            >
              <Text
                accessible={true}
                style={{
                  color: isDarkMode ? dark.actionBtnText : light.actionBtnText,
                  fontSize: 20 * fontScale,
                }}
              >
                {MODEscreen === "read" && t("mode-read")}
                {MODEscreen === "detect" && t("mode-detect")}
                {MODEscreen === "describe" && t("mode-describe")}
                {MODEscreen === "voice" && t("mode-voice")}
                {MODEscreen === "ai" && t("mode-ai")}
              </Text>
            </View>
            <View
              style={{
                ...styles.fabContainer,
                backgroundColor: isDarkMode
                  ? dark.actionSection
                  : light.actionSection,
                padding: fontScale < 1.4 ? 20 : 0,
              }}
            >
              <View
                style={{
                  position: "absolute",
                  // backgroundColor: "#f0f",
                  width: "100%",
                  alignItems: "center",
                  alignSelf: "center",
                }}
              >
                <Animated.View
                  style={[
                    styles.expandingCircle,
                    volumeScaleStyle,
                    {
                      backgroundColor: isDarkMode
                        ? dark.mainBtn
                        : light.mainBtn,
                    },
                  ]}
                />
                <Animated.View
                  style={[
                    styles.expandingBorder,
                    pulseStyle,
                    { borderColor: isDarkMode ? dark.mainBtn : light.mainBtn },
                  ]}
                />
                <Pressable
                  style={{ zIndex: 5 }}
                  accessibilityLabel={t("voice-a")}
                  accessibilityHint={t("voiceHint-a")}
                  accessibilityRole="button"
                  onPress={() => handleVoice}
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
                    <Image
                      source={
                        isDarkMode
                          ? require("../assets/icons/dark/voice.png")
                          : require("../assets/icons/light/voice.png")
                      }
                      resizeMode="contain"
                      style={{ width: 45, height: 45 }}
                    />
                  </Animated.View>
                </Pressable>
              </View>
              <ActionButton
                src={
                  isDarkMode
                    ? require("../assets/icons/dark/sightmate.png")
                    : require("../assets/icons/light/sightmate.png")
                }
                label={t("sightmate")}
                aLabel={t("sightmate-a")}
                isDMode={isDarkMode}
                onPress={handleSightMate}
              />
              <ActionButton
                src={
                  isDarkMode
                    ? require("../assets/icons/dark/read.png")
                    : require("../assets/icons/light/read.png")
                }
                onPress={handleRead}
                label={t("read")}
                aLabel={t("read-a")}
                isDMode={isDarkMode}
              />
              <ActionButton
                src={
                  isDarkMode
                    ? require("../assets/icons/dark/detect.png")
                    : require("../assets/icons/light/detect.png")
                }
                onPress={handleDetect}
                label={t("detect")}
                aLabel={t("detect-a")}
                isDMode={isDarkMode}
              />
              <ActionButton
                src={
                  isDarkMode
                    ? require("../assets/icons/dark/describe.png")
                    : require("../assets/icons/light/describe.png")
                }
                onPress={handleDescribe}
                label={t("describe")}
                aLabel={t("describe-a")}
                isDMode={isDarkMode}
              />
            </View>
          </View>
        </View>
      </View>
      {/* </SafeAreaView> */}
    </View>
  );
}
