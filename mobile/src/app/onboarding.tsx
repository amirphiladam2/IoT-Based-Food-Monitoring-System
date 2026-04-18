import { Text, View, StyleSheet, Image, Modal, ScrollView, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { Colors } from "../constants/Colors";
import PrimaryButton from "../components/Buttons/PrimaryButton";
import { useAuth } from "../context/AuthContext";

export default function OnboardingScreen() {
  const [isPolicyVisible, setIsPolicyVisible] = useState(false);
  const { completeOnboarding } = useAuth();

  const handleGetStarted = async () => {
    await completeOnboarding();
  };

  return (
    <View style={styles.container}>
      {/* Illustration container and image */}
      <View style={styles.illustation}>
        <Image
          source={require("@/assets/images/FoodFreshness.png")}
          style={{ width: "100%", height: "100%" }}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Track your food Quality Instantly</Text>
        <Text style={styles.subtitle}>Reduce waste and eat fresh!</Text>
      </View>

      {/* Button container */}
      <View style={styles.buttonContainer}>
        <PrimaryButton 
            title="Get Started" 
            onPress={handleGetStarted} 
            color={Colors.primary}
            textColor={Colors.light}
          
          />
        <Text style={styles.termsText}>
          By clicking on Get Started, you agree to our{" "}
          <Text style={styles.linkText} onPress={() => setIsPolicyVisible(true)}>
            Terms & Privacy Policy
          </Text>
        </Text>
      </View>

      <Modal
        visible={isPolicyVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsPolicyVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.policyCard}>
            <View style={styles.policyHeader}>
              <View>
                <Text style={styles.policyEyebrow}>FreshGuard Policy</Text>
                <Text style={styles.policyTitle}>Terms & Privacy</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsPolicyVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.policyScroll}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.policySectionTitle}>Using FreshGuard</Text>
              <Text style={styles.policyBody}>
                FreshGuard helps you monitor food-storage conditions using linked
                hardware and cloud-synced readings. The app is informational and
                should support, not replace, your own food-safety judgment.
              </Text>

              <Text style={styles.policySectionTitle}>Your Responsibility</Text>
              <Text style={styles.policyBody}>
                You are responsible for pairing the correct device, reviewing
                alerts promptly, and making final decisions about food use,
                disposal, and storage conditions.
              </Text>

              <Text style={styles.policySectionTitle}>Data We Store</Text>
              <Text style={styles.policyBody}>
                FreshGuard may store your account details, device ID, avatar,
                notification token, and sensor readings so the app can show live
                status, history, and alerts across your signed-in device.
              </Text>

              <Text style={styles.policySectionTitle}>Privacy</Text>
              <Text style={styles.policyBody}>
                Your data is used to operate app features like authentication,
                device pairing, profile personalization, and push notifications.
                You can stop using the service at any time by signing out and
                unpairing your hardware.
              </Text>

              <Text style={styles.policySectionTitle}>Service Availability</Text>
              <Text style={styles.policyBody}>
                Alerts and readings depend on device connectivity, network
                access, and backend availability. Delays, stale readings, or
                temporary outages can happen, so critical decisions should not
                rely on the app alone.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  illustation: {
    marginTop: 0,
    width: "100%",
    height: "70%",
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    overflow: "hidden",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 40,
    left: 15,
    right: 15,
  },
  termsText: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: "center",
    marginTop: 20,
    gap: 4,
  },
  linkText: {
    color: Colors.primary,
    textDecorationLine: "underline",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
    padding: 16,
  },
  policyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    maxHeight: "72%",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 10,
  },
  policyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  policyEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  policyTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.text,
  },
  closeButton: {
    backgroundColor: "#EEF8F8",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  closeButtonText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  policyScroll: {
    paddingRight: 4,
  },
  policySectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 6,
    marginTop: 10,
  },
  policyBody: {
    fontSize: 14,
    lineHeight: 22,
    color: "#5F6E7A",
  },
});
