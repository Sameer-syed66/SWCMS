export const BIN_STATUSES = {
  EMPTY: "Empty",
  NORMAL: "Normal",
  HIGH: "High",
  FULL: "Full",
  OFFLINE: "Offline"
};

export const COMPLAINT_STATUSES = ["Pending", "Assigned", "In Progress", "Resolved", "Rejected"];

export const SAMPLE_BINS = [
  { id: "BIN-001", location: "Main Gate", level: 86, status: "Full", lastUpdated: "2 min ago" },
  { id: "BIN-002", location: "Hostel Block A", level: 63, status: "High", lastUpdated: "5 min ago" },
  { id: "BIN-003", location: "Canteen", level: 42, status: "Normal", lastUpdated: "4 min ago" },
  { id: "BIN-004", location: "Library Road", level: 19, status: "Normal", lastUpdated: "8 min ago" },
  { id: "BIN-005", location: "Sports Ground", level: 91, status: "Full", lastUpdated: "1 min ago" },
  { id: "BIN-006", location: "Academic Block", level: 35, status: "Normal", lastUpdated: "6 min ago" },
  { id: "BIN-007", location: "Parking Area", level: 74, status: "High", lastUpdated: "3 min ago" },
  { id: "BIN-008", location: "Staff Quarters", level: 12, status: "Normal", lastUpdated: "10 min ago" },
  { id: "BIN-009", location: "Market Junction", level: 97, status: "Full", lastUpdated: "1 min ago" },
  { id: "BIN-010", location: "Community Hall", level: 51, status: "Normal", lastUpdated: "7 min ago" }
];

export const SAMPLE_ALERTS = [
  { id: 1, title: "Bin requires immediate collection", bin: "BIN-009", location: "Market Junction", level: 97, severity: "Critical", time: "1 min ago" },
  { id: 2, title: "Bin reached collection threshold", bin: "BIN-005", location: "Sports Ground", level: 91, severity: "Critical", time: "4 min ago" },
  { id: 3, title: "High waste level detected", bin: "BIN-001", location: "Main Gate", level: 86, severity: "High", time: "8 min ago" },
  { id: 4, title: "Bin approaching threshold", bin: "BIN-007", location: "Parking Area", level: 74, severity: "Medium", time: "12 min ago" }
];

export const SAMPLE_COMPLAINTS = [
  { id: "CMP-2026-001", subject: "Overflowing bin near bus stop", location: "Main Gate", citizen: "Anonymous", status: "Pending", date: "22 Sep 2026" },
  { id: "CMP-2026-002", subject: "Waste not collected", location: "Hostel Block A", citizen: "Anonymous", status: "Assigned", date: "21 Sep 2026" },
  { id: "CMP-2026-003", subject: "Litter around community bin", location: "Community Hall", citizen: "Anonymous", status: "In Progress", date: "20 Sep 2026" },
  { id: "CMP-2026-004", subject: "Damaged bin lid", location: "Library Road", citizen: "Anonymous", status: "Resolved", date: "19 Sep 2026" }
];