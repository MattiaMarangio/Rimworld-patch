# Reinstall guide (Mac)

Everything needed to get my RimWorld back exactly as it was: the same mods, in the same order, with the same settings.

| File | What it restores |
|---|---|
| [mod-list.md](mod-list.md) | Every mod in load order, with a link to subscribe to each one |
| [Config/ModsConfig.xml](Config/ModsConfig.xml) | Which mods are switched on, and their order |
| [Config/Prefs.xml](Config/Prefs.xml) | Game options (sound, graphics, interface, autosave) |
| [Config/KeyPrefs.xml](Config/KeyPrefs.xml) | Keyboard shortcuts |
| Config/Mod_….xml and ModSettingsFrameworkMod_Settings.xml | Each mod's own settings |

Saved games are **not** in here. Back them up yourself (step 1).

To open a hidden folder in the steps below: in Finder, press **Shift + Command + G**, paste the path and press Return.

## Before uninstalling

1. **Copy your saves.** Open `~/Library/Application Support/RimWorld/Saves` and copy that whole folder to your Desktop.

## After reinstalling

2. **Install RimWorld from Steam.** The DLCs you own (Royalty, Ideology, Biotech, Anomaly, Odyssey) install with it.
3. **Start the game once**, wait for the main menu, then quit. This creates RimWorld's settings folder.
4. **Subscribe to every mod** in [mod-list.md](mod-list.md): open each Steam Workshop link and press **Subscribe**. Wait until Steam's **Downloads** page has finished.
5. **Install Unified Research Tree** (this repository; it is not on the Workshop):
   - On this repository's GitHub page, press **Code → Download ZIP**, then double-click the ZIP to unzip it.
   - Rename the unzipped folder from `Rimworld-patch-main` to `UnifiedResearchTree`.
   - Open `~/Library/Application Support/Steam/steamapps/common/RimWorld/RimWorldMac.app/Mods` and move the `UnifiedResearchTree` folder into it.
6. **Restore the mod order and all settings.** Make sure RimWorld is closed.
   - Open `~/Library/Application Support/RimWorld/Config`.
   - From the unzipped download, open `my-setup/Config`, select every file, and drag them into the Config folder. Choose **Replace** when asked.
7. **Start RimWorld.** Open **Mods** and check that nothing is shown in red as missing. If a mod is missing, subscribe to it, wait for the download and restart the game.
8. **Put your saves back.** Copy the files from your Desktop copy into `~/Library/Application Support/RimWorld/Saves`.

## Good to know
- Do step 4 before step 6. If RimWorld starts with mods missing or crashes on start, it may reset the mod list. Then just repeat step 6.
- Workshop mods update on their own, so a mod may be newer than when this list was saved. Settings usually carry over; a mod that changed a lot may ignore an old setting and use its default.
- Unified Research Tree loads near the bottom of the list (the order file takes care of this).
