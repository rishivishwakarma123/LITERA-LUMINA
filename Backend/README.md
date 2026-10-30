# Litera Lumina backend

## Requirements and running

Use JDK 25 to build and run the backend. The Maven Wrapper uses Maven 3.10.0.
From this directory, run `.\mvnw.cmd clean test` to compile and test, or
`.\mvnw.cmd spring-boot:run` to start the application.
On Windows, if JDK 25 is installed under your user profile, select it in the
current PowerShell session before running Maven:

```powershell
$env:JAVA_HOME = "$HOME\.jdk\jdk-25"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
```

The default development profile uses an in-memory H2 database and recreates its
schema at startup, so it starts with no sample users, books, or orders.

Set `LITERA_ADMIN_PASSWORD` before starting the backend to create the `rishi`
admin account. The password is only read from the environment and is stored in
the database as a BCrypt hash. `LITERA_ADMIN_USERNAME` can change the username;
`LITERA_FRONTEND_ORIGIN` can change the allowed frontend origin.

Admin UI/API endpoints require an authenticated `ADMIN` session. Requests made
by the frontend must preserve cookies and send the CSRF token returned by
`GET /api/auth/csrf` on state-changing requests.

## Marketplace workflows

The default H2 database is in-memory and is recreated at startup. It is empty
on each launch; no dummy users, books, or orders are seeded. To use MySQL,
activate the `mysql` profile and configure `DATABASE_URL`, `DATABASE_USERNAME`,
and `DATABASE_PASSWORD`. That profile uses schema updates and does not drop
existing records.
Start with `.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=mysql"`.

Set `LITERA_ADMIN_PASSWORD` in the backend process environment to bootstrap the
administrator; the password is stored as a BCrypt hash. The default username is
`rishi` and can be changed with `LITERA_ADMIN_USERNAME`. Do not put credentials
in source control.

Book uploads start in `PENDING` and require administrator approval. Checkout
uses the persisted cart, server-side prices, a configurable `LITERA_TAX_RATE`
(a decimal rate, default `0.05` for 5%), and ₹40 shipping below ₹500. UPI is a manual handoff to the
configured `LITERA_UPI_RECEIVER_PHONE` (default `7905873589`): transaction
references are not verified with Google Pay or a payment provider. Payments
remain pending and inventory is reserved until an administrator confirms or
rejects the reference. Confirmed payments deduct stock; failed or cancelled
pending orders release the reservation.

Book cover uploads accept JPG, PNG, and WebP files up to 5 MB. Files are stored
under `./uploads/book-covers` relative to the backend working directory. Set
`LITERA_UPLOAD_DIRECTORY` to use a different persistent storage directory.

Cart, order, and payment APIs require a signed-in session. `/api/admin/**` and
`/admin/**` require the `ADMIN` role. Users see their outgoing payments and
sellers see incoming amounts for books they listed.
