import { dark, light } from "@/utils/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
    View
} from "react-native";
import CountryFlag from "react-native-country-flag";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFontScale } from "../../context/fontScaleContext";
import { ThemeContext } from "../../context/ThemeContext";

export default function profile() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [lngVisible, setLngVisibility] = useState(false);
  const { fontScale, increaseFont, decreaseFont } = useFontScale();
  const {isDarkMode, toggleTheme} = useContext(ThemeContext);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: isDarkMode ? dark.prefBg : light.prefBg }}
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
          <Modal
            visible={lngVisible}
            onRequestClose={() => setLngVisibility(false)}
            animationType="fade"
            transparent
          >
            <Pressable
              style={{ height: 250, backgroundColor: "#DDD", opacity: 0.5 }}
              onPress={() => setLngVisibility(false)}
              accessibilityLabel={t("toBackPrefBtn-a")}
            />
            <View
              style={{ padding: 40, backgroundColor: isDarkMode ? dark.prefBg : light.prefBg, height: "100%" }}
            >
              <TouchableOpacity
                onPress={() => {
                  i18n.changeLanguage("en");
                  setLngVisibility(false);
                }}
                style={[styles.row, {backgroundColor: isDarkMode ? dark.prefRow : light.prefRow}]}
                accessibilityLabel={t("setEnglish")}
              >
                <View style={[styles.rowIcon]}>
                  <CountryFlag isoCode="us" size={18} />
                </View>
                <Text style={[styles.rowLabel, { fontSize: 17 * fontScale, backgroundColor: isDarkMode ? dark.prefRowText : light.prefRowText }]}>
                  English
                </Text>
                <View style={styles.rowSpacer} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  i18n.changeLanguage("ar");
                  setLngVisibility(false);
                }}
                style={[styles.row, {backgroundColor: isDarkMode ? dark.prefRow : light.prefRow}]}
                accessibilityLabel={t("setArabic")}
                accessible={true}
              >
                <View style={[styles.rowIcon]}>
                  <CountryFlag isoCode="ae" size={18} />
                </View>
                <Text style={[styles.rowLabel, { fontSize: 17 * fontScale, backgroundColor: isDarkMode ? dark.prefRowText : light.prefRowText }]}>
                  العربية
                </Text>
                <View style={styles.rowSpacer} />
              </TouchableOpacity>
            </View>
          </Modal>
          <View>
            <TouchableOpacity
              style={{
                shadowColor: "#7f5df0",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.25,
                shadowRadius: 3.5,
                elevation: 5,
                zIndex: 9,
                backgroundColor: isDarkMode ? dark.menuBtn : light.menuBtn
              }}
              onPress={() => router.back()}
              className="absolute top-5 left-4 rounded-[20px] p-2"
              accessibilityLabel={t("toHomeBtn-a")}
              accessibilityRole="button"
            >
              <MaterialIcons name="west" size={60} color={isDarkMode ? dark.menuBtnIcon : light.menuBtnIcon} />
            </TouchableOpacity>
          </View>
          <View style={[styles.profile, {backgroundColor: isDarkMode ? dark.prefBg : light.prefBg}]}>
            <TouchableOpacity
              onPress={() => {
                // handle onPress
              }}
            >
              <View style={styles.profileAvatarWrapper}>
                <Image
                  style={styles.profileAvatar}
                  source={require("../../assets/images/icon.png")}
                />
                <TouchableOpacity
                  onPress={() => {
                    // handle onPress
                  }}
                >
                  <View style={styles.profileAction}>
                    <MaterialIcons color="#fff" name="article" size={15} />
                  </View>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
            <View>
              <Text style={[styles.profileName, { fontSize: 19 * fontScale, color: isDarkMode ? dark.prefRowText : light.prefRowText }]}>
                John Doe
              </Text>
              <Text
                style={[styles.profileAddress, { fontSize: 16 * fontScale, color: isDarkMode ? dark.prefRowText : light.prefRowText }]}
              >
                123 Maple Street. Anytown, PA 17101
              </Text>
            </View>
          </View>
          <ScrollView>
            <View style={styles.section}>
              <Text
                accessibilityRole="header"
                accessibilityLabel={t("preferences")}
                style={[styles.sectionTitle, { fontSize: 12 * fontScale, color: isDarkMode ? dark.prefRowText : light.prefRowText }]}
              >
                {t("preferences")}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setLngVisibility(true);
                }}
                style={[styles.row, {backgroundColor: isDarkMode ? dark.prefRow : light.prefRow}]}
                accessibilityLabel={t("language")}
              >
                <View style={[styles.rowIcon, { backgroundColor: "#fe9400" }]}>
                  <MaterialIcons color="#fff" name="language" size={20} />
                </View>
                <Text style={[styles.rowLabel, { fontSize: 17 * fontScale, color: isDarkMode ? dark.prefRowText : light.prefRowText }]}>
                  {t("language")}
                </Text>
                <View style={styles.rowSpacer} />
                <MaterialIcons color={isDarkMode ? dark.prefRowText : light.prefRowText} name="east" size={35} />
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityLabel={t("dMode")}
                accessibilityRole="togglebutton"
                accessibilityState={{ checked: isDarkMode }}
                style={[styles.row, {backgroundColor: isDarkMode ? dark.prefRow : light.prefRow}]}
                onPress={toggleTheme}
              >
                <View style={[styles.rowIcon, { backgroundColor: "#007afe" }]}>
                  <MaterialIcons color="#fff" name="dark-mode" size={20} />
                </View>
                <Text style={[styles.rowLabel, { fontSize: 17 * fontScale, color: isDarkMode ? dark.prefRowText : light.prefRowText }]}>
                  {t("dMode")}
                </Text>
                <View style={styles.rowSpacer} />
                <Switch
                  accessible={false}
                  onValueChange={toggleTheme}
                  value={isDarkMode}
                />
              </TouchableOpacity>

              <View style={[styles.row, {backgroundColor: isDarkMode ? dark.prefRow : light.prefRow}]} accessibilityLabel={t("fontSize-a")}>
                <View style={[styles.rowIcon, { backgroundColor: "#007afe" }]}>
                  <MaterialIcons color="#fff" name="text-fields" size={20} />
                </View>
                <Text style={[styles.rowLabel, { fontSize: 17 * fontScale, color: isDarkMode ? dark.prefRowText : light.prefRowText }]}>
                  {t("fontSize")}
                </Text>
                <View style={styles.rowSpacer} />
                <TouchableOpacity
                  className="mx-3"
                  onPress={decreaseFont}
                  // disabled={fontScale == 0.8}

                  accessibilityLabel={t("decFont-a")}
                  accessibilityState={{ disabled: fontScale == 0.8 }}
                >
                  <MaterialIcons color={isDarkMode ? dark.prefRowText : light.prefRowText} name="remove" size={60} />
                </TouchableOpacity>
                <TouchableOpacity
                  className="mx-3"
                  onPress={increaseFont}
                  // disabled={fontScale == 1.6}
                  accessibilityLabel={t("incFont-a")}
                  accessibilityState={{ disabled: fontScale == 1.6 }}
                >
                  <MaterialIcons color={isDarkMode ? dark.prefRowText : light.prefRowText} name="add" size={60} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.section}>
              <Text
                accessibilityRole="header"
                accessibilityLabel={t("resources")}
                style={[styles.sectionTitle, { fontSize: 12 * fontScale, color: isDarkMode ? dark.prefRowText : light.prefRowText }]}
              >
                {t("resources")}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  router.push("/onboarding")
                }}
                style={[styles.row, {backgroundColor: isDarkMode ? dark.prefRow : light.prefRow}]}
                accessibilityLabel={t("tutorial-a")}
                accessibilityHint={t("tutorialHint-a")}
              >
                <View style={[styles.rowIcon, { backgroundColor: "#8e8d91" }]}>
                  <MaterialIcons color="#fff" name="lightbulb" size={20} />
                </View>
                <Text style={[styles.rowLabel, { fontSize: 17 * fontScale, color: isDarkMode ? dark.prefRowText : light.prefRowText }]}>
                  {t("tutorial")}
                </Text>
                <View style={styles.rowSpacer} />
                <MaterialIcons color={isDarkMode ? dark.prefRowText : light.prefRowText} name="east" size={35} />
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
