import { Image, StyleSheet, Text, View } from "react-native";
import React from "react";

type Props = {
  source: {};
  credit: string;
};

const CaptionedImage = ({ source, credit }: Props) => {
  return (
    <View style={styles.content}>
      {source ? (
        <>
          <Image
            source={source}
            style={styles.image}
            accessibilityLabel="A cute cat."
          />
          <Text style={styles.credit}>{credit}</Text>
        </>
      ) : (
        <></>
      )}
    </View>
  );
};

export default CaptionedImage;

const styles = StyleSheet.create({
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  image: {
    flex: 1,
    width: 400,
    resizeMode: "contain",
  },
  credit: {
    color: "#777",
    fontSize: 16,
    textAlign: "center",
  },
});