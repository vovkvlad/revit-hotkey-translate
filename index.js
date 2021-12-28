const inquirer = require('inquirer');
const process = require('process');
const main = require('./main');

const exportedOrSystemChoices = {
  exported: 'Exported to current folder',
  system: 'System < NOT SUPPORTED YET >'
}

async function Cli() {
  try {
    const { exportedOrSystem } = await inquirer.prompt({
      type: 'list',
      name: 'exportedOrSystem',
      message: 'Do you want to translate locally exported file, or System one?',
      choices: Object.values(exportedOrSystemChoices),
    });

    if(exportedOrSystem === exportedOrSystemChoices.system) {
      console.log('===================');
      console.log('THIS OPTION IS IN DEVELOPMENT')
      console.log('===================');

      process.exit(0);

    } else if(exportedOrSystem === exportedOrSystemChoices.exported) {
      const { fileName } = await inquirer.prompt({
        type: 'input',
        name: 'fileName',
        message: 'Enter file name or hit Enter for default value (KeyboardShortcuts.xml)',
        default() {
          return 'KeyboardShortcuts.xml'
        }
      });
      main(fileName);

    }

  } catch (error) {
    if (error.isTtyError) {
      console.error('CLI could not be rendered on your environment');
      console.error(error.msg)
    } else {
      console.error('Something went wrong:');
      console.error('=====================');
      console.error(error)
    }
  }
}


Cli();