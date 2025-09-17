import AsyncStorage from "@react-native-async-storage/async-storage";

const MAX_RECENTS = 10;
// recent food name
export const NAMES_KEY = (uid: string) => `recent-food-names:${uid}`;
// recent food category
export const CATS_KEY  = (uid: string) => `recent-food-cats:${uid}`;

export async function loadRecents(key: string): Promise<string[]> {
    try { 
        const raw = await AsyncStorage.getItem(key); 
        return raw ? JSON.parse(raw) : []; 
    }
    catch { 
        return []; 
    }
}

export async function saveRecent(key: string, value: string) {
    const v = value.trim();
    if (!v) return;
    const list = await loadRecents(key);
    const next = [v, ...list.filter(x => x.toLowerCase() !== v.toLowerCase())].slice(0, MAX_RECENTS);
    await AsyncStorage.setItem(key, JSON.stringify(next));
}