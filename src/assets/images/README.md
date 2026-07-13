# Local Image Assets

This directory contains all local image files for the Khadamat Digital Wallet application.

## Image Files & Sources

Below are the images that need to be downloaded and placed in this folder:

### 1. **khadamat-logo.png**
- **Original URL**: `https://api.builder.io/api/v1/image/assets/TEMP/fb63caaa2d594d26af94d2076552feced6092990?width=740`
- **Used in**: Sidebar component
- **Recommended Size**: 370x auto (max 740px width)
- **Location**: `src/assets/images/khadamat-logo.png`

### 2. **webotix-logo.png**
- **Original URL**: `https://api.builder.io/api/v1/image/assets/TEMP/e9d17a8524f2b0a3a79ef3ac37b35802eb42ba11?width=94`
- **Used in**: Sidebar footer (credits)
- **Recommended Size**: 47x auto (max 94px width)
- **Location**: `src/assets/images/webotix-logo.png`

### 3. **success-icon.png**
- **Original URL**: `https://api.builder.io/api/v1/image/assets/TEMP/63e2443bd4236787c856c5442856201e02be7f60?width=252`
- **Used in**: Success Screen page
- **Recommended Size**: 126x126px
- **Location**: `src/assets/images/success-icon.png`

### 4. **success-decoration.png**
- **Original URL**: `https://api.builder.io/api/v1/image/assets/TEMP/bb943dbdd0bc2325b9af916ab591ec50499f90cf?width=280`
- **Used in**: Success Screen footer
- **Recommended Size**: 140x130px
- **Location**: `src/assets/images/success-decoration.png`

### 5. **wallet-decoration.png**
- **Original URL**: `https://api.builder.io/api/v1/image/assets/TEMP/8feb48350b5607eac66df81098cdf5027ff55359?width=256`
- **Used in**: Sidebar wallet icon
- **Recommended Size**: 128x128px
- **Location**: `src/assets/images/wallet-decoration.png`

### 6. **sidebar-pattern.png** (Background Pattern)
- **Original URL**: `https://api.builder.io/api/v1/image/assets/TEMP/7aa7fd921157ccd998b94e60edf51a67f96629a0?width=936`
- **Used in**: Sidebar background (CSS)
- **Recommended Size**: 936x600px or larger
- **Location**: `src/assets/images/sidebar-pattern.png`

## How to Download Images

### Option 1: Using Browser
1. Open each URL in your browser
2. Right-click the image
3. Select "Save image as..."
4. Save to the appropriate location in this folder

### Option 2: Using Command Line (curl)
```bash
cd src/assets/images

# Download all images
curl -o khadamat-logo.png "https://api.builder.io/api/v1/image/assets/TEMP/fb63caaa2d594d26af94d2076552feced6092990?width=740"

curl -o webotix-logo.png "https://api.builder.io/api/v1/image/assets/TEMP/e9d17a8524f2b0a3a79ef3ac37b35802eb42ba11?width=94"

curl -o success-icon.png "https://api.builder.io/api/v1/image/assets/TEMP/63e2443bd4236787c856c5442856201e02be7f60?width=252"

curl -o success-decoration.png "https://api.builder.io/api/v1/image/assets/TEMP/bb943dbdd0bc2325b9af916ab591ec50499f90cf?width=280"

curl -o wallet-decoration.png "https://api.builder.io/api/v1/image/assets/TEMP/8feb48350b5607eac66df81098cdf5027ff55359?width=256"

curl -o sidebar-pattern.png "https://api.builder.io/api/v1/image/assets/TEMP/7aa7fd921157ccd998b94e60edf51a67f96629a0?width=936"
```

## Using Images in Components

### With imageConfig.js:
```jsx
import images from '../../assets/images/imageConfig';

<img src={images.khadamatLogo} alt="Khadamat Logo" />
```

### With Direct Import (Recommended for Vite):
```jsx
import khadamatLogo from './khadamat-logo.png';

<img src={khadamatLogo} alt="Khadamat Logo" />
```

## File Structure

```
src/assets/
└── images/
    ├── README.md (this file)
    ├── imageConfig.js
    ├── khadamat-logo.png
    ├── webotix-logo.png
    ├── success-icon.png
    ├── success-decoration.png
    ├── wallet-decoration.png
    └── sidebar-pattern.png
```

## Notes

- All images should be optimized for web (compressed PNG/WEBP)
- Maintain the recommended sizes for best performance
- If you need to replace an image, download the new version and overwrite the file
- Images are now tracked in version control for better deployment
