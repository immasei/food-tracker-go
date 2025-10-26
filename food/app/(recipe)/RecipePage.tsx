import React, { useEffect, useState, useContext, useCallback } from "react";
import { Alert, FlatList, Pressable, Text, TextInput, View, StyleSheet, ScrollView, ActivityIndicator, Button } from "react-native";
import { useToast } from "@/components/Toast"; 
import FoodCard from "../(tracker)/components/FoodCard"; 
import EditItemModal from "../(tracker)/components/EditItemModal"; 
import { shadow, palette } from "./styles"; 
import { Food } from "@/types/food";
import { NAMES_KEY, CATS_KEY, loadRecents } from "@/utils/recents"; 
import { deleteFood, upsertFood } from "@/services/foodService"; 
import { fetchFoods } from "../(tracker)/utils/hooks";
import { User, UStats } from "@/types/user" 
import { fetchUser, fetchStats, updateUser } from "@/services/userService"; 
import { generateRecipe } from "./utils/gemini";
import Markdown from 'react-native-markdown-display';
import { router } from "expo-router";
import { AuthContext } from "@/contexts/AuthContext";
import Loading from "@/components/Loading"; 
import { MaterialIcons } from '@expo/vector-icons';


// --- New Component for Ingredient Selection Item ---
interface IngredientItemProps {
    food: Partial<Food>;
    isSelected: boolean;
    onToggle: (food: Partial<Food>) => void;
}

const IngredientItem: React.FC<IngredientItemProps> = ({ food, isSelected, onToggle }) => (
    <Pressable style={styles.ingredientItem} onPress={() => onToggle(food)}>
        <Text style={styles.ingredientText}>{food.name}</Text>
        <MaterialIcons 
            name={isSelected ? "check-box" : "check-box-outline-blank"} 
            size={24} 
            color={isSelected ? "#4285F4" : "#A9A9A9"} 
        />
    </Pressable>
);

// --- Main RecipePage Component ---

const RecipePage: React.FC = () => {
    const { user } = useContext(AuthContext);
    const USER_ID = user?.uid ?? null;
    
    const [userData, setUserData] = useState<User | null>(null);

    const { filteredSorted: allIngredients, isLoading: ingredientsLoading } = fetchFoods("", USER_ID); 
    
    const [selectedIngredients, setSelectedIngredients] = useState<Partial<Food>[]>([]);

    const [recipe, setRecipe] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [ingredientNames, setIngredientNames] = useState<string>("");
    
    // 🔑 THE CRITICAL STATE CHANGE: This controls which view is displayed
    const [recipeGenerated, setRecipeGenerated] = useState(false); 

    // 🔄 MODIFIED: Now, instead of closing the screen, it resets the recipe view.
    const resetToSelection = () => {
        setRecipeGenerated(false); // Go back to the ingredient selection view
        setRecipe("");              // Clear the displayed recipe
        setLoading(false);          // Ensure loading is false
    };

    // --- Effect for Initial Data Loading ---
    useEffect(() => {
        const loadUser = async () => {
            try {
                const userRes = await fetchUser(USER_ID);
                setUserData(userRes);
            } catch (err) {
                console.error("Failed to fetch user", err);
            }
        };
        loadUser();
    }, [USER_ID]);

    // --- Effect to set initial selected ingredients (all available) ---
    useEffect(() => {
        if (allIngredients.length > 0 && selectedIngredients.length === 0) {
            setSelectedIngredients(allIngredients);
        }
    }, [allIngredients]);
    
    // --- Function to toggle the selection status of an ingredient ---
    const toggleIngredientSelection = useCallback((food: Partial<Food>) => {
        setSelectedIngredients(prevSelected => {
            const isSelected = prevSelected.some(f => f.name === food.name);
            if (isSelected) {
                return prevSelected.filter(f => f.name !== food.name);
            } else {
                return [...prevSelected, food];
            }
        });
    }, []);

    // --- Function to Handle Recipe Generation ---
    const handleGenerateRecipe = useCallback(async () => {
        if (!USER_ID) {
            Alert.alert("Authentication Required", "Please log in to generate a recipe.");
            return;
        }

        if (selectedIngredients.length === 0) {
            Alert.alert("No Ingredients Selected", "Please select at least one ingredient to generate a recipe.");
            return;
        }

        const names = selectedIngredients.map(f => f.name).join(', ');
        setIngredientNames(names);
        
        setLoading(true);
        setRecipeGenerated(false); 
        setRecipe(""); 
        
        try {
            const dietPref = userData?.dietaryPreference ? `, based on a ${userData.dietaryPreference} diet` : '';
            const allergies = userData?.allergies ? `, avoiding ${userData.allergies.join(', ')}` : '';

            const prompt = `Generate a recipe using ONLY these ingredients: ${names}${dietPref}${allergies}. Provide the recipe title, ingredients list, and instructions in Markdown format.`;
            
            const generatedRecipe = await generateRecipe(prompt); 
            setRecipe(generatedRecipe);
            setRecipeGenerated(true); // Switches to the recipe display view
        } catch (e) {
            console.error("Recipe Generation Error:", e);
            Alert.alert("Recipe Error", "Could not generate recipe.");
            setRecipe("Error loading recipe.");
        } finally {
            setLoading(false);
        }
    }, [USER_ID, selectedIngredients, userData]);


    // --- Render Logic ---

    if (!USER_ID) {
        return (
            <View style={styles.container}>
                <Loading text="Please login to generate a recipe."/>
            </View>
        );
    }
    
    if (ingredientsLoading) {
        return (
            <View style={styles.container}>
                <Loading text="Loading your ingredients..."/>
            </View>
        );
    }
    
    if (allIngredients.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>AI Recipe Generator</Text>
                    {/* Only close the page if there's nothing to select */}
                    <Button title="Close" onPress={() => router.back()} /> 
                </View>
                <View style={styles.centered}>
                    <Text style={styles.emptyText}>
                        Your food list is empty. Please add items to your tracker before generating a recipe.
                    </Text>
                </View>
            </View>
        );
    }

    // --- Recipe Generation View ---
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>AI Recipe Generator</Text>
                {/* 🔑 MODIFIED: Use the resetToSelection function when recipe is visible, otherwise close the screen */}
                <Button 
                    title={recipeGenerated ? "Back to Selection" : "Close Page"} 
                    onPress={recipeGenerated ? resetToSelection : () => router.back()} 
                />
            </View>

            {/* Selection/Generation Area */}
            <View style={styles.buttonRow}>
                <Pressable 
                    onPress={handleGenerateRecipe} 
                    style={[styles.generateBtn, selectedIngredients.length === 0 && styles.disabledBtn]} 
                    disabled={loading || selectedIngredients.length === 0 || recipeGenerated}
                >
                    <Text style={styles.generateBtnText}>
                        {loading ? 'Generating...' : `Generate Recipe (${selectedIngredients.length} items)`}
                    </Text>
                    {loading && <ActivityIndicator size="small" color="#fff" style={styles.activityIndicator} />}
                </Pressable>
            </View>
            
            {loading ? (
                // --- Loading State for AI Generation ---
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#4285F4" />
                    <Text style={styles.loadingText}>Thinking up a delicious recipe...</Text>
                    <Text style={styles.promptText}>Using: {ingredientNames}</Text>
                </View>
            ) : recipeGenerated ? (
                // --- Recipe Display State ---
                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.promptText}>
                        **Ingredients Used:** {ingredientNames}
                    </Text>
                    <Markdown style={markdownStyles}>
                        {recipe}
                    </Markdown>
                </ScrollView>
            ) : (
                // --- Ingredient Selection State ---
                <View style={{ flex: 1 }}>
                    <Text style={styles.selectionTitle}>Select Ingredients to Use:</Text>
                    <FlatList
                        data={allIngredients}
                        keyExtractor={(item, index) => item.name + index}
                        renderItem={({ item }) => (
                            <IngredientItem 
                                food={item} 
                                isSelected={selectedIngredients.some(f => f.name === item.name)}
                                onToggle={toggleIngredientSelection}
                            />
                        )}
                        contentContainerStyle={styles.listContent}
                    />
                    <View style={styles.footerInfo}>
                        <Text style={styles.footerText}>
                            {selectedIngredients.length} of {allIngredients.length} ingredients selected.
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
};

// --- Styles (Unchanged) ---
// ... (Keep your original styles here)
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
    promptText: { marginHorizontal: 20, marginBottom: 20, fontSize: 14, fontStyle: 'italic', color: '#555', textAlign: 'center' },
    emptyText: { fontSize: 16, color: '#DB4437', textAlign: 'center' },
    
    // Button Styles
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
    disabledBtn: {
        backgroundColor: '#A9A9A9', // Grey when disabled
    },
    generateBtnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    activityIndicator: {
        marginLeft: 10,
    },

    // New Styles for Selection
    selectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        padding: 16,
        backgroundColor: '#EFEFEF',
        borderBottomWidth: 1,
        borderBottomColor: '#DDD',
    },
    listContent: {
        paddingBottom: 80, 
    },
    ingredientItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        backgroundColor: '#fff',
    },
    ingredientText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    footerInfo: {
        padding: 10,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 14,
        color: '#555',
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