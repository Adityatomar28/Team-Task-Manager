function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(email) {
  if (!isNonEmptyString(email)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password) {
  return typeof password === "string" && password.length >= 6;
}

function isEnumValue(value, validValues) {
  return validValues.includes(value);
}

function isOptionalDate(value) {
  if (value === null || value === undefined || value === "") return true;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

module.exports = {
  isNonEmptyString,
  isValidEmail,
  isStrongPassword,
  isEnumValue,
  isOptionalDate,
};
