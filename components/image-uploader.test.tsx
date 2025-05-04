import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImageUploader } from "./image-uploader";
import { storeImageData } from "@/lib/image-storage";
import { extractColours } from "@/lib/color-extractor";

// Mock the next/navigation module
const mockRouterPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

vi.mock("@/lib/image-storage", () => ({
  storeImageData: vi.fn(),
}));

vi.mock("@/lib/color-extractor", () => ({
  extractColours: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} src={props.src || ""} alt={props.alt || ""} />;
  },
}));

describe("ImageUploader", () => {
  const mockOnUploadStart = vi.fn();
  const mockOnUploadComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock implementation for extractColours
    vi.mocked(extractColours).mockResolvedValue([
      { hex: "#FFFFFF", percentage: 50 },
      { hex: "#000000", percentage: 50 },
    ]);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("renders the upload interface initially", () => {
    render(
      <ImageUploader
        onUploadStart={mockOnUploadStart}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    expect(
      screen.getByText("Drop your image here or click to browse")
    ).toBeInTheDocument();
    expect(screen.getByText("JPG, PNG (max 10MB)")).toBeInTheDocument();
  });

  it("shows error when uploading a non-image file", async () => {
    render(
      <ImageUploader
        onUploadStart={mockOnUploadStart}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    const file = new File(["test"], "test.txt", { type: "text/plain" });
    const input = screen.getByTestId("image-upload");

    await userEvent.upload(input, file);

    expect(
      screen.getByText("Please upload an image file (JPG, PNG)")
    ).toBeInTheDocument();
  });

  it("shows error when uploading a file larger than 10MB", async () => {
    render(
      <ImageUploader
        onUploadStart={mockOnUploadStart}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    // Create a mock file with size just over 10MB
    const largeFile = new File(["x".repeat(1000)], "large.jpg", {
      type: "image/jpeg",
    });
    Object.defineProperty(largeFile, "size", { value: 10 * 1024 * 1024 + 1 });

    const input = screen.getByTestId("image-upload");

    await userEvent.upload(input, largeFile);

    expect(
      screen.getByText("Image size should be less than 10MB")
    ).toBeInTheDocument();
  });

  it("shows preview when uploading a valid image", async () => {
    // Mock FileReader
    const fileReaderMock = {
      readAsDataURL: vi.fn(),
      result: "data:image/jpeg;base64,testbase64",
      onload: null,
    };

    global.FileReader = vi.fn(() => fileReaderMock);

    render(
      <ImageUploader
        onUploadStart={mockOnUploadStart}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const input = screen.getByTestId("image-upload");

    await userEvent.upload(input, file);

    // Manually trigger the FileReader onload event
    fileReaderMock.onload({ target: fileReaderMock });

    // Check that the preview is shown (indicated by the "Analyse Colours" button appearing)
    await waitFor(() => {
      expect(screen.getByText("Analyse Colours")).toBeInTheDocument();
    });
  });

  it("calls the right functions and redirects when uploading", async () => {
    // Mock FileReader
    const fileReaderMock = {
      readAsDataURL: vi.fn(),
      result: "data:image/jpeg;base64,testbase64",
      onload: null,
    };

    global.FileReader = vi.fn(() => fileReaderMock);

    // Mock Date.now for predictable IDs
    const mockDate = new Date(2023, 5, 15).getTime();
    vi.spyOn(Date, "now").mockImplementation(() => mockDate);

    // Render component
    render(
      <ImageUploader
        onUploadStart={mockOnUploadStart}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    // Upload a file
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const input = screen.getByTestId("image-upload");
    await userEvent.upload(input, file);

    // Trigger FileReader onload
    fileReaderMock.onload({ target: fileReaderMock });

    // Click the upload button
    await waitFor(() => {
      expect(screen.getByText("Analyse Colours")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Analyse Colours"));

    // Verify loading state
    expect(screen.getByText("Analysing Colours...")).toBeInTheDocument();
    expect(mockOnUploadStart).toHaveBeenCalledTimes(1);

    // Wait for the upload process to complete
    await waitFor(() => {
      expect(extractColours).toHaveBeenCalledWith(
        "data:image/jpeg;base64,testbase64"
      );
      expect(storeImageData).toHaveBeenCalledWith(
        "demo-" + mockDate,
        "data:image/jpeg;base64,testbase64",
        [
          { hex: "#FFFFFF", percentage: 50 },
          { hex: "#000000", percentage: 50 },
        ]
      );
      expect(mockOnUploadComplete).toHaveBeenCalledTimes(1);
      expect(mockRouterPush).toHaveBeenCalledWith(`/results/demo-${mockDate}`);
    });
  });

  it("handles errors during upload process", async () => {
    // Mock FileReader
    const fileReaderMock = {
      readAsDataURL: vi.fn(),
      result: "data:image/jpeg;base64,testbase64",
      onload: null,
    };

    global.FileReader = vi.fn(() => fileReaderMock);

    // Mock extractColours to throw an error
    vi.mocked(extractColours).mockRejectedValue(new Error("Test error"));

    // Render component
    render(
      <ImageUploader
        onUploadStart={mockOnUploadStart}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    // Upload a file
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const input = screen.getByTestId("image-upload");
    await userEvent.upload(input, file);

    // Trigger FileReader onload
    fileReaderMock.onload({ target: fileReaderMock });

    // Click the upload button
    await waitFor(() => {
      expect(screen.getByText("Analyse Colours")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Analyse Colours"));

    // Verify error state
    await waitFor(() => {
      expect(
        screen.getByText(
          "Failed to analyze image colors. Please try again with a different image."
        )
      ).toBeInTheDocument();
      expect(mockOnUploadComplete).toHaveBeenCalledTimes(1);
    });
  });

  it("allows resetting the selected image", async () => {
    // Mock FileReader
    const fileReaderMock = {
      readAsDataURL: vi.fn(),
      result: "data:image/jpeg;base64,testbase64",
      onload: null,
    };

    global.FileReader = vi.fn(() => fileReaderMock);

    render(
      <ImageUploader
        onUploadStart={mockOnUploadStart}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    // Upload a file
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
    const input = screen.getByTestId("image-upload");
    await userEvent.upload(input, file);

    // Trigger FileReader onload
    fileReaderMock.onload({ target: fileReaderMock });

    // Wait for preview to appear
    await waitFor(() => {
      expect(screen.getByText("Analyse Colours")).toBeInTheDocument();
    });

    // Click the reset button (X icon)
    const resetButton = screen.getByRole("button");
    fireEvent.click(resetButton);

    // Verify we're back to the initial state
    expect(
      screen.getByText("Drop your image here or click to browse")
    ).toBeInTheDocument();
  });
});
