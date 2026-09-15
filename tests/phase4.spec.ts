import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function login(page: Page, role = "Manager") {
  await page.goto("/demo");
  await page
    .getByRole("button", { name: `Continue as ${role}`, exact: true })
    .click();
}

async function createDemoBooking(page: Page) {
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

test("manager dashboard and filtered MVP reports use persisted demo records", async ({
  page,
}) => {
  await createDemoBooking(page);
  await login(page);
  await expect(
    page.getByRole("heading", { name: "The business, at a glance." }),
  ).toBeVisible();
  await expect(page.getByText("THB 850", { exact: true })).toBeVisible();
  await expect(
    page.getByText("THB 7,650 active balance", { exact: false }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Reports", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Useful numbers, clear limits." }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Report product" })
    .selectOption("open-water");
  await expect(
    page.getByRole("cell", { name: "OPEN WATER", exact: false }).first(),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Booking status" })
    .selectOption("Deposit paid");
  await expect(
    page.locator("span.badge", { hasText: "Deposit paid" }),
  ).toBeVisible();
});

test("manager creates and publishes a product while existing booking totals stay fixed", async ({
  page,
}) => {
  await createDemoBooking(page);
  await login(page);
  await page.getByRole("link", { name: "Products", exact: true }).click();
  await page.getByRole("button", { name: "Create product" }).click();
  await page.getByLabel("Product name").fill("Marine Ecology Demo");
  await page.getByLabel("Catalogue category").fill("Fictional specialty");
  await page.getByLabel("Price THB").fill("4800");
  await page
    .getByLabel("Public description")
    .fill("A fictional ecology activity created for the DiveOS manager demo.");
  await page.getByLabel("Prerequisites").fill("Certified diver demo review");
  await page.getByLabel("Published in catalogue").check();
  await page.getByRole("button", { name: "Create draft product" }).click();
  await expect(page.getByText("Product created.")).toBeVisible();
  await expect(page.getByText("Marine Ecology Demo")).toBeVisible();
  await page.goto("/courses");
  await expect(
    page.getByRole("heading", { name: "Marine Ecology Demo" }),
  ).toBeVisible();
  await login(page);
  await expect(page.getByText("THB 850", { exact: true })).toBeVisible();
});

test("manager manages sites, boats and general settings with role protection", async ({
  page,
}) => {
  await login(page);
  await page.getByRole("link", { name: "Sites & boats" }).click();
  await page.getByRole("button", { name: "Add site" }).click();
  await page.getByLabel("Dive site name").fill("Japanese Gardens Demo");
  await page.getByLabel("Site participant capacity").fill("18");
  await page
    .getByLabel("Dive site operational notes")
    .fill("Fictional calm-water site record.");
  await page.getByRole("button", { name: "Save dive site" }).click();
  await expect(page.getByText("Dive site created.")).toBeVisible();
  await page.getByRole("button", { name: "Add boat" }).click();
  await page.getByLabel("Boat name").fill("Ocean Demo");
  await page.getByLabel("Boat passenger capacity").fill("20");
  await page.getByRole("button", { name: "Save boat" }).click();
  await expect(page.getByText("Boat created.")).toBeVisible();
  await page.getByRole("link", { name: "System", exact: true }).click();
  await page.getByLabel("Organization name").fill("Natneef Diving Demo");
  await page.getByLabel("Contact email").fill("ops@example.test");
  await page.getByLabel("Default deposit percent").fill("15");
  await page.getByLabel("LINE · simulated").check();
  await page.getByRole("button", { name: "Save general settings" }).click();
  await expect(page.getByText("General settings saved.")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Organization name")).toHaveValue(
    "Natneef Diving Demo",
  );
  await login(page, "Front Desk");
  await page.goto("/app/system");
  await expect(
    page.getByRole("heading", { name: "Permission denied" }),
  ).toBeVisible();
});

test("notification center creates only simulated previews and audit records", async ({
  page,
}) => {
  await createDemoBooking(page);
  await login(page);
  await page.getByRole("link", { name: "Notifications" }).click();
  await expect(page.getByText("MESSAGE PREVIEW · NOT SENT")).toBeVisible();
  await page.getByLabel("LINE · simulated").check();
  await page
    .getByRole("button", { name: "Record preview — do not send" })
    .click();
  await expect(
    page.getByText(
      "Simulated notification preview recorded. Nothing was sent.",
    ),
  ).toBeVisible();
  await expect(page.getByText("INTERNAL · LINE · NOT SENT")).toBeVisible();
  await page.getByRole("button", { name: "Mark read", exact: true }).click();
  await expect(page.getByText("Read", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Audit", exact: true }).click();
  await page.getByLabel("Search audit history").fill("not sent");
  await expect(
    page.getByText("Booking confirmation preview created; not sent"),
  ).toBeVisible();
});

test("Phase 4 manager routes remain accessible and responsive", async ({
  page,
}, testInfo) => {
  test.setTimeout(60_000);
  await login(page);
  for (const route of [
    "/app/dashboard",
    "/app/mvp-reports",
    "/app/products",
    "/app/resources",
    "/app/system",
    "/app/notifications",
    "/app/audit",
  ]) {
    await page.goto(route);
    await expect(page.locator("h1")).toBeVisible();
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
  }
  await page.goto("/app/dashboard");
  await page.screenshot({
    path: `test-results/phase4-dashboard-${testInfo.project.name}.png`,
    fullPage: true,
  });
});
