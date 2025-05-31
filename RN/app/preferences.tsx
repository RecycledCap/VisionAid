import { dark, light } from "@/utils/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CountryFlag from "react-native-country-flag";
import { SafeAreaView } from "react-native-safe-area-context";
import tw from "twrnc";
import { useFontScale } from "../context/fontScaleContext";
import { COCO_CLASSES, useSelection } from "../context/selectionContext";
import { ThemeContext } from "../context/ThemeContext";

export default function preferences() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [lngVisible, setLngVisibility] = useState(false);
  const { fontScale, increaseFont, decreaseFont } = useFontScale();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const { selection, updateSelection } = useSelection();
  const [selVisible, setSelVisibility] = useState(false);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? dark.prefBg : light.prefBg,
      }}
    >
      <View
        style={{ flex: 1 }}
        accessible={true}
        accessibilityLabel={t("preferencesDesc-a")}
      >
        <View
          style={{ flex: 1 }}
          accessible={true}
          accessibilityLabel={t("preferences-a")}
        >
          {lngVisible && (
            <Modal
              visible={lngVisible}
              onRequestClose={() => setLngVisibility(false)}
              animationType="fade"
              transparent
            >
              <View accessible={true} accessibilityLabel={t("modalDesc-a")}>
                <Pressable
                  style={{
                    height: 250,
                    backgroundColor: isDarkMode ? "#121212" : "#DDD",
                    opacity: 0.5,
                  }}
                  onPress={() => setLngVisibility(false)}
                  accessibilityLabel={t("toBackPrefBtn-a")}
                />
                <View
                  style={{
                    padding: 40,
                    backgroundColor: isDarkMode ? dark.prefBg : light.prefBg,
                    height: "100%",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      i18n.changeLanguage("en");
                      setLngVisibility(false);
                      SecureStore.setItemAsync("language", `en`);
                    }}
                    style={[
                      styles.row,
                      {
                        backgroundColor: isDarkMode
                          ? dark.prefRow
                          : light.prefRow,
                      },
                    ]}
                    accessibilityLabel={t("setEnglish")}
                  >
                    <View style={[styles.rowIcon]}>
                      <CountryFlag isoCode="us" size={18} />
                    </View>
                    <Text
                      style={[
                        styles.rowLabel,
                        {
                          fontSize: 17 * fontScale,
                          color: isDarkMode
                            ? dark.prefRowText
                            : light.prefRowText,
                        },
                      ]}
                    >
                      English
                    </Text>
                    <View style={styles.rowSpacer} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      i18n.changeLanguage("ar");
                      setLngVisibility(false);
                      SecureStore.setItemAsync("language", `ar`);
                    }}
                    style={[
                      styles.row,
                      {
                        backgroundColor: isDarkMode
                          ? dark.prefRow
                          : light.prefRow,
                      },
                    ]}
                    accessibilityLabel={t("setArabic")}
                    accessible={true}
                  >
                    <View style={[styles.rowIcon]}>
                      <CountryFlag isoCode="ae" size={18} />
                    </View>
                    <Text
                      style={[
                        styles.rowLabel,
                        {
                          fontSize: 17 * fontScale,
                          color: isDarkMode
                            ? dark.prefRowText
                            : light.prefRowText,
                        },
                      ]}
                    >
                      العربية
                    </Text>
                    <View style={styles.rowSpacer} />
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          )}
          {selVisible && (
            <Modal
              visible={true}
              onRequestClose={() => setSelVisibility(false)}
              animationType="fade"
              transparent
            >
              <View accessible={true} accessibilityLabel={t("modalDesc-a")}>
                <Pressable
                  style={{
                    height: 250,
                    backgroundColor: isDarkMode ? "#121212" : "#DDD",
                    opacity: 0.5,
                  }}
                  onPress={() => setSelVisibility(false)}
                  accessibilityLabel={t("toBackPrefBtn-a")}
                />
                <ScrollView
                  style={{
                    padding: 40,
                    backgroundColor: isDarkMode ? dark.prefBg : light.prefBg,
                    height: "100%",
                  }}
                >
                  {COCO_CLASSES.map((obj) => {
                    return (
                      <TouchableOpacity
                        key={obj}
                        onPress={() => {
                          if (selection.includes(obj))
                            updateSelection(
                              selection.filter((item) => item !== obj)
                            );
                          else updateSelection([obj, ...selection]);
                        }}
                        style={[
                          styles.row,
                          {
                            backgroundColor: isDarkMode
                              ? dark.prefRow
                              : light.prefRow,
                            paddingLeft: 25,
                          },
                        ]}
                        accessibilityLabel={obj}
                      >
                        <Text
                          style={[
                            styles.rowLabel,
                            {
                              fontSize: 17 * fontScale,
                              color: isDarkMode
                                ? dark.prefRowText
                                : light.prefRowText,
                            },
                          ]}
                        >
                          {t(obj).charAt(0).toUpperCase() + t(obj).slice(1)}
                        </Text>
                        <View style={styles.rowSpacer} />
                        {selection.includes(obj) && (
                          <View style={[styles.rowIcon]}>
                            <MaterialIcons
                              name="check-circle"
                              size={30}
                              color={
                                isDarkMode
                                  ? dark.prefRowText
                                  : light.prefRowText
                              }
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </Modal>
          )}
          <View>
            <TouchableOpacity
              style={{
                ...tw`absolute top-5 left-4 rounded-[20px] p-2`,
                shadowColor: "#7f5df0",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.25,
                shadowRadius: 3.5,
                elevation: 5,
                zIndex: 9,
                backgroundColor: isDarkMode ? dark.menuBtn : light.menuBtn,
              }}
              onPress={() => router.back()}
              accessibilityLabel={t("toHomeBtn-a")}
              accessibilityRole="button"
            >
              <MaterialIcons
                name="west"
                size={60}
                color={isDarkMode ? dark.prefRowText : light.prefRowText}
              />
            </TouchableOpacity>
          </View>
          <View
            style={[
              styles.profile,
              { backgroundColor: isDarkMode ? dark.prefBg : light.prefBg },
            ]}
          >
            <View style={styles.profileAvatarWrapper}>
              <Image
                style={styles.profileAvatar}
                source={
                  isDarkMode
                    ? require("../assets/icons/dark/sightmate.png")
                    : require("../assets/icons/light/sightmate.png")
                }
              />
            </View>
            <View>
              <Text
                style={[
                  styles.profileName,
                  {
                    fontSize: 19 * fontScale,
                    color: isDarkMode ? dark.prefRowText : light.prefRowText,
                  },
                ]}
              >
                {t("app-name")}
              </Text>
              <Text
                style={[
                  styles.profileAddress,
                  {
                    fontSize: 16 * fontScale,
                    color: isDarkMode ? dark.prefRowText : light.prefRowText,
                  },
                ]}
              >
                {t("app-motto")}
              </Text>
            </View>
          </View>
          <ScrollView>
            <View style={styles.section}>
              <Text
                accessible={true}
                accessibilityRole="header"
                accessibilityLabel={t("preferences")}
                style={[
                  styles.sectionTitle,
                  {
                    fontSize: 14 * fontScale,
                    color: isDarkMode ? dark.prefRowText : light.prefRowText,
                  },
                ]}
              >
                {t("preferences")}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setLngVisibility(true);
                }}
                style={[
                  styles.row,
                  {
                    backgroundColor: isDarkMode ? dark.prefRow : light.prefRow,
                  },
                ]}
                accessibilityLabel={t("language-a")}
              >
                <View style={[styles.rowIcon, { backgroundColor: "#fe9400" }]}>
                  <MaterialIcons color="#fff" name="language" size={20} />
                </View>
                <Text
                  style={[
                    styles.rowLabel,
                    {
                      fontSize: 17 * fontScale,
                      color: isDarkMode ? dark.prefRowText : light.prefRowText,
                    },
                  ]}
                >
                  {t("language")}
                </Text>
                <View style={styles.rowSpacer} />
                <MaterialIcons
                  color={isDarkMode ? dark.prefRowText : light.prefRowText}
                  name="east"
                  size={35}
                />
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityLabel={t("dMode")}
                accessibilityRole="togglebutton"
                accessibilityState={{ checked: isDarkMode }}
                style={[
                  styles.row,
                  {
                    backgroundColor: isDarkMode ? dark.prefRow : light.prefRow,
                  },
                ]}
                onPress={toggleTheme}
              >
                <View style={[styles.rowIcon, { backgroundColor: "#007afe" }]}>
                  <MaterialIcons color="#fff" name="dark-mode" size={20} />
                </View>
                <Text
                  style={[
                    styles.rowLabel,
                    {
                      fontSize: 17 * fontScale,
                      color: isDarkMode ? dark.prefRowText : light.prefRowText,
                    },
                  ]}
                >
                  {t("dMode")}
                </Text>
                <View style={styles.rowSpacer} />
                <Switch
                  accessible={false}
                  onValueChange={toggleTheme}
                  value={isDarkMode}
                />
              </TouchableOpacity>

              <View
                style={[
                  styles.row,
                  {
                    backgroundColor: isDarkMode ? dark.prefRow : light.prefRow,
                  },
                ]}
                accessibilityLabel={t("fontSize-a")}
              >
                <View style={[styles.rowIcon, { backgroundColor: "#007afe" }]}>
                  <MaterialIcons color="#fff" name="text-fields" size={20} />
                </View>
                <Text
                  style={[
                    styles.rowLabel,
                    {
                      fontSize: 17 * fontScale,
                      color: isDarkMode ? dark.prefRowText : light.prefRowText,
                    },
                  ]}
                >
                  {t("fontSize")}
                </Text>
                <View style={styles.rowSpacer} />
                <TouchableOpacity
                  style={tw`mx-3`}
                  onPress={decreaseFont}
                  // disabled={fontScale == 0.8}

                  accessibilityLabel={t("decFont-a")}
                  accessibilityState={{ disabled: fontScale == 0.8 }}
                >
                  <MaterialIcons
                    color={isDarkMode ? dark.prefRowText : light.prefRowText}
                    name="remove"
                    size={60}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={tw`mx-3`}
                  onPress={increaseFont}
                  // disabled={fontScale == 1.6}
                  accessibilityLabel={t("incFont-a")}
                  accessibilityState={{ disabled: fontScale == 1.6 }}
                >
                  <MaterialIcons
                    color={isDarkMode ? dark.prefRowText : light.prefRowText}
                    name="add"
                    size={60}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setSelVisibility(true);
                }}
                style={[
                  styles.row,
                  {
                    backgroundColor: isDarkMode ? dark.prefRow : light.prefRow,
                  },
                ]}
                accessibilityLabel={t("selection-a")}
              >
                <View style={[styles.rowIcon, { backgroundColor: "#007afe" }]}>
                  <MaterialIcons
                    color="#fff"
                    name="center-focus-strong"
                    size={20}
                  />
                </View>
                <Text
                  style={[
                    styles.rowLabel,
                    {
                      fontSize: 17 * fontScale,
                      color: isDarkMode ? dark.prefRowText : light.prefRowText,
                    },
                  ]}
                >
                  {t("selection")}
                </Text>
                <View style={styles.rowSpacer} />
                <MaterialIcons
                  color={isDarkMode ? dark.prefRowText : light.prefRowText}
                  name="east"
                  size={35}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.section}>
              <Text
                accessible={true}
                accessibilityRole="header"
                accessibilityLabel={t("resources")}
                style={[
                  styles.sectionTitle,
                  {
                    fontSize: 14 * fontScale,
                    color: isDarkMode ? dark.prefRowText : light.prefRowText,
                  },
                ]}
              >
                {t("resources")}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  router.push("/");
                }}
                style={[
                  styles.row,
                  {
                    backgroundColor: isDarkMode ? dark.prefRow : light.prefRow,
                  },
                ]}
                accessibilityLabel={t("tutorial-a")}
                accessibilityHint={t("tutorialHint-a")}
              >
                <View style={[styles.rowIcon, { backgroundColor: "#8e8d91" }]}>
                  <MaterialIcons color="#fff" name="lightbulb" size={20} />
                </View>
                <Text
                  style={[
                    styles.rowLabel,
                    {
                      fontSize: 17 * fontScale,
                      color: isDarkMode ? dark.prefRowText : light.prefRowText,
                    },
                  ]}
                >
                  {t("tutorial")}
                </Text>
                <View style={styles.rowSpacer} />
                <MaterialIcons
                  color={isDarkMode ? dark.prefRowText : light.prefRowText}
                  name="east"
                  size={35}
                />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /** Profile */
  profile: {
    padding: 24,
    backgroundColor: "#fff",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarWrapper: {
    position: "relative",
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 9999,
  },
  profileAction: {
    position: "absolute",
    right: -4,
    bottom: -10,
    alignItems: "center",
    justifyContent: "center",
    width: 28,
    height: 28,
    borderRadius: 9999,
    backgroundColor: "#007bff",
  },
  profileName: {
    marginTop: 20,
    fontSize: 19,
    fontWeight: "600",
    color: "#414d63",
    textAlign: "center",
  },
  profileAddress: {
    marginTop: 5,
    fontSize: 16,
    color: "#989898",
    textAlign: "center",
    fontStyle: "italic",
  },
  /** Section */
  section: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    paddingVertical: 12,
    fontSize: 12,
    fontWeight: "600",
    color: "#9e9e9e",
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  /** Row */
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    height: 80,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    marginRight: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: "400",
    color: "#0c0c0c",
  },
  rowSpacer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
});
