const fs = require("fs");
const path = require("path");
const { XMLParser, XMLBuilder } = require('fast-xml-parser');

const enToKeycodes = require('./dictionaries/en-keycodes.json');
const keyCodesToRu = require('./dictionaries/keycodes-ru.json');

const parserOptions = {
  ignoreAttributes: false,
  attributesGroupName: 'attributes',
  allowBooleanAttributes: true,
  attributeNamePrefix: '',
};

const builderOptions = {
  attributesGroupName: 'attributes',
  ignoreAttributes: false,
  allowBooleanAttributes: true,
  suppressEmptyNode: true,
  format: true,
  attributeValueProcessor: (attribute, value) => {
    return value.replace(/&/g, '&amp;');
  }
};

const SHORTCUTS_FILE_NAME = 'KeyboardShortcuts.xml';
const FUNCTIONAL_KEYS = ['Ctrl', 'Shift'];


function main() {
  // read file
  const filePath = path.join(__dirname, 'test_files', SHORTCUTS_FILE_NAME);
  const xmlData = fs.readFileSync(filePath);

  // parse xml to object
  const parser = new XMLParser(parserOptions);
  const result = parser.parse(xmlData);

  const shortCutsArray = result.Shortcuts.ShortcutItem;

  // translate all shortcuts
  const newData = {
    Shortcuts: { ShortcutItem: walkThroughAndUpdate(shortCutsArray) },
  }

  // build xml back from JS object
  const xmlBuilder = new XMLBuilder(builderOptions)
  const resultXml = xmlBuilder.build(newData);

  // create new file name
  const updatedFileName = SHORTCUTS_FILE_NAME.replace(/\.xml$/, '-TRANSLATED.xml');
  const updatedFilePath = path.join(__dirname, updatedFileName);

  // write translated data to a new file
  fs.writeFile(updatedFilePath, resultXml, function (err) {
    if (err) {
      console.error('ERROR WHILE WRITING RESULT TO FILE')
      console.log(err);
    } else {
      console.log(`TRANSLATED SHORTCUTS WRITTEN TO ${updatedFileName}`);
    }
  });
}

function walkThroughAndUpdate(shortCutsArr) {
  // TODO handle case when there is only one element and it is object - not array
  return shortCutsArr.map(shortCutItem => {
    // search for shortcuts attribute on each XML tag
    const hotKey = shortCutItem.attributes['Shortcuts'];

    // if there is no hotkey - skip to next item
    if(!hotKey) {
      return shortCutItem;
    }

    // "Shortcuts" attribute can hold several hotkeys, so we need to split by # and translate each item individually
    const translatedHotKeysArr = hotKey.split('#').map(singleHotKey => {
      // for every item - return original hotkey + translated one with the # delimiter
      return `${singleHotKey}#${translateIndividualShortcut(singleHotKey)}`;
    });

    // also join all paris with # symbol in the end
    const result = translatedHotKeysArr.join('#');

    return {
      attributes: {
        ...shortCutItem.attributes,
        'Shortcuts': result
      }
    };
  });
}

function translateIndividualShortcut(hotKey) {
  // there can be combined  shortcuts, e.g. "Ctrl+A"
  const combinedShortcutArr = hotKey.split('+');
  // if length is greater than 1 then it is combined one
  if(combinedShortcutArr.length > 1) {
    // translate each word separately in the combined shortcut
    return combinedShortcutArr.map(item => {
      // if word is one of "Ctrl"/"Shift" do nothing
      if(FUNCTIONAL_KEYS.includes(item)) {
        return item;
      }

      // otherwise - translate each letter individually (by recursively invoking this function for the word)
      return translateIndividualShortcut(item);
    }).join('+');
  } else {
    // if not greater then one - then it is not combine one and we translate letter by letter
    const hotKeyEngArr = hotKey.toLowerCase().split('');
    // TODO add support for several languages
    const hotKeyRuArr = hotKeyEngArr.map(engItem => {
      const keyCode = enToKeycodes[engItem];
      return keyCodesToRu[keyCode] ? keyCodesToRu[keyCode] : engItem;
    });

    return hotKeyRuArr.join('');
  }
}

main();
