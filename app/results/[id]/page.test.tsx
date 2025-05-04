import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ResultsPage from "./page"; // Import from the Next.js page file in the same directory
import { getPaintMatches } from "@/lib/color-matcher";
import { getImageData } from "@/lib/image-storage";

// Mock the Next.js components and modules
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    className,
  }: {
    src: string;
    alt: string;
    className?: string;
  }) => <img src={src} alt={alt} className={className} />,
}));

// Mock the lucide-react icons
vi.mock("lucide-react", () => ({
  ArrowLeft: () => <div data-testid="arrow-left-icon" />,
}));

// Mock the custom components
vi.mock("@/components/ui/button", () => ({
  Button: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div className={`mock-card ${className || ""}`}>{children}</div>,
  CardContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div className={`mock-card-content ${className || ""}`}>{children}</div>
  ),
}));

vi.mock("@/components/color-results", () => ({
  ColorResults: ({ colorMatch, index }: { colorMatch: any; index: number }) => (
    <div data-testid={`color-results-${index}`}>
      {JSON.stringify(colorMatch)}
    </div>
  ),
}));

vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: ({ className }: { className: string }) => (
    <div className={`mock-skeleton ${className}`} />
  ),
}));

// Mock the color matcher and image storage functions
vi.mock("@/lib/color-matcher", () => ({
  getPaintMatches: vi.fn(),
}));

vi.mock("@/lib/image-storage", () => ({
  getImageData: vi.fn(),
}));

describe("ResultsPage Component", () => {
  const mockParams = { id: "test-image-id" };

  const mockImageData = {
    id: "test-image-id",
    imageUrl: "/test-image.jpg",
    extractedColours: [
      { hex: "#FF0000", percentage: 50 },
      { hex: "#00FF00", percentage: 30 },
      { hex: "#0000FF", percentage: 20 },
    ],
  };

  const mockPaintMatches = [
    {
      originalColor: { hex: "#FF0000" },
      matches: [{ name: "Red Paint", hex: "#FF0000", brand: "TestBrand" }],
    },
    {
      originalColor: { hex: "#00FF00" },
      matches: [{ name: "Green Paint", hex: "#00FF00", brand: "TestBrand" }],
    },
  ];

  beforeEach(() => {
    // Reset and setup mocks
    vi.resetAllMocks();
    vi.mocked(getImageData).mockReturnValue(mockImageData);
    vi.mocked(getPaintMatches).mockResolvedValue(mockPaintMatches as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render loading state initially", () => {
    render(<ResultsPage params={mockParams} />);

    expect(screen.getByText("Analysing Your Image")).toBeInTheDocument();
    expect(screen.getByText("Uploaded Image")).toBeInTheDocument();
    expect(screen.getByText("Matching Paint Colours")).toBeInTheDocument();
  });

  it("should render the results after loading", async () => {
    render(<ResultsPage params={mockParams} />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText("Your Paint Colour Results")).toBeInTheDocument();
    });

    // Verify image data is displayed
    expect(screen.getByText("Detected Colours:")).toBeInTheDocument();
    expect(screen.getByAltText("Uploaded wall image")).toBeInTheDocument();

    // Verify color results components are rendered
    expect(screen.getByTestId("color-results-0")).toBeInTheDocument();
    expect(screen.getByTestId("color-results-1")).toBeInTheDocument();

    // Verify the upload another image button is present
    expect(screen.getByText("Upload Another Image")).toBeInTheDocument();

    // Verify the API functions were called correctly
    expect(getImageData).toHaveBeenCalledWith("test-image-id");
    expect(getPaintMatches).toHaveBeenCalledWith(
      mockImageData.extractedColours
    );
  });

  it("should render error state when image data is not found", async () => {
    // Mock the getImageData to return null (image not found)
    vi.mocked(getImageData).mockReturnValue(null as any);

    render(<ResultsPage params={mockParams} />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText("Image Not Found")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Sorry, we couldn't find the image you're looking for.")
    ).toBeInTheDocument();
    expect(screen.getByText("Upload a New Image")).toBeInTheDocument();
  });

  it("should render error state when an exception occurs", async () => {
    // Mock the getImageData to throw an error
    vi.mocked(getImageData).mockImplementation(() => {
      throw new Error("Test error");
    });

    render(<ResultsPage params={mockParams} />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText("Image Not Found")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Sorry, we couldn't find the image you're looking for.")
    ).toBeInTheDocument();
  });
});
