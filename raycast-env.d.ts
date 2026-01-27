/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Output Folder - Folder name inside Downloads where images will be saved */
  "outputFolder": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `remove-background` command */
  export type RemoveBackground = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `remove-background` command */
  export type RemoveBackground = {}
}

