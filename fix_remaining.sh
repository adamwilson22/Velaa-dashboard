#!/bin/bash

echo "🔧 Fixing remaining pages..."

# Fix vehicle-add-old.html
if [ -f "vehicle-add-old.html" ]; then
    echo "Fixing vehicle-add-old.html..."
    sed -i '' 's|const api = new VelaaAPI();|// Initialize authentication\n    if (!window.authHelper.init()) {\n        throw new Error("Authentication required");\n    }\n    const api = window.authHelper.getAPI();|g' vehicle-add-old.html
    sed -i '' 's|js/config\.js|js/config.js?v=2.0.1|g' vehicle-add-old.html
    sed -i '' 's|js/api\.js|js/api.js?v=2.0.1|g' vehicle-add-old.html
    if ! grep -q "auth-helper.js" vehicle-add-old.html; then
        sed -i '' 's|<script src="js/api.js?v=2.0.1"></script>|<script src="js/api.js?v=2.0.1"></script>\n    <script src="js/auth-helper.js?v=2.0.1"></script>|g' vehicle-add-old.html
    fi
    echo "✅ vehicle-add-old.html fixed"
fi

# Fix vehicle-add-simplified.html
if [ -f "vehicle-add-simplified.html" ]; then
    echo "Fixing vehicle-add-simplified.html..."
    sed -i '' 's|const api = new VelaaAPI();|// Initialize authentication\n    if (!window.authHelper.init()) {\n        throw new Error("Authentication required");\n    }\n    const api = window.authHelper.getAPI();|g' vehicle-add-simplified.html
    sed -i '' 's|js/config\.js|js/config.js?v=2.0.1|g' vehicle-add-simplified.html
    sed -i '' 's|js/api\.js|js/api.js?v=2.0.1|g' vehicle-add-simplified.html
    if ! grep -q "auth-helper.js" vehicle-add-simplified.html; then
        sed -i '' 's|<script src="js/api.js?v=2.0.1"></script>|<script src="js/api.js?v=2.0.1"></script>\n    <script src="js/auth-helper.js?v=2.0.1"></script>|g' vehicle-add-simplified.html
    fi
    echo "✅ vehicle-add-simplified.html fixed"
fi

# Fix vehicle-billing.html
if [ -f "vehicle-billing.html" ]; then
    echo "Fixing vehicle-billing.html..."
    sed -i '' 's|const api = (window.velaaAPI) || new VelaaAPI();|// Initialize authentication\n    if (!window.authHelper.init()) {\n        throw new Error("Authentication required");\n    }\n    const api = window.authHelper.getAPI();|g' vehicle-billing.html
    echo "✅ vehicle-billing.html fixed"
fi

# Fix vehicle-edit.html
if [ -f "vehicle-edit.html" ]; then
    echo "Fixing vehicle-edit.html..."
    sed -i '' 's|window.velaaAPI = new VelaaAPI();|// Global API instance is already created in api.js|g' vehicle-edit.html
    echo "✅ vehicle-edit.html fixed"
fi

echo "🎉 All remaining pages fixed!"
