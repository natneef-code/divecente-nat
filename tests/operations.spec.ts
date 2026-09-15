import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
async function login(page: Page, role: string) {
  await page.goto("/demo");
  await page
    .getByRole("button", { name: `Continue as ${role}`, exact: true })
    .click();
}
async function accept(page: Page) {
  await page.getByLabel("I have reviewed").check();
  await page.getByLabel("I accept").check();
  await page.getByLabel("Submit placeholder medical").check();
  await page.getByRole("button", { name: "Create booking & continue" }).click();
}
async function course(page: Page) {
  await login(page, "Customer");
  await page.goto("/courses/open-water");
  await accept(page);
  await page
    .getByRole("button", { name: "Simulate successful payment" })
    .click();
}
test("Fun Dive certification → mandatory Refresher → scheduled → Divemaster completion → check-in", async ({
  page,
}) => {
  await login(page, "Customer");
  await page.goto("/courses/fun-dive");
  await expect(page.getByLabel("Equipment size")).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Certification agency", exact: true })
    .selectOption("SSI");
  await page
    .getByLabel("Certification level", { exact: true })
    .fill("Open Water");
  await page
    .getByLabel("Certification number", { exact: true })
    .fill("DEMO-ABC");
  await page.getByLabel("Logged dives", { exact: true }).fill("24");
  await page.getByLabel("Last dive date", { exact: true }).fill("2020-01-01");
  await page
    .getByRole("combobox", { name: "Equipment rental", exact: true })
    .selectOption("individual");
  await page.getByLabel("Dive computer ·").check();
  await expect(page.locator(".deposit-box")).toContainText("375");
  await page
    .getByRole("combobox", { name: "Equipment rental", exact: true })
    .selectOption("none");
  await expect(page.locator(".deposit-box")).toContainText("350");
  await accept(page);
  await page
    .getByRole("button", { name: "Simulate successful payment" })
    .click();
  await expect(page.getByText("Mandatory Refresher: Required")).toBeVisible();
  await page.goto("/portal/training");
  await expect(
    page.getByRole("heading", {
      name: "Your learning journey starts with a booking.",
    }),
  ).toBeVisible();
  await login(page, "Front Desk");
  await page
    .getByRole("button", { name: "Confirm booking", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Check in group", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Refresher");
  await page
    .getByRole("button", { name: "Schedule Refresher", exact: true })
    .click();
  await expect(
    page.getByText("Refresher scheduled.", { exact: true }),
  ).toBeVisible();
  await login(page, "Divemaster");
  await expect(page.getByText("Total", { exact: true })).toHaveCount(0);
  await page
    .getByRole("button", { name: "Record Refresher completed", exact: true })
    .click();
  await expect(page.getByText("Refresher completion recorded.")).toBeVisible();
  await login(page, "Front Desk");
  await page
    .getByRole("button", { name: "Check in group", exact: true })
    .click();
  await expect(
    page.getByRole("article").getByText("Checked in", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("article").getByText("Checked in", { exact: true }),
  ).toBeVisible();
});
test("professional fitting → audited Front Desk correction → Divemaster checkout and damaged return", async ({
  page,
}) => {
  await course(page);
  await login(page, "Front Desk");
  await page.goto("/app/staffing");
  await page.getByLabel("Dao · Divemaster", { exact: false }).first().check();
  await page
    .getByRole("button", { name: "Assign staff for all sessions", exact: true })
    .click();
  await expect(page.getByText("Manual team assignment saved.")).toBeVisible();
  await login(page, "Divemaster");
  await page.goto("/app/equipment");
  await page
    .getByLabel("Equipment category", { exact: true })
    .selectOption("Mask");
  await page
    .getByLabel("Equipment size or model", { exact: true })
    .selectOption("Universal");
  await page
    .getByRole("button", { name: /Manage EQ/ })
    .first()
    .click();
  await page
    .getByLabel("Allocate to participant", { exact: true })
    .selectOption({ index: 1 });
  await page
    .getByRole("button", { name: "Reserve this item", exact: true })
    .click();
  await expect(
    page.getByText("Equipment reserved for this participant."),
  ).toBeVisible();
  await login(page, "Front Desk");
  await page.goto("/app/equipment");
  await page
    .getByLabel("Equipment category", { exact: true })
    .selectOption("Mask");
  await page
    .getByLabel("Equipment size or model", { exact: true })
    .selectOption("Universal");
  await page
    .getByRole("button", { name: /Manage EQ/ })
    .first()
    .click();
  await page
    .getByLabel("Replacement asset", { exact: true })
    .selectOption({ index: 1 });
  await page
    .getByLabel("Correction reason", { exact: true })
    .fill("Fitting corrected after professional review");
  await page
    .getByRole("button", { name: "Correct assignment", exact: true })
    .click();
  await expect(
    page.getByText("Assignment corrected; previous record retained."),
  ).toBeVisible();
  await login(page, "Divemaster");
  await page.goto("/app/equipment");
  await page
    .getByLabel("Equipment category", { exact: true })
    .selectOption("Mask");
  await page
    .getByLabel("Equipment size or model", { exact: true })
    .selectOption("Universal");
  await page
    .getByRole("button", { name: /Manage EQ/ })
    .nth(1)
    .click();
  await page.getByRole("button", { name: "Check out", exact: true }).click();
  await page
    .getByLabel("Damage report on return (optional)")
    .fill("Fictional damaged strap");
  await page.getByRole("button", { name: "Return item", exact: true }).click();
  await expect(page.getByText("Damage: Fictional damaged strap")).toBeVisible();
  await page.goto("/app/settings");
  await expect(
    page.getByRole("heading", { name: "Permission denied" }),
  ).toBeVisible();
  await page.goto("/app/customers");
  await expect(
    page.getByRole("heading", { name: "Permission denied" }),
  ).toBeVisible();
});
test("manager raises independent capacities and Front Desk staffs a six-student course", async ({
  page,
}) => {
  await login(page, "Manager");
  await page.goto("/app/settings");
  await page
    .getByLabel("Product participant maximum", { exact: true })
    .fill("8");
  await page.getByRole("button", { name: "Save product", exact: true }).click();
  await page.getByLabel("Rule scope", { exact: true }).selectOption("activity");
  await page
    .getByLabel("Rule target", { exact: true })
    .selectOption("open-water-0");
  await page.getByLabel("Participant capacity", { exact: true }).fill("8");
  await page.getByRole("button", { name: "Save rules", exact: true }).click();
  await login(page, "Front Desk");
  await page.goto("/app/staffing");
  await page.getByLabel("Dao · Divemaster", { exact: false }).first().check();
  await page
    .getByRole("button", { name: "Assign staff for all sessions", exact: true })
    .click();
  await login(page, "Customer");
  await page.goto("/courses/open-water");
  await page.getByLabel("Participants", { exact: true }).selectOption("6");
  for (let i = 0; i < 6; i++)
    await page
      .getByLabel("Full name", { exact: true })
      .nth(i)
      .fill(`Fictional Group ${i + 1}`);
  await accept(page);
  await expect(page.getByText("Deposit due:")).toContainText("5,100");
  await login(page, "Front Desk");
  await page.goto("/app/staffing");
  await expect(
    page.getByText("Professionals required").locator(".."),
  ).toContainText("2");
  await expect(
    page.getByText("Missing professionals").locator(".."),
  ).toContainText("0");
  await page
    .getByRole("button", { name: "Mark operationally ready", exact: true })
    .click();
  await expect(
    page.getByText("Activity marked operationally ready."),
  ).toBeVisible();
});
test("Front Desk manual booking → document review → Instructor training; DM cannot approve", async ({
  page,
}) => {
  await login(page, "Front Desk");
  await page.goto("/app/new-booking");
  await page
    .getByRole("link", { name: "Book Open Water", exact: true })
    .click();
  await expect(
    page.getByRole("combobox", { name: "Booking customer", exact: true }),
  ).toBeVisible();
  await accept(page);
  await expect(page).toHaveURL(/\/app$/);
  await page
    .getByText("Document review & booking actions", { exact: true })
    .click();
  await page
    .getByRole("button", { name: "Approve demo documents", exact: true })
    .click();
  await page.getByRole("button", { name: /Record demo deposit/ }).click();
  await page
    .getByRole("button", { name: "Confirm booking", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Check in group", exact: true })
    .click();
  await login(page, "Instructor");
  await page.goto("/app/training");
  for (const checkbox of await page.getByRole("checkbox").all())
    await checkbox.check();
  await page
    .getByLabel("Training status", { exact: true })
    .selectOption("Ready for SSI processing");
  await page
    .getByLabel("Instructor notes / problems — no sensitive health details")
    .fill("All fictional milestones reviewed.");
  await page
    .getByRole("button", { name: "Save training progress", exact: true })
    .click();
  await expect(
    page.getByText("Training record saved.", { exact: false }),
  ).toBeVisible();
  await login(page, "Customer");
  await page.goto("/portal/training");
  await expect(
    page.getByText("Ready for SSI processing", { exact: true }),
  ).toBeVisible();
  await login(page, "Divemaster");
  await page.goto("/app/training");
  await expect(
    page.getByRole("heading", { name: "Permission denied" }),
  ).toBeVisible();
});
test("operational workspaces are accessible and fit desktop/mobile widths", async ({
  page,
}, info) => {
  test.setTimeout(60000);
  await login(page, "Manager");
  for (const route of [
    "/app/staffing",
    "/app/settings",
    "/app/equipment",
    "/app/customers",
    "/app/reports",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
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
  await page.goto("/app/staffing");
  await page.screenshot({
    path: `test-results/staffing-${info.project.name}.png`,
    fullPage: true,
  });
});
