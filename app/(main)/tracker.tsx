import FoodListTab from "../(tracker)/FoodList";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function FoodTrackerScreen() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <FoodListTab />
    </GestureHandlerRootView>
  );
}