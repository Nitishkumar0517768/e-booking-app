import { View, type ViewProps } from 'react-native';

import { ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedViewProps = ViewProps & {
  themeColor?: ThemeColor;
  type?: 'background' | 'backgroundElement' | 'backgroundSelected';
};

export function ThemedView({
  style,
  themeColor,
  type = 'background',
  ...otherProps
}: ThemedViewProps) {
  const theme = useTheme();
  const backgroundColor =
    (theme as any)[themeColor ?? type] || theme.background;

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
