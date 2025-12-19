import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams } from "expo-router";

type Props = {};

const ExternalWebView = (props: Props) => {
  const params = useLocalSearchParams();
  let url: string = "";
  {
    params.data ? (url = params.data) : (url = "https://google.com");
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <WebView
        source={{ uri: url }}
        // Optional: restrict which origins can be loaded inside the WebView
        originWhitelist={["https://*", "http://*"]}
        // Optional: turns off zoom controls on Android; set as you need
        scalesPageToFit={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});

export default ExternalWebView;