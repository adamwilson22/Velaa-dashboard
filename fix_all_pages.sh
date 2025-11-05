#!/bin/bash

# List of pages that need authentication fixes
PAGES=(
    "vehicle-view.html"
    "vehicle-edit.html" 
    "clients.html"
    "client-edit.html"
    "client-add.html"
    "vehicle-billing.html"
)

echo "🔧 Fixing authentication for all pages..."

for page in "${PAGES[@]}"; do
    if [ -f "$page" ]; then
        echo "Processing $page..."
        
        # Update script tags with cache busting and auth helper
        sed -i '' 's|js/config\.js|js/config.js?v=2.0.1|g' "$page"
        sed -i '' 's|js/api\.js|js/api.js?v=2.0.1|g' "$page"
        sed -i '' 's|js/scripts\.js|js/scripts.js?v=2.0.1|g' "$page"
        sed -i '' 's|js/navigation\.js|js/navigation.js?v=2.0.1|g' "$page"
        
        # Add auth-helper.js after api.js if not already present
        if ! grep -q "auth-helper.js" "$page"; then
            sed -i '' 's|<script src="js/api.js?v=2.0.1"></script>|<script src="js/api.js?v=2.0.1"></script>\n    <script src="js/auth-helper.js?v=2.0.1"></script>|g' "$page"
        fi
        
        # Replace new VelaaAPI() with auth helper pattern
        sed -i '' 's|const api = new VelaaAPI();|// Initialize authentication\n    if (!window.authHelper.init()) {\n        throw new Error("Authentication required");\n    }\n    const api = window.authHelper.getAPI();|g' "$page"
        sed -i '' 's|let api = new VelaaAPI();|// Initialize authentication\n    if (!window.authHelper.init()) {\n        throw new Error("Authentication required");\n    }\n    const api = window.authHelper.getAPI();|g' "$page"
        
        echo "✅ $page updated"
    else
        echo "⚠️  $page not found"
    fi
done

echo "🎉 All pages updated!"
