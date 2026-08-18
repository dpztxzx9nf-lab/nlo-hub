//#region node_modules/.nitro/vite/services/ssr/assets/password-CqOEJuK1.js
function passwordIssues(password, email = "") {
	const issues = [];
	if (password.length < 12) issues.push(`At least 12 characters.`);
	if (!/[a-zA-Z]/.test(password)) issues.push("Include a letter.");
	if (!/[0-9]/.test(password)) issues.push("Include a number.");
	if (email && password.toLowerCase().includes(email.split("@")[0].toLowerCase()) && email.split("@")[0].length >= 3) issues.push("Do not use your email in the password.");
	return issues;
}
//#endregion
export { passwordIssues as t };
