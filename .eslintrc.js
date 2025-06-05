module.exports = {
  extends: ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
  rules: {
    "@typescript-eslint/no-explicit-any": "off", // turn off the rule
    // or to warn instead of error:
    // "@typescript-eslint/no-explicit-any": "warn",
  },
};