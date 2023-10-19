module.exports = (durationInMinutes) => {
  const now = new Date();
  const expirationDate = new Date(now.getTime() + durationInMinutes * 60000); // Convert minutes to milliseconds
  return expirationDate;
};