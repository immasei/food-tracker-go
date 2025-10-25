import React, { useEffect, useState, useContext, useCallback } from "react";
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
import { AuthContext } from "@/contexts/AuthContext";
import Loading from "@/components/Loading"; 


const RecipePage: React.FC = () => {
    // --- Authentication and Data Fetching Integration ---
    const { user } = useContext(AuthContext);
    const USER_ID = user?.uid ?? null;

    // Hardcoded ingredients (Keep this until fetchFoods is fixed)
    const ingredients: Partial<Food>[] = [
      { name: "Chicken Breast" }, 
      { name: "Broccoli" }, 
      { name: "Soy Sauce" }, 
      { name: "Rice" }
    ];
    // const { filteredSorted: ingredients } = fetchFoods("", USER_ID); // <-- Use this line when fetching works

    const [recipe, setRecipe] = useState<string>("");
    // 'loading' now only controls the state of the AI generation process
    const [loading, setLoading] = useState(false); // Start as false
    const [ingredientNames, setIngredientNames] = useState<string>("");
    const [recipeGenerated, setRecipeGenerated] = useState(false); 

    const onClose = () => {
        router.back();
    };

    // --- Function to Handle Recipe Generation ---
    const handleGenerateRecipe = useCallback(async () => {
        if (!USER_ID) {
            Alert.alert("Authentication Required", "Please log in to generate a recipe.");
            return;
        }

        if (ingredients.length === 0) {
            Alert.alert("No Ingredients", "Your food list is empty. Add items to generate a recipe.");
            return;
        }

        const names = ingredients.map(f => f.name).join(', ');
        setIngredientNames(names);
        
        setLoading(true);
        setRecipeGenerated(false); // Reset before new generation
        setRecipe(""); // Clear old recipe
        
        try {
            const generatedRecipe = await generateRecipe(names);
            setRecipe(generatedRecipe);
            setRecipeGenerated(true);
        } catch (e) {
            console.error("Recipe Generation Error:", e);
            Alert.alert("Recipe Error", "Could not generate recipe.");
            setRecipe("Error loading recipe.");
        } finally {
            setLoading(false);
        }
    }, [USER_ID, ingredients]);


    // --- Effect for Initial Ingredient Display/Check (Runs only once) ---
    useEffect(() => {
        if (USER_ID && ingredients.length > 0) {
            const names = ingredients.map(f => f.name).join(', ');
            setIngredientNames(names);
        } else if (USER_ID) {
            setIngredientNames("None found in your food list.");
        }
        // NOTE: The previous useEffect logic that called fetchRecipe is now moved to handleGenerateRecipe
    }, [USER_ID]); 
    
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

            <View style={styles.buttonRow}>
                <Pressable onPress={handleGenerateRecipe} style={styles.generateBtn} disabled={loading}>
                    <Text style={styles.generateBtnText}>
                        {loading ? 'Generating...' : 'Generate Recipe'}
                    </Text>
                    {loading && <ActivityIndicator size="small" color="#fff" style={styles.activityIndicator} />}
                </Pressable>
            </View>
            
            {loading && (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#4285F4" />
                    <Text style={styles.loadingText}>Thinking up a delicious recipe...</Text>
                </View>
            )}

            {!loading && recipeGenerated && (
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.promptText}>
                        **Ingredients:** {ingredientNames}
                    </Text>
                    <Markdown style={markdownStyles}>
                        {recipe}
                    </Markdown>
                </ScrollView>
            )}

            {!loading && !recipeGenerated && ingredients.length === 0 && (
                <View style={styles.centered}>
                    <Text style={styles.emptyText}>
                        Your food list is empty. Please add items to your tracker before generating a recipe.
                    </Text>
                </View>
            )}

            {!loading && !recipeGenerated && ingredients.length > 0 && (
                <View style={styles.centered}>
                    <Text style={styles.welcomeText}>
                        Ready to cook? Press "Generate Recipe" to get started!
                    </Text>
                    <Text style={styles.promptText}>
                        **Ingredients Found:** {ingredientNames}
                    </Text>
                </View>
            )}
        </SafeAreaView>
    );
};

// --- Styles ---

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
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    loadingText: { marginTop: 10, fontSize: 16, color: "#4285F4" },
    promptText: { marginBottom: 20, fontSize: 14, fontStyle: 'italic', color: '#555', textAlign: 'center' },
    welcomeText: { fontSize: 18, marginBottom: 20, fontWeight: '600', color: '#555', textAlign: 'center' },
    emptyText: { fontSize: 16, color: '#DB4437', textAlign: 'center' },
    
    // New Styles for the Button
    buttonRow: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        alignItems: 'center',
    },
    generateBtn: {
        backgroundColor: '#4285F4', // Google Blue
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        ...shadow,
    },
    generateBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    activityIndicator: {
        marginLeft: 10,
    }
  });
  
  const markdownStyles = StyleSheet.create({
      body: { fontSize: 16, lineHeight: 24, color: '#333' },
      heading1: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#4285F4' },
      heading2: { fontSize: 20, fontWeight: 'bold', marginTop: 15, marginBottom: 5, color: '#DB4437' },
      list_item: { marginBottom: 4 },
      strong: { fontWeight: 'bold' }
  });

export default RecipePage;