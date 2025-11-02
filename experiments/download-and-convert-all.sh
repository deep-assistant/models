#!/bin/bash

# List of all Anthropic model files from models.dev
models=(
  "claude-3-5-haiku-20241022"
  "claude-3-5-haiku-latest"
  "claude-3-5-sonnet-20240620"
  "claude-3-5-sonnet-20241022"
  "claude-3-7-sonnet-20250219"
  "claude-3-7-sonnet-latest"
  "claude-3-haiku-20240307"
  "claude-3-opus-20240229"
  "claude-3-sonnet-20240229"
  "claude-haiku-4-5-20251001"
  "claude-haiku-4-5"
  "claude-opus-4-0"
  "claude-opus-4-1-20250805"
  "claude-opus-4-1"
  "claude-opus-4-20250514"
  "claude-sonnet-4-0"
  "claude-sonnet-4-20250514"
  "claude-sonnet-4-5-20250929"
  "claude-sonnet-4-5"
)

BASE_URL="https://raw.githubusercontent.com/sst/models.dev/dev/providers/anthropic/models"
OUTPUT_DIR="../providers/anthropic/models"

mkdir -p "$OUTPUT_DIR"

for model in "${models[@]}"; do
  echo "Processing $model..."

  # Download TOML file
  TOML_FILE="/tmp/${model}.toml"
  LINO_FILE="${OUTPUT_DIR}/${model}.lino"

  curl -s "${BASE_URL}/${model}.toml" -o "$TOML_FILE"

  if [ $? -eq 0 ] && [ -f "$TOML_FILE" ]; then
    # Convert to .lino
    node toml-to-lino.js "$TOML_FILE" "$LINO_FILE"
    rm "$TOML_FILE"
  else
    echo "Failed to download $model.toml"
  fi
done

echo "All models converted!"
