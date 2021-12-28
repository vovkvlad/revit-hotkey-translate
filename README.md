# Revit hot keys translator

This is a script to translate hotkeys in Revit software to different languages. (See Rationale below for more info)

Table of Contents
=================

* [TODO](#todo)
* [How To Use](#how-to-use)
* [Rationale](#rationale)

## TODO
Right now only translating exported file that resides in the same folder as executable is available. 
Ideally, script can try to patch the file where it resides and being used by Revit, so that user won't have
to export it and then import back translated one.


## How to use
1. Download executable for your system from `dist` folder
2. Export `KeyboardShortcuts.xml` from your Revit and put it in the same folder as executable
3. Run executable
4. Translated file will reside in the same folder under `KeyboardShortcuts-TRANSLATED.xml` name


## Rationale
Revit software has is declaring it's hotkeys in XML file of such structure:
```xml
<Shortcuts>
  <ShortcutItem CommandId="ID_BUTTON_SELECT" Shortcuts="MD" />
  ....
</Shortcuts>
```
And that piece of Software is created in such way that if user has another
language enabled on his keyboard layout hotkeys won't work! (ಠ_ಠ)

This can be fixed by adding the same hotkey in desired language like this:
```xml
<Shortcuts>
  <ShortcutItem Shortcuts="MD#ьв" />
  ....
</Shortcuts>
```
### **(ノಠ益ಠ)ノ彡┻━┻**
As people were doing those translations manually, it makes sense to automate it

This script does it. that's it
