import React, { useState } from "react";
import { SafeAreaView, View, StyleSheet, Alert } from "react-native";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { AppHeader } from "./src/components/layout/AppHeader";
import { AppFooter, BottomTabKey } from "./src/components/layout/AppFooter";
import { SplashScreen } from "./src/components/SplashScreen";
import { SplashProvider } from "./src/contexts/SplashContext";
import { AppProvider, useAppContext } from "./src/state/AppContext";
import type { RootStackParamList } from "./src/types/navigation";

type RootRouteName = keyof RootStackParamList;

function AppContent() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const [activeTab, setActiveTab] = useState<BottomTabKey>("home");
  const [showSplash, setShowSplash] = useState(true);
  const { user, selectedTownId, selectedTownName } = useAppContext();

  const routeToTab = (name?: RootRouteName): BottomTabKey => {
    if (!name) return "home";
    if (name === "Account") return "account";
    if (name === "Town") return "town";
    return "home";
  };

  const handleStateChange = () => {
    const route = navigationRef.getCurrentRoute();
    const name = route?.name as RootRouteName | undefined;
    setActiveTab(routeToTab(name));
  };

  const handleTabPress = (tab: BottomTabKey) => {
    if (!navigationRef.isReady()) return;
    setActiveTab(tab);

    switch (tab) {
      case "home":
        navigationRef.navigate("Home");
        break;
      case "town": {
        // Prioridad: selectedTown > user.town
        const townId = selectedTownId ?? user?.townId;
        const townName = selectedTownName ?? user?.townName;
        if (townId && townName) {
          navigationRef.navigate("Town", { townId, townName });
        } else {
          Alert.alert(
            "Selecciona tu pueblo",
            "Ve a Mi cuenta para elegir tu pueblo principal."
          );
        }
        break;
      }
      case "account":
        navigationRef.navigate("Account");
        break;
      case "magic":
        if (!user) {
          navigationRef.navigate("Login");
        } else {
          navigationRef.navigate("PublishWizard" as keyof RootStackParamList, {} as never);
        }
        break;
    }
  };

  if (showSplash) {
    return (
      <SplashScreen
        onFinish={() => {
          setShowSplash(false);
          // La navegación se hará automáticamente cuando se monte el NavigationContainer
        }}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <AppHeader onLogoPress={() => setShowSplash(true)} />
        <View style={styles.content}>
          <SplashProvider onShowSplash={() => setShowSplash(true)}>
            <NavigationContainer
              ref={navigationRef}
              onStateChange={handleStateChange}
            >
              <RootNavigator />
            </NavigationContainer>
          </SplashProvider>
        </View>
        <AppFooter activeTab={activeTab} onTabPress={handleTabPress} />
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
  },
});
