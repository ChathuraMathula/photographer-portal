export const getDeadlineText = (deadlineStr?: string) => {
  if (!deadlineStr) return "";
  const deadline = new Date(deadlineStr);
  const diffMs = deadline.getTime() - Date.now();
  if (diffMs <= 0) return "Expired";
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${diffHours}h ${diffMins}m remaining`;
};
