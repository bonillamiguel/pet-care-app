import { supabase } from "@/lib/supabase";
import { Stack } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const SPECIES = [
  { value: "dog", label: "Dog", emoji: "🐶" },
  { value: "cat", label: "Cat", emoji: "🐱" },
  { value: "bird", label: "Bird", emoji: "🐦" },
  { value: "rabbit", label: "Rabbit", emoji: "🐰" },
  { value: "fish", label: "Fish", emoji: "🐟" },
  { value: "reptile", label: "Reptile", emoji: "🦎" },
  { value: "other", label: "Other", emoji: "🐾" },
] as const;

type Species = (typeof SPECIES)[number]["value"];

function speciesEmoji(species: string | null) {
  return SPECIES.find((s) => s.value === species)?.emoji ?? "🐾";
}

type Pet = {
  id: string;
  name: string;
  species: string | null;
  breed: string | null;
  care_notes: string | null;
};

export default function PetsScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<Species>("dog");
  const [speciesOpen, setSpeciesOpen] = useState(false);
  const [breed, setBreed] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  // READ: get pets from the database
  const loadPets = useCallback(async () => {
    const { data, error } = await supabase
      .from("pets")
      .select("id, name, species, breed, care_notes")
      .order("created_at", { ascending: false });
    if (error) Alert.alert("Error loading pets", error.message);
    else setPets(data);
  }, []);

  useEffect(() => {
    loadPets();
  }, [loadPets]);

  // CREATE: save a new pet
  async function addPet() {
    if (!name.trim()) {
      Alert.alert("Please enter your pet's name");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("pets").insert({
      name: name.trim(),
      species,
      breed: breed.trim() || null,
      care_notes: notes.trim() || null,
    });
    setSaving(false);
    if (error) {
      Alert.alert("Error", error.message);
      return;
    }
    setName("");
    setSpecies("dog");
    setBreed("");
    setNotes("");
    loadPets(); // refresh the list
  }

  // DELETE: remove a pet (with a confirmation)
  function confirmDelete(pet: Pet) {
    Alert.alert("Remove pet", `Remove ${pet.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase
            .from("pets")
            .delete()
            .eq("id", pet.id);
          if (error) Alert.alert("Error", error.message);
          else loadPets();
        },
      },
    ]);
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: "My Pets" }} />
      <FlatList
        style={styles.container}
        // Inset content below the header and above the home indicator on iOS
        contentInsetAdjustmentBehavior="automatic"
        data={pets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 20 }}
        ListHeaderComponent={
          <View style={styles.form}>
            <Text style={styles.heading}>Add a pet</Text>
            <TextInput
              style={styles.input}
              placeholder="Name *"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
            />
            {/* Pet type dropdown */}
            <Pressable
              style={[styles.input, styles.dropdown]}
              onPress={() => setSpeciesOpen((open) => !open)}
            >
              <Text style={styles.dropdownText}>
                {speciesEmoji(species)}{" "}
                {SPECIES.find((s) => s.value === species)?.label}
              </Text>
              <Text style={styles.dropdownArrow}>
                {speciesOpen ? "▲" : "▼"}
              </Text>
            </Pressable>
            {speciesOpen && (
              <View style={styles.dropdownMenu}>
                {SPECIES.map((option) => (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.dropdownOption,
                      option.value === species && styles.dropdownOptionSelected,
                    ]}
                    onPress={() => {
                      setSpecies(option.value);
                      setSpeciesOpen(false);
                    }}
                  >
                    <Text style={styles.dropdownText}>
                      {option.emoji} {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
            <TextInput
              style={styles.input}
              placeholder="Breed"
              placeholderTextColor="#888"
              value={breed}
              onChangeText={setBreed}
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Care notes (feeding, behavior, meds...)"
              placeholderTextColor="#888"
              multiline
              value={notes}
              onChangeText={setNotes}
            />
            <Pressable style={styles.button} onPress={addPet} disabled={saving}>
              <Text style={styles.buttonText}>
                {saving ? "Saving..." : "Add Pet"}
              </Text>
            </Pressable>
            <Text style={[styles.heading, { marginTop: 28 }]}>
              Your pets ({pets.length})
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>No pets yet. Add one above!</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onLongPress={() => confirmDelete(item)}
          >
            <Text style={styles.petName}>
              {speciesEmoji(item.species)} {item.name}
            </Text>
            {item.breed && <Text style={styles.detail}>{item.breed}</Text>}
            {item.care_notes && (
              <Text style={styles.notes}>{item.care_notes}</Text>
            )}
          </Pressable>
        )}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  form: { marginBottom: 8 },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    color: "#111",
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: { fontSize: 16, color: "#111" },
  dropdownArrow: { fontSize: 12, color: "#888" },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: -6,
    marginBottom: 10,
    overflow: "hidden",
  },
  dropdownOption: { padding: 12 },
  dropdownOptionSelected: { backgroundColor: "#e0e7ff" },
  button: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  empty: { color: "#888", textAlign: "center", marginTop: 12 },
  card: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  petName: { fontSize: 18, fontWeight: "600", color: "#111" },
  detail: { color: "#555", marginTop: 2 },
  notes: { color: "#333", marginTop: 8 },
});
