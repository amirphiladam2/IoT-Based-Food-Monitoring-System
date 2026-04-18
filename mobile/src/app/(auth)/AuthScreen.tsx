import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Colors } from '@/constants/Colors'
import LoginForm from '@/components/Forms/LoginForm'
import RegisterForm from '@/components/Forms/RegisterForm'
import { LinearGradient } from 'expo-linear-gradient'

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header — illustration */}
          <View style={styles.header}>
            <Image
              source={require('@/assets/images/AuthIllustration.png')}
              style={styles.headerImage}
            />
            <LinearGradient
              colors={['transparent', Colors.background]}
              style={styles.fadeOverlay}
            />
          </View>

          {/* Form section */}
          <View style={styles.formContainer}>
            <Text style={styles.title}>
              {isLogin ? 'Welcome Back!' : 'Create an Account'}
            </Text>

            {isLogin ? <LoginForm /> : <RegisterForm />}

            {/* Toggle */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {isLogin ? "Don't have an account?" : 'Already have an account?'}
              </Text>
              <TouchableOpacity onPress={() => setIsLogin(prev => !prev)}>
                <Text style={styles.toggleLink}>
                  {isLogin ? 'Sign Up' : 'Log In'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default AuthScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 320, 
    width: '100%',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  fadeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  toggleText: {
    marginRight: 6,
  },
  toggleLink: {
    color: Colors.primary,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
})