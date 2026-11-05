import React from 'react';
import {Image, ImageSourcePropType, StyleSheet, Text, View} from 'react-native';
import type {LucideIcon} from 'lucide-react-native';

/**
 * ICON_SIZE is the single icon size for every button in the app and
 * LABEL_LINE_HEIGHT always matches it, so a label can never sit off-centre
 * against its glyph. Do not introduce a second size.
 */
export const ICON_SIZE = 24;
export const LABEL_LINE_HEIGHT = 24;
export const ICON_GAP = 10;

/** Every button icon is a lucide glyph, so the icon set stays uniform. */
export type ButtonIcon = LucideIcon;

type Props = {
  label: string;
  color: string;
  fontSize: number;
  Icon?: ButtonIcon;
  iconImage?: ImageSourcePropType;
  strokeWidth?: number;
  letterSpacing?: number;
};

/** The one row layout shared by every button: icon, gap 10, label. */
export function ButtonContent({
  label,
  color,
  fontSize,
  Icon,
  iconImage,
  strokeWidth = 2.2,
  letterSpacing = 2,
}: Props) {
  return (
    <View style={styles.row}>
      {Icon ? (
        <Icon size={ICON_SIZE} color={color} strokeWidth={strokeWidth} />
      ) : null}
      {!Icon && iconImage ? (
        <Image source={iconImage} style={styles.image} />
      ) : null}
      <Text
        style={[styles.label, {color, fontSize, letterSpacing}]}
        numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ICON_GAP,
  },
  image: {width: ICON_SIZE, height: ICON_SIZE, resizeMode: 'contain'},
  label: {
    lineHeight: LABEL_LINE_HEIGHT,
    fontWeight: '900',
    textAlign: 'center',
  },
});

export default ButtonContent;
