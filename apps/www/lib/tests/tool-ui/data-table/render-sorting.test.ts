// @vitest-environment jsdom

import { cleanup, fireEvent, render } from "@testing-library/react";
import { createElement } from "react";
import { afterEach, expect, test } from "vitest";

import { DataTable } from "@/components/tool-ui/data-table";

afterEach(cleanup);

test("renders decimal-comma byte sizes in numeric order after sorting", () => {
  const { container, getByRole } = render(
    createElement(DataTable.Table<{ id: string; size: string }>, {
      id: "byte-size-sort",
      columns: [{ key: "size", label: "Size" }],
      rowIdKey: "id",
      data: [
        { id: "small", size: "1,25MB" },
        { id: "large", size: "2MB" },
      ],
      defaultSort: { by: "size", direction: "asc" },
      locale: "de-DE",
    }),
  );
  const sizes = () =>
    Array.from(
      container.querySelectorAll("tbody tr"),
      (row) => row.textContent,
    );
  expect(sizes()).toEqual(["1,25MB", "2MB"]);
  fireEvent.click(getByRole("button", { name: /Size/ }));
  expect(sizes()).toEqual(["2MB", "1,25MB"]);
});
