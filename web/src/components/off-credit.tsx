const LINK = "underline underline-offset-4 hover:text-foreground";

export function OffCredit() {
  return (
    <p className="text-xs text-muted-foreground">
      Contains data from{" "}
      <a href="https://world.openfoodfacts.org" target="_blank" rel="noreferrer" className={LINK}>
        Open Food Facts
      </a>{" "}
      under the{" "}
      <a href="https://opendatacommons.org/licenses/odbl/1-0/" target="_blank" rel="noreferrer" className={LINK}>
        Open Database License
      </a>
      , images under{" "}
      <a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noreferrer" className={LINK}>
        CC BY-SA
      </a>
      .
    </p>
  );
}
