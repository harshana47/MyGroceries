// app/support/support.tsx
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  ImageBackground,
  LayoutAnimation,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  UIManager,
  View,
} from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Reusable gradient accordion section
const SupportSection = ({
  id,
  title,
  icon,
  color,
  open,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  open: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) => {
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        onToggle(id);
      }}
    >
      <View style={{ marginBottom: 18 }}>
        <LinearGradient
          colors={[color, color + "cc", "#ffffff22"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sectionWrapper}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconRow}>
              <View
                style={[styles.iconCircle, { backgroundColor: "#ffffff22" }]}
              >
                {icon}
              </View>
              <Text style={styles.sectionTitle}>{title}</Text>
            </View>
            <MaterialIcons
              name={open ? "keyboard-arrow-up" : "keyboard-arrow-down"}
              size={30}
              color="#fff"
              style={{ opacity: 0.9 }}
            />
          </View>
          {open && <View style={styles.sectionBody}>{children}</View>}
        </LinearGradient>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default function Support() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const sections = [
    {
      id: "instructions",
      title: "Instructions",
      icon: <Ionicons name="document-text" size={22} color="#fff" />,
      color: "#6366f1",
      body: (
        <Text style={styles.bodyText}>
          1. Login or Sign up to start using the app.{"\n"}
          2. Add groceries using the Grocery tab.{"\n"}
          3. Track completed lists in History.{"\n"}
          4. Use Map & Support for more utilities.{"\n"}
          5. Manage your profile & preferences anytime.
        </Text>
      ),
    },
    {
      id: "feedback",
      title: "Feedback",
      icon: <FontAwesome5 name="comment-dots" size={18} color="#fff" />,
      color: "#8b5cf6",
      body: (
        <Text style={styles.bodyText}>
          We value your feedback. Share suggestions or report issues to help us
          improve the experience. Thank you for contributing!
        </Text>
      ),
    },
  ];

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <ImageBackground
      source={require("../../../assets/images/help1.jpg")}
      className="flex-1"
      resizeMode="cover"
    >
      {/* Dark overlay refined */}
      <View className="absolute inset-0">
        <LinearGradient
          colors={["#000000d8", "#000000aa", "#111827dd"]}
          style={{ flex: 1 }}
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: 100,
          paddingBottom: 60,
        }}
        className="flex-1"
      >
        {/* Header */}
        <View style={{ marginBottom: 34 }}>
          <Text style={styles.headerTitle}>Support Center</Text>
          <Text style={styles.headerSubtitle}>
            Help, guidance & ways to reach us
          </Text>
          <View style={styles.headerAccent} />
        </View>

        {/* Sections */}
        {sections.map((s) => (
          <SupportSection
            key={s.id}
            id={s.id}
            title={s.title}
            icon={s.icon}
            color={s.color}
            open={openSection === s.id}
            onToggle={toggleSection}
          >
            {s.body}
          </SupportSection>
        ))}

        {/* Contact Card */}
        <LinearGradient
          colors={["#0ea5e9", "#0284c7", "#0369a1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.contactWrapper}
        >
          <View style={styles.contactHeaderRow}>
            <View style={styles.sectionIconRow}>
              <View
                style={[styles.iconCircle, { backgroundColor: "#ffffff22" }]}
              >
                <MaterialIcons name="call" size={22} color="#fff" />
              </View>
              <Text style={styles.contactTitle}>Contact Us</Text>
            </View>
          </View>
          <View style={styles.contactBody}>
            <Text style={styles.contactLine}>Email: support@example.com</Text>
            <Text style={styles.contactLine}>Phone: +123 456 7890</Text>
            <Text style={styles.contactLine}>
              Address: 123 Main Street, City
            </Text>
            <Text style={styles.contactLine}>Website: mygroceryapp.com</Text>
            <View style={styles.quickActionsRow}>
              <TouchableOpacity
                style={styles.actionChip}
                onPress={() =>
                  Linking.openURL("mailto:pabodhaharshana15@gmail.com")
                }
              >
                <MaterialIcons name="email" size={16} color="#fff" />
                <Text style={styles.actionChipText}>Email</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionChip}
                onPress={() => Linking.openURL("tel:+94701969102")}
              >
                <MaterialIcons name="phone" size={16} color="#fff" />
                <Text style={styles.actionChipText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionChip}
                onPress={() => Linking.openURL("https://mygroceryapp.com")}
              >
                <MaterialIcons name="open-in-new" size={16} color="#fff" />
                <Text style={styles.actionChipText}>Visit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </ImageBackground>
  );
}

// Styles additive (kept separate for clarity)
const styles = StyleSheet.create({
  sectionWrapper: {
    borderRadius: 26,
    padding: 1.5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  sectionIconRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  sectionBody: {
    paddingHorizontal: 22,
    paddingBottom: 18,
    paddingTop: 4,
  },
  bodyText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13.5,
    lineHeight: 20,
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.8,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.65)",
    marginTop: 6,
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.4,
  },
  headerAccent: {
    height: 4,
    width: 72,
    backgroundColor: "#6366f1",
    borderRadius: 4,
    marginTop: 14,
  },
  contactWrapper: {
    borderRadius: 28,
    padding: 2,
    marginTop: 12,
    marginBottom: 40,
  },
  contactHeaderRow: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 4,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.5,
  },
  contactBody: {
    paddingHorizontal: 24,
    paddingBottom: 22,
    paddingTop: 12,
  },
  contactLine: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13.5,
    fontWeight: "500",
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  quickActionsRow: {
    flexDirection: "row",
    marginTop: 14,
  },
  actionChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
  },
  actionChipText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 6,
    letterSpacing: 0.3,
  },
});
