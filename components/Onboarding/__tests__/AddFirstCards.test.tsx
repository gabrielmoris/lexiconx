/* eslint-disable @typescript-eslint/no-unused-vars */
import { render, screen } from "@testing-library/react";
import AddFirstCards from "../AddFirstCards";
import React from "react";

// Mock the dependencies
jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("../../Words/WordForm", () => {
  const MockWordForm = ({ className, isOpen }: { className?: string; isOpen?: boolean }) => {
    return <div data-testid="word-form">Word Form</div>;
  };
  return MockWordForm;
});

jest.mock("../../Words/WordList", () => {
  const MockWordList = () => {
    return <div data-testid="word-list">Word List</div>;
  };
  return MockWordList;
});

jest.mock("../../AI/AiGenerateVocabulary", () => {
  const MockAiGenerateVocabulary = () => {
    return <div data-testid="ai-generate">AI Generate</div>;
  };
  return MockAiGenerateVocabulary;
});

describe("AddFirstCards", () => {
  it("renders all required components", () => {
    render(<AddFirstCards />);

    // Check if title is rendered
    expect(screen.getByText("title")).toBeInTheDocument();

    // Check if all child components are rendered
    expect(screen.getByTestId("word-form")).toBeInTheDocument();
    expect(screen.getByTestId("word-list")).toBeInTheDocument();
    expect(screen.getByTestId("ai-generate")).toBeInTheDocument();
  });
});
