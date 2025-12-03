import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../types/navigation";
import { HomeScreen } from "../screens/HomeScreen";
import { TownScreen } from "../screens/TownScreen";
import { AccountScreen } from "../screens/AccountScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { SubcategoryPickerScreen } from "../screens/SubcategoryPickerScreen";
import { PublishWizardScreen } from "../screens/PublishWizardScreen";
import { ChannelsScreen } from "../screens/ChannelsScreen";
import { ChannelDetailScreen } from "../screens/ChannelDetailScreen";
import { CreateChannelScreen } from "../screens/CreateChannelScreen";
import { CategoryFeedScreen } from "../screens/CategoryFeedScreen";
// Solicitudes de Servicio
import { ServiceRequestsUserScreen } from "../screens/ServiceRequestsUserScreen";
import { ServiceRequestDetailUserScreen } from "../screens/ServiceRequestDetailUserScreen";
import { ServiceRequestsProScreen } from "../screens/ServiceRequestsProScreen";
import { ServiceRequestDetailProScreen } from "../screens/ServiceRequestDetailProScreen";
import { MiniChatScreen } from "../screens/MiniChatScreen";
import { RateServiceScreen } from "../screens/RateServiceScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Town" component={TownScreen} />
      <Stack.Screen name="CategoryFeed" component={CategoryFeedScreen} />
      <Stack.Screen name="Account" component={AccountScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="SubcategoryPicker" component={SubcategoryPickerScreen} />
      <Stack.Screen name="PublishWizard" component={PublishWizardScreen} />
      <Stack.Screen name="Channels" component={ChannelsScreen} />
      <Stack.Screen name="ChannelDetail" component={ChannelDetailScreen} />
      <Stack.Screen name="CreateChannel" component={CreateChannelScreen} />
      {/* Solicitudes de Servicio - Usuario */}
      <Stack.Screen name="ServiceRequestsUser" component={ServiceRequestsUserScreen} />
      <Stack.Screen name="ServiceRequestDetailUser" component={ServiceRequestDetailUserScreen} />
      {/* Solicitudes de Servicio - Profesional */}
      <Stack.Screen name="ServiceRequestsPro" component={ServiceRequestsProScreen} />
      <Stack.Screen name="ServiceRequestDetailPro" component={ServiceRequestDetailProScreen} />
      {/* Mini Chat y Valoración */}
      <Stack.Screen name="MiniChat" component={MiniChatScreen} />
      <Stack.Screen name="RateService" component={RateServiceScreen} />
    </Stack.Navigator>
  );
};
