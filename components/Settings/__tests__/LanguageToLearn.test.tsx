import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import LanguageToLearn from "../LanguageToLearn";
import { LanguageToLearnProvider } from "@/context/LanguageToLearnContext";
import { selectUserLearningLanguage } from "@/lib/apis";
import { vi } from "vitest";

// Mock next-intl and next/navigation
vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string) => key,
}));

// mock apis
vi.mock("@/lib/apis");

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { name: "Test User" } },
    status: "authenticated",
  }),
}));

describe("Language Learning Options", () => {
  const mockSelectUserLearningLanguage = vi.mocked(selectUserLearningLanguage);

  beforeEach(() => {
    mockSelectUserLearningLanguage.mockClear();
    // mockSelectUserLearningLanguage.mockResolvedValue({});
  });

  it("renders the LanguageToLearn and its main components", async () => {
    render(
      <LanguageToLearnProvider>
        <LanguageToLearn />
      </LanguageToLearnProvider>
    );

    // Wait for the component to finish loading and positioning flags
    await waitFor(async () => {
      const user = userEvent.setup();
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();

      await user.click(button);
      expect(screen.getByRole("listbox")).toBeInTheDocument();

      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(5);
    });
  });
});
