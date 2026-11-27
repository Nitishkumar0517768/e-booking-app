import React from 'react';
import { Image, StyleSheet, View, ViewStyle, ImageStyle } from 'react-native';

const logoFullSource = require('../../../assets/images/logo.png');
const logoEmblemSource = require('../../../assets/images/logo-emblem.png');

interface EBookingLogoProps {
  size?: number;
  variant?: 'emblem' | 'full';
  style?: ViewStyle | ImageStyle;
  withContainer?: boolean;
}

export const EBookingLogo: React.FC<EBookingLogoProps> = ({
  size = 56,
  variant = 'emblem',
  style,
  withContainer = false,
}) => {
  const source = variant === 'full' ? logoFullSource : logoEmblemSource;

  // For 'full' logo (emblem + text), aspect ratio is approx 1:1 (568x559)
  const imageElement = (
    <Image
      source={source}
      style={[
        {
          width: size,
          height: size,
        },
        style as ImageStyle,
      ]}
      resizeMode="contain"
    />
  );

  if (withContainer) {
    return (
      <View
        style={[
          styles.container,
          {
            width: size + 16,
            height: size + 16,
            borderRadius: Math.round((size + 16) * 0.28),
          },
          style as ViewStyle,
        ]}>
        {imageElement}
      </View>
    );
  }

  return imageElement;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0052ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#eef0f3',
  },
});
