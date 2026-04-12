import { View, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  return (
    <View className="flex-1 bg-background">
      <View className="bg-primary pt-14 pb-8 px-6 rounded-b-3xl">
        <Text className="text-yellow text-2xl font-bold">KeyGo</Text>
        <Text className="text-white text-base mt-1">Panel Administrador</Text>
        <Text className="text-white/70 text-sm mt-1">Hola, {user?.full_name}</Text>
      </View>
      <View className="flex-1 px-6 pt-8 items-center justify-center">
        <Text className="text-dark text-lg font-semibold mb-2">✅ Fase 1 Completa</Text>
        <Text className="text-gray-500 text-sm text-center">
          Autenticado como Administrador. El panel de control completo se construirá en la Fase 5.
        </Text>
      </View>
      <TouchableOpacity
        className="mx-6 mb-10 border border-danger rounded-xl py-3 items-center"
        onPress={logout}
      >
        <Text className="text-danger text-sm font-semibold">Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}
