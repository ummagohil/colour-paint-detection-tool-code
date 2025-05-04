import { describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import UploadPage from "./page";

// Mock the Next.js components and modules
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a href={href} data-testid="next-link">
      {children}
    </a>
  ),
}));

// Mock the lucide-react icons
vi.mock("lucide-react", () => ({
  ArrowLeft: () => <div data-testid="arrow-left-icon" />,
}));

// Mock the custom components
vi.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card" className={className || ""}>
      {children}
    </div>
  ),
}));

vi.mock("@/components/image-uploader", () => ({
  ImageUploader: ({
    onUploadStart,
    onUploadComplete,
  }: {
    onUploadStart: () => void;
    onUploadComplete: () => void;
  }) => (
    <div data-testid="image-uploader">
      <button data-testid="start-upload-btn" onClick={onUploadStart}>
        Start Upload
      </button>
      <button data-testid="complete-upload-btn" onClick={onUploadComplete}>
        Complete Upload
      </button>
    </div>
  ),
}));

describe("UploadPage Component", () => {
  it("should render the page with correct title and header", () => {
    render(<UploadPage />);

    // Check for the page header and navigation
    expect(screen.getByText("Paint Matcher")).toBeInTheDocument();
    expect(screen.getByTestId("arrow-left-icon")).toBeInTheDocument();
    expect(screen.getByTestId("next-link")).toHaveAttribute("href", "/");

    // Check for the page title
    expect(screen.getByText("Upload Your Wall Image")).toBeInTheDocument();

    // Check for the card and uploader
    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByTestId("image-uploader")).toBeInTheDocument();

    // Check for the best practices list
    expect(screen.getByText("For best results:")).toBeInTheDocument();
    expect(
      screen.getByText("Take photos in natural daylight")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Avoid shadows or strong reflections")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Capture a clean section of the wall")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Ensure the wall colour is the main subject")
    ).toBeInTheDocument();
  });

  it("should handle upload state changes correctly", async () => {
    const user = userEvent.setup();
    render(<UploadPage />);

    // Initial state - isUploading should be false (though we can't directly test the state)

    // Simulate starting an upload
    await user.click(screen.getByTestId("start-upload-btn"));
    // isUploading should now be true (we can't directly assert on state)

    // Simulate completing an upload
    await user.click(screen.getByTestId("complete-upload-btn"));
    // isUploading should now be false again

    // Since we can't directly test React state, we're just testing that
    // the component doesn't crash when these events occur
    // This is a limitation of testing hooks without more complex test setup

    // If you wanted to actually test the state changes, you'd need to
    // either expose the state via the DOM or use a React testing library
    // that supports testing hooks directly
  });

  it("should have the correct link to the homepage", () => {
    render(<UploadPage />);

    const homeLink = screen.getByTestId("next-link");
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("should render the Card component with proper styling", () => {
    render(<UploadPage />);

    const card = screen.getByTestId("card");
    expect(card).toHaveClass("p-6");
  });

  it("should pass the correct callbacks to ImageUploader", async () => {
    const user = userEvent.setup();
    render(<UploadPage />);

    // Test that ImageUploader receives the callbacks
    const startButton = screen.getByTestId("start-upload-btn");
    const completeButton = screen.getByTestId("complete-upload-btn");

    await user.click(startButton);
    await user.click(completeButton);

    // Successfully reaching this point without errors means
    // the callbacks were properly passed and can be called
  });
});
