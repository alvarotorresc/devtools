## How it works

Pick a start date and an end date and you get, for that range, the **calendar days** (also in weeks and days), the **weekdays** (Monday to Friday), the **business days** (Monday to Friday minus Spain's national holidays) and the weekend days. With "Include the end date" on, both ends count; off, the end date is left out. Every count uses the same set of days.

National holidays are worked out for any year between 1900 and 2100, with no tables to update: the nine fixed ones (New Year's Day, Epiphany, 1 May, 15 August, 12 October, 1 November, 6 and 8 December and Christmas) and **Good Friday**, the Friday before Easter Sunday. Easter is computed with the Meeus/Jones/Butcher Gregorian algorithm. The result lists the holidays that fall on a weekend, because those do not reduce the business days.

## What it leaves out

Only holidays shared by all of Spain are counted. Regional and local holidays (such as Maundy Thursday, Saint Joseph's Day or town festivities) are not included, nor the holidays regions move when one falls on a Sunday. If your deadline depends on them, subtract them by hand. Counting is done in UTC days, so the March and October clock changes never add or remove a day.
