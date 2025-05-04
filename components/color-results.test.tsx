import { describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { screen } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { ColorResults } from "./color-results"; // Adjust this path as needed

// Mock the lucide-react icons
vi.mock("lucide-react", () => ({
  ExternalLink: () => <div data-testid="external-link-icon" />,
}));

// Mock the custom UI components
vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    variant,
    size,
  }: {
    children: React.ReactNode;
    variant?: string;
    size?: string;
  }) => (
    <button data-testid="button" data-variant={variant} data-size={size}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
}));

vi.mock("@/components/ui/tabs", () => ({
  Tabs: ({
    children,
    defaultValue,
  }: {
    children: React.ReactNode;
    defaultValue: string;
  }) => (
    <div data-testid="tabs" data-default-value={defaultValue}>
      {children}
    </div>
  ),
  TabsList: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="tabs-list" className={className}>
      {children}
    </div>
  ),
  TabsTrigger: ({
    children,
    value,
    className,
  }: {
    children: React.ReactNode;
    value: string;
    className?: string;
  }) => (
    <button
      data-testid={`tab-${value}`}
      data-value={value}
      className={className}
    >
      {children}
    </button>
  ),
  TabsContent: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => (
    <div data-testid={`tab-content-${value}`} data-value={value}>
      {children}
    </div>
  ),
}));

describe("ColorResults Component", () => {
  // Sample test data
  const mockColorMatch = {
    color: {
      hex: "#FF5733",
      percentage: 35,
    },
    vendorMatches: [
      {
        vendor: "dulux",
        matches: [
          {
            name: "Fiery Sunset",
            code: "DLX1234",
            hex: "#FF6347",
            matchPercentage: 92,
            url: "https://example.com/dulux/fiery-sunset",
          },
          {
            name: "Autumn Blaze",
            code: "DLX5678",
            hex: "#FF7F50",
            matchPercentage: 87,
            url: "https://example.com/dulux/autumn-blaze",
          },
        ],
      },
      {
        vendor: "sherwin-williams",
        matches: [
          {
            name: "Coral Reef",
            code: "SW6606",
            hex: "#FF6F61",
            matchPercentage: 89,
            url: "https://example.com/sherwin-williams/coral-reef",
          },
        ],
      },
    ],
  };

  it("should render with the correct color info", () => {
    const { container } = render(
      <ColorResults colorMatch={mockColorMatch} index={0} />
    );

    // Check header information
    expect(
      screen.getByText("Matches for Detected Colour 1")
    ).toBeInTheDocument();
    expect(screen.getByText("#FF5733 (35% of wall)")).toBeInTheDocument();

    // Check the color box is rendered with correct background color using style attribute
    const colorBoxElement = container.querySelector(
      ".w-10.h-10.rounded-md.border.shadow-sm.flex-shrink-0"
    );
    expect(colorBoxElement).toHaveAttribute(
      "style",
      expect.stringContaining("background-color: rgb(255, 87, 51);")
    );
  });

  it("should render all vendor tabs", () => {
    render(<ColorResults colorMatch={mockColorMatch} index={0} />);

    // Check that tabs for both vendors are rendered
    expect(screen.getByTestId("tab-dulux")).toBeInTheDocument();
    expect(screen.getByText("dulux")).toBeInTheDocument();

    expect(screen.getByTestId("tab-sherwin-williams")).toBeInTheDocument();
    expect(screen.getByText("sherwin-williams")).toBeInTheDocument();
  });

  it("should render the dulux matches in the default tab", () => {
    render(<ColorResults colorMatch={mockColorMatch} index={0} />);

    // Default tab should be the first vendor (dulux)
    expect(screen.getByTestId("tabs")).toHaveAttribute(
      "data-default-value",
      "dulux"
    );

    // Check the paint match details in the dulux tab
    expect(screen.getByText("Fiery Sunset")).toBeInTheDocument();
    expect(screen.getByText("DLX1234")).toBeInTheDocument();
    expect(screen.getByText("92% match")).toBeInTheDocument();

    expect(screen.getByText("Autumn Blaze")).toBeInTheDocument();
    expect(screen.getByText("DLX5678")).toBeInTheDocument();
    expect(screen.getByText("87% match")).toBeInTheDocument();
  });

  it("should render the sherwin-williams tab content", () => {
    render(<ColorResults colorMatch={mockColorMatch} index={0} />);

    // Check the sherwin-williams tab content exists
    expect(
      screen.getByTestId("tab-content-sherwin-williams")
    ).toBeInTheDocument();

    // The tab content should have the Coral Reef paint info
    expect(screen.getByText("Coral Reef")).toBeInTheDocument();
    expect(screen.getByText("SW6606")).toBeInTheDocument();
    expect(screen.getByText("89% match")).toBeInTheDocument();
  });

  it('should render "View" buttons with external links', () => {
    render(<ColorResults colorMatch={mockColorMatch} index={0} />);

    // Check that there are the expected number of buttons
    const buttons = screen.getAllByTestId("button");
    expect(buttons).toHaveLength(3); // 2 for dulux + 1 for sherwin-williams

    // Check button text
    buttons.forEach((button) => {
      expect(button).toHaveTextContent("View");
    });

    // Check that the buttons have the correct variant and size
    buttons.forEach((button) => {
      expect(button).toHaveAttribute("data-variant", "outline");
      expect(button).toHaveAttribute("data-size", "sm");
    });

    // Check that the external link icon is rendered in each button
    const externalLinkIcons = screen.getAllByTestId("external-link-icon");
    expect(externalLinkIcons).toHaveLength(3);
  });

  it("should render the component with a different index", () => {
    render(<ColorResults colorMatch={mockColorMatch} index={2} />);

    // The heading should now reflect the different index (2+1 = 3)
    expect(
      screen.getByText("Matches for Detected Colour 3")
    ).toBeInTheDocument();
  });

  it("should handle a colorMatch with no vendor matches gracefully", () => {
    const emptyColorMatch = {
      color: {
        hex: "#000000",
        percentage: 10,
      },
      vendorMatches: [],
    };

    // This should not throw an error despite no vendor matches
    render(<ColorResults colorMatch={emptyColorMatch} index={0} />);

    // The component should still render the color information
    expect(
      screen.getByText("Matches for Detected Colour 1")
    ).toBeInTheDocument();
    expect(screen.getByText("#000000 (10% of wall)")).toBeInTheDocument();
  });

  it("should show correct match percentages in progress bars", () => {
    const { container } = render(
      <ColorResults colorMatch={mockColorMatch} index={0} />
    );

    // Find all progress bars (divs with percentage-based widths)
    const progressBars = container.querySelectorAll(
      ".bg-primary.h-2.rounded-full"
    );

    // Verify we have 3 progress bars (2 for dulux, 1 for sherwin-williams)
    expect(progressBars.length).toBe(3);

    // Check style attribute of the progress bars
    const firstProgressBar = progressBars[0] as Element;
    expect(firstProgressBar).toHaveAttribute(
      "style",
      expect.stringContaining("width: 92%")
    );

    const secondProgressBar = progressBars[1] as Element;
    expect(secondProgressBar).toHaveAttribute(
      "style",
      expect.stringContaining("width: 87%")
    );
  });
});
