import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Profile = { full_name: string | null; role: string };

export default function HomeScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single();
      if (error) console.log("Profile error:", error.message);
      else setProfile(data);
    }
    loadProfile();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hi, {profile?.full_name ?? "..."} 👋</Text>
      <Text style={styles.role}>Role: {profile?.role ?? "..."}</Text>
      <Pressable
        style={[
          styles.button,
          { backgroundColor: "#2563eb", marginBottom: 12 },
        ]}
        onPress={() => router.push("/pets")}
      >
        <Text style={styles.buttonText}>My Pets</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.buttonText}>Log Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  title: { fontSize: 26, fontWeight: "bold", color: "#111" },
  role: { fontSize: 18, color: "#555", marginTop: 8, marginBottom: 32 },
  button: {
    backgroundColor: "#dc2626",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
