export function formatTimeDuration(startTime: Date | undefined, endTime: Date | undefined): string {
  // Check if either date is undefined
  if (!startTime || !endTime) {
    return '';
  }

  const durationMs = endTime.getTime() - startTime.getTime();
  let duration = new Date(Math.abs(durationMs));
  const sign = durationMs >= 0 ? '' : '-';
  const days = Math.abs(Math.trunc(durationMs / (1000 * 60 * 60 * 24)));
  const hours = duration.getUTCHours();
  const minutes = duration.getUTCMinutes();
  const seconds = duration.getUTCSeconds();
  const milliseconds = duration.getUTCMilliseconds();

  // Constructing the time string conditionally
  let timeString = `${sign}`;
  if (days !== 0) {
    timeString += `${days}d `;
  }
  if (hours > 0) {
    timeString += `${pad(hours)}:`;
  }
  timeString += `${pad(minutes)}:${pad(seconds)}.${Math.floor(milliseconds / 100)}`;

  return timeString;
}

function pad(number: number): string {
  return number < 10 ? '0' + number : number.toString();
}
