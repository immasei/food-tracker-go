import React, { useCallback, useEffect, useRef, useState, useContext } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, Button, Image, ActivityIndicator, Platform } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { cloudOCR, OCRResult } from "./utils/ocr";
import { deriveFromOCR } from "./utils/parser";
import { upsertItem } from "../(tracker)/utils/firebase";
import { useToast } from "../../components/Toast";
import { palette, shadow, styles } from "./styles";
import { NAMES_KEY, loadRecents } from "../(tracker)/utils/recents";
import { AuthContext } from "../../contexts/AuthContext";

type PhotoItem = { id: string; uri: string; ocr?: OCRResult; error?: string };
type CameraRef = React.ComponentRef<typeof CameraView>;

export default function ScannerScreen() {
  const { show, Toast } = useToast();
  
  const { user } = useContext(AuthContext);
  const USER_ID = user.uid;

  const cameraRef = useRef<CameraRef | null>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [shooting, setShooting] = useState(false);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [guessName, setGuessName] = useState<string | null>(null);
  const [guessExpiry, setGuessExpiry] = useState<string | null>(null);
  const [recentNames, setRecentNames] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  // ----- camera permission button (auto asked first time) & dont press never allowed ---------
  useEffect(() => {
    (async () => {
      if (!permission?.granted) await requestPermission();
      setRecentNames(await loadRecents(NAMES_KEY(USER_ID)));
    })();
  }, []);

  // new ocr coming in & trigger
  useEffect(() => {
    const latest = photos[0];
    const text = latest?.ocr?.text ?? "";
    const lines: string[] = latest?.ocr?.lines?.map(l => l.text) ?? [];

    const { name, expiry } = deriveFromOCR(text, lines);
    if (name) setGuessName(name);
    if (expiry) setGuessExpiry(expiry);
  }, [photos]);

  // take a pic (i mean scan)
  const takePicture = useCallback(async () => {
    if (!cameraRef.current) return;
    try {
      // prevent multiple photos captured at once
      setShooting(true);
      // ----- photo -------
      const snap = await (cameraRef.current as any)?.takePictureAsync?.({
        quality: 0.7,
        base64: true,
        skipProcessing: true,
      });

      const item: PhotoItem = { id: String(Date.now()), uri: snap.uri };
      setPhotos((prev) => [item, ...prev]);

      // prevent concurrent OCR calls and show the “processing” overlay while waiting for ocr result.
      setProcessing(true);
      // ------ ocr -------
      try {
        const ocr = await cloudOCR(snap);
        setPhotos((prev) => prev.map((p) => (p.id === item.id ? { ...p, ocr } : p)));
      } catch (e: any) {
        setPhotos((prev) => prev.map((p) => (p.id === item.id ? { ...p, error: String(e) } : p)));
        show("OCR failed on a photo.", "danger");
      } finally {
        setProcessing(false);
      }
    } finally {
      setShooting(false);
    }
  }, [show]);

  // -------- reset button: clear all scanned props -----------
  const resetAll = useCallback(() => {
    setPhotos([]);
    setGuessName(null);
    setGuessExpiry(null);
  }, []);

  // ------- add button: add scanned food item to tracker (need at leasted 1 ok scanned property) --------
  // food item (in tracker) are allowed to be empty overall, but scanner needs at least one signal
  const canAdd = !!(guessName || guessExpiry);

  const onSave = useCallback(async () => {
    try {
      await upsertItem({
        id: "",
        userId: USER_ID,
        name: guessName ?? null,
        category: null,
        expiryDate: guessExpiry ?? null,
        shared: false,
        createdAt: new Date().toISOString(),
      } as any, USER_ID);
      show("Added from scan.", "success");
      resetAll();
    } catch (e) {
      show("Save failed.", "danger");
    }
  }, [guessName, guessExpiry, resetAll, show]);

  const handleAddPress = useCallback(() => {
    if (! (guessName || guessExpiry) ) {
      show("Scan at least one field (Item or Expiry) before adding.", "danger");
      return;
    }
    onSave();
  }, [guessName, guessExpiry, onSave, show]);

  // ---------- scanned progress ------------------------
  const doneBullet = (ok: boolean) => ok ? "[o]" : "[x]";
  const green = (ok: boolean) => ({ color: ok ? "#9AE6B4" : "#FCA5A5" });

  // ---------- get permission (again) if havent -------------
  if (!permission) return <View style={styles.center}><ActivityIndicator /></View>;
  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>We need camera access.</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* top: progress */}
      <View style={styles.progressBox}>
        <Text style={styles.progressTitle}>Scan Progress</Text>
        <Text style={[styles.progressLine, green(!!guessName)]}>{doneBullet(!!guessName)} Item: {guessName ?? "—"}</Text>
        <Text style={[styles.progressLine, green(!!guessExpiry)]}>{doneBullet(!!guessExpiry)} Expiry: {guessExpiry ?? "—"}</Text>
      </View>

      {/* middle: camera & button*/}
      <View style={styles.cameraWrap}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back"/>
        <View style={styles.shutterBar}>
          <Pressable
            style={[styles.btn, canAdd ? styles.add : styles.addDisabled]}
            // disabled={!canAdd || processing}
            onPress={handleAddPress}
          >
            <Text style={styles.btnText}>Add</Text>
          </Pressable>
          <Pressable onPress={takePicture} style={[styles.btn, styles.btnPrimary]} disabled={shooting}>
            <Text style={styles.btnText}>{shooting ? "..." : "Capture"}</Text>
          </Pressable>
          <Pressable onPress={resetAll} style={[styles.btn, styles.btnGrey]} disabled={!photos.length && !guessName && !guessExpiry}>
            <Text style={styles.btnText}>Reset</Text>
          </Pressable>
        </View>
      </View>

      {/* bottom: thumbnails (+ ocr status when error) */}
      <View style={{ height: 115}}>
      <FlatList
        data={photos}
        keyExtractor={(p) => p.id}
        horizontal
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
        renderItem={({ item }) => (
          <View style={styles.thumb}>
            <Image source={{ uri: item.uri }} style={{ width: "100%", height: "100%", borderRadius: 10 }} />
            {!item.ocr && !item.error && <View style={styles.thumbBadge}><Text style={styles.thumbBadgeText}>OCR…</Text></View>}
            {item.error && <View style={[styles.thumbBadge, { backgroundColor: "#FCA5A5" }]}><Text style={styles.thumbBadgeText}>ERR</Text></View>}
          </View>
        )}
      />
      </View>

      {processing && (
        <View style={styles.processing}>
          <ActivityIndicator />
        </View>
      )}
      
      <Toast />
    </View>
  );
}