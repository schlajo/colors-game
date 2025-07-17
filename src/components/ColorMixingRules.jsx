import React from "react";

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
      "Two of Same Color = That Color",
    ],
  },
};

const ColorMixingRules = ({ difficulty }) => {
  return (
    <div className="instruction-panel lg:w-1/2 w-full text-center mt-2 lg:mt-4 bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-2">Color-Mixing Rules</h2>
      <ul className="list-disc list-inside mb-4 text-gray-300">
        Additive Mixing (RGB) for Light
        {COLOR_MIXING_RULES_BY_DIFFICULTY[difficulty].additive.map(
          (rule, index) => (
            <li key={`additive-${index}`}>{rule}</li>
          )
        )}
      </ul>
      <ul className="list-disc list-inside mb-4 text-gray-300">
        Subtractive Mixing (CMY) for Ink
        {COLOR_MIXING_RULES_BY_DIFFICULTY[difficulty].subtractive.map(
          (rule, index) => (
            <li key={`subtractive-${index}`}>{rule}</li>
          )
        )}
      </ul>
      <ul className="list-disc list-inside mb-4 text-gray-300">
        Arbitrary Mixing
        {COLOR_MIXING_RULES_BY_DIFFICULTY[difficulty].arbitrary.map(
          (rule, index) => (
            <li key={`arbitrary-${index}`}>{rule}</li>
          )
        )}
      </ul>
      <h3 className="text-lg font-bold text-white mb-2">
        Understanding RGB vs. CMY
      </h3>
      <div className="text-gray-300 text-left">
        <span>
          With additive color-mixing (RGB), we start with darkness (black) and
          add colored light. We see light directly emitted from a source, like a
          TV. This model's three primary colors (red, green, and blue) can
          combine to make white.
          <br />
          <br />
          But with subtractive color-mixing (CMY), we see light that has bounced
          off of an object, with certain wavelengths absorbed by the pigments.
          We start with white, like a sheet of paper, and subtract light through
          pigments. A red apple appears red because it absorbs most wavelengths
          but reflects primarily red light back to our eyes.
          <br />
          <br />
          On ink cartridges, the letters CMYK refer to cyan, magenta, yellow,
          and black. Cartridges include black ink even though CMY's three
          primary colors could combine to make black.
        </span>
      </div>
    </div>
  );
};

export default ColorMixingRules;
