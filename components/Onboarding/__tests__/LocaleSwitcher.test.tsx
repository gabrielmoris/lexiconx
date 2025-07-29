import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LocaleSwitcher from "../LocaleSwitcher";
import React from "react";

// Create a mock function for router.push and next step
const mockPush = jest.fn();

// Mock next-intl and next/navigation
jest.mock("next-intl", () => ({
  useLocale: () => "en",
}));

jest.mock("@/src/i18n/navigation", () => ({
  usePathname: () => "/onboarding",
  Link: ({ children, locale, onClick, ...props }: React.PropsWithChildren<{ locale: string; onClick?: () => void }>) => (
    <button
      data-locale={locale}
      onClick={() => {
        mockPush(`/${locale}/onboarding`);
        if (onClick) onClick();
      }}
      {...props}
    >
      {children}
    </button>
  ),
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("@/src/i18n/routing", () => ({
  locales: ["en", "de", "zh", "es", "ru"],
}));

// Mock other dependencies
jest.mock("@/lib/apis", () => ({ updateUserData: jest.fn() }));

jest.mock("@/hooks/useAuthGuard", () => ({
  useAuthGuard: () => ({ session: {}, status: "authenticated" }),
}));

describe("LocaleSwitcher", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it("shows correct aria-label for German flag", async () => {
    render(<LocaleSwitcher setNextStep={jest.fn()} />);

    const germanFlag = screen.getByLabelText(/Switch to Deutsch/i);
    expect(germanFlag).toBeInTheDocument();
  });

  it("calls router.push with correct path when German flag is clicked", async () => {
    const user = userEvent.setup();
    render(<LocaleSwitcher setNextStep={jest.fn()} />);

    const germanFlag = screen.getByLabelText(/Switch to Deutsch/i);
    await user.click(germanFlag);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/de/onboarding");
  });
});
