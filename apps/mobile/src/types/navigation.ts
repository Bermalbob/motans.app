import { SubcategoryConfig } from "../data/categories";

export type RootStackParamList = {
  Home: undefined;
  Town: { townId: string; townName?: string };
  CategoryFeed: {
    townId: string;
    townName: string;
    categoryKey: string;
    subcategoryKey?: string | null;
  };
  Account: undefined;
  Login: undefined;
  Register: undefined;
  PublishWizard: {
    townId?: string | null;
    townName?: string | null;
    channelId?: string | null;
    categoryKey?: string | null;
    subcategoryKey?: string | null;
  };
  Channels: undefined;
  ChannelDetail: { channelId: string };
  CreateChannel: undefined;
  PostDetail: { postId: string };
  SubcategoryPicker: {
    categoryKey: string;
    subcategoryKey: string;
    subcategoryLabel: string;
    children: SubcategoryConfig[];
    color: string;
  };
  // Solicitudes de Servicio - Usuario
  ServiceRequestsUser: undefined;
  ServiceRequestDetailUser: { requestId: string };
  // Solicitudes de Servicio - Profesional
  ServiceRequestsPro: undefined;
  ServiceRequestDetailPro: { assignmentId: string };
  // Mini Chat por solicitud
  MiniChat: { requestId: string; recipientId: string; recipientName: string };
  // Valoración de servicio
  RateService: { requestId: string; professionalId: string; professionalName: string };
};
