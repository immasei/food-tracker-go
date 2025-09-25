import React, { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, SafeAreaView, Text, TextInput, View, StyleSheet, Platform, ScrollView, ActivityIndicator, Button } from "react-native";
// Import the new RecipePage component
import { useToast } from "../../components/Toast";
import FoodCard from "../(tracker)/components/FoodCard";
import EditItemModal from "../(tracker)/components/EditItemModal";
import { shadow, palette } from "./styles";
import { Food } from "../(tracker)/types/food";
import { NAMES_KEY, CATS_KEY, loadRecents } from "../(tracker)/utils/recents";
import { USER_ID, deleteItem, upsertItem } from "../(tracker)/utils/firebase";
import { useFoodItems } from "../(tracker)/utils/hooks";
import { generateRecipe } from "./utils/gemini";
import Markdown from 'react-native-markdown-display'; // You'll need to install this: npm install react-native-markdown-display
import { router } from "expo-router"; // Used for navigation/back

const RecipePage: React.FC = () => {
    // We assume useFoodItems returns: 
    // - null/undefined while fetching
    // - [] if the fetch is complete and there are no items
    // - [...] if the fetch is complete and there are items
    const { filteredSorted: ingredients } = useFoodItems("", () => {}); 

    const [recipe, setRecipe] = useState<string>("");
    // 🚨 Keep loading state managed locally
    const [loading, setLoading] = useState(true); 
    const [ingredientNames, setIngredientNames] = useState<string>("");

    const [recipeGenerated, setRecipeGenerated] = useState(false); 

    const onClose = () => {
        router.back();
    };

    useEffect(() => {
        // 1. Return immediately if the recipe is already generated
        if (recipeGenerated) {
            return; 
        }

        // 2. Check if ingredients have finished loading (i.e., is an array)
        if (Array.isArray(ingredients)) {
            
            if (ingredients.length > 0) {
                const names = ingredients.map(f => f.name).join(', ');
                setIngredientNames(names);
                
                // Start generation
                const fetchRecipe = async () => {
                    setLoading(true);
                    try {
                        const generatedRecipe = await generateRecipe(names);
                        setRecipe(generatedRecipe);
                        setRecipeGenerated(true); // Success! Stop further runs.
                    } catch (e) {
                        console.error("Recipe Generation Error:", e);
                        Alert.alert("Recipe Error", "Could not generate recipe.");
                        setRecipe("Error loading recipe.");
                        setRecipeGenerated(true); // Even on fail, stop running.
                    } finally {
                        setLoading(false);
                    }
                };
                fetchRecipe();
                
            } else {
                // Case: Finished loading, but array is empty.
                setIngredientNames("No non-expired ingredients available.");
                setRecipe("Your food list is empty or all items are expired. Please add non-expired items to generate a recipe.");
                setLoading(false);
                setRecipeGenerated(true); // Set flag to true to stop running.
            }
        } else {
             // Case: ingredients is null/undefined. Still loading.
             // We remain in the default loading state set above.
             setLoading(true);
        }
    }, [ingredients, recipeGenerated]); 
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Recipe Generator 🧑‍🍳</Text>
        <Button title="Back to List" onPress={onClose} />
      </View>
      
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#4285F4" />
          <Text style={styles.loadingText}>Thinking up a delicious recipe...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.promptText}>
            **Ingredients:** {ingredientNames}
          </Text>
          <Markdown style={markdownStyles}>
            {recipe}
          </Markdown>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F7F7F7" },
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#34A853" },
  content: { padding: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: "#4285F4" },
  promptText: { marginBottom: 20, fontSize: 14, fontStyle: 'italic', color: '#555' },
});

// Basic Markdown styles for react-native-markdown-display
const markdownStyles = StyleSheet.create({
    body: { fontSize: 16, lineHeight: 24, color: '#333' },
    heading1: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#4285F4' },
    heading2: { fontSize: 20, fontWeight: 'bold', marginTop: 15, marginBottom: 5, color: '#DB4437' },
    list_item: { marginBottom: 4 },
    strong: { fontWeight: 'bold' }
});

export default RecipePage;