import React, { useState } from "react";
import { Modal, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { SmartTouchable as Touchable } from "@/components/ui/touchable";
import * as Haptics from "expo-haptics";

export type Client = { number: string; name?: string };

export type ClientModalProps = {
  open: boolean;
  onClose: () => void;
  clients: Client[];
  select: (c: Client) => void;
  adding: boolean;
  setAdding: (v: boolean) => void;
  addClient: (c: Client) => void;
  scheme: keyof typeof Colors;
  selectedClient?: Client | null;
  newNumber: string;
  newName: string;
  setNewNumber: (v: string) => void;
  setNewName: (v: string) => void;
};

export function ClientModal({
  open,
  onClose,
  clients,
  select,
  adding,
  setAdding,
  addClient,
  scheme,
  selectedClient,
  newNumber,
  newName,
  setNewNumber,
  setNewName,
}: ClientModalProps) {
  if (!open) return null;
  const [query, setQuery] = useState("");
  const filtered = !query.trim()
    ? clients
    : clients.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.number.toLowerCase().includes(q) ||
          (c.name?.toLowerCase().includes(q) ?? false)
        );
      });

  return (
    <Modal transparent animationType='fade'>
      <View style={styles.modalBackdrop}>
        <View
          style={[
            styles.modalCard,
            { backgroundColor: Colors[scheme].surface },
          ]}
        >
          <View style={styles.modalHeader}>
            <View style={styles.clientIconWrapSmall}>
              <IconSymbol
                name='person.crop.circle'
                size={18}
                color={"#FFFFFF"}
              />
            </View>
            <ThemedText style={{ fontWeight: "700", fontSize: 16 }}>
              Seleccionar Cliente
            </ThemedText>
            <Touchable
              onPress={() => {
                onClose();
              }}
              hitSlop={8}
            >
              <IconSymbol name='xmark' size={18} color={Colors[scheme].text} />
            </Touchable>
          </View>
          {/* Buscador */}
          <View>
            <TextInput
              placeholder='Buscar por número o nombre'
              placeholderTextColor={"#777"}
              value={query}
              onChangeText={setQuery}
              style={[
                styles.input,
                {
                  borderColor: Colors[scheme].border,
                  color: Colors[scheme].text,
                },
              ]}
            />
          </View>
          {!adding && (
            <Touchable
              style={styles.addClientInline}
              onPress={() => {
                setAdding(true);
              }}
            >
              <IconSymbol
                name='plus'
                size={18}
                color={Colors[scheme].primary}
              />
              <ThemedText
                style={{ color: Colors[scheme].primary, fontWeight: "600" }}
              >
                Agregar Cliente
              </ThemedText>
            </Touchable>
          )}
          <ScrollView
            style={{ maxHeight: 420 }}
            contentContainerStyle={{ paddingBottom: 12, gap: 10 }}
          >
            {adding ? (
              <View style={{ gap: 10 }}>
                <ThemedText style={{ fontWeight: "600" }}>
                  Nuevo Cliente
                </ThemedText>
                <TextInput
                  placeholder='Número *'
                  placeholderTextColor={"#888"}
                  value={newNumber}
                  onChangeText={setNewNumber}
                  keyboardType='numeric'
                  style={[
                    styles.input,
                    {
                      borderColor: Colors[scheme].border,
                      color: Colors[scheme].text,
                    },
                  ]}
                />
                <TextInput
                  placeholder='Nombre (opcional)'
                  placeholderTextColor={"#888"}
                  value={newName}
                  onChangeText={setNewName}
                  style={[
                    styles.input,
                    {
                      borderColor: Colors[scheme].border,
                      color: Colors[scheme].text,
                    },
                  ]}
                />
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <Touchable
                    style={[styles.modalBtn, { backgroundColor: "#E1E4E3" }]}
                    onPress={() => {
                      setAdding(false);
                      setNewName("");
                      setNewNumber("");
                    }}
                  >
                    <ThemedText style={{ fontWeight: "600" }}>
                      Cancelar
                    </ThemedText>
                  </Touchable>
                  <Touchable
                    disabled={!newNumber.trim()}
                    style={[
                      styles.modalBtn,
                      {
                        backgroundColor: newNumber.trim()
                          ? Colors[scheme].primary
                          : "#B5BDBC",
                      },
                    ]}
                    onPress={() => {
                      if (!newNumber.trim()) return;
                      addClient({
                        number: newNumber.trim(),
                        name: newName.trim() || undefined,
                      });
                      Haptics.notificationAsync(
                        Haptics.NotificationFeedbackType.Success
                      ).catch(() => {});
                      setAdding(false);
                      setNewName("");
                      setNewNumber("");
                      onClose();
                    }}
                  >
                    <ThemedText
                      lightColor='#FFFFFF'
                      darkColor='#FFFFFF'
                      style={{ fontWeight: "600" }}
                    >
                      Guardar
                    </ThemedText>
                  </Touchable>
                </View>
              </View>
            ) : (
              <>
                {filtered.map((c) => (
                  <Touchable
                    key={c.number}
                    style={[
                      styles.clientItem,
                      {
                        borderColor:
                          c.number === selectedClient?.number
                            ? Colors[scheme].primary
                            : Colors[scheme].border,
                        backgroundColor: Colors[scheme].background,
                      },
                    ]}
                    onPress={() => {
                      select(c);
                      onClose();
                    }}
                  >
                    <ThemedText style={{ fontWeight: "600" }}>
                      {"N° " + c.number}
                    </ThemedText>
                    {c.name && (
                      <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                        {c.name}
                      </ThemedText>
                    )}
                  </Touchable>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "#00000055",
    paddingHorizontal: 18,
    paddingVertical: 40,
    justifyContent: "center",
  },
  modalCard: {
    borderRadius: 22,
    padding: 18,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  clientIconWrapSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2E6F61",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#FFFFFF",
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  addClientInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  clientItem: {
    padding: 12,
    gap: 4,
    borderWidth: 1,
    borderRadius: 12,
  },
});
