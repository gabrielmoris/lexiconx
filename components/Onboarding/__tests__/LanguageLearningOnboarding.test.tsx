import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import LanguageLearningOnboarding from "../LanguageLearningOnboarding";
import { LanguageToLearnProvider } from "@/context/LanguageToLearnContext";
import { selectUserLearningLanguage } from "@/lib/apis";

// Mock next-intl and next/navigation
jest.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string) => key,
}));

// mock apis
jest.mock("@/lib/apis");

jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { name: "Test User" } },
    status: "authenticated",
  }),
}));

describe("Language Learning Options", () => {
  const mockSelectUserLearningLanguage = jest.mocked(selectUserLearningLanguage);

  beforeEach(() => {
    mockSelectUserLearningLanguage.mockClear();
    // mockSelectUserLearningLanguage.mockResolvedValue({});
  });

  it("renders the LanguageLearningOnBoarding and its main components", async () => {
    render(
      <LanguageToLearnProvider>
        <LanguageLearningOnboarding setNextStep={jest.fn()} />
      </LanguageToLearnProvider>
    );

    // Wait for the component to finish loading and positioning flags
    await waitFor(() => {
      const chineseFlag = screen.getByLabelText(/flag 中文/i);
      expect(chineseFlag).toBeInTheDocument();
    });

    const chineseFlag = screen.getByLabelText(/flag 中文/i);
    const englishFlag = screen.getByLabelText(/flag English/i);
    const germanFlag = screen.getByLabelText(/flag Deutsch/i);
    const spanishFlag = screen.getByLabelText(/flag Español/i);

    expect(chineseFlag).toBeInTheDocument();
    expect(englishFlag).toBeInTheDocument();
    expect(germanFlag).toBeInTheDocument();
    expect(spanishFlag).toBeInTheDocument();
  });

  it("Calls the API when a flag is clicked", async () => {
    const user = userEvent.setup();
    const mockSetNextStep = jest.fn();

    render(
      <LanguageToLearnProvider>
        <LanguageLearningOnboarding setNextStep={mockSetNextStep} />
      </LanguageToLearnProvider>
    );

    // Find the clickable div inside the Chinese flag container
    const chineseFlagContainer = screen.getByLabelText(/flag 中文/i);
    const clickableDiv = chineseFlagContainer.querySelector("div.cursor-pointer");

    expect(clickableDiv).toBeInTheDocument();

    await user.click(clickableDiv!);

    // Wait for async operations to complete
    await waitFor(() => {
      expect(mockSelectUserLearningLanguage).toHaveBeenCalledTimes(1);
    });

    // console.log("Mock calls:", mockSelectUserLearningLanguage.mock.calls[0]);

    expect(mockSetNextStep).toHaveBeenCalledTimes(1);
  });
});
