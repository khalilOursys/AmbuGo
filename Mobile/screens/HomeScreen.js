import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import axios from "../axios";
import { useFocusEffect } from "@react-navigation/native";

const LIMIT = 10;

const HomeScreen = () => {
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);

  const [minPage, setMinPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadingPrevious, setLoadingPrevious] = useState(false);
  const [hasMoreNext, setHasMoreNext] = useState(true);
  const [hasMorePrevious, setHasMorePrevious] = useState(false);

  const isLoadingRef = useRef(false);

  // ================= FETCH PAGE =================
  const fetchPage = useCallback(async (pageNumber, direction = "initial") => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    try {
      if (direction === "next") setLoadingMore(true);
      else if (direction === "previous") setLoadingPrevious(true);
      else setLoading(true);

      const response = await axios.get("/mission", {
        params: {
          page: pageNumber,
          limit: LIMIT,
        },
      });

      // ✅ Unwrap the { data, filters, meta } envelope
      const payload = response.data?.data ?? [];
      const meta = response.data?.meta ?? {};

      const currentPage = meta.page ?? pageNumber;
      const next = meta.hasNextPage ?? payload.length === LIMIT;
      const prev = meta.hasPreviousPage ?? currentPage > 1;

      if (direction === "next") {
        setMissions((prevList) => [...prevList, ...payload]);
        setMaxPage(currentPage);
        setHasMoreNext(next);
      } else if (direction === "previous") {
        setMissions((prevList) => [...payload, ...prevList]);
        setMinPage(currentPage);
        setHasMorePrevious(prev);
      } else {
        // initial load
        setMissions(payload);
        setMinPage(currentPage);
        setMaxPage(currentPage);
        setHasMoreNext(next);
        setHasMorePrevious(prev);
      }
    } catch (error) {
      console.error("fetchPage error:", error?.response?.data || error.message);
      Alert.alert("Error", "Unable to fetch missions.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setLoadingPrevious(false);
      isLoadingRef.current = false;
    }
  }, []);

  // First load when screen is focused
  useFocusEffect(
    useCallback(() => {
      setMissions([]);
      setMinPage(1);
      setMaxPage(1);
      setHasMoreNext(true);
      setHasMorePrevious(false);
      fetchPage(1, "initial"); // ✅ start at page 1
    }, [fetchPage]),
  );

  // ================= LOAD NEXT (scroll down) =================
  const loadNext = () => {
    if (!hasMoreNext || loadingMore || loadingPrevious || loading) return;
    fetchPage(maxPage + 1, "next");
  };

  // ================= LOAD PREVIOUS (scroll up) =================
  const loadPrevious = () => {
    if (
      !hasMorePrevious ||
      loadingPrevious ||
      loadingMore ||
      loading ||
      minPage <= 1
    )
      return;
    fetchPage(minPage - 1, "previous");
  };

  // Detect scroll near top
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY < 80 && hasMorePrevious && !loadingPrevious) {
      loadPrevious();
    }
  };

  // ================= DETAIL =================
  const fetchMissionDetails = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`/mission/${id}`);
      // Handle both envelope and raw object responses
      const mission = response.data?.data ?? response.data;
      setSelectedMission(mission);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Unable to fetch mission details.");
    } finally {
      setLoading(false);
    }
  };

  // ================= ACCEPT =================
  const acceptMission = async (id) => {
    Alert.alert("Accept Mission", "Do you want to accept this mission?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Accept",
        onPress: async () => {
          try {
            setLoading(true);
            await axios.put(`/mission/${id}/accept`);
            Alert.alert("Success", "Mission accepted successfully.");
            setSelectedMission(null);
            fetchPage(1, "initial");
          } catch (error) {
            Alert.alert("Error", "Unable to accept the mission.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  // ================= REFUSE =================
  const refuseMission = async (id) => {
    Alert.alert(
      "Refuse Mission",
      "Are you sure you want to refuse this mission?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Refuse",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await axios.put(`/mission/${id}/refuse`);
              Alert.alert("Success", "Mission refused.");
              setSelectedMission(null);
              fetchPage(1, "initial");
            } catch (error) {
              Alert.alert("Error", "Unable to refuse the mission.");
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "CRITICAL":
        return "#e53935";
      case "HIGH":
        return "#fb8c00";
      case "NORMAL":
        return "#43a047";
      default:
        return "#1e88e5";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "EN_ROUTE":
        return "#e53935";
      case "ON_SCENE":
        return "#43a047";
      case "ASSIGNED":
        return "#1e88e5";
      case "DISPATCHED":
        return "#fb8c00";
      default:
        return "#757575";
    }
  };

  const safeReplace = (value) =>
    typeof value === "string" ? value.replace("_", " ") : "UNKNOWN";

  // ================= LOADING =================
  if (loading && missions.length === 0) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1e88e5" />
      </View>
    );
  }

  // ================= DETAIL VIEW =================
  if (selectedMission) {
    const timelineSteps = [
      "CREATED",
      "ASSIGNED",
      "EN_ROUTE",
      "ON_SCENE",
      "COMPLETED",
    ];
    const currentIndex = timelineSteps.indexOf(selectedMission.status);

    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setSelectedMission(null)}>
              <MaterialIcons name="arrow-back" size={26} color="#1e88e5" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              Mission {selectedMission.code}
            </Text>
            <View style={{ width: 26 }} />
          </View>

          {/* Timeline */}
          <View style={styles.timeline}>
            {timelineSteps.map((step, index) => {
              const isPassed = index <= currentIndex;
              const isActive = selectedMission.status === step;

              return (
                <View key={step} style={styles.timelineItem}>
                  <View
                    style={[
                      styles.timelineDot,
                      isPassed && styles.timelineDotActive,
                      isActive && styles.timelineDotCurrent,
                    ]}
                  />
                  <Text
                    style={[
                      styles.timelineText,
                      isActive && styles.timelineTextActive,
                    ]}
                  >
                    {step.replace("_", " ")}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Patient */}
          <View style={styles.detailCard}>
            <View style={styles.patientHeader}>
              <FontAwesome5 name="user-injured" size={20} color="#1e88e5" />
              <Text style={styles.patientName}>
                {selectedMission.patient
                  ? `${selectedMission.patient.firstname ?? ""} ${
                      selectedMission.patient.lastname ?? ""
                    }`.trim() || "Unknown Patient"
                  : "Unknown Patient"}
              </Text>
              <View
                style={[
                  styles.priorityBadge,
                  {
                    backgroundColor: getPriorityColor(selectedMission.priority),
                  },
                ]}
              >
                <Text style={styles.priorityText}>
                  {selectedMission.priority ?? "N/A"}
                </Text>
              </View>
            </View>

            <Text style={styles.detailText}>
              <FontAwesome5 name="map-marker-alt" size={14} color="#666" />{" "}
              {selectedMission.pickupAddress || "No address"}
            </Text>
            <Text style={styles.detailText}>
              <FontAwesome5 name="phone" size={14} color="#666" />{" "}
              {selectedMission.patient?.phone || "N/A"}
            </Text>
          </View>

          {/* Vehicle & Staff */}
          {selectedMission.assignments?.[0] && (
            <View style={styles.detailCard}>
              <Text style={styles.sectionTitle}>Assigned Vehicle & Staff</Text>
              <Text style={styles.detailText}>
                🚑{" "}
                {selectedMission.assignments[0].vehicle?.registration || "N/A"}
              </Text>
              {selectedMission.assignments[0].staffMembers?.map((s, idx) => (
                <Text key={s?.id ?? `staff-${idx}`} style={styles.detailText}>
                  👤 {s?.staff?.firstname} {s?.staff?.lastname} (
                  {s?.staff?.type})
                </Text>
              ))}
            </View>
          )}

          {/* Actions */}
          {["ASSIGNED", "DISPATCHED"].includes(selectedMission.status) && (
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.acceptBtn]}
                onPress={() => acceptMission(selectedMission.id)}
              >
                <FontAwesome5 name="check" size={16} color="#fff" />
                <Text style={styles.actionBtnText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.refuseBtn]}
                onPress={() => refuseMission(selectedMission.id)}
              >
                <FontAwesome5 name="times" size={16} color="#fff" />
                <Text style={styles.actionBtnText}>Refuse</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ================= LIST VIEW =================
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.heading}>Active Missions</Text>

        {/* Loading previous indicator */}
        {loadingPrevious && (
          <View style={{ paddingVertical: 12 }}>
            <ActivityIndicator size="small" color="#1e88e5" />
          </View>
        )}

        <FlatList
          data={missions}
          keyExtractor={(item, index) =>
            item?.id ? String(item.id) : `mission-${index}`
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No active missions</Text>
          }
          // ===== BIDIRECTIONAL PAGINATION =====
          onEndReached={loadNext}
          onEndReachedThreshold={0.3}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          maintainVisibleContentPosition={
            Platform.OS === "ios" ? { minIndexForVisible: 0 } : undefined
          }
          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color="#1e88e5" />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.codeRow}>
                  <FontAwesome5
                    name="ambulance"
                    size={16}
                    color={getPriorityColor(item.priority)}
                  />
                  <Text style={styles.missionCode}>{item.code}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.status) },
                  ]}
                >
                  <Text style={styles.statusText}>
                    {safeReplace(item.status)}
                  </Text>
                </View>
              </View>

              <Text style={styles.patientLabel}>Patient</Text>
              <Text style={styles.patientNameList}>
                {item.patient
                  ? `${item.patient.firstname ?? ""} ${
                      item.patient.lastname ?? ""
                    }`.trim() || "Unknown"
                  : "Unknown"}
              </Text>

              <View style={styles.addressRow}>
                <FontAwesome5 name="map-marker-alt" size={13} color="#666" />
                <Text style={styles.addressText} numberOfLines={1}>
                  {item.pickupAddress || "No address"}
                </Text>
              </View>

              <View
                style={[
                  styles.priorityBadgeSmall,
                  { backgroundColor: getPriorityColor(item.priority) },
                ]}
              >
                <Text style={styles.priorityText}>
                  {item.priority ?? "N/A"}
                </Text>
              </View>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.detailsBtn}
                  onPress={() => fetchMissionDetails(item.id)}
                >
                  <FontAwesome5 name="eye" size={14} color="#1e88e5" />
                  <Text style={styles.detailsBtnText}>Details</Text>
                </TouchableOpacity>

                {["ASSIGNED", "DISPATCHED"].includes(item.status) && (
                  <>
                    <TouchableOpacity
                      style={styles.acceptBtnSmall}
                      onPress={() => acceptMission(item.id)}
                    >
                      <FontAwesome5 name="check" size={14} color="#fff" />
                      <Text style={styles.acceptBtnText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.refuseBtnSmall}
                      onPress={() => refuseMission(item.id)}
                    >
                      <FontAwesome5 name="times" size={14} color="#fff" />
                      <Text style={styles.acceptBtnText}>Refuse</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a237e",
    marginBottom: 16,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#999",
    fontSize: 16,
  },

  // Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  missionCode: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a237e",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  patientLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 2,
  },
  patientNameList: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
    marginBottom: 6,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  addressText: {
    fontSize: 13,
    color: "#555",
    flex: 1,
  },
  priorityBadgeSmall: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 12,
  },
  priorityText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  detailsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1e88e5",
  },
  detailsBtnText: {
    color: "#1e88e5",
    fontWeight: "600",
    fontSize: 13,
  },
  acceptBtnSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#43a047",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  refuseBtnSmall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#e53935",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  acceptBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },

  // Detail View
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a237e",
  },
  timeline: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  timelineItem: {
    alignItems: "center",
    flex: 1,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#ccc",
    marginBottom: 4,
  },
  timelineDotActive: {
    backgroundColor: "#90caf9",
  },
  timelineDotCurrent: {
    backgroundColor: "#1e88e5",
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  timelineText: {
    fontSize: 9,
    color: "#999",
    textAlign: "center",
  },
  timelineTextActive: {
    color: "#1e88e5",
    fontWeight: "700",
  },
  detailCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  patientHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  patientName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#222",
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  detailText: {
    fontSize: 14,
    color: "#444",
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a237e",
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  acceptBtn: {
    backgroundColor: "#43a047",
  },
  refuseBtn: {
    backgroundColor: "#e53935",
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});

export default HomeScreen;
