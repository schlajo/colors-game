import { COLOR_VALUES } from "./colorUtils";

// Function to parse a mixing rule and extract color information
export const parseColorRule = (ruleString) => {
  // List of color names that might appear in rules
  const colorNames = Object.keys(COLOR_VALUES);

  // Create a regex pattern that matches any color name (case insensitive)
  const colorPattern = new RegExp(`\\b(${colorNames.join("|")})\\b`, "gi");

  const parts = [];
  let lastIndex = 0;
  let match;

  // Find all color matches in the string
  while ((match = colorPattern.exec(ruleString)) !== null) {
    // Add text before the color
    if (match.index > lastIndex) {
      parts.push({
        type: "text",
        content: ruleString.slice(lastIndex, match.index),
      });
    }

    // Add the color
    parts.push({
      type: "color",
      content: match[0],
      color: match[0].toLowerCase(),
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < ruleString.length) {
    parts.push({
      type: "text",
      content: ruleString.slice(lastIndex),
    });
  }

  return parts;
};
