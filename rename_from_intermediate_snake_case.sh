#!/bin/bash

echo "Starting rename process (Phase 2: from intermediate _snake_case to final snake_case)..."

# Find files starting with '_' and ending with .ts or .tsx
# Use -depth to process files before directories, though less critical here
find . -depth -type f \( -name '_*.ts' -o -name '_*.tsx' \) -print0 | while IFS= read -r -d $'\0' file; do
  # Get directory and filename
  dir=$(dirname "$file")
  filename=$(basename "$file")

  # Check if filename actually starts with '_'
  if [[ "$filename" == _* ]]; then
    # Remove leading underscore
    new_filename="${filename#_}"
    # Construct new path
    new_path="$dir/$new_filename"

    # Check if the target name already exists (shouldn't happen often with git mv)
    if [[ -e "$new_path" ]]; then
      echo "WARN: Target file already exists, skipping rename: $new_path"
      continue
    fi

    echo "Planning rename: $file -> $new_path"
    # Rename using git mv
    git mv "$file" "$new_path"
    if [[ $? -eq 0 ]]; then
        echo "SUCCESS: Renamed $file to $new_path"
    else
        echo "ERROR: Failed to rename $file to $new_path using git mv"
        # Optionally add fallback using standard mv, but git mv is preferred
        # mv "$file" "$new_path"
        # if [[ $? -eq 0 ]]; then
        #    echo "WARN: Renamed (non-git) $file to $new_path"
        # else
        #    echo "ERROR: Filesystem rename also failed for $file"
        # fi
    fi
  else
    echo "Skipping (doesn't start with _): $file" # Should not happen with the find command used
  fi
done

echo "Rename process (Phase 2) finished."
echo "Please review the changes with 'git status' and commit if correct." 