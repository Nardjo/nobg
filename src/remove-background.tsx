import {
  List,
  Action,
  ActionPanel,
  showToast,
  Toast,
  getPreferenceValues,
  showHUD,
  open,
  getSelectedFinderItems,
  Icon,
  Color,
  environment,
} from "@raycast/api";
import { homedir } from "os";
import { join, basename } from "path";
import { existsSync, mkdirSync, readdirSync, statSync, readFileSync } from "fs";
import { execSync } from "child_process";
import { useState, useEffect } from "react";

// Load .env file
function loadEnv(): Record<string, string> {
  const envPath = join(environment.assetsPath, "..", ".env");
  const env: Record<string, string> = {};
  try {
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
        const [key, ...rest] = trimmed.split("=");
        env[key] = rest.join("=").replace(/^~/, homedir());
      }
    }
  } catch {
    // .env not found
  }
  return env;
}

const ENV = loadEnv();

// Configurable paths
const REMBG_PATH = process.env.REMBG_PATH || ENV.REMBG_PATH || join(homedir(), ".local/bin/rembg");
const IMAGES_DIR = process.env.IMAGES_DIR || ENV.IMAGES_DIR || join(homedir(), "Downloads");
const OUTPUT_BASE_DIR = process.env.OUTPUT_DIR || ENV.OUTPUT_DIR || join(homedir(), "Downloads");

interface Preferences {
  outputFolder: string;
}

interface ImageFile {
  path: string;
  name: string;
  size: number;
  modifiedAt: Date;
}

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];

function isImageFile(filename: string): boolean {
  const ext = filename.toLowerCase();
  return IMAGE_EXTENSIONS.some((e) => ext.endsWith(e));
}

function getImagesFromDownloads(): ImageFile[] {
  try {
    const files = readdirSync(IMAGES_DIR);
    return files
      .filter((f) => isImageFile(f))
      .map((f) => {
        const fullPath = join(IMAGES_DIR, f);
        const stats = statSync(fullPath);
        return {
          path: fullPath,
          name: f,
          size: stats.size,
          modifiedAt: stats.mtime,
        };
      })
      .sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime()) // Most recent first
      .slice(0, 50); // Limit to 50 images
  } catch {
    return [];
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

async function removeBackground(imagePath: string): Promise<string> {
  const preferences = getPreferenceValues<Preferences>();
  const outputFolder = preferences.outputFolder || "bg-removed";

  const outputDir = join(OUTPUT_BASE_DIR, outputFolder);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const originalName = basename(imagePath, imagePath.substring(imagePath.lastIndexOf(".")));
  const filename = `${originalName}-no-bg-${timestamp}.png`;
  const outputPath = join(outputDir, filename);

  execSync(`"${REMBG_PATH}" i "${imagePath}" "${outputPath}"`, {
    timeout: 120000,
    env: {
      ...process.env,
      PATH: `${process.env.PATH}:${join(homedir(), ".local/bin")}:/usr/local/bin:/opt/homebrew/bin`,
    },
  });

  return outputPath;
}

export default function Command() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [directImage, setDirectImage] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      // First, check Finder selection
      try {
        const finderItems = await getSelectedFinderItems();
        if (finderItems.length > 0) {
          const imageItems = finderItems.filter((item) => isImageFile(item.path));
          if (imageItems.length > 0) {
            // Process directly
            setDirectImage(imageItems[0].path);
            await processImage(imageItems[0].path);
            return;
          }
        }
      } catch {
        // Finder not available
      }

      // Load images from Downloads
      const downloadImages = getImagesFromDownloads();
      setImages(downloadImages);
      setIsLoading(false);
    }

    init();
  }, []);

  async function processImage(imagePath: string) {
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: "Removing background...",
      message: basename(imagePath),
    });

    try {
      const outputPath = await removeBackground(imagePath);
      const outputFolder = getPreferenceValues<Preferences>().outputFolder || "bg-removed";

      toast.style = Toast.Style.Success;
      toast.title = "Background removed!";
      toast.message = basename(outputPath);

      const outputDir = join(OUTPUT_BASE_DIR, outputFolder);
      const displayPath = outputDir.replace(homedir(), "~");
      await showHUD(`✅ Saved to ${displayPath}/`);
      await open(outputDir);
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Error";
      toast.message = error instanceof Error ? error.message : "Unknown error";
    }
  }

  return (
    <List isLoading={isLoading || directImage !== null} searchBarPlaceholder="Search images in Downloads...">
      <List.EmptyView
        title="No images found"
        description="No images in Downloads folder"
        icon={Icon.Image}
      />
      {images.map((image) => (
        <List.Item
          key={image.path}
          title={image.name}
          subtitle={formatFileSize(image.size)}
          accessories={[{ text: formatDate(image.modifiedAt) }]}
          icon={{ fileIcon: image.path }}
          actions={
            <ActionPanel>
              <Action
                title="Remove Background"
                icon={{ source: Icon.Eraser, tintColor: Color.Red }}
                onAction={() => processImage(image.path)}
              />
              <Action.ShowInFinder path={image.path} />
              <Action.OpenWith path={image.path} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
