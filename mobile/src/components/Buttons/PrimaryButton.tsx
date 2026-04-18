import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import React from 'react'

type PrimaryButtonProps = {
    title?: string;
    onPress?: () => void;
    color?: string;
    textColor?: string;
}
const PrimaryButton = ({ title, onPress, color, textColor }: PrimaryButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.primaryButton, color ? { backgroundColor: color } : {}]}
    >
        <Text style={[styles.buttonText, textColor ? { color: textColor } : {}]}>{title}</Text>
    </TouchableOpacity>
  )
}

export default PrimaryButton

const styles = StyleSheet.create({
    primaryButton: {
        backgroundColor: "#0E8E93",
        paddingVertical: 15,
        width: "100%",
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center", 
    },
    buttonText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "bold",
    }
})
