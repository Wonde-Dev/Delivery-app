/* eslint-env node */
/* global __dirname */
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const faviconPath = path.join(rootDir, 'assets/images/favicon.png');

// 1. Ensure expo-router assets
const expoRouterAssetsDir = path.join(rootDir, 'node_modules/expo-router/assets');
if (fs.existsSync(path.join(rootDir, 'node_modules/expo-router'))) {
  if (!fs.existsSync(expoRouterAssetsDir)) {
    fs.mkdirSync(expoRouterAssetsDir, { recursive: true });
  }

  const routerPngs = [
    'file.png',
    'pkg.png',
    'forward.png',
    'sitemap.png',
    'arrow_down.png',
    'error.png',
    'logotype.png',
    'unmatched.png'
  ];

  if (fs.existsSync(faviconPath)) {
    for (const file of routerPngs) {
      const target = path.join(expoRouterAssetsDir, file);
      if (!fs.existsSync(target)) {
        fs.copyFileSync(faviconPath, target);
      }
    }
  }

  // XML assets
  const arrowRightXml = `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
  <path
      android:fillColor="#FF000000"
      android:pathData="M10,17l5,-5 -5,-5v10z"/>
</vector>
`;
  const checkmarkXml = `<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
  <path
      android:fillColor="#FF000000"
      android:pathData="M9,16.17L4.83,12l-1.42,1.41L9,19 21,7l-1.41,-1.41z"/>
</vector>
`;

  const arrowRightTarget = path.join(expoRouterAssetsDir, 'arrow_right.xml');
  if (!fs.existsSync(arrowRightTarget)) {
    fs.writeFileSync(arrowRightTarget, arrowRightXml, 'utf8');
  }

  const checkmarkTarget = path.join(expoRouterAssetsDir, 'checkmark.xml');
  if (!fs.existsSync(checkmarkTarget)) {
    fs.writeFileSync(checkmarkTarget, checkmarkXml, 'utf8');
  }

  // React Navigation Elements in expo-router
  const reactNavElementsTargetDir = path.join(expoRouterAssetsDir, 'react-navigation/elements');
  const reactNavDrawerTargetDir = path.join(expoRouterAssetsDir, 'react-navigation/drawer');
  fs.mkdirSync(reactNavElementsTargetDir, { recursive: true });
  fs.mkdirSync(reactNavDrawerTargetDir, { recursive: true });

  const reactNavSourceDir = path.join(rootDir, 'node_modules/@react-navigation/elements/lib/module/assets');
  if (fs.existsSync(reactNavSourceDir)) {
    const files = fs.readdirSync(reactNavSourceDir);
    for (const file of files) {
      const srcFile = path.join(reactNavSourceDir, file);
      const destFile = path.join(reactNavElementsTargetDir, file);
      if (!fs.existsSync(destFile)) {
        fs.copyFileSync(srcFile, destFile);
      }
    }
  }

  const drawerToggleTarget = path.join(reactNavDrawerTargetDir, 'toggle-drawer-icon.png');
  if (!fs.existsSync(drawerToggleTarget) && fs.existsSync(faviconPath)) {
    fs.copyFileSync(faviconPath, drawerToggleTarget);
  }
}

// 2. Ensure @expo-google-fonts/material-symbols ttf files
const materialSymbolsDir = path.join(rootDir, 'node_modules/@expo-google-fonts/material-symbols');
const sourceTtf = path.join(materialSymbolsDir, '100Thin_Filled/MaterialSymbols_100Thin_Filled.ttf');

if (fs.existsSync(sourceTtf)) {
  const weights = [
    ['400Regular', 'MaterialSymbols_400Regular.ttf'],
    ['100Thin', 'MaterialSymbols_100Thin.ttf'],
    ['200ExtraLight', 'MaterialSymbols_200ExtraLight.ttf'],
    ['300Light', 'MaterialSymbols_300Light.ttf'],
    ['500Medium', 'MaterialSymbols_500Medium.ttf'],
    ['600SemiBold', 'MaterialSymbols_600SemiBold.ttf'],
    ['700Bold', 'MaterialSymbols_700Bold.ttf'],
    ['200ExtraLight_Filled', 'MaterialSymbols_200ExtraLight_Filled.ttf'],
    ['300Light_Filled', 'MaterialSymbols_300Light_Filled.ttf'],
    ['400Regular_Filled', 'MaterialSymbols_400Regular_Filled.ttf'],
    ['500Medium_Filled', 'MaterialSymbols_500Medium_Filled.ttf'],
    ['600SemiBold_Filled', 'MaterialSymbols_600SemiBold_Filled.ttf'],
    ['700Bold_Filled', 'MaterialSymbols_700Bold_Filled.ttf']
  ];

  for (const [folder, filename] of weights) {
    const targetFolder = path.join(materialSymbolsDir, folder);
    if (fs.existsSync(targetFolder)) {
      const targetFile = path.join(targetFolder, filename);
      if (!fs.existsSync(targetFile)) {
        fs.copyFileSync(sourceTtf, targetFile);
      }
    }
  }
}
