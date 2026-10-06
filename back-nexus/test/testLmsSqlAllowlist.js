import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { mock } from "node:test";

const calls = [];
const mockDb = {
  async query(sql, values) {
    calls.push({ sql, values });
    return [{ affectedRows: 1 }];
  },
};

mock.module(pathToFileURL(resolve("config/db.js")).href, {
  exports: { default: mockDb },
});

const [{ default: discussions }, { default: assignments }, { default: materials }] =
  await Promise.all([
    import(pathToFileURL(resolve("model/lmsDiscussions.model.js")).href),
    import(pathToFileURL(resolve("model/lmsAssignments.model.js")).href),
    import(pathToFileURL(resolve("model/lmsMaterials.model.js")).href),
  ]);

const cases = [
  {
    name: "discussions",
    model: discussions,
    safeField: "title",
    safeValue: "Updated topic",
  },
  {
    name: "assignments",
    model: assignments,
    safeField: "instructions",
    safeValue: "Updated instructions",
  },
  {
    name: "materials",
    model: materials,
    safeField: "file_name",
    safeValue: "notes.pdf",
  },
];

for (const { name, model, safeField, safeValue } of cases) {
  calls.length = 0;
  assert.equal(await model.update(73, { [safeField]: safeValue }), true);
  assert.equal(calls.length, 1);
  assert.match(calls[0].sql, new RegExp(`SET ${safeField} = \\?`));
  assert.deepEqual(calls[0].values, [safeValue, 73]);
  console.log(`PASS ${name}: allowlisted field and parameterized value`);

  calls.length = 0;
  const injectedKey = "title = 'changed', status";
  assert.equal(
    await model.update(73, {
      [safeField]: safeValue,
      [injectedKey]: "active",
    }),
    true,
  );
  assert.equal(calls.length, 1);
  assert.doesNotMatch(calls[0].sql, /title = 'changed'/);
  assert.deepEqual(calls[0].values, [safeValue, 73]);
  console.log(`PASS ${name}: injected column key is ignored`);

  calls.length = 0;
  await assert.rejects(
    model.update(73, { "title = 'changed'": "active" }),
    /No valid .* fields to update/i,
  );
  assert.equal(calls.length, 0);
  console.log(`PASS ${name}: invalid-only update does not query database`);
}
