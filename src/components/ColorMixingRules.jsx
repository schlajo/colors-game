import React from "react";
import ColorSwatch from "./ColorSwatch";
import { parseColorRule } from "../utils/ruleParser";

const COLOR_MIXING_RULES_BY_DIFFICULTY = {
  Easy: {
    additive: [
      "Red + Green = Yellow",
      "Red + Blue = Magenta",
      "Blue + Green = Cyan",
    ],
    subtractive: [
      "Cyan + Magenta = Blue",
      "Cyan + Yellow = Green",
      "Magenta + Yellow = Red",
    ],
    arbitrary: ["Two of Same Color = That Color"],
  },
  Medium: {
    additive: [
      "Red + Green = Yellow",
      "Red + Blue = Magenta",
      "Blue + Green = Cyan",
    ],
    subtractive: [
      "Cyan + Magenta = Blue",
      "Cyan + Yellow = Green",
      "Magenta + Yellow = Red",
    ],
    arbitrary: [
      "Magenta + Blue = Purple",
      "Yellow + Red = Orange",
      "Cyan + Green = Teal",
      "Two of Same Color = That Color",
    ],
  },
  Difficult: {
    additive: [
      "Red + Green = Yellow",
      "Red + Blue = Magenta",
      "Blue + Green = Cyan",
      "Red + Green + Blue = White",
    ],
    subtractive: [
      "Cyan + Magenta = Blue",
      "Cyan + Yellow = Green",
      "Magenta + Yellow = Red",
      "Cyan + Magenta + Yellow = Black",
    ],
    arbitrary: [
      "Cyan + Green = Teal",
      "Magenta + Blue = Purple",
      "Yellow + Red = Orange",
      // "Cyan + Magenta + Blue = Silver",
      // "Red + Yellow + Magenta = Gold",
      "Two of Same Color = That Color",
    ],
  },
};

// Component to render a rule with color swatches
const RuleWithSwatches = ({ rule }) => {
  const parts = parseColorRule(rule);

  return (
    <span className="flex items-center justify-center flex-wrap">
      {parts.map((part, index) => {
        if (part.type === "color") {
          return (
            <span key={index} className="inline-flex items-center">
              <ColorSwatch color={part.color} size="w-3 h-3" />
              <span className="ml-1">{part.content}</span>
            </span>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </span>
  );
};

const ColorMixingRules = ({ difficulty }) => {
  return (
    <div className="instruction-panel lg:w-1/2 w-full text-center mt-2 lg:mt-4 bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-2">Color-Mixing Rules</h2>
      <ul className="list-none list-inside mb-4 text-gray-300">
        <strong className="text-white">Additive Mixing (RGB) for Light</strong>
        {COLOR_MIXING_RULES_BY_DIFFICULTY[difficulty].additive.map(
          (rule, index) => (
            <li key={`additive-${index}`}>
              <RuleWithSwatches rule={rule} />
            </li>
          )
        )}
      </ul>
      <ul className="list-none list-inside mb-4 text-gray-300">
        <strong className="text-white">Subtractive Mixing (CMY) for Ink</strong>
        {COLOR_MIXING_RULES_BY_DIFFICULTY[difficulty].subtractive.map(
          (rule, index) => (
            <li key={`subtractive-${index}`}>
              <RuleWithSwatches rule={rule} />
            </li>
          )
        )}
      </ul>
      <ul className="list-none list-inside mb-4 text-gray-300">
        <strong className="text-white">Arbitrary Mixing</strong>
        {COLOR_MIXING_RULES_BY_DIFFICULTY[difficulty].arbitrary.map(
          (rule, index) => (
            <li key={`arbitrary-${index}`}>
              <RuleWithSwatches rule={rule} />
            </li>
          )
        )}
      </ul>
      <h3 className="text-lg font-bold text-white mb-2">
        Understanding RGB vs. CMY
      </h3>
      <div className="text-gray-300 text-left">
        <span>
          You probably learned about subtractive color-mixing as a kid, with the
          three primaries—red, blue, and yellow—and the secondaries they form:
          purple, orange, and green. Printers later refined this system into CMY
          (cyan, magenta, yellow), which more accurately represent the
          primaries. That’s why ink cartridges are labeled CMYK, with “K” for
          black ink, since CMY alone doesn’t produce a true black.
          <br />
          <br />
          Subtractive mixing starts with white (like paper) and removes light
          through pigments, reflecting only certain wavelengths. An apple
          appears red because it absorbs most wavelengths, but reflects
          primarily red light back to our eyes. In contrast, additive mixing
          (RGB) starts with black and adds colored light, as with TVs, monitors,
and smartphones. Red, green, and blue light can combine to form white, making
          RGB the inverse of CMY.
          <br />
          <br />
          The contrast between the two systems shows how our perception of color depends on context. The same red looks different on a glowing screen vs. printed on paper, since one comes from emitted light and the other from reflected light. {difficulty === "Easy" && (
            <>  That’s why colors don’t always translate perfectly between digital displays and print.</>
          )}
        </span>
      </div>
    </div>
  );
};

export default ColorMixingRules;
