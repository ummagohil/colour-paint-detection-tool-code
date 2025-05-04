# 🎨 Wall Colour Spaces

## 💡 Colour Matcher

This file calculates and converts the colours. It finds the closest colour by mapping the distance and percentage.

```ts
function findClosestMatches(
  targetColor: ExtractedColor,
  vendorColors: any[],
  maxMatches = 3
) {
  return vendorColors
    .map((paint) => {
      const distance = getColourDistance(targetColor.hex, paint.hex);
      const matchPercentage = calculateMatchPercentage(distance);

      return {
        ...paint,
        matchPercentage,
      };
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, maxMatches);
}
```

This function is then used to find the match of colour between the shade and paint vendor.

```ts
export async function getPaintMatches(extractedColours: ExtractedColor[]) {
  // For each extracted colour, find matches from each vendor
  const results = extractedColours.map((extractedColor) => {
    // Find matches for this color from each vendor
    const vendorMatches = paintDatabase.vendors.map((vendor) => {
      const matches = findClosestMatches(extractedColor, vendor.colours);

      return {
        vendor: vendor.name,
        matches,
      };
    });

    return {
      color: extractedColor,
      vendorMatches,
    };
  });

  return results;
}
```

## 🗄️ Dummy Paint Database

This is a set of values for paints that has been mocked. In a real world scenario this would a bigger external database.

## 📸 Upload

```ts
const handleImageChange = useCallback(
  (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);

    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (JPG, PNG)");
      return;
    }

    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size should be less than 10MB");
      return;
    }

    setImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  },
  []
);

const handleUpload = async () => {
  if (!image || !preview) return;

  try {
    setIsUploading(true);
    onUploadStart();

    // Generate a unique ID for this upload
    const uniqueId = `demo-${Date.now()}`;

    // Actually extract colors from the image using ColorThief
    const extractedColours = await extractColours(preview);

    // Store the image data in our storage system
    storeImageData(uniqueId, preview, extractedColours);

    // Simulate a short processing delay for UX
    await new Promise((resolve) => setTimeout(resolve, 1000));

    onUploadComplete();
    router.push(`/results/${uniqueId}`);
  } catch (err) {
    console.error("Error processing image:", err);
    setError(
      "Failed to analyze image colors. Please try again with a different image."
    );
    setIsUploading(false);
    onUploadComplete();
  }
};
```

This uses the native file reader API and ensures the right file is uploaded. It then reads the file and gives it a unique ID. Once the file has been uploaded, the `extractedColours` variable stores the analysis from `extractColors()` helper function and it stores it. The results are then pushed to the results page with the unique ID through `router.push('/results/${uniqueID}')`

## 🚀 Result

```ts
useEffect(() => {
  const fetchData = async () => {
    try {
      // Get the image data and extracted colours from our storage
      const imageId = params.id;
      console.log("Fetching data for image ID:", imageId);

      const data = getImageData(imageId);

      if (!data) {
        console.error("No image data found for ID:", imageId);
        setError(true);
        setLoading(false);
        return;
      }

      setImageData(data);

      // Get paint matches for the extracted colours
      const matches = await getPaintMatches(data.extractedColours);
      setPaintMatches(matches);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching results:", err);
      setError(true);
      setLoading(false);
    }
  };

  fetchData();
}, [params.id]);
```

This is were the analysis of the images and colour extraction with the helper functions takes place and the user is able to see the matches from the data that has been provided.

## 🧪 Testing

`npm run test` (test for uploader needs to be fixed)

## 🧠 Other Considerations

- Replace the dummy database by either creating a database of colours or find if one exists
