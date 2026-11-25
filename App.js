import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import LoginScreen from './screens/LoginScreen';

export default function App() {
  const [facteur, setFacteur] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        const savedSession = await AsyncStorage.getItem('facteur_session');
        if (savedSession) {
          setFacteur(JSON.parse(savedSession));
        }
      } catch (err) {
        console.error('Erreur chargement session :', err);
      } finally {
        setCheckingSession(false);
      }
    }

    loadSession();
  }, []);

  async function handleLogout() {
    try {
      await AsyncStorage.removeItem('facteur_session');
      setFacteur(null);
    } catch (err) {
      console.error('Erreur déconnexion :', err);
    }
  }

  if (checkingSession) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#26297D" />
        <Text style={styles.loadingText}>Chargement de la session...</Text>
      </View>
    );
  }

  if (!facteur) {
    return <LoginScreen onLoginSuccess={(loggedFacteur) => setFacteur(loggedFacteur)} />;
  }

  const fullName =
    [facteur.prenom, facteur.nom].filter(Boolean).join(' ') ||
    facteur.nom_complet ||
    'Facteur Amana';

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* En-tête avec logo Amana */}
      <View style={styles.topCard}>
        <Image
          source={require('./assets/amanadeliv.jpg')}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <View style={styles.badge}>
          <Ionicons name="checkmark-circle" size={14} color="#E56723" />
          <Text style={styles.badgeText}>SESSION ACTIVE • TOURNÉE PRÊTE</Text>
        </View>
      </View>

      {/* Carte Bienvenue & Infos Facteur */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeLabel}>Bienvenue,</Text>
        <Text style={styles.welcomeName}>{fullName}</Text>

        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Ionicons name="id-card-outline" size={18} color="#26297D" />
              <Text style={styles.infoLabel}>Matricule</Text>
            </View>
            <Text style={styles.infoValue}>{facteur.matricule}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoLeft}>
              <Ionicons name="phone-portrait-outline" size={18} color="#26297D" />
              <Text style={styles.infoLabel}>Appareil lié</Text>
            </View>
            <Text style={styles.infoValueMono} numberOfLines={1}>
              {facteur.device_id || 'Non renseigné'}
            </Text>
          </View>
        </View>

        {/* Bouton Se déconnecter */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={19} color="#FFFFFF" />
          <Text style={styles.logoutButtonText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F6FA',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 36 : 48,
    paddingBottom: 28,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F4F6FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  topCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },
  logoImage: {
    width: '82%',
    height: 76,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E56723',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  welcomeLabel: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '500',
  },
  welcomeName: {
    fontSize: 25,
    fontWeight: '800',
    color: '#26297D',
    marginTop: 2,
    marginBottom: 20,
  },
  infoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 22,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
    marginLeft: 8,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  infoValueMono: {
    maxWidth: 155,
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#E56723',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E56723',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
});