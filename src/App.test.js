import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders app", () => {
  render(<App />);
  const searchTitle = screen.getByText("Search for GitHub repos or users");
  expect(searchTitle).toBeInTheDocument();
});
