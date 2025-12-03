import React from "react";
import { View, Text, StyleSheet, ViewProps } from "react-native";

type Props = ViewProps & {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
};

export const SectionCard: React.FC<Props> = ({ title, right, children, style, ...rest }) => {
  return (
    <View style={[styles.card, style]} {...rest}>
      {(title || right) && (
        <View style={styles.header}>
          {title ? <Text style={styles.title}>{title}</Text> : <View />}
          {right ? <View>{right}</View> : null}
        </View>
      )}
      <View>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#111827",
    padding: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#E5E7EB",
  },
});
