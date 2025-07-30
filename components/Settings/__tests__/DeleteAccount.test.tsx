import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import DeleteAccount from "../DeleteAccount";

// Mock useAuthGuard to avoid async state updates
jest.mock("@/hooks/useAuthGuard", () => ({
  useAuthGuard: () => ({
    session: { user: { email: "test@example.com" } },
    status: "authenticated",
    isLoading: false,
    userData: { name: "Test User" },
  }),
}));

// Mock useLocalStorage for testing Delete Data after deleting account
// jest.mock("@/hooks/useLocalStorage", () => ({
//   __esModule: true,
//   default: () => ({
//     deleteValue: jest.fn(),
//   }),
// }));

jest.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string) => key,
}));

jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { name: "Test User" } },
    status: "authenticated",
  }),
  signOut: jest.fn(),
}));

jest.mock("@/lib/apis", () => ({
  getUserData: jest.fn().mockResolvedValue({ data: {} }),
  deleteUserData: jest.fn().mockResolvedValue({ data: { deletedCount: 1 } }),
}));

describe("Delete Account", () => {
  it("renders delete account button", async () => {
    render(<DeleteAccount />);

    await waitFor(() => {
      const deleteButton = screen.getByRole("button");
      expect(deleteButton).toBeInTheDocument();
    });
  });
});
