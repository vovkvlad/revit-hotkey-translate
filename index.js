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


function main() {
  const filePath = path.join(__dirname, 'test_files', SHORTCUTS_FILE_NAME);
  const xmlData = fs.readFileSync(filePath);

  const parser = new XMLParser(parserOptions);
  const result = parser.parse(xmlData);

  const shortCutsArray = result.Shortcuts.ShortcutItem;

  const newData = {
    Shortcuts: { ShortcutItem: walkThroughAndUpdate(shortCutsArray) },
  }

  const xmlBuilder = new XMLBuilder(builderOptions)
  const resultXml = xmlBuilder.build(newData);

  const updatedFileName = SHORTCUTS_FILE_NAME.replace(/\.xml$/, '-TRANSLATED.xml');
  const updatedFilePath = path.join(__dirname, updatedFileName);
  fs.writeFile(updatedFileName, resultXml, function (err) {
    if (err) {
      console.error('ERROR WHILE WRITING RESULT TO FILE')
      console.log(err);
    } else {
      console.log(`TRANSLATED SHORTCUTS WRITTEN TO ${updatedFileName}`);
    }
  });
}

function walkThroughAndUpdate(shortCutsArr) {
  return shortCutsArr.map(shortCutItem => {
    const hotKey = shortCutItem.attributes['Shortcuts'];

    if(!hotKey) {
      return shortCutItem;
    }

    const hotKeyEngArr = hotKey.toLowerCase().split('');
    const hotKeyRuArr = hotKeyEngArr.map(engItem => {
      const keyCode = enToKeycodes[engItem];
      return keyCodesToRu[keyCode];
    });

    const rusHotKey = hotKeyRuArr.join('');

    return {
      attributes: {
        ...shortCutItem.attributes,
        'Shortcuts': `${hotKey}#${rusHotKey}`
      }
    };
  });
}

main();
