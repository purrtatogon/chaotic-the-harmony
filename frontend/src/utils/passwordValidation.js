const PASSWORD_MIN_LENGTH = 12;

const RULES = [
  { test: (pw) => pw.length >= PASSWORD_MIN_LENGTH, label: `At least ${PASSWORD_MIN_LENGTH} characters`, key: 'length' },
  { test: (pw) => /[A-Z]/.test(pw), label: 'One uppercase letter', key: 'upper' },
  { test: (pw) => /[a-z]/.test(pw), label: 'One lowercase letter', key: 'lower' },
  { test: (pw) => /[0-9]/.test(pw), label: 'One number', key: 'digit' },
  { test: (pw) => /[^A-Za-z0-9]/.test(pw), label: 'One special character', key: 'special' },
];

export function validatePassword(password) {
  if (!password) return 'Password is required.';
  for (const rule of RULES) {
    if (!rule.test(password)) {
      return `Password must contain: ${rule.label.toLowerCase()}.`;
    }
  }
  return null;
}

export function getPasswordChecklist(password) {
  return RULES.map((rule) => ({
    key: rule.key,
    label: rule.label,
    passed: password ? rule.test(password) : false,
  }));
}

export { PASSWORD_MIN_LENGTH, RULES };
