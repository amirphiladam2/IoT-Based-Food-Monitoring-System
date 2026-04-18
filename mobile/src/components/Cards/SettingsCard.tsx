import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

export type SettingsCardItem = {
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  iconBackgroundColor: string;
  label: string;
  value: string;
  valueColor?: string;
  trailingIconName?: React.ComponentProps<typeof Ionicons>['name'];
  trailingIconColor?: string;
};

type SettingsCardProps = {
  items: SettingsCardItem[];
  title?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  activeOpacity?: number;
};

const SettingsCard = ({
  items,
  title,
  onPress,
  style,
  activeOpacity = 0.85,
}: SettingsCardProps) => {
  const content = (
    <>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {items.map((item, index) => (
        <React.Fragment key={`${item.label}-${index}`}>
          <View style={styles.row}>
            <View style={[styles.iconWrapper, { backgroundColor: item.iconBackgroundColor }]}>
              <Ionicons name={item.iconName} size={24} color={item.iconColor} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={[styles.value, item.valueColor ? { color: item.valueColor } : null]}>
                {item.value}
              </Text>
            </View>
            {item.trailingIconName ? (
              <Ionicons
                name={item.trailingIconName}
                size={20}
                color={item.trailingIconColor ?? Colors.primary}
              />
            ) : null}
          </View>
          {index < items.length - 1 ? <View style={styles.divider} /> : null}
        </React.Fragment>
      ))}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={activeOpacity}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.card, style]}>{content}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.gray,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
});

export default SettingsCard;
