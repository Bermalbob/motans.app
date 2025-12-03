const getColors = require('get-image-colors');
const path = require('path');
const fs = require('fs');

(async () => {
  const iconPath = path.resolve(__dirname, '../apps/mobile/assets/icon-512.png');
  if (!fs.existsSync(iconPath)) {
    console.error('Icon not found at', iconPath);
    process.exit(1);
  }
  try {
    const colors = await getColors(iconPath);
    const hexes = colors.map((c) => c.hex());
    console.log(JSON.stringify(hexes));
  } catch (err) {
    console.error('Failed to extract colors:', err.message || err);
    process.exit(1);
  }
})();