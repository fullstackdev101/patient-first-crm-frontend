// Extracted dummy data from dashboard-static.html

export const metrics = [
  {
    title: "Total Leads",
    value: "8",
    iconColor: "primary" as const,
  },
  {
    title: "Conversion Rate",
    value: "37.5%",
    iconColor: "secondary" as const,
  },
  {
    title: "Pending QA",
    value: "2",
    iconColor: "amber" as const,
  },
  {
    title: "Rejected",
    value: "1",
    iconColor: "rose" as const,
  },
];

export const chartData = [
  { month: "Jan", height: 40, value: 32 },
  { month: "Feb", height: 65, value: 58 },
  { month: "Mar", height: 55, value: 48 },
  { month: "Apr", height: 80, value: 72 },
  { month: "May", height: 70, value: 63 },
  { month: "Jun", height: 90, value: 85 },
  { month: "Jul", height: 75, value: 67 },
  { month: "Aug", height: 85, value: 78 },
  { month: "Sep", height: 95, value: 91 },
  { month: "Oct", height: 88, value: 82 },
  { month: "Nov", height: 92, value: 87 },
  { month: "Dec", height: 100, value: 95 },
];

export const activities = [
  {
    avatar: "DW",
    name: "David Wilson",
    action: "created new lead for Michael Brown",
    time: "2 hours ago",
    color: "primary" as const,
  },
  {
    avatar: "ED",
    name: "Emily Davis",
    action: "added comment to lead L002",
    time: "3 hours ago",
    color: "purple" as const,
  },
  {
    avatar: "MC",
    name: "Michael Chen",
    action: "changed status of L003 to Manager Review",
    time: "5 hours ago",
    color: "secondary" as const,
  },
  {
    avatar: "LA",
    name: "Lisa Anderson",
    action: "updated lead information for L002",
    time: "6 hours ago",
    color: "primary" as const,
  },
  {
    avatar: "ED",
    name: "Emily Davis",
    action: "approved lead L001",
    time: "1 day ago",
    color: "purple" as const,
  },
  {
    avatar: "JM",
    name: "Jennifer Martinez",
    action: "rejected lead L005 - Missing information",
    time: "2 days ago",
    color: "secondary" as const,
  },
];
