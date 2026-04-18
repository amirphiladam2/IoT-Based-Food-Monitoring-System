import { StyleSheet, View, Alert } from 'react-native'
import React, { useState } from 'react'
import InputField from './InputField';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PrimaryButton from '../Buttons/PrimaryButton';
import { auth } from '../../lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { registerSchema, RegisterFormData } from '../../schemas/authSchema';

const RegisterForm = () => {
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' }
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(userCredential.user, { displayName: data.name });
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <InputField
            icon="person"
            placeholder="Enter your name"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.name?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <InputField
            icon="mail"
            placeholder="Enter your email"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.email?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <InputField
            icon="lock-closed"
            placeholder="Enter your password"
            secureTextEntry={true}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.password?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <InputField
            icon="lock-closed"
            placeholder="Confirm your password"
            secureTextEntry={true}
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.confirmPassword?.message}
          />
        )}
      />
      <View style={styles.buttonContainer}>
        <PrimaryButton title={loading ? "Registering..." : "Register"} onPress={handleSubmit(onSubmit)} />
      </View>
    </View>
  )
}

export default RegisterForm

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  buttonContainer: {
    marginTop: 16,
  }
})
