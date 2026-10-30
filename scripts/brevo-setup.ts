import {
  BREVO_ATTRIBUTES,
  brevoRequest,
  brevoSettings,
} from "@/payload/members/brevo";

// Prepares the Brevo account for the member sync: creates the contact
// attributes Happenings sends and the list members join. Safe to run again.
const LIST_NAME = "Happenings members";
const FOLDER_NAME = "Happenings";

const settings = brevoSettings();
if (!settings) {
  console.error("Set BREVO_API_KEY first.");
  process.exit(1);
}

try {
  const { attributes = [] } =
    (await brevoRequest<{ attributes?: { name: string }[] }>(
      "/contacts/attributes",
    )) ?? {};
  const existing = new Set(attributes.map(({ name }) => name.toUpperCase()));
  for (const { name, type } of BREVO_ATTRIBUTES) {
    if (existing.has(name)) continue;
    await brevoRequest(`/contacts/attributes/normal/${name}`, {
      method: "POST",
      body: { type },
    });
    console.log(`Created attribute ${name} (${type}).`);
  }

  if (settings.listId) {
    const list = await brevoRequest<{ id: number; name: string }>(
      `/contacts/lists/${settings.listId}`,
    );
    console.log(`Using list ${list?.id}: ${list?.name}.`);
  } else {
    const { lists = [] } =
      (await brevoRequest<{ lists?: { id: number; name: string }[] }>(
        "/contacts/lists?limit=50",
      )) ?? {};
    let list = lists.find(({ name }) => name === LIST_NAME);
    if (!list) {
      const { folders = [] } =
        (await brevoRequest<{ folders?: { id: number; name: string }[] }>(
          "/contacts/folders?limit=50",
        )) ?? {};
      const folder =
        folders.find(({ name }) => name === FOLDER_NAME) ??
        (await brevoRequest<{ id: number }>("/contacts/folders", {
          method: "POST",
          body: { name: FOLDER_NAME },
        }));
      const created = await brevoRequest<{ id: number }>("/contacts/lists", {
        method: "POST",
        body: { name: LIST_NAME, folderId: folder!.id },
      });
      list = { id: created!.id, name: LIST_NAME };
      console.log(`Created list ${list.id}: ${LIST_NAME}.`);
    }
    console.log(
      `\nAdd BREVO_LIST_ID=${list.id} to .env and to Vercel, then run npm run brevo:sync.`,
    );
  }
  console.log("Brevo is ready.");
  process.exit(0);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
