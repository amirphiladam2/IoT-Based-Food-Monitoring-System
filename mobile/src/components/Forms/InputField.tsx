import { StyleSheet, TextInput, View, Text, TouchableOpacity } from 'react-native'
import React,{useState} from 'react'
import {Ionicons} from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

type InputFieldProps = {
    label?:string;
    icon?: keyof typeof Ionicons.glyphMap,
    placeholder?: string,
    value?: string,
    onChangeText?: (text: string) => void,
    onBlur?: () => void,
    secureTextEntry?:boolean,
    error?: string
}
const InputField = ({label,icon,placeholder,value,onChangeText,onBlur,secureTextEntry=false,error}: InputFieldProps) => {
    const[hidePassword,setHidePassword]=useState(secureTextEntry);
    const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.fieldWrapper}>
        {label&&(<Text style={styles.label}>{label}</Text>)}
        <View style={[
          styles.inputContainer,
          isFocused ? styles.inputFocused : null,
          error ? styles.inputError : null
        ]}>
         {icon&&(
        <Ionicons
          name={icon}
          size={22}
          color={isFocused ? Colors.primary : Colors.lightGray}
          style={{ marginRight: 6 }}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
            setIsFocused(false);
            if(onBlur) onBlur();
        }}
        secureTextEntry={hidePassword}
        />
      {secureTextEntry && (
        <TouchableOpacity onPress={() => setHidePassword(!hidePassword)}>
          <Ionicons
            name={hidePassword ? "eye-off" : "eye"}
            size={22}
            color={Colors.gray}
          />
        </TouchableOpacity>
      )}
    </View>  
    {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

export default InputField

const styles = StyleSheet.create({
  fieldWrapper: {
    marginBottom: 12,
    width: '100%',
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  inputContainer: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB', // Neutral non-focused color
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  inputFocused: {
    borderColor: Colors.primary, // Conditional active focus color
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.text,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
})
