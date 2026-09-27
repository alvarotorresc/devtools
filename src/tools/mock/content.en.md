## Data that fits together

Each row is a complete, consistent fictional person: the email comes from the name and surname (without accents, `maria.ibanez@example.com`), the postal code and city belong to the same province, the DNI or NIE letter is right and the company’s CIF is type A for an S.A. and type B for an S.L. Emails use the reserved domains `example.com`, `example.org` and `example.net`, which never reach a real mailbox, so you can load the data into a test environment without writing to anyone.

Pick the columns, rename and reorder them, and add number, date or custom list fields. Removing or moving columns does not change the values of the others, because every row is always generated in full and in the same order.

## JSON, CSV or SQL, always the same with a seed

The output can be a JSON array (numbers and booleans keep their type), a CSV with a header row, or one `INSERT` statement per row with every text properly escaped. The preview shows 20 rows; copy and download include all of them. With a seed, the same settings give the same data in any browser, except for dates relative to today (such as birth date), which depend on the day the data is generated. Without a seed, the data changes when you press Generate.

“International data” mode uses generic English names, streets and cities and the 555-01XX phone range, reserved for fiction. In that mode the fields that only make sense in Spain, such as the DNI or the IBAN, are turned off.
