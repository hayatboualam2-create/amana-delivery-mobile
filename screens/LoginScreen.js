import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabase';

export default function LoginScreen({ onLoginSuccess }) {
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);

  // Récupère l'identifiant unique du téléphone
  async function getDeviceId() {
    if (Platform.OS === 'android') {
      return Application.getAndroidId();
    }

    if (Platform.OS === 'ios') {
      const iosId = await Application.getIosIdForVendorAsync();
      return iosId;
    }

    return 'unknown-device';
  }

  async function handleLogin() {
    const cleanMatricule = matricule.trim();
    const cleanPassword = password.trim();

    if (!cleanMatricule || !cleanPassword) {
      Alert.alert(
        'Champs requis',
        'Veuillez saisir votre matricule et votre mot de passe.'
      );
      return;
    }

    setLoading(true);

    try {
      const currentDeviceId = await getDeviceId();

      // 1. Recherche du facteur par matricule
      const { data: rows, error } = await supabase
        .from('facteurs')
        .select('*')
        .ilike('matricule', cleanMatricule);

      if (error) {
        Alert.alert('Erreur Supabase', error.message);
        return;
      }

      const facteur = rows && rows.length > 0 ? rows[0] : null;

      if (!facteur) {
        Alert.alert(
          'Connexion refusée',
          `Aucun facteur trouvé pour le matricule "${cleanMatricule}".`
        );
        return;
      }

      // 2. Vérification du mot de passe
      if (facteur.password !== cleanPassword) {
        Alert.alert('Connexion refusée', 'Mot de passe incorrect.');
        return;
      }

      // 3. Vérification / liaison du device_id
      let updatedFacteur = facteur;

      if (!facteur.device_id) {
        const { data: linkedData, error: updateError } = await supabase
          .from('facteurs')
          .update({ device_id: currentDeviceId })
          .eq('facteur_id', facteur.facteur_id)
          .select()
          .single();

        if (updateError) {
          Alert.alert('Erreur', "Impossible d'associer cet appareil au compte.");
          return;
        }

        updatedFacteur = linkedData;
      } else if (facteur.device_id !== currentDeviceId) {
        Alert.alert(
          'Appareil non autorisé',
          'Ce matricule est déjà lié à un autre téléphone.'
        );
        return;
      }

      // 4. Sauvegarde locale de la session facteur
      await AsyncStorage.setItem(
        'facteur_session',
        JSON.stringify(updatedFacteur)
      );

      if (onLoginSuccess) {
        onLoginSuccess(updatedFacteur);
      }
    } catch (err) {
      Alert.alert(
        'Erreur détaillée',
        err?.message || 'Une erreur est survenue lors de la connexion.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Zone Logo Amana Delivery Services */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/amanadeliv.jpg')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              ESPACE FACTEUR • DISTRIBUTION & SUIVI
            </Text>
          </View>
        </View>

        {/* Carte formulaire moderne */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Connexion</Text>
          <Text style={styles.cardSubtitle}>
            Identifiez-vous pour accéder à votre tournée
          </Text>

          {/* Champ Matricule */}
          <Text style={styles.label}>Matricule</Text>
          <View
            style={[
              styles.inputWrapper,
              focusedField === 'matricule' && styles.inputWrapperFocused,
            ]}
          >
            <Ionicons
              name="id-card-outline"
              size={20}
              color={focusedField === 'matricule' ? '#26297D' : '#64748B'}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Ex: FAC001"
              placeholderTextColor="#94A3B8"
              value={matricule}
              onChangeText={setMatricule}
              autoCapitalize="characters"
              autoCorrect={false}
              onFocus={() => setFocusedField('matricule')}
              onBlur={() => setFocusedField(null)}
            />
          </View>

          {/* Champ Mot de passe */}
          <Text style={styles.label}>Mot de passe</Text>
          <View
            style={[
              styles.inputWrapper,
              focusedField === 'password' && styles.inputWrapperFocused,
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={focusedField === 'password' ? '#26297D' : '#64748B'}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#64748B"
              />
            </TouchableOpacity>
          </View>

          {/* Bouton Se connecter */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Se connecter</Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#E56723"
                  style={styles.buttonIcon}
                />
              </View>
            )}
          </TouchableOpacity>

          {/* Badge info sécurité */}
          <View style={styles.securityNote}>
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color="#26297D"
            />
            <Text style={styles.securityText}>
              Accès sécurisé lié à cet appareil professionnel
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 52,
    paddingBottom: 32,
  },
  logoContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
  },
  logoImage: {
    width: '88%',
    height: 92,
  },
  roleBadge: {
    marginTop: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E56723',
    letterSpacing: 0.6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 22,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 18,
    height: 52,
  },
  inputWrapperFocused: {
    borderColor: '#26297D',
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },
  eyeButton: {
    paddingLeft: 8,
  },
  button: {
    backgroundColor: '#26297D',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#26297D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buttonIcon: {
    marginLeft: 8,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  securityText: {
    fontSize: 12,
    color: '#475569',
    marginLeft: 6,
    fontWeight: '500',
  },
});