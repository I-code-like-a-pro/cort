import type { ComponentType } from "react";
import {
  ArrowIcon,
  BoltIcon,
  ChatIcon,
  CodeIcon,
  KeyIcon,
  LockIcon,
  PulseIcon,
} from "./icons.js";
import type { Plan } from "./usePilot.js";

// The 11 slides of the Cort pitch. Each is drawn on a 1920 x 1080 canvas;
// Presenter.tsx scales the canvas to fit the screen.

function Frame({
  tone,
  eyebrow,
  title,
  n,
  children,
}: {
  tone: "light" | "dark";
  eyebrow: string;
  title: string;
  n: number;
  children: React.ReactNode;
}) {
  return (
    <section className={"slide " + tone}>
      <div className="head">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="title">{title}</h2>
      </div>
      {children}
      <footer className="foot">
        <span>Cort · Boundless Build Day</span>
        <span>{String(n).padStart(2, "0")}</span>
      </footer>
    </section>
  );
}

function Card({
  icon,
  title,
  children,
}: {
  icon?: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      {icon}
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}

function Cover() {
  return (
    <section className="slide dark cover">
      <div className="orb">
        <LockIcon size={300} />
      </div>
      <p className="eyebrow">Boundless Build Day · Stellar</p>
      <h1 className="hero">Cort</h1>
      <p className="lede">Spending limits that software can’t talk its way past.</p>
      <p className="badge">Testnet prototype</p>
    </section>
  );
}

function ProblemAgents() {
  return (
    <Frame tone="light" n={2} eyebrow="The problem" title="Agents that spend money need limits they can’t override">
      <div className="row">
        <Card title="Agents act alone">
          They buy data, services and subscriptions with real money, with no person approving each step.
        </Card>
        <Card title="Mistakes and tricks">
          A confused or manipulated agent can pay the wrong party, or far too much.
        </Card>
        <Card title="App limits are soft">
          Limits in an app’s own code can be edited, bypassed or switched off by whoever controls it.
        </Card>
      </div>
    </Frame>
  );
}

function ProblemIntrusion() {
  return (
    <Frame tone="light" n={3} eyebrow="The same weakness, another way in" title="A taken-over company system can send money anywhere">
      <div className="row flow">
        <Card title="Attacker gets in">
          Remote management tools are real IT software. Attackers abuse them to take over a machine.
        </Card>
        <span className="arrow"><ArrowIcon /></span>
        <Card title="Reaches a payer">
          The machine or account can approve payments, so now the attacker can too.
        </Card>
        <span className="arrow"><ArrowIcon /></span>
        <Card title="Funds leave">Money goes to an address the attacker controls, often in crypto.</Card>
      </div>
      <p className="note" style={{ fontSize: 24, lineHeight: 1.35, width: 1664 }}>
        Huntress saw RMM-tool abuse (AnyDesk, ScreenConnect and similar) in about <b>1 in 4</b> incidents its
        analysts investigated in 2025, up from 1 in 14 in 2024 — a 277% jump, because the traffic looks like normal
        IT work. CISA, NSA and MS-ISAC have separately warned that criminals abuse these same tools to reach
        victims’ accounts.{" "}
        <span style={{ fontSize: 18, color: "#8a96aa" }}>
          Sources: Huntress 2026 Cyber Threat Report · CISA/NSA/MS-ISAC Advisory AA23-025A (Jan 2023).
        </span>
      </p>
      <div className="mock">
        <p className="mock-label">Illustrative example · not an actual case</p>
        <div className="mock-chat">
          <p className="mock-msg">“Admin”: Access confirmed. Send me the account details.</p>
          <p className="mock-msg short">“Admin”: Split is 40% once it clears.</p>
        </div>
      </div>
    </Frame>
  );
}

function Gap() {
  return (
    <Frame tone="dark" n={4} eyebrow="The gap" title="Two problems, one root cause">
      <h3 className="statement">Whoever holds the signing key can pay anyone, for any amount.</h3>
      <div className="row">
        <div className="card">
          <p className="tag">Case 1</p>
          <p className="big">An AI agent that is tricked or makes a mistake</p>
        </div>
        <div className="card">
          <p className="tag">Case 2</p>
          <p className="big">A company system that has been taken over</p>
        </div>
      </div>
      <p className="note">Either way, nothing limits the damage.</p>
    </Frame>
  );
}

function Idea() {
  return (
    <Frame tone="light" n={5} eyebrow="The idea" title="Put the rules on the blockchain, where the agent can’t change them">
      <div className="row">
        <Card icon={<KeyIcon />} title="The owner">
          Sets the rules once: who can be paid, and the most per payment. Holds the only key that can change them.
        </Card>
        <Card icon={<ChatIcon />} title="The agent">
          Asks to pay a vendor. Its key can request payments and do nothing else.
        </Card>
        <Card icon={<LockIcon />} title="The wallet contract">
          Holds the funds, checks every request, and pays or refuses on-chain.
        </Card>
      </div>
      <p className="note">
        Who sets this up: teams giving an AI agent real purchasing or treasury authority on Stellar, and MSPs and
        IT service companies who let automation initiate client payments — the same companies that are frequent
        targets of the RMM abuse on the previous slide.
      </p>
    </Frame>
  );
}

function Checks() {
  const steps = [
    "The agent signed the request",
    "The amount is above zero",
    "The amount is within the cap",
    "The payee is on the approved list",
  ];
  return (
    <Frame tone="dark" n={6} eyebrow="How a payment works" title="Every request passes four checks">
      <div className="row split">
        <div className="steps">
          {steps.map((text, i) => (
            <div className="step" key={text}>
              <span className="num">{i + 1}</span>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <div className="outcomes">
          <div className="outcome sent">
            <h3>All four pass: sent</h3>
            <p>The contract moves the funds to the payee.</p>
          </div>
          <div className="outcome refused">
            <h3>Any one fails: refused</h3>
            <p>The request is rejected and the balance does not change.</p>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function Demo() {
  return (
    <Frame tone="light" n={7} eyebrow="Live demo" title="Three requests, three outcomes">
      <table className="results">
        <thead>
          <tr>
            <th>Request</th>
            <th>Result</th>
            <th>Why</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Pay DataCo 2 XLM</td>
            <td className="ok">Sent</td>
            <td>Approved, under the cap</td>
            <td>Down 2 XLM</td>
          </tr>
          <tr>
            <td>Pay ShadyCorp 3 XLM</td>
            <td className="bad">Refused</td>
            <td>Never approved</td>
            <td>Unchanged</td>
          </tr>
          <tr>
            <td>Pay DataCo 50 XLM</td>
            <td className="bad">Refused</td>
            <td>Over the 10 XLM cap</td>
            <td>Unchanged</td>
          </tr>
        </tbody>
      </table>
      <p className="note">The agent wanted to pay in all three cases. The blockchain decided.</p>
    </Frame>
  );
}

function Limits() {
  return (
    <Frame tone="light" n={8} eyebrow="An honest look" title="What it protects against, and what it doesn’t">
      <div className="row">
        <div className="card good">
          <h3>It limits the damage from</h3>
          <ul>
            <li>An agent that is tricked or makes a mistake</li>
            <li>A taken-over machine that holds only the agent’s key</li>
            <li>Payments to anyone who was never approved</li>
            <li>Large single transfers</li>
          </ul>
        </div>
        <div className="card warn">
          <h3>It still needs other defences</h3>
          <ul>
            <li>A stolen owner key can change the rules</li>
            <li>It does not detect or stop the intrusion itself</li>
            <li>It only protects funds held in the contract</li>
            <li>It is a testnet prototype and has not been audited</li>
          </ul>
        </div>
      </div>
      <p className="note">
        This split is deliberate: CISA and Huntress both note that RMM abuse is hard to catch because the traffic
        looks like ordinary IT work. Cort does not watch for that — it is a payment-side guardrail, not an
        intrusion detector, so it still caps what a compromised signer can pay out even when the break-in itself
        goes unnoticed.
      </p>
    </Frame>
  );
}

function Stellar() {
  return (
    <Frame tone="dark" n={9} eyebrow="Why Stellar" title="Fast, cheap and built for payments">
      <div className="row">
        <Card icon={<BoltIcon />} title="Quick to settle">
          Payments confirm in seconds, so an agent can act and see the result right away.
        </Card>
        <Card icon={<PulseIcon />} title="Tiny fees">
          Fees are a fraction of a cent, so small automated payments make sense.
        </Card>
        <Card icon={<CodeIcon />} title="Soroban contracts">
          The rules run as a smart contract, and signatures are checked by the network.
        </Card>
      </div>
      <p className="note">Runs on Stellar testnet today. Moving to USDC means changing one token address.</p>
    </Frame>
  );
}

function Roadmap() {
  const items: [string, string][] = [
    ["Multi-signature owner", "Two or more approvers to change any rule, so one stolen key is not enough."],
    ["Delay on new payees", "A new address only becomes active after a waiting period, so there is time to notice and cancel."],
    ["Daily spending cap", "A limit over time as well as per payment, so many small payments cannot drain it."],
    ["Alerts", "A message to other people on every payment and every rule change."],
    ["Emergency pause", "One action that stops all payments instantly."],
    ["Security audit", "An independent review before any real funds are held."],
  ];
  return (
    <Frame tone="light" n={10} eyebrow="What comes next" title="What would make it production-ready">
      <div className="grid">
        {items.map(([title, text]) => (
          <div className="card small" key={title}>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </Frame>
  );
}

function Close() {
  return (
    <section className="slide dark close">
      <div className="orb small">
        <LockIcon size={200} />
      </div>
      <p className="eyebrow">In short</p>
      <h2 className="title wide">
        Agents that can spend are coming. The owner should set the limits, and the blockchain should enforce them.
      </h2>
      <div className="pills">
        <span>Soroban wallet contract</span>
        <span>AI purchasing agent</span>
        <span>Live dashboard</span>
      </div>
      <p className="thanks">Thank you</p>
      <footer className="foot">
        <span>Cort · Boundless Build Day</span>
        <span>11</span>
      </footer>
    </section>
  );
}

export interface Slide {
  id: string;
  name: string;
  view: ComponentType;
}

export const SLIDES: Slide[] = [
  { id: "cover", name: "Cover", view: Cover },
  { id: "problem-agents", name: "Agents need limits", view: ProblemAgents },
  { id: "problem-intrusion", name: "Taken-over systems", view: ProblemIntrusion },
  { id: "gap", name: "The gap", view: Gap },
  { id: "idea", name: "The idea", view: Idea },
  { id: "checks", name: "Four checks", view: Checks },
  { id: "demo", name: "Live demo", view: Demo },
  { id: "limits", name: "An honest look", view: Limits },
  { id: "stellar", name: "Why Stellar", view: Stellar },
  { id: "roadmap", name: "What comes next", view: Roadmap },
  { id: "close", name: "Close", view: Close },
];

// Starting timings, in seconds, until you rehearse. The demo slide holds:
// it waits for you, because a live demo never takes the same time twice.
export const DEFAULT_PLAN: Plan = {
  durations: [8, 12, 12, 10, 12, 12, 40, 12, 8, 8, 10],
  holds: [false, false, false, false, false, false, true, false, false, false, false],
};
