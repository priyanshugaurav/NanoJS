#!/usr/bin/env bash
set -e

# NanoJS One-Line Installer
echo "=== Installing NanoJS v1.0.0 ==="

OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
  Darwin*)
    DOWNLOAD_FILE="nanojs-v1.0.0-macos-universal.tar.gz"
    ;;
  Linux*)
    DOWNLOAD_FILE="nanojs-v1.0.0-linux-x64.tar.gz"
    ;;
  *)
    echo "Unsupported OS: $OS"
    exit 1
    ;;
esac

INSTALL_DIR="/usr/local/bin"
if [ ! -w "$INSTALL_DIR" ]; then
  INSTALL_DIR="$HOME/.local/bin"
  mkdir -p "$INSTALL_DIR"
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

echo "Downloading $DOWNLOAD_FILE..."
if command -v curl >/dev/null 2>&1; then
  curl -sSL -o "$TMP_DIR/$DOWNLOAD_FILE" "https://nanojs.priyanshugaurav.space/downloads/$DOWNLOAD_FILE" || curl -sSL -o "$TMP_DIR/$DOWNLOAD_FILE" "https://raw.githubusercontent.com/priyanshugaurav/NanoJS/main/web/public/downloads/$DOWNLOAD_FILE"
elif command -v wget >/dev/null 2>&1; then
  wget -q -O "$TMP_DIR/$DOWNLOAD_FILE" "https://nanojs.priyanshugaurav.space/downloads/$DOWNLOAD_FILE"
fi

tar -xzf "$TMP_DIR/$DOWNLOAD_FILE" -C "$TMP_DIR"
chmod +x "$TMP_DIR/nanojs"
mv "$TMP_DIR/nanojs" "$INSTALL_DIR/nanojs"

echo "✓ NanoJS successfully installed to $INSTALL_DIR/nanojs"
echo "Run 'nanojs file.mjs' to execute your JavaScript files!"
