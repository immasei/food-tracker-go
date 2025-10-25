import React, { useEffect, useState, useContext } from "react";
import { Alert, FlatList, Pressable, SafeAreaView, Text, TextInput, View, StyleSheet, Platform, ScrollView, ActivityIndicator, Button } from "react-native";
import { useToast } from "@/components/Toast";
import FoodCard from "../(tracker)/components/FoodCard";
import EditItemModal from "../(tracker)/components/EditItemModal";
import { shadow, palette } from "./styles";
import { Food } from "@/types/food";
import { NAMES_KEY, CATS_KEY, loadRecents } from "@/utils/recents";
import { deleteFood, upsertFood } from "@/services/foodService";
import { fetchFoods } from "../(tracker)/utils/hooks"; // Keep the original import path
import { generateRecipe } from "./utils/gemini";
import Markdown from 'react-native-markdown-display';
import { router } from "expo-router";
// 1. Import AuthContext
import { AuthContext } from "@/contexts/AuthContext";
// 2. Import Loading component (for user authentication check)
import Loading from "@/components/Loading"; 


const RecipePage: React.FC = () => {
    // --- Authentication and Data Fetching Integration ---
    const { user } = useContext(AuthContext);
    const USER_ID = user?.uid ?? null;

    // Use fetchFoods hook to get the items from the database
    // We pass an empty string for search since we want all items, and the USER_ID.
    const { filteredSorted: ingredients } = fetchFoods("", USER_ID); 
    // const ingredients = [
    //   { name: "Chicken Breast" }, 
    //   { name: "Broccoli" }, 
    //   { name: "Soy Sauce" }, 
    //   { name: "Rice" }
    // ]; // <--- REMOVED HARDCODED ARRAY

    const [recipe, setRecipe] = useState<string>("");
    // Start with loading true, as we now depend on async fetchFoods
    const [loading, setLoading] = useState(true); 
    const [ingredientNames, setIngredientNames] = useState<string>("");
    const [recipeGenerated, setRecipeGenerated] = useState(false); 

    const onClose = () => {
        router.back();
    };

    // --- Main Logic to Generate Recipe ---
    useEffect(() => {
        // Exit if no user is logged in
        if (!USER_ID) {
            setLoading(false);
            return;
        }

        // 1. Return immediately if the recipe is already generated
        if (recipeGenerated) {
            return; 
        }

        // 2. Check if ingredients has data (fetchFoods returns an array once data is loaded)
        if (Array.isArray(ingredients)) {
            
            if (ingredients.length > 0) {
                // Ensure we only use the items' name property
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
                setIngredientNames("No ingredients available.");
                setRecipe("Your food list is empty. Please add items to generate a recipe.");
                setLoading(false);
                setRecipeGenerated(true);
            }
        } else {
             // ingredients is null or undefined while loading, keep loading state
             setLoading(true);
        }
    }, [USER_ID, ingredients, recipeGenerated]); 
    
    // --- Render Logic ---
    if (!USER_ID) {
        // Show loading/login message if not authenticated
        return (
            <SafeAreaView style={styles.container}>
                <Loading text="Please login to generate a recipe."/>
            </SafeAreaView>
        );
    }

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

// ... (rest of the styles remain the same)

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