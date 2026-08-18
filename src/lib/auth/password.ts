export const PASSWORD_MIN = 12;

export function passwordIssues(password: string, email = ""): string[] {
  const issues: string[] = [];
  if (password.length < PASSWORD_MIN) {
    issues.push(`At least ${PASSWORD_MIN} characters.`);
  }
  if (!/[a-zA-Z]/.test(password)) issues.push("Include a letter.");
  if (!/[0-9]/.test(password)) issues.push("Include a number.");
  if (email && password.toLowerCase().includes(email.split("@")[0].toLowerCase()) && email.split("@")[0].length >= 3) {
    issues.push("Do not use your email in the password.");
  }
  return issues;
}
