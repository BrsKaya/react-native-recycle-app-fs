// styles/home.styles.js
import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, 
  },
  header: {
    fontSize: 24,
    paddingTop: 0,
    color: '#fff',
    fontWeight: 'bold',
    marginVertical: 8,
    fontFamily: 'serif',
  },
  profileSection: {
    
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 35,
    color: "#E1EEBC",
    fontFamily: "cursive",
    letterSpacing: 1,
    textAlign: 'center',  
    fontWeight: 'bold',    
    marginVertical: 12,
  },
  
  bookCard: {
    backgroundColor: "#E1EEBC",
    borderRadius: 16,
    marginBottom: 20,
    paddingTop: 0,
    paddingLeft: 0,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bookCardS: {
    backgroundColor: "#C9D2AE",
    borderRadius: 16,
    padding: 16,
    marginTop: 0,
    marginBottom: 12,
    width: 377,
    alignSelf: 'center', 
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bookHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 0,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  username: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3E7A5C",
  },
  bookDetails: {
    padding: 4,
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "700",
    paddingLeft: 20,
    color: "#3E7A5C",
    marginBottom: 6,
  },
  caption: {
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 8,
    lineHeight: 20,
    paddingLeft: 20,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  eventDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    paddingLeft: 20,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#E1EEBC",
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#E1EEBC",
    textAlign: "center",
  },
  footerLoader: {
    marginVertical: 20,
  },
  coinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 28,
  },
});

export default styles;