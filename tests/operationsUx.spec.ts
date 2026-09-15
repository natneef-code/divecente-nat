import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function login(page: Page, role: string) {
  await page.goto("/demo");
  await page
    .getByRole("button", { name: `Continue as ${role}`, exact: true })
    .click();
}

async function createOpenWaterBooking(page: Page) {
  await login(page, "Customer");
  await page.goto("/courses/open-water");
  await page.getByLabel("I have reviewed").check();
  await page.getByLabel("I accept").check();
  await page.getByLabel("Submit placeholder medical").check();
  await page.getByRole("button", { name: "Create booking & continue" }).click();
  await page
    .getByRole("button", { name: "Simulate successful payment" })
    .click();
}

test("equipment scales from category to group to paginated physical assets", async ({
  page,
}) => {
  await login(page, "Manager");
  await page.goto("/app/equipment");
  await expect(
    page.getByRole("button", { name: /Fins.*total.*available/i }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Fins.*total.*available/i }).click();
  await expect(
    page.getByRole("heading", { name: "Fins groups" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /^M.*physical assets/i }).click();
  await expect(
    page.getByRole("button", { name: /Manage EQ/ }).first(),
  ).toBeVisible();
  await page.getByLabel("Search by asset code").fill("EQ-03-3-1");
  await expect(page.getByText("EQ-03-3-1", { exact: true })).toBeVisible();
  await page.getByText("Bulk-create similar physical assets").click();
  await page.getByLabel("Asset code prefix").fill("TEST-FIN");
  await page.getByLabel("Number of assets").fill("25");
  await page
    .getByRole("button", { name: "Review and create sequential assets" })
    .click();
  await expect(
    page.getByText("25 individually tracked assets created."),
  ).toBeVisible();
  await page.getByLabel("Search by asset code").fill("TEST-FIN");
  await expect(page.getByText(/Page 1 of 2 · 25 assets/)).toBeVisible();
  await expect(page.getByText("TEST-FIN-001", { exact: true })).toBeVisible();
});

test("Month Calendar shows activities and opens the selected day and activity", async ({
  page,
}) => {
  await login(page, "Manager");
  await page.goto("/app/calendar");
  await page.getByRole("button", { name: "Month", exact: true }).click();
  await expect(page.locator(".month-calendar")).toBeVisible();
  await expect(page.locator(".month-activity").first()).toContainText(
    /people · \d+\/\d+ pros ·/,
  );
  const dateButton = page
    .locator(".month-day:has(.month-activity) .month-date")
    .first();
  await dateButton.click();
  await expect(
    page.getByRole("button", { name: "Day", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Month", exact: true }).click();
  await page.locator(".month-activity").first().click();
  await expect(page).toHaveURL(/\/app\/staffing\?activity=/);
  await expect(page.getByText("Daily staffing overview")).toBeVisible();
});

test("daily staffing presents ten professionals, employment type and per-session coverage", async ({
  page,
}) => {
  await login(page, "Front Desk");
  await page.goto("/app/staffing");
  await expect(page.getByText("Daily staffing overview")).toBeVisible();
  await expect(page.getByText(/Permanent/).first()).toBeVisible();
  await page.getByText("Assigned Dive Team").click();
  const professionalChecks = page
    .locator("fieldset")
    .filter({ hasText: "Assigned Dive Team" })
    .first()
    .locator('input[type="checkbox"]');
  await expect(professionalChecks).toHaveCount(12);
  await expect(page.getByText(/\/4 · \d+ assigned/).first()).toBeVisible();
  await expect(
    page.getByText("Activity default team", { exact: true }),
  ).toHaveCount(0);
});

test("Front Desk manages a configurable boat manifest and seat map", async ({
  page,
}) => {
  await createOpenWaterBooking(page);
  await login(page, "Manager");
  await page.goto("/app/resources");
  const boatCard = page
    .locator(".resource-row")
    .filter({ hasText: "Blue Current" });
  await boatCard.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("Passenger capacity").fill("36");
  await page.getByRole("button", { name: "Save boat" }).click();
  await login(page, "Front Desk");
  await page.goto("/app/boats");
  await expect(page.getByText("Seat map · 1–36")).toBeVisible();
  await expect(page.locator(".seat")).toHaveCount(36);
  const seatInput = page.getByLabel(/Seat for Alex Morgan/);
  await seatInput.fill("36");
  await page
    .locator("form")
    .filter({ has: seatInput })
    .getByRole("button", { name: "Assign seat" })
    .click();
  await expect(page.getByText("Seat 36 assigned.")).toBeVisible();
  await page.getByLabel("Operational seat").fill("35");
  await page.getByRole("button", { name: "Block or release seat" }).click();
  await expect(page.getByText("Seat 35 blocked.")).toBeVisible();
});

test("boat manifest is read-only for assigned professionals and denied to customers", async ({
  page,
}) => {
  await createOpenWaterBooking(page);
  await login(page, "Instructor");
  await page.goto("/app/boats");
  await expect(
    page.getByRole("heading", {
      name: "A seat and a place for every passenger.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Assign seat" })).toHaveCount(
    0,
  );
  await login(page, "Divemaster");
  await page.goto("/app/boats");
  await expect(
    page.getByRole("heading", {
      name: "A seat and a place for every passenger.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Assign seat" })).toHaveCount(
    0,
  );
  await login(page, "Customer");
  await page.goto("/app/boats");
  await expect(
    page.getByRole("heading", {
      name: "Permission denied",
    }),
  ).toBeVisible();
});

test("revised operational workspaces remain accessible without horizontal overflow", async ({
  page,
}) => {
  await login(page, "Manager");
  for (const route of [
    "/app/equipment",
    "/app/calendar",
    "/app/staffing",
    "/app/boats",
  ]) {
    await page.goto(route);
    if (route === "/app/calendar")
      await page.getByRole("button", { name: "Month", exact: true }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations.map((item) => ({
        id: item.id,
        nodes: item.nodes.map((node) => node.target),
      })),
    ).toEqual([]);
    const name = route.split("/").at(-1);
    await page.screenshot({
      path: `test-results/operations-${name}-${test.info().project.name}.png`,
      fullPage: true,
    });
  }
});
