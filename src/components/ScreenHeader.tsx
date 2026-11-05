import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {HEADER_H, HEADER_TOP} from '../constants/config';
import theme from '../constants/theme';

type Props = {
  title?: string;
  subtitle?: string;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  /** The game screen puts a scrim behind the header; the menu does not. */
  scrim?: boolean;
};

const SLOT_W = 44;

/**
 * The single header used by every screen. Screens differ only through their
 * slots and title, which keeps padding, height and type identical throughout.
 */
export function ScreenHeader({
  title,
  subtitle,
  leftSlot,
  rightSlot,
  scrim = false,
}: Props) {
  return (
    <View style={[styles.header, scrim ? styles.scrim : null]}>
      <View style={styles.side}>{leftSlot}</View>

      <View style={styles.center}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <View style={[styles.side, styles.sideRight]}>{rightSlot}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: HEADER_TOP,
    height: HEADER_TOP + HEADER_H,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrim: {
    backgroundColor: theme.colors.ui.headerScrim,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  side: {minWidth: SLOT_W, justifyContent: 'center', alignItems: 'flex-start'},
  sideRight: {alignItems: 'flex-end'},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  title: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    letterSpacing: 2,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '600',
    letterSpacing: 2,
    color: theme.colors.text.muted,
    textAlign: 'center',
  },
});

export default ScreenHeader;
