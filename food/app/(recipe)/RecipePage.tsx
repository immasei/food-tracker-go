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
import { daysLeft, isExpired } from "@/utils/dates"; // isExpired is key for this feature


// --- Expiry Status Logic ---

// choose badge style based on expiry (null/empty = never expires)
const statusStyle = (iso: string | null | undefined) => {
    if (!iso || !iso.trim?.())
      return [localStyles.badge, localStyles.badgeNone];
  
    if (isExpired(iso)) 
      return [localStyles.badge, localStyles.badgeExpired];
      
    const d = daysLeft(iso);
    if (Number.isFinite(d) && d <= 3) 
      return [localStyles.badge, localStyles.badgeSoon];
      
    return [localStyles.badge, localStyles.badgeOk];
};

// text for badge
const statusText = (iso: string | null | undefined) => {
    if (!iso || !iso.trim?.()) return "No expiry";
    return isExpired(iso) ? "Expired" : `${daysLeft(iso)}d left`;
};


// --- Ingredient Selection Item Component ---
interface IngredientItemProps {
    food: Partial<Food> & { expiryDate?: string }; 
    isSelected: boolean;
    onToggle: (food: Partial<Food>) => void;
}

const IngredientItem: React.FC<IngredientItemProps> = ({ food, isSelected, onToggle }) => (
    <Pressable style={localStyles.ingredientItem} onPress={() => onToggle(food)}>
        <View style={localStyles.ingredientInfo}>
            <Text style={localStyles.ingredientText}>{food.name}</Text>
            
            <View style={localStyles.expiryBadgeContainer}>
                {food.expiryDate !== undefined && food.expiryDate !== null && (
                    <View style={statusStyle(food.expiryDate)}>
                        <Text style={localStyles.badgeText}>{statusText(food.expiryDate)}</Text>
                    </View>
                )}
            </View>
        </View>

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
    
    const [recipeGenerated, setRecipeGenerated] = useState(false); 

    const resetToSelection = () => {
        setRecipeGenerated(false); 
        setRecipe("");              
        setLoading(false);          
    };

    // 🆕 NEW FUNCTION: Select all ingredients
    const handleSelectAll = useCallback(() => {
        setSelectedIngredients(allIngredients);
    }, [allIngredients]);

    // 🆕 NEW FUNCTION: Deselect all ingredients
    const handleUntickAll = useCallback(() => {
        setSelectedIngredients([]);
    }, []);

    // 🔑 NEW FUNCTION: Exclude all expired items
    const handleExcludeExpired = useCallback(() => {
        if (allIngredients.length === 0) return;

        // Filter out expired items from the currently selected list
        const nonExpired = selectedIngredients.filter(food => {
            // isExpired returns true if the date is in the past or if the date is null/undefined.
            // We want to keep items that are NOT expired, OR items with no expiry date set.
            const date = food.expiryDate;
            if (!date || !date.trim()) {
                return true; // Keep items with no expiry date
            }
            return !isExpired(date);
        });

        if (nonExpired.length === selectedIngredients.length) {
             Alert.alert("No change needed", "No expired items were found in your current selection.");
             return;
        }

        setSelectedIngredients(nonExpired);
        Alert.alert("Expired Items Excluded", `${selectedIngredients.length - nonExpired.length} expired item(s) removed from selection.`);
    }, [selectedIngredients]);
    // NOTE: We depend on selectedIngredients to only remove expired items from the CURRENT SELECTION.
    
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
            setRecipeGenerated(true); 
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
            <View style={localStyles.container}>
                <Loading text="Please login to generate a recipe."/>
            </View>
        );
    }
    
    if (ingredientsLoading) {
        return (
            <View style={localStyles.container}>
                <Loading text="Loading your ingredients..."/>
            </View>
        );
    }
    
    if (allIngredients.length === 0) {
        return (
            <View style={localStyles.container}>
                <View style={localStyles.header}>
                    <Text style={localStyles.title}>AI Recipe Generator</Text>
                    <Button title="Close" onPress={() => router.back()} /> 
                </View>
                <View style={localStyles.centered}>
                    <Text style={localStyles.emptyText}>
                        Your food list is empty. Please add items to your tracker before generating a recipe.
                    </Text>
                </View>
            </View>
        );
    }

    // --- Recipe Generation View ---
    return (
        <View style={localStyles.container}>
            <View style={localStyles.header}>
                <Text style={localStyles.title}>AI Recipe Generator</Text>
                <Button 
                    title={recipeGenerated ? "Back to Selection" : "Close Page"} 
                    onPress={recipeGenerated ? resetToSelection : () => router.back()} 
                />
            </View>

            {/* Selection/Generation Area */}
            <View style={localStyles.buttonRow}>
                <Pressable 
                    onPress={handleGenerateRecipe} 
                    style={[localStyles.generateBtn, selectedIngredients.length === 0 && localStyles.disabledBtn]} 
                    disabled={loading || selectedIngredients.length === 0 || recipeGenerated}
                >
                    <Text style={localStyles.generateBtnText}>
                        {loading ? 'Generating...' : `Generate Recipe (${selectedIngredients.length} items)`}
                    </Text>
                    {loading && <ActivityIndicator size="small" color="#fff" style={localStyles.activityIndicator} />}
                </Pressable>
            </View>
            
            {loading ? (
                // --- Loading State for AI Generation ---
                <View style={localStyles.centered}>
                    <ActivityIndicator size="large" color="#4285F4" />
                    <Text style={localStyles.loadingText}>Thinking up a delicious recipe...</Text>
                    <Text style={localStyles.promptText}>Using: {ingredientNames}</Text>
                </View>
            ) : recipeGenerated ? (
                // --- Recipe Display State ---
                <ScrollView contentContainerStyle={localStyles.content}>
                    <Text style={localStyles.promptText}>
                        **Ingredients Used:** {ingredientNames}
                    </Text>
                    <Markdown style={markdownStyles}>
                        {recipe}
                    </Markdown>
                </ScrollView>
            ) : (
                // --- Ingredient Selection State ---
                <View style={{ flex: 1 }}>
                    <View style={localStyles.selectionHeader}>
                        <Text style={localStyles.selectionTitle}>Select Ingredients to Use:</Text>
                        
                        <View style={localStyles.tickButtonsContainer}>
                            <Pressable 
                                onPress={handleSelectAll} 
                                style={[localStyles.tickButton, localStyles.tickAllButton]}
                                disabled={allIngredients.length === 0}
                            >
                                <Text style={localStyles.tickButtonText}>Tick All</Text>
                            </Pressable>
                            <Pressable 
                                onPress={handleUntickAll} 
                                style={[localStyles.tickButton, localStyles.untickAllButton]}
                                disabled={selectedIngredients.length === 0}
                            >
                                <Text style={localStyles.tickButtonText}>Untick All</Text>
                            </Pressable>
                            {/* 🔑 ADDED EXCLUDE EXPIRED BUTTON */}
                            <Pressable 
                                onPress={handleExcludeExpired} 
                                style={[localStyles.tickButton, localStyles.excludeExpiredButton]}
                                disabled={selectedIngredients.length === 0}
                            >
                                <Text style={localStyles.tickButtonText}>Exclude Expired</Text>
                            </Pressable>
                        </View>
                    </View>
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
                        contentContainerStyle={localStyles.listContent}
                    />
                    <View style={localStyles.footerInfo}>
                        <Text style={localStyles.footerText}>
                            {selectedIngredients.length} of {allIngredients.length} ingredients selected.
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
};

// --- Styles (Updated to include Exclude Expired Styles) ---

const localStyles = StyleSheet.create({
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

    // SELECTION HEADER STYLES
    selectionHeader: {
        padding: 16,
        backgroundColor: '#EFEFEF',
        borderBottomWidth: 1,
        borderBottomColor: '#DDD',
    },
    selectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8, 
    },
    // TICK BUTTONS STYLES
    tickButtonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Allow buttons to wrap to next line if space is tight
        gap: 10,
    },
    tickButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    tickAllButton: {
        backgroundColor: '#34A853', // Green
    },
    untickAllButton: {
        backgroundColor: '#DB4437', // Red
    },
    // 🔑 NEW STYLE: Exclude Expired Button
    excludeExpiredButton: {
        backgroundColor: '#F7A34B', // Orange/Amber
    },
    tickButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },
    // END NEW STYLES

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
    ingredientInfo: {
        flexDirection: 'row', 
        alignItems: 'center',
        flex: 1, 
        marginRight: 10,
    },
    ingredientText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '600',
        flexShrink: 1, 
        marginRight: 10, 
    },
    expiryBadgeContainer: {
        marginLeft: 'auto', 
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
    },

    // BADGE STYLES
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
    badgeText: { fontSize: 10, fontWeight: "700", color: palette.text }, 
    badgeExpired: { backgroundColor: "#FEE2E2", borderColor: "#FECACA" },
    badgeSoon: { backgroundColor: "#FEF3C7", borderColor: "#FDE68A" },
    badgeOk: { backgroundColor: "#D1FAE5", borderColor: "#A7F3D0" },
    badgeNone: { backgroundColor: "#8a8a8a27", borderColor: "#bcbcbcff" },
  });
  
  const markdownStyles = StyleSheet.create({
      body: { fontSize: 16, lineHeight: 24, color: '#333' },
      heading1: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#4285F4' },
      heading2: { fontSize: 20, fontWeight: 'bold', marginTop: 15, marginBottom: 5, color: '#DB4437' },
      list_item: { marginBottom: 4 },
      strong: { fontWeight: 'bold' }
  });


export default RecipePage;