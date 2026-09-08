import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("public and booking pages pass automated WCAG A/AA checks", async ({
  page,
}) => {
  for (const route of ["/", "/demo", "/courses"]) {
    await page.goto(route);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  }
  await page.goto("/courses/open-water");
  await page
    .getByRole("button", { name: "Continue as Customer", exact: true })
    .click();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
});
test("manager calendar filtering and daily view are functional", async ({
  page,
}) => {
  await page.goto("/demo");
  await page
    .getByRole("button", { name: "Continue as Manager", exact: true })
    .click();
  await expect(page.getByText("Pending transfer reviews")).toBeVisible();
  await page.getByRole("link", { name: "Open calendar", exact: false }).click();
  await page
    .getByRole("combobox", { name: "Course", exact: true })
    .selectOption("nitrox");
  await expect(
    page.getByRole("heading", { name: "Nitrox Specialty", exact: true }),
  ).toHaveCount(3);
  await expect(
    page.getByRole("heading", { name: "Open Water", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Daily", exact: true }).click();
  await page.getByLabel("Date", { exact: true }).fill("2000-01-01");
  await expect(
    page.getByRole("heading", { name: "A quiet day on the calendar." }),
  ).toBeVisible();
});
