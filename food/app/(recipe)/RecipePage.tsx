import React, { useEffect, useState } from "react";
import { Alert, FlatList, Pressable, SafeAreaView, Text, TextInput, View, StyleSheet, Platform, ScrollView, ActivityIndicator, Button } from "react-native";
import { useToast } from "@/components/Toast";
import FoodCard from "../(tracker)/components/FoodCard";
import EditItemModal from "../(tracker)/components/EditItemModal";
import { shadow, palette } from "./styles";
import { Food } from "@/types/food";
import { NAMES_KEY, CATS_KEY, loadRecents } from "@/utils/recents";
import { deleteFood, upsertFood } from "@/services/foodService";
import { fetchFoods } from "../(tracker)/utils/hooks";
import { generateRecipe } from "./utils/gemini";
import Markdown from 'react-native-markdown-display';
import { router } from "expo-router";

const RecipePage: React.FC = () => {
    // const { filteredSorted: ingredients } = useFoodItems("", () => {}); 
    const ingredients = [
      { name: "Chicken Breast" }, 
      { name: "Broccoli" }, 
      { name: "Soy Sauce" }, 
      { name: "Rice" }
    ];
    const [recipe, setRecipe] = useState<string>("");
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
                
                const fetchRecipe = async () => {
                    setLoading(true);
                    try {
                        const generatedRecipe = await generateRecipe(names);
                        setRecipe(generatedRecipe);
                        setRecipeGenerated(true);
                    } catch (e) {
                        console.error("Recipe Generation Error:", e);
                        Alert.alert("Recipe Error", "Could not generate recipe.");
                        setRecipe("Error loading recipe.");
                        setRecipeGenerated(true);
                    } finally {
                        setLoading(false);
                    }
                };
                fetchRecipe();
                
            } else {
                setIngredientNames("No non-expired ingredients available.");
                setRecipe("Your food list is empty or all items are expired. Please add non-expired items to generate a recipe.");
                setLoading(false);
                setRecipeGenerated(true);
            }
        } else {
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

const markdownStyles = StyleSheet.create({
    body: { fontSize: 16, lineHeight: 24, color: '#333' },
    heading1: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#4285F4' },
    heading2: { fontSize: 20, fontWeight: 'bold', marginTop: 15, marginBottom: 5, color: '#DB4437' },
    list_item: { marginBottom: 4 },
    strong: { fontWeight: 'bold' }
});

export default RecipePage;