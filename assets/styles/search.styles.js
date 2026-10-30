import { StyleSheet } from "react-native";
import { COLORS } from "../../constants/colors";
import { FONT_STACK } from "../../constants/typography";

export const searchStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONT_STACK.regular,
    fontSize: 15,
    color: COLORS.text,
  },
  clearButton: {
    padding: 4,
  },
  quickFilters: {
    marginTop: 16,
  },
  filterLabel: {
    fontFamily: FONT_STACK.bold,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 10,
  },
  filterButtons: {
    flexDirection: "row",
    gap: 10,
  },
  quickFilterButton: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activeQuickFilter: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quickFilterText: {
    fontFamily: FONT_STACK.medium,
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.text,
  },
  activeQuickFilterText: {
    color: COLORS.white,
    fontFamily: FONT_STACK.bold,
  },
  resultsSection: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 8,
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    marginTop: 12,
  },
  resultsTitle: {
    fontFamily: FONT_STACK.bold,
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    flex: 1,
  },
  resultsCount: {
    fontFamily: FONT_STACK.medium,
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  recipesGrid: {
    gap: 16,
    paddingBottom: 32,
    width: "100%",
    maxWidth: 1200,
    alignSelf: "center",
  },
  row: {
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyTitle: {
    fontFamily: FONT_STACK.bold,
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontFamily: FONT_STACK.regular,
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 20,
  },
});
