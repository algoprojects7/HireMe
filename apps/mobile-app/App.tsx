import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { UserRole } from '@repo/types';

export default function App() {
  const [role, setRole] = useState<UserRole | null>(null);

  if (!role) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.welcomeSection}>
          <Text style={styles.title}>Welcome to LabourLink</Text>
          <Text style={styles.subtitle}>Choose your path to continue</Text>
        </View>

        <View style={styles.roleGrid}>
          <TouchableOpacity 
            style={[styles.roleCard, { backgroundColor: '#2563eb' }]}
            onPress={() => setRole(UserRole.WORKER)}
          >
            <Text style={styles.roleEmoji}>👷</Text>
            <Text style={styles.roleText}>I am a Worker</Text>
            <Text style={styles.roleSubtext}>Find jobs and earn money</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.roleCard, { backgroundColor: '#7c3aed' }]}
            onPress={() => setRole(UserRole.CUSTOMER)}
          >
            <Text style={styles.roleEmoji}>🏠</Text>
            <Text style={styles.roleText}>I am an Owner</Text>
            <Text style={styles.roleSubtext}>Hire workers for your project</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {role === UserRole.WORKER ? 'Worker Portal' : 'Owner Portal'}
        </Text>
        <TouchableOpacity onPress={() => setRole(null)}>
          <Text style={styles.switchText}>Switch Role</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.placeholderText}>
          {role === UserRole.WORKER 
            ? 'Your dashboard with nearby jobs will appear here.' 
            : 'Find and book workers near your location.'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  welcomeSection: {
    marginTop: 80,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#94a3b8',
    textAlign: 'center',
  },
  roleGrid: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    gap: 20,
  },
  roleCard: {
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  roleEmoji: {
    fontSize: 40,
    marginBottom: 15,
  },
  roleText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  roleSubtext: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  switchText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  placeholderText: {
    color: '#64748b',
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 28,
  },
});
