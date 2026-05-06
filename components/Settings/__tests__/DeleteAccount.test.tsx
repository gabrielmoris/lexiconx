import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import DeleteAccount from "../DeleteAccount";
import userEvent from "@testing-library/user-event";
import { deleteUserData } from "@/lib/apis";
import { signOut } from "next-auth/react";
import { vi } from "vitest";

// Mock useAuthGuard to avoid async state updates
vi.mock("@/hooks/useAuthGuard", () => ({
  useAuthGuard: () => ({
    session: { user: { email: "test@example.com" } },
    status: "authenticated",
    isLoading: false,
    userData: { name: "Test User" },
  }),
}));

// Mock useLocalStorage for testing Delete Data after deleting account
const mockDeleteStep = vi.fn();
const mockDeleteQuiz = vi.fn();

vi.mock("@/hooks/useLocalStorage", () => ({
  __esModule: true,
  default: vi.fn((key: string) => {
    if (key === "onboardingStep") {
      return { deleteValue: mockDeleteStep };
    }
    if (key === "quizes") {
      return { deleteValue: mockDeleteQuiz };
    }
    return { deleteValue: vi.fn() };
  }),
}));

// Mock next-intl for translations
vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string) => key,
}));

// Mock next-auth/react for signOut
vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { name: "Test User" } },
    status: "authenticated",
  }),
  signOut: vi.fn(),
}));

// Mock deleteUserData from lib/apis
vi.mock("@/lib/apis", () => ({
  deleteUserData: vi.fn().mockResolvedValue({ data: { deletedCount: 1 } }),
}));

describe("Delete Account", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders delete account button", async () => {
    render(<DeleteAccount />);

    await waitFor(() => {
      const deleteButton = screen.getByRole("button");
      expect(deleteButton).toBeInTheDocument();
    });
  });

  it("deletes account and data", async () => {
    const user = userEvent.setup();
    render(<DeleteAccount />);

    await waitFor(() => {
      const deleteButton = screen.getByRole("button");
      expect(deleteButton).toBeInTheDocument();
    });
    const deleteButton = screen.getByRole("button");
    await user.click(deleteButton);

    const acceptButton = screen.getByText("accept-popup");
    await user.click(acceptButton);

    expect(deleteUserData).toHaveBeenCalled();
    expect(signOut).toHaveBeenCalled();
		expect(deleteUserData).toHaveBeenCalled();

    expect(mockDeleteStep).toHaveBeenCalled();
    expect(mockDeleteQuiz).toHaveBeenCalled();
  });
});
