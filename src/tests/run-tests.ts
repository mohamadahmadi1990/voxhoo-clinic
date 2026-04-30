import { runDatabaseFallbackTests } from "../db/index.test";
import { runGooglePlacesTests } from "../lib/google-places.test";
import { runClinicResultsTests } from "../lib/clinic-results.test";

async function main() {
  const suites = [
    {
      name: "clinic results",
      run: runClinicResultsTests,
    },
    {
      name: "google places helpers",
      run: runGooglePlacesTests,
    },
    {
      name: "places fallback",
      run: runDatabaseFallbackTests,
    },
  ];

  let assertionCount = 0;

  for (const suite of suites) {
    const suiteAssertions = await suite.run();
    assertionCount += suiteAssertions;
    console.log(`PASS ${suite.name}`);
  }

  console.log(`PASS ${assertionCount} automated assertions`);
}

main().catch((error) => {
  console.error("FAIL automated tests");
  console.error(error);
  process.exitCode = 1;
});
