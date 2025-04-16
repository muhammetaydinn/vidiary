import { Text, type TextProps } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  className?: string;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  className = '',
  ...rest
}: ThemedTextProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const textColor = colorScheme === 'light'
    ? lightColor || 'text-[#11181C]'
    : darkColor || 'text-[#ECEDEE]';

  let typeClasses = '';

  switch (type) {
    case 'default':
      typeClasses = 'text-base leading-6';
      break;
    case 'defaultSemiBold':
      typeClasses = 'text-base leading-6 font-semibold';
      break;
    case 'title':
      typeClasses = 'text-3xl font-bold leading-8';
      break;
    case 'subtitle':
      typeClasses = 'text-xl font-bold';
      break;
    case 'link':
      typeClasses = 'leading-[30px] text-base text-[#0a7ea4] dark:text-white';
      break;
  }

  // Only apply the default text color if custom colors aren't provided
  const colorClass = (lightColor || darkColor) ? '' : (colorScheme === 'light' ? 'text-[#11181C]' : 'text-[#ECEDEE]');

  return (
    <Text
      className={`${typeClasses} ${colorClass} ${className}`}
      style={[
        // If custom colors are provided as props, apply them through style
        (lightColor || darkColor) && { color: colorScheme === 'light' ? lightColor : darkColor },
        style,
      ]}
      {...rest}
    />
  );
}
