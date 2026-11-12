import { CheckIcon } from "./Icons.jsx";

// Plain text describing how the wallet contract is configured.
// If you change the cap with set_limit, update the second line.
const RULES = [
  "Only approved payees can be paid",
  "Up to 10 XLM per payment",
  "Only the agent's key can spend",
  "Only the owner can change the rules",
];

export default function RulesCard() {
  return (
    <section className="card panel">
      <h2>Spending rules</h2>
      <ul className="rules">
        {RULES.map((rule) => (
          <li key={rule}>
            <CheckIcon />
            {rule}
          </li>
        ))}
      </ul>
    </section>
  );
}
