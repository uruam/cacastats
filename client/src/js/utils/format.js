export const formatNumber = (num) => {
  const units = ["", "k", "M", "B", "T", "Q"];
  if (num >= 1000) {
    const unitIndex = Math.floor(Math.log10(num) / 3);
    const unit = units[unitIndex];
    const formattedNum = (num / 1000 ** unitIndex).toFixed(
      unitIndex > 0 ? 2 : 0,
    );

    return parseFloat(formattedNum) + unit;
  }

  // Formats numbers with commas for thousands and ensures two decimal places
  return parseFloat(num.toFixed(2)).toLocaleString();
};

export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const formattedHours = hours > 0 ? `${hours}h` : "";
  const formattedMinutes = minutes > 0 ? `${minutes}m` : "";
  const formattedSeconds = remainingSeconds > 0 ? `${remainingSeconds}s` : "";

  return `${formattedHours}${formattedMinutes}${formattedSeconds}`;
};

export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const formattedDate = `${year}.${month < 10 ? "0" : ""}${month}.${
    day < 10 ? "0" : ""
  }${day}`;

  return formattedDate;
};

export const formatPeriod = (period) => {
  const { from } = period;
  const { till } = period;
  const formattedPeriod = `${formatDate(from)}-${formatDate(till)}`;

  return formattedPeriod;
};
