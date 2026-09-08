import { test, expect, type Page } from "@playwright/test";
async function login(page: Page, role = "Customer") {
  await page.goto("/demo");
  await page
    .getByRole("button", { name: `Continue as ${role}`, exact: true })
    .click();
}
async function booking(
  page: Page,
  method: "QR" | "Wise" = "QR",
  documents = true,
) {
  await login(page);
  await page.goto("/courses/open-water");
  await page.getByLabel("I have reviewed the demo prerequisites").check();
  await page.getByLabel("I accept the demo terms").check();
  if (documents)
    await page.getByLabel("Submit placeholder medical and waiver").check();
  if (method === "Wise")
    await page
      .getByRole("radio", { name: "Wise manual transfer", exact: false })
      .check();
  await page.getByRole("button", { name: "Create booking & continue" }).click();
  await expect(page).toHaveURL(/\/portal\/bookings\//);
}
test("customer → QR deposit → portal → staff → calendar, persisted after refresh", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "Try DiveOS" }).first(),
  ).toHaveAttribute("href", "/demo");
  await page
    .getByRole("link", { name: "View Courses", exact: true })
    .first()
    .click();
  await page
    .getByRole("link", { name: "View Open Water", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Continue as Customer", exact: true })
    .click();
  await page.getByLabel("I have reviewed the demo prerequisites").check();
  await page.getByLabel("I accept the demo terms").check();
  await page.getByLabel("Submit placeholder medical and waiver").check();
  await page.getByRole("button", { name: "Create booking & continue" }).click();
  await expect(page.getByText("Deposit due:")).toContainText("850");
  await page
    .getByRole("button", { name: "Simulate successful payment" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your place is reserved." }),
  ).toBeVisible();
  await expect(
    page.getByText("Outstanding balance").locator(".."),
  ).toContainText("7,650");
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your place is reserved." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Simulate successful payment" }),
  ).toHaveCount(0);
  await page.goto("/portal");
  await expect(
    page.getByRole("heading", { name: "Open Water", exact: true }),
  ).toBeVisible();
  await login(page, "Front Desk");
  await expect(
    page.getByRole("article").getByText("Deposit paid", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Confirm booking", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Check in group", exact: true })
    .click();
  await expect(
    page.getByRole("article").getByText("Checked in", { exact: true }),
  ).toBeVisible();
  await page.goto("/app/calendar");
  await expect(page.getByText("1 / 4 students", { exact: true })).toBeVisible();
  await expect(page.getByText("Alex Morgan", { exact: true })).toBeVisible();
  await page.screenshot({
    path: `test-results/calendar-${info.project.name}.png`,
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("Wise submission needs staff verification and records the balance only after approval", async ({
  page,
}) => {
  await booking(page, "Wise");
  await page
    .getByRole("button", { name: "Mark demo transfer as submitted" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your transfer is awaiting review." }),
  ).toBeVisible();
  await expect(
    page.getByText("Outstanding balance").locator(".."),
  ).toContainText("8,500");
  await login(page, "Front Desk");
  await page.getByRole("button", { name: "Approve demo transfer" }).click();
  await expect(
    page.getByRole("article").getByText("Deposit paid", { exact: true }),
  ).toBeVisible();
  await login(page);
  await page.getByRole("link", { name: "View booking", exact: false }).click();
  await expect(
    page.getByText("Outstanding balance").locator(".."),
  ).toContainText("7,650");
});
test("missing documents block check-in until the customer submits acknowledgements", async ({
  page,
}) => {
  await booking(page, "QR", false);
  await page
    .getByRole("button", { name: "Simulate successful payment" })
    .click();
  const url = page.url();
  await login(page, "Front Desk");
  await page
    .getByRole("button", { name: "Confirm booking", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Check in group", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText(
    "document acknowledgements",
  );
  await login(page);
  await page.goto(url);
  await page
    .getByRole("button", { name: "Submit demo document acknowledgements" })
    .click();
  await login(page, "Front Desk");
  await page
    .getByRole("button", { name: "Check in group", exact: true })
    .click();
  await expect(
    page.getByRole("article").getByText("Checked in", { exact: true }),
  ).toBeVisible();
});
test("full class disables another booking and alternate date is available", async ({
  page,
}) => {
  await login(page);
  await page.goto("/courses/open-water");
  await page
    .getByRole("combobox", { name: "Participants", exact: true })
    .selectOption("4");
  for (let i = 0; i < 4; i++)
    await page
      .getByLabel("Full name", { exact: true })
      .nth(i)
      .fill(`Fictional Diver ${i + 1}`);
  await page.getByLabel("I have reviewed").check();
  await page.getByLabel("I accept").check();
  await page.getByRole("button", { name: "Create booking & continue" }).click();
  await page.goto("/courses/open-water");
  await expect(
    page.getByRole("button", { name: "Create booking & continue" }),
  ).toBeDisabled();
  await page.getByLabel("Available start date").selectOption("open-water-1");
  await expect(
    page.getByRole("button", { name: "Create booking & continue" }),
  ).toBeEnabled();
});
test("equipment add-on changes total and calculated deposit", async ({
  page,
}) => {
  await login(page);
  await page.goto("/courses/open-water");
  await page.getByLabel("Add a dive computer").check();
  await expect(page.locator(".deposit-box")).toContainText("875");
  await expect(page.locator(".summary-row.total")).toContainText("8,750");
  await page.getByLabel("I have reviewed").check();
  await page.getByLabel("I accept").check();
  await page.getByRole("button", { name: "Create booking & continue" }).click();
  await expect(page.getByText("Deposit due:")).toContainText("875");
});
test("protected routes, instructor financial exclusion, empty results and invalid routes", async ({
  page,
}) => {
  await page.goto("/app");
  await expect(
    page.getByRole("heading", { name: "Choose your demo role" }),
  ).toBeVisible();
  await booking(page);
  await page
    .getByRole("button", { name: "Simulate successful payment" })
    .click();
  await page.goto("/app");
  await expect(
    page.getByRole("heading", { name: "Permission denied" }),
  ).toBeVisible();
  await login(page, "Instructor");
  await expect(page.getByText("Alex Morgan", { exact: true })).toBeVisible();
  await expect(page.getByText("Total", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Balance", { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Confirm booking" }),
  ).toHaveCount(0);
  await page
    .getByRole("textbox", { name: "Search bookings" })
    .fill("no-match-for-this-query");
  await expect(
    page.getByRole("heading", { name: "No matching bookings." }),
  ).toBeVisible();
  await page.goto("/portal");
  await expect(
    page.getByRole("heading", { name: "Permission denied" }),
  ).toBeVisible();
  await page.goto("/not-a-route");
  await expect(
    page.getByRole("heading", { name: "Looks like uncharted water." }),
  ).toBeVisible();
  await page.goto("/courses/unknown");
  await expect(
    page.getByRole("heading", { name: "Course not found" }),
  ).toBeVisible();
});
test("responsive homepage, course and demo pages have no horizontal overflow", async ({
  page,
}, info) => {
  for (const route of ["/", "/courses", "/demo", "/courses/open-water"]) {
    await page.goto(route);
    await expect(page.locator("h1").first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/");
  await page.screenshot({
    path: `test-results/home-${info.project.name}.png`,
    fullPage: true,
  });
});
test("saved-data error offers an explicit reset, while valid empty portal is usable", async ({
  page,
}) => {
  await login(page);
  await expect(
    page.getByRole("heading", { name: "Your first adventure is waiting." }),
  ).toBeVisible();
  await page.evaluate(() =>
    localStorage.setItem("diveos-demo-v1", "broken-json"),
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Saved demo needs attention" }),
  ).toBeVisible();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Reset fictional demo" }).click();
  await expect(
    page.getByRole("heading", { name: "Your first adventure is waiting." }),
  ).toBeVisible();
});
