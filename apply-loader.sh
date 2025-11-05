#!/bin/bash
# Script to add loader CSS link to multiple HTML files
files=("clients.html" "vehicle-billing.html" "vehicle-add.html" "vehicle-edit.html" "client-edit.html")

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Check if loader.css is already included
    if ! grep -q "loader.css" "$file"; then
      # Add loader.css after the last existing CSS link
      sed -i '' 's|</head>|    <link rel="stylesheet" href="css/loader.css">\n</head>|' "$file"
      echo "✓ Added loader.css to $file"
    else
      echo "○ $file already has loader.css"
    fi
  fi
done
